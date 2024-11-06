import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.userInfo.deleteMany();
  await prisma.userWorkspace.deleteMany();

  const user = await prisma.user.create({
    data: {
      email: 'example@gmail.com',
      accountType: 'credentials',
      is_active: true,
      password: 'password',
      username: 'example',
      id: crypto.randomUUID(),
    },
  });
  console.log({ user });
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
