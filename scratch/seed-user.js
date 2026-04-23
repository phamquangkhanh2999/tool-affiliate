const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Đang kiểm tra Database ---');
  const user = await prisma.user.upsert({
    where: { id: 'demo-user' },
    update: {},
    create: {
      id: 'demo-user',
      email: 'demo@example.com',
      name: 'Demo User'
    }
  });
  console.log('✅ User "demo-user" đã sẵn sàng:', user.id);
}

main()
  .catch(err => {
    console.error('❌ Lỗi:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
