import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(10);
  
  // Create test Admin
  const adminPwd = await bcrypt.hash('admin123', salt);
  await prisma.user.upsert({
    where: { email: 'test@admin.com' },
    update: { passwordHash: adminPwd, role: 'ADMIN' },
    create: {
      name: 'Test Admin',
      email: 'test@admin.com',
      passwordHash: adminPwd,
      role: 'ADMIN'
    }
  });

  // Create test Student
  const studentPwd = await bcrypt.hash('student123', salt);
  await prisma.user.upsert({
    where: { email: 'test@student.com' },
    update: { passwordHash: studentPwd, role: 'STUDENT' },
    create: {
      name: 'Test Student',
      email: 'test@student.com',
      passwordHash: studentPwd,
      role: 'STUDENT'
    }
  });

  console.log('✅ Test users created successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
