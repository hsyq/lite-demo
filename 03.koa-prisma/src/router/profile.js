const Router = require('@koa/router')
const prisma = require('../prisma')

const router = new Router({
  prefix: '/profile'
})

// 定义 4 个路由方法，分别对应 CRUD

// 
router.get("/:id", async ctx => {
  console.log('查询用户')
  const res = await prisma.profile.findUnique({
    where: {
      userId: parseInt(ctx.params.id)
    }
  })

  ctx.body = res
})

router.post('/', async ctx => {
  // { userId, age, gender, phone }
  const profile = ctx.request.body
  const res = await prisma.profile.create({
    data: profile
  })

  ctx.body = res
})

router.patch("/:id", async ctx => {
  const res = await prisma.profile.update({
    where: {
      userId: parseInt(ctx.params.id)
    },
    data: ctx.request.body
  })

  ctx.body = res
})

router.delete('/:id', async ctx => {
  const id = parseInt(ctx.params.id)
  const res = await prisma.profile.delete({
    where: {
      userId: id
    }
  })

  ctx.body = res
})

module.exports = router
