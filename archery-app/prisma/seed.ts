// prisma/seed.ts
import { prisma } from '../lib/prisma'; // <-- NO .ts

async function main() {
  const dummyUser = await prisma.user.upsert({
    where: { username: 'testuser' },
    update: {},
    create: {
      username: 'testuser',
      passwordHash: 'hashedpassword',
      name: 'Test',
      surname: 'User',
      defaultBowType: 'COMPOUND',
      club: {
        connectOrCreate: {
          where: { name: 'Default Club' },
          create: { name: 'Default Club' },
        },
      },
    },
  });

  console.log('Dummy user ID:', dummyUser.id);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
