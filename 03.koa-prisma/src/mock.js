const { Random } = require('mockjs')

const users = []
for (let i = 0; i < 100; i++) {
  const user = {
    name: Random.cname(),
    email: Random.email(),
    password: Random.string(10)
  }

  console.log(user.name)

  users.push(user)
}

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  await prisma.user.createMany({
    data: users
  })
}

main()