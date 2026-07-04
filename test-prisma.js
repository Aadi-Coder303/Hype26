const { PrismaClient } = require('@prisma/client')

try {
  const p1 = new PrismaClient({})
  console.log('{} works')
} catch (e) {
  console.log('{} failed', e.message)
}

try {
  const p2 = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } })
  console.log('datasources works')
} catch (e) {
  console.log('datasources failed', e.message)
}
