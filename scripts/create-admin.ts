import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return crypto.createHash('md5').update(password).digest('hex');
}

async function createAdminAccount() {
  try {
    const adminUsername = 'devnolife';
    const adminEmail = `${adminUsername}@admin.lab`; // Email tetap diperlukan untuk database
    const adminPassword = 'samaKemarin00';

    console.log('Creating/updating admin account...');

    // Hash password
    const hashedPassword = hashPassword(adminPassword);

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      // Update existing admin
      const updatedAdmin = await prisma.user.update({
        where: { email: adminEmail },
        data: {
          password: hashedPassword,
          fullName: 'DevNoLife',
          role: 'ADMIN',
          isActive: true,
        },
      });

      console.log('✅ Admin account updated successfully!');
      console.log('Username:', adminUsername);
      console.log('Name:', updatedAdmin.fullName);
      console.log('Role:', updatedAdmin.role);
    } else {
      // Create new admin
      const newAdmin = await prisma.user.create({
        data: {
          username: adminUsername,
          email: adminEmail,
          password: hashedPassword,
          fullName: 'DevNoLife',
          role: 'ADMIN',
          isActive: true,
        },
      });

      console.log('✅ Admin account created successfully!');
      console.log('Username:', adminUsername);
      console.log('Name:', newAdmin.fullName);
      console.log('Role:', newAdmin.role);
    }

    console.log('\n📝 Login credentials:');
    console.log('Username: devnolife');
    console.log('Password: samaKemarin00');

  } catch (error) {
    console.error('❌ Error creating admin account:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdminAccount();
