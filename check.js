const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./dev.db"
    }
  }
});

async function main() {
  const users = await prisma.user.findMany();
  const couples = await prisma.couple.findMany();
  const goals = await prisma.goal.findMany();
  console.log("USERS:", JSON.stringify(users, null, 2));
  console.log("COUPLES:", JSON.stringify(couples, null, 2));
  console.log("GOALS:", JSON.stringify(goals, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
