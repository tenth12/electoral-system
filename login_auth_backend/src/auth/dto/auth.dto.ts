import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AuthDto {
    @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
    email: string;

    @IsNotEmpty()
    @MinLength(8, { message: 'รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร' })
    password: string;

    @IsNotEmpty({ message: 'กรุณายืนยันตัวตน' })
    turnstileToken?: string;
}

export class CreateCandidateDto {
    @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
    email: string;

    @IsString()
    @MinLength(8, { message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' })
    password: string;

    @IsString()
    @IsNotEmpty({ message: 'กรุณากรอกชื่อพรรค/ผู้สมัคร' })
    displayName: string;

    @IsString()
    @IsNotEmpty({ message: 'กรุณากรอกสโลแกน' })
    slogan: string;

    @IsString()
    @IsNotEmpty({ message: 'กรุณาระบุ URL รูปภาพ' })
    imageUrl: string;
}

