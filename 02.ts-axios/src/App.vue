<template>
  <a-form
    :model="loginForm"
    class="login-form"
    @submit.prevent="handleSubmit"
  >
    <a-form-item
      label="用户名"
      name="username"
    >
      <a-input v-model:value="loginForm.username" />
    </a-form-item>

    <a-form-item
      label="密 码"
      name="password"
    >
      <a-input-password v-model:value="loginForm.password" />
    </a-form-item>

    <a-form-item>
      <a-button type="primary" html-type="submit" class="login-form-button">
        登 录
      </a-button>

      <a-button type="primary" danger @click="onTestError">
        失败测试
      </a-button>
    </a-form-item>
  </a-form>
</template>
<script setup lang="ts">
import { reactive } from 'vue'
import request from '@/utils/request'
import { login, loginRaw, getUserInfo } from '@/api'

interface FormState {
  username: string;
  password: string;
}

const loginForm = reactive<FormState>({
  username: '',
  password: '',
})

const handleSubmit = async (values: any) => {
  const form = {
    username: loginForm.username,
    password: loginForm.password
  }

  const res = await login(form)
  console.log(res.token)

  const res2 = await loginRaw(form)
  console.log(res2.token)
  
  const userInfo = await getUserInfo()
  console.log(userInfo.username)
}

const onTestError = () => {
  request.get('/error')
}

</script>

<style scoped>
.login-form {
  max-width: 300px;
}
.login-form-forgot {
  float: right;
}
.login-form-button {
  width: 30%;
  margin-right: 20px;
}
</style>