import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express'; // เพิ่มอันนี้
import { join } from 'path'; // เพิ่มอันนี้
import helmet from 'helmet';

async function bootstrap() {
  // 1. ระบุ Type เป็น NestExpressApplication เพื่อให้ใช้ useStaticAssets ได้
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 2. ตั้งค่า Helmet (ต้องปรับ Cross-Origin Resource Policy เพื่อให้แสดงรูปได้)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // อนุญาตให้โหลดรูปข้าม Origin
    }),
  );

  // 3. เปิดโฟลเดอร์ uploads ให้คนภายนอกเข้าถึงผ่าน URL ได้
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // 4. เปิด CORS
  app.enableCors();

  // 5. Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();