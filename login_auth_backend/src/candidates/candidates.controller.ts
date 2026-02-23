import { 
  Controller, Post, Get, Body, Request, Param, Patch, 
  UseInterceptors, UploadedFile, BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { CandidatesService } from './candidates.service';

@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  // --- ฟังก์ชันอัปโหลดรูปภาพ ---
  // URL: POST /candidates/upload
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads', // โฟลเดอร์ที่จะเก็บไฟล์
      filename: (req, file, cb) => {
        // ตั้งชื่อไฟล์ใหม่เป็น timestamp + สุ่มตัวเลข เพื่อป้องกันชื่อซ้ำ
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      // ตรวจสอบประเภทไฟล์ (รับเฉพาะภาพ)
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return cb(new BadRequestException('รองรับเฉพาะไฟล์รูปภาพเท่านั้น!'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 2 * 1024 * 1024 } // จำกัดขนาด 2MB
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('ไม่พบไฟล์ที่อัปโหลด');
    }
    // ส่ง URL กลับไป (สมมติว่าคุณตั้งค่า Static assets ที่ /uploads)
    return { 
        imageUrl: `http://localhost:3000/uploads/${file.filename}` 
    };
  }

  @Patch('user/:userId') 
  async update(@Param('userId') userId: string, @Body() body: any) {
    return this.candidatesService.updateByUserId(userId, body);
  }

  @Get('user/:userId')
  async findOne(@Param('userId') userId: string) {
    return this.candidatesService.findOneByUserId(userId);
  }

  @Post('signup')
  async signup(@Body() body: any) {
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