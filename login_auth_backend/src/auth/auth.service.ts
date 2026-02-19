import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dto/auth.dto';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private config: ConfigService,
        private readonly httpService: HttpService,
    ) { }

    private normalizeEmail(email: string) {
        return email.trim().toLowerCase();
    }

    private async signTokens(user: {id: string; email: string; role: string}) {
        const accessSecret = this.config.getOrThrow<string>('JWT_ACCESS_SECRET');
        const refreshSecret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');

        const accessExp = parseInt(this.config.get<string>('JWT_ACCESS_EXPIRATION') ?? '900', 10);
        const refreshExp = parseInt(this.config.get<string>('JWT_REFRESH_EXPIRATION') ?? '604800', 10);

        const payload = { sub: user.id, email: user.email, role: user.role };

        const [access_token, refresh_token] = await Promise.all([
            this.jwtService.signAsync(payload, { secret: accessSecret, expiresIn: accessExp }),
            this.jwtService.signAsync(payload, { secret: refreshSecret, expiresIn: refreshExp }),
        ]);

        return { access_token, refresh_token };
    }

    private async storeRefreshHash(userId: string, refreshToken: string) {
        const hash = await argon2.hash(refreshToken);
        await this.usersService.setRefreshTokenHash(userId, hash);
    }

    async signUp(dto: AuthDto) {
        const email = this.normalizeEmail(dto.email);
        const userExists = await this.usersService.findByEmail(email);
        if (userExists) throw new BadRequestException('Email นี้ถูกใช้งานแล้ว');

        const passwordHash = await argon2.hash(dto.password);

        const newUser = await this.usersService.create({
            email,
            passwordHash,
            role: 'user'
        });

        const tokens = await this.signTokens({ id: String(newUser._id), email: newUser.email, role: 'user' });
        await this.storeRefreshHash(String(newUser._id), tokens.refresh_token);

        return tokens;
    }

    async signIn(dto: AuthDto) {
        // Validate Turnstile Token
        if (dto.turnstileToken) {
            await this.validateTurnstile(dto.turnstileToken);
        }

        const email = this.normalizeEmail(dto.email);

        const user = await this.usersService.findByEmailWithSecrets(email);
        if (!user) throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');

        const passwordMatches = await argon2.verify(user.passwordHash, dto.password);
        if (!passwordMatches) throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');

        const tokens = await this.signTokens({ id: String(user._id), email: user.email, role: user.role });
        await this.storeRefreshHash(String(user._id), tokens.refresh_token);

        // return this.signToken(String(user._id), user.email);
        return tokens;

    }

    // async signToken(userId: string, email: string) {
    //     const payload = { sub: userId, email };
    //     const token = await this.jwtService.signAsync(payload);

    //     return {
    //         access_token: token,
    //     };
    // }
    async refreshTokens(userId: string, email: string, role: string, refreshToken: string) {
        if (!refreshToken) throw new ForbiddenException('Access denied');

        const user = await this.usersService.findByIdWithRefresh(userId);
        if (!user?.refreshTokenHash) throw new ForbiddenException('Access denied');

        const matches = await argon2.verify(user.refreshTokenHash, refreshToken);
        if (!matches) throw new ForbiddenException('Access denied');

        const tokens = await this.signTokens({ id: userId, email, role });

        // Rotation: refresh token ใหม่ต้องถูกเก็บ hash ใหม่ทับตัวเก่า
        await this.storeRefreshHash(userId, tokens.refresh_token);

        return tokens;
    }

    async logout(userId: string) {
        await this.usersService.setRefreshTokenHash(userId, null);
        return { success: true };
    }


    async validateTurnstile(token: string) {
        const secretKey = this.config.get<string>('CLOUDFLARE_TURNSTILE_SECRET_KEY');
        if (!secretKey) {
            console.warn('CLOUDFLARE_TURNSTILE_SECRET_KEY not set. Skipping verification.');
            return;
        }

        const verifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
        
        try {
            const { data } = await firstValueFrom(
                this.httpService.post(verifyUrl, {
                    secret: secretKey,
                    response: token,
                })
            );

            if (!data.success) {
                throw new BadRequestException('Captcha verification failed');
            }
        } catch (error) {
             // If the error is already a BadRequestException (from !data.success), rethrow it.
             if (error instanceof BadRequestException) {
                throw error;
            }
            console.error('Turnstile verification error:', error);
            // Decide if you want to block login on error or fail open. 
            // Here we fail closed for security, but ensure we don't block legitimate users on network issues if possible.
            // For now, throw Unauthorized or BadRequest
            throw new BadRequestException('Captcha verification failed');
        }
    }
}
