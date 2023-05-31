const Router = require('@koa/router')
const prisma = require('../prisma')

const router = new Router({
  prefix: '/users'
})

// 定义 4 个路由方法，分别对应 CRUD

// 查询用户列表
router.get('/', async ctx => {
  let { pageNum, pageSize } = ctx.query
  pageNum = parseInt(pageNum)
  pageSize = parseInt(pageSize)
  const users = await prisma.user.findMany({
    where: {
      name: {
        contains: '秀英'
      }
    },
    select: {
      name: true,
      email: true
    },
    // 偏移量，相当于页码
    skip: (pageNum - 1) * pageSize,
    take: pageSize,

    orderBy: {
      email: 'desc' // asc: 升序排序 a-z desc：降序排序，z-a
    }
  })

  ctx.body = users
})

// 查询单个用户
router.get('/:id', async ctx => {
  const id = parseInt(ctx.params.id)
  const user = await prisma.user.findUnique({
    where: { id }
  })

  ctx.body = user
})

// 创建用户
router.post('/', async ctx => {
  const user = ctx.request.body
  const res = await prisma.user.create({
    data: user
  })

  console.log(res)
  ctx.body = res
})

// 更新用户 /1
router.patch('/:id', async ctx => {
  const id = parseInt(ctx.params.id)
  const updateUser = ctx.request.body

  const res = await prisma.user.update({
    where: {
      id
    },
    data: updateUser
  })

  console.log(res)

  ctx.body = res
})

// 删除用户
router.delete('/:id', async ctx => {
  const id = parseInt(ctx.params.id)

  const res = await prisma.user.deleteMany({
    where: {
      id,
      // 批量删除
      // id: {
      //   in: [201, 202, 203, 204, 205]
      // }
    },
    // include: {
    //   profile: true
    // }
  })

  // console.log(res)

  ctx.body = res
})

module.exports = router