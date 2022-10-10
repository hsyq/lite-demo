export default [
  // 用户登录
  {
    url: "/api/user/login",
    method: "post",
    response: (res) => {
      return {
        code: 0,
        message: 'success',
        data: {
          token: "Token",
          username: "昆吾kw"
        }
      }
    }
  }
]
