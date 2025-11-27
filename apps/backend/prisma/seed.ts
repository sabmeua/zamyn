import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { seedWorkflowTemplates } from './seeds/workflow-templates';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  try {
    let adminRole = await prisma.role.findUnique({
      where: { name: 'admin' },
    });

    if (!adminRole) {
      console.log('📋 Creating admin role...');
      adminRole = await prisma.role.create({
        data: {
          name: 'admin',
          description: 'Administrator',
          permissions: { all: true },
        },
      });
      console.log('✅ Admin role created');
    } else {
      console.log('ℹ️  Admin role already exists');
    }

    let adminUser = await prisma.user.findUnique({
      where: { email: 'admin@zamyn.local' },
    });

    if (!adminUser) {
      console.log('👤 Creating admin user...');
      const passwordHash = await bcrypt.hash('admin123', 10);

      adminUser = await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@zamyn.local',
          passwordHash,
          displayName: 'System Administrator',
          roleId: adminRole.id,
        },
      });

      console.log('✅ Admin user created');
      console.log('   Email: admin@zamyn.local');
      console.log('   Password: admin123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    console.log('');
    console.log('📋 Creating workflow templates...');
    const templates = await seedWorkflowTemplates(adminUser.id);
    console.log(`✅ Created ${Object.keys(templates).length} workflow templates`);

    console.log('');
    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('');
    console.error('❌ Seeding failed with error:');
    console.error('---');
    console.error(error.message);
    if (error.stack) {
      console.error('');
      console.error('Stack trace:');
      console.error(error.stack);
    }
    console.error('---');
    throw error; // 再スロー（プロセス終了のため）
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
