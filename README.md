# คู่มือการติดตั้งและใช้งาน GitHub สำหรับงานกลุ่ม (5 คน)

## ส่วนที่ 1: ขั้นตอนที่เราทำให้แล้ว
1. ตั้งค่าโปรเจกต์ให้เป็น Git Repository (สร้างโฟลเดอร์ `.git`)
2. สร้างไฟล์ `.gitignore` เพื่อกันไฟล์ขยะและไฟล์ที่ไม่จำเป็น (เช่น `node_modules`, `.env`)
3. ทำการ Save (Commit) ไฟล์ทั้งหมดในเครื่องเรียบร้อยแล้ว เตรียมพร้อมขึ้น GitHub

---

## ส่วนที่ 2: สิ่งที่คุณต้องทำต่อ (เจ้าของเครื่อง)

1. เข้าไปที่ **[GitHub.com](https://github.com)** และล็อกอินให้เรียบร้อย
2. กดปุ่ม **New** (ปุ่มเขียวหรือเครื่องหมาย + มุมขวาบน) แล้วเลือก **New repository**
3. ตั้งชื่อ Repository เช่น `my-group-project`
4. **สำคัญ:** 
   - เลือก **Public** (สาธารณะ) หรือ **Private** (ส่วนตัว แต่ต้องเชิญเพื่อน)
   - **ไม่ต้องติ๊ก** เลือกพวก `Add a README file`, `.gitignore`, หรือ `license` (เพราะมีไฟล์ในเครื่องแล้ว)
5. กดปุ่ม **Create repository**

---

## ส่วนที่ 3: เอาไฟล์ขึ้น GitHub (ทำที่เครื่องคุณ)

เมื่อหน้า GitHub สร้างเสร็จ จะมีคำแนะนำต่างๆ ให้ดูหัวข้อ **"…or push an existing repository from the command line"**

เปิด Terminal ใน VS Code (กด `ctrl` + `shft` + `backtick`) แล้วพิมพ์คำสั่งตามนี้ทีละบรรทัด:

```bash
git remote add origin https://github.com/tenth12/electoral-system.git
git branch -M main
git push -u origin main
```
*หมายเหตุ: URL ของ Repository นี้คือ `https://github.com/tenth12/electoral-system.git`*

---

## ส่วนที่ 4: สำหรับเพื่อนในกลุ่ม (อีก 4 คน)

ให้เพื่อนทำตามนี้เพื่อดึงงานไปทำ:

1. **เชิญเพื่อนเข้ากลุ่ม (ถ้าตั้ง Private):**
   - ไปที่ Settings > Collaborators > Add people > ใส่ชื่อหรือ email เพื่อน

2. **เพื่อนโคลนโปรเจกต์ (ทำครั้งแรกครั้งเดียว):**
   ```bash
   git clone https://github.com/tenth12/electoral-system.git
   cd electoral-system
   npm install  # หรือ yarn install เพื่อลง dependencies
   ```

3. **ก่อนเริ่มงานทุกครั้ง (ดึงงานล่าสุด):**
   ```bash
   git pull origin main
   ```

4. **เมื่อทำงานเสร็จและต้องการส่งงาน:**
   ```bash
   git add .
   git commit -m "อธิบายงานที่ทำสั้นๆ"
   git push origin main
   ```

---

## ข้อแนะนำเพิ่มเติม
- **แบ่งงานกันชัดเจน:** พยายามอย่าแก้ไฟล์เดียวกันในบรรทัดเดียวกันพร้อมกัน
- **Pull บ่อยๆ:** ก่อนเริ่มงานให้ `git pull` เสมอ เพื่อให้แน่ใจว่าได้โค้ดล่าสุดจากเพื่อน
- **คุยกันก่อน Push:** ถ้ามีการแก้ไฟล์สำคัญ ให้บอกเพื่อนในกลุ่มด้วย
