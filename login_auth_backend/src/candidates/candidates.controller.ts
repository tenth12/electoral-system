import { Controller, Post, Get, Body, UseGuards, Request, Param } from '@nestjs/common';
import { CandidatesService } from './candidates.service';

@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  // 1. ดึงข้อมูลส่วนตัวของผู้สมัคร (สำหรับหน้า Profile ของพรรคนั้นๆ)
  // URL: GET /candidates/user/:userId
  @Get('user/:userId')
  async findOne(@Param('userId') userId: string) {
    return this.candidatesService.findOneByUserId(userId);
  }

  // 2. สำหรับสมัครสมาชิกใหม่ + ลงเลือกตั้งทันที (ไม่ต้อง Login ก่อน)
  // URL: POST /candidates/signup
  @Post('signup')
  async signup(@Body() body: any) {
    return this.candidatesService.signupAndApply(body);
  }

  // 3. สำหรับคนที่มีบัญชีอยู่แล้วและต้องการสมัครเพิ่ม
  // URL: POST /candidates/apply
  @Post('apply')
  async create(@Request() req, @Body() body: any) {
    // พยายามเอา userId จาก req.user (ถ้าผ่าน Guard) หรือจาก body
    const userId = req.user?.id || body.userId; 
    return this.candidatesService.apply(userId, body);
  }

  // 4. สำหรับดึงรายชื่อผู้สมัคร "ทั้งหมด" ไปโชว์ที่หน้าบ้าน (Public)
  // URL: GET /candidates
  @Get()
  async findAll() {
    return this.candidatesService.findAll();
  }
  
}