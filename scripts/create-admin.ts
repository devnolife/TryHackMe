import prisma from '../lib/db';
import { hashPassword } from '../lib/auth';

async function createAdminAccount() {
  try {
    const adminEmail = 'devnolife@admin.lab';
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
      console.log('Email:', updatedAdmin.email);
      console.log('Name:', updatedAdmin.fullName);
      console.log('Role:', updatedAdmin.role);
    } else {
      // Create new admin
      const newAdmin = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          fullName: 'DevNoLife',
          role: 'ADMIN',
          isActive: true,
        },
      });

      console.log('✅ Admin account created successfully!');
      console.log('Email:', newAdmin.email);
      console.log('Name:', newAdmin.fullName);
      console.log('Role:', newAdmin.role);
    }

    console.log('\n📝 Login credentials:');
    console.log('Username/Email: devnolife');
    console.log('Password: samaKemarin00');
    console.log('\nNote: You can login using either "devnolife" or "devnolife@admin.lab" as email');

  } catch (error) {
    console.error('❌ Error creating admin account:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdminAccount();
