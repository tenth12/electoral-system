import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { CandidatesService } from './candidates.service';

@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  // 1. สำหรับสมัครสมาชิกใหม่ + ลงเลือกตั้งทันที (ไม่ต้อง Login ก่อน)
  // URL: POST /candidates/signup
  @Post('signup')
  async signup(@Body() body: any) {
    // ส่งข้อมูลทั้งหมดไปที่ signupAndApply ใน Service
    return this.candidatesService.signupAndApply(body);
  }

  // 2. สำหรับคนที่มีบัญชีอยู่แล้วและ Login อยู่ (ต้องใช้ Guard เพื่อเอา user.id)
  // URL: POST /candidates/apply
  @Post('apply')
  // @UseGuards(JwtAuthGuard) // เปิดใช้งาน Guard ของคุณเพื่อให้ req.user มีข้อมูล
  async create(@Request() req, @Body() body: any) {
    // ตรวจสอบว่ามี user.id หรือไม่ (ถ้าไม่ใช้ Guard ต้องมั่นใจว่าส่ง id มาใน body หรือวิธีอื่น)
    const userId = req.user?.id || body.userId; 
    return this.candidatesService.apply(userId, body);
  }

  // 3. สำหรับดึงรายชื่อผู้สมัครทั้งหมดไปโชว์ที่หน้าบ้าน
  // URL: GET /candidates
  @Get()
  async findAll() {
    return this.candidatesService.findAll();
  }
}