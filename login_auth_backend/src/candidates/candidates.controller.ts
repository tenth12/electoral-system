import { 
  Controller, Post, Get, Body, Request, Param, Patch, 
  UseInterceptors, UploadedFile, BadRequestException, Delete, Query 
} from '@nestjs/common';
import * as fs from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from 'src/auth/dto/auth.dto';

@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads', 
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        return cb(new BadRequestException('รองรับเฉพาะไฟล์รูปภาพเท่านั้น!'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 15 * 1024 * 1024 } 
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('ไม่พบไฟล์ที่อัปโหลด');
    }
    return { 
        imageUrl: `http://localhost:3000/uploads/${file.filename}` 
    };
  }

  @Delete('image')
  async deleteImage(@Query('imageUrl') imageUrl: string) {
    if (!imageUrl) {
        throw new BadRequestException('imageUrl is required');
    }

    try {
        const filename = imageUrl.split('/uploads/')[1];
        if (filename) {
            const filePath = join(process.cwd(), 'uploads', filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                return { message: 'Image deleted successfully' };
            }
        }
        return { message: 'Image not found or already deleted' };
    } catch (error) {
        console.error('Error deleting image:', error);
        throw new BadRequestException('Failed to delete image');
    }
  }

  @Patch('user/:userId') 
  async update(@Param('userId') userId: string, @Body() body: any) {
    return this.candidatesService.updateByUserId(userId, body);
  }

  @Delete('user/:userId')
  async removeUserAndCandidate(@Param('userId') userId: string) {
    return this.candidatesService.removeByUserId(userId);
  }

  @Get('user/:userId')
  async findOne(@Param('userId') userId: string) {
    return this.candidatesService.findOneByUserId(userId);
  }

  @Post('signup')
  async signup(@Body() body: CreateCandidateDto) { 
    return this.candidatesService.signupAndApply(body);
  }

  @Post('apply')
  async create(@Request() req, @Body() body: any) {
    const userId = req.user?.id || body.userId; 
    return this.candidatesService.apply(userId, body);
  }

  @Get()
  async findAll() {
    return this.candidatesService.findAll();
  }
}