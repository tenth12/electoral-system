import { Controller, Get, Param, Query, UseGuards, Req, ForbiddenException, Patch, Body, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { UserRole } from './schemas/user.schema';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @UseGuards(AccessTokenGuard)
    @Get()
    async findAll(@Req() req, @Query('role') role?: string) {
        // Allow querying for candidates by anyone (authenticated)
        if (role === 'candidate') {
            return this.usersService.findAll('candidate');
        }

        // For other queries, require admin
        if (req.user.role !== 'admin') {
             throw new ForbiddenException('Admin only');
        }
        return this.usersService.findAll(role as UserRole);
    }

    @UseGuards(AccessTokenGuard)
    @Get(':id')
    async findOne(@Req() req, @Param('id') id: string) {
        // Admin can view anyone, or user can view themselves?
        // Prompt says "admin... can view user accounts"
        if (req.user.role !== 'admin' && req.user.sub !== id) {
             throw new ForbiddenException('Access denied');
        }
        return this.usersService.findById(id);
    }
    @UseGuards(AccessTokenGuard)
    @Patch(':id')
    async update(@Req() req, @Param('id') id: string, @Body() body: any) {
        // Only admin can update other users
        if (req.user.role !== 'admin') {
             throw new ForbiddenException('Admin only');
        }
        return this.usersService.update(id, body);
    }

    @UseGuards(AccessTokenGuard)
    @Delete(':id')
    async remove(@Req() req, @Param('id') id: string) {
        // Only admin can delete users
        if (req.user.role !== 'admin') {
             throw new ForbiddenException('Admin only');
        }
        return this.usersService.remove(id);
    }
}
