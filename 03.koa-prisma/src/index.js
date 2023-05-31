const Koa = require('koa')

const bodyParser = require('koa-bodyparser')
const userRouter = require('./router/user')
const profileRouter = require('./router/profile')
const app = new Koa()

// 处理POST请求，解析请求体中的数据，放到 ctx.request.body 对象上
app.use(bodyParser())

// 注册路由中间件
app.use(userRouter.routes()).use(userRouter.allowedMethods())
app.use(profileRouter.routes()).use(profileRouter.allowedMethods())

app.listen(3000, () => {
  console.log('服务器运行在 3000 端口')
})