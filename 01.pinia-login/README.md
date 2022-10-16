

# 一个登录案例学会 Pinia

Pinia 号称下一代的 Vuex。

经过初步体验，发现相比于 Vuex，Pinia 确实有了很大进步，最明显的就是删减了复杂的概念，简化了数据流转的过程，现在只剩下了 store、state、getters、actions 这四个核心概念。

接下来使用一个**用户登录**的案例，来学习 Pinia 的使用。

## 案例概述

需要用到：

- vite：创建和管理 vue 项目
- pinia：状态管理
- axios：网络请求
- vite-plugin-mock：提供登录的 mock 接口
- pinia-plugin-persistedstate：状态持久化插件



我们会先 mock 一个简单的登录接口，然后介绍使用 Pinia 的基本流程，最后在组件中使用 Pinia，完成整个流程。

![](https://static.kunwu.tech/images/2022-10/202210102233072.webp)



### 初始化工程

创建 Vue 项目可以使用 create-vite 和 create-vue 这两个脚手架。案例使用前者。

``` bash
pnpm create vite pinia-login
```

选择 Vue 和 使用 JavaScript 构建：

![image-20221007164049987](https://static.kunwu.tech/images/2022-10/202210071641551.webp)



![image-20221007164147819](https://static.kunwu.tech/images/2022-10/202210071641431.webp)

然后进入项目并安装依赖：

``` bash
cd vite pinia-login
pnpm install
```



代码示例上传到[仓库](https://github.com/hsyq/lite-demo)。到最后完成后的目录结构如下：

![image-20221010221819787](https://static.kunwu.tech/images/2022-10/202210102336416.webp)





## Mock 的用法

项目开发阶段通常会使用 mock 数据。插件 [vite-plugin-mock](https://www.npmjs.com/package/vite-plugin-mock)  同时提供了开发环境和生产环境下的数据 mock 服务，简单好用。



### 安装

插件依赖于 mockjs，需要一并安装：

```bash
pnpm add -D vite-plugin-mock mockjs
```

### 配置

在 `vite.config.js` 配置文件启用插件。

**Mock 服务通常只用于开发阶段**，因此我们需要在配置文件中判断当前所处环境。

在 webpack 中通常会配置一个 `NODE_ENV` 的环境变量。而在 Vite 中，不用开发者进行设置，它提供了一种方便的判断开发环境和生产环境的方式，如下：

``` js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteMockServe } from 'vite-plugin-mock'

export default defineConfig((config) => {
  const { command } = config
  return {
    plugins: [
      vue(),
      viteMockServe({
        // 只在开发阶段开启 mock 服务
        localEnabled: command === 'serve'
      })
    ]
  }
})
```

上面，配置文件导出一个立即执行的 `defineConfig` 函数。它又接收一个函数作为参数，该函数接收一个 `config` 参数，它包含一个 `command` 属性。当在命令行中执行 `vite` （开发）命令时， `command` 的值为 `serve`，当执行 `vite build` （构建）命令时，对应的值为 `build`。据此，可以识别所处环境。

插件 `vite-plugin-mock` 有一个配置项 `localEnabled`，可以决定是否开启 mock 服务。默认即为开启状态。结合 `command` 属性，就可以动态的切换 mock 服务的状态了。



### 编写 mock server

该插件开箱即用。默认它会读取项目根目录下 `mock` 文件下的内容，作为 mock server。

新建一个模拟用户接口的服务，它导出一个数组，数组里每一项用来模拟一个接口：

``` js
// /mock/user.js

export default [
  // 用户登录
  {
    // 请求地址
    url: "/api/user/login",
    // 请求方法
    method: "post",
    // 响应数据
    response: () => {
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
```

插件内部使用了 [Connect](https://github.com/senchalabs/connect) 来提供接口服务，它是一个比 `Express` 更悠久的 Node HTTP 框架。上面的写法就相当于创建了一个这样的接口服务：

``` js
app.post('/api/user/login', (req, res)=>{
    res.send({
        code: 0,
        message: 'success',
        data: {
          token: "Token",
          username: "昆吾kw"
        }
    })
})
```



由于开启了`mock` 服务，当前端在发出 `ajax` 请求时，会被拦截到，交由 `mock` 服务处理。没有做数据校验，前端传任何数据来都返回上面的结果。



## 使用 Pinia

如果用过 `Vuex`，那么可以无缝切换到 `Pinia`，用过之后，你会直呼**简约就是美**。

`Pinia` 提供了更简单的 API，具有更少的规范，提供了 Composition API 风格的 API。尤其是对 `Typescript` 的支持，比 `Vuex` 好用太多。

Pinia 的核心概念只剩下了：

- store：状态仓库
- state：状态，和 vuex 保持一致
- getters：类似组件的计算属性，和 vuex 中的 getters 的保持一致
- actions：和 vuex 中的 actions 保持一致，可以处理逻辑并修改 state



安装依赖：

```bash
pnpm add pinia axios
```

axios 一会在 actions 中发送请求。

使用 Pinia 的一般套路是：

1. 创建 pinia

2. 注册 pinia

3. 创建 store

4. 抽离需要管理的数据作为 state，声明 getters 优化状态读取，声明 actions 处理业务逻辑

5. 在需要的地方（组件或其他），导入和使用 store



### 创建 pinia

和 `Vuex` 的用法一样，通常会在 `src` 目录下创建 store 目录来存放状态管理有关的代码。

首先是创建 `pinia` 插件。在该文件中，从安装好的 `pinia` 模块中导出一个 `createPinia` 方法，它用于创建一个pinia `插`件实例供 Vue 注册和使用。

``` js
// store/index.js

import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia
```



### 注册 pinia 

在项目的入口文件中，注册上面创建出来的 `pinia` 插件。

``` js
import { createApp } from 'vue'
import App from './App.vue'
import pinia from './store'

const app = createApp(App)
app.use(pinia).mount('#app')
```

`app` 实例调用 `use` 方法来注册插件。在 Vue2 中，注册插件直接调用 `Vue.use`方法。 



### 创建用户 store

过去使用 `Vuex` 时，通常会先创建一个根 `store`，然后划分模块，每个模块拆分成一个文件进行管理，然后再导入根 `store` 中注册。

`Pinia` 中没有 `module` 的概念，是一个拍平的 `store` 结构。Pinia `推荐`按照功能去划分一个个的 `store` ，这样更方便管理和使用。

使用 `defineStore` 方法创建 `store`，store 的命名遵循 `useXXX` 的形式。创建时需要指定一个唯一的 `id`，有两种方式：

``` js
const useStore = defineStore('main', {
  // other options...
})

const useStore = defineStore({
   id: 'main'
  // other options...
})
```



下面是定义的用户 `store`。

``` js
// store/user.js

import axios from 'axios'
import { defineStore } from 'pinia'

// 创建 store
const useUserStore = defineStore('user', {
  // 定义状态：一个函数，返回一个对象
  state: () => ({
    username: '',
    token: ''
  }),
   
  // 定义 getters，等同于组件的计算属性
  getters: {
    // getter 函数接收 state 作为参数，推荐使用箭头函数
    hello: state => 'Hello!' + state.username
  },
  
  // 定义 actions，有同步和异步两种类型
  actions: {
    // 异步 action，一般用来处理异步逻辑
    async login(userData) {
      const result = await axios.post('/api/user/login', userData)
      const { data, code } = result.data
      if (code === 0) {
        // action 中修改状态，
        this.username = data.username
        this.token = data.token
      }
    },

    // 同步 action
    logout() {
      this.token = ''
      this.username = ''
    }
  }
})

export default useUserStore
```



### state、getters、actions

这几个概念，相信大家都很熟悉了，就不再过多介绍了。

重点说下 `actions` 。过去要修改 store 中的状态，需要先 `dispatch action`，再 `commit mutation`，真的很繁琐。

这次最大的改变，就是不再需要 `dispatch` 了，也没有 `mutation` 的概念了，可以当作普通函数那样使用就好了。无论是同步逻辑，还是异步逻辑，现在都可以一股脑写在 actions 中了。在一个 `action` 函数中， `this` 就是当前 `store` 的实例，可以直接修改状态。



### 组件中使用 Pinia

组件中使用 store 非常方便，使用哪个就导入哪个。

`Pinia` 和 `Vuex4` 一样，支持 `Composition API` ，先实例化 `store`；实例化 `store` 之后，可以直接使用它的 `state`、`getters` 和 `actions`。

``` vue
// App.vue

<script setup>
import { reactive } from 'vue'
import useUserStore from "./store/user"

const userData = reactive({
  username: '',
  password: '',
})

const userStore = useUserStore()

const onLogin = async () => {
  // 使用 actions，当作函数一样直接调用
  // login action 定义为了 async 函数，所以它返回一个 Promise
  await userStore.login()
  userData.username = ''
  userData.password = ''
}

const onLogout = () => {
  userStore.logout()
}
</script>

<template>
  <div>
    <!-- state：通过 store 直接访问 -->
    <template v-if="userStore.token">
       您好，{{ userStore.username }}
       <br />
       <button @click="onLogout">退 出</button>
    </template>

    <template v-else>
      用户名：<input v-model="userData.username" />
      <br />
      密码：<input v-model="userData.password" type="password"/>
      <br />
      <button @click="onLogin">登 录</button>
    </template>
  </div>
</template>
```



运行代码，效果如图：

![login-demo](https://static.kunwu.tech/images/2022-10/login-demo.gif)





### pinia 状态持久化

Pinia 的数据是存在内存当中的，页面刷新数据就会丢失。所以对于一些重要数据，需要持久化到本地存储，简单的数据可以直接调用 `localStorage` 或者 `sessionStorage` API。更推荐的方式，是使用持久化插件，比如 `pinia-plugin-persistedstate`。



安装：

``` bash
pnpm add pinia-plugin-persistedstate
```



然后，在创建 `pinia` 实例的时候，进行插件的注册：

``` js
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export default pinia
```



`Pinia` 中的状态是以 `store` 为单位进行管理的。哪个 `store` 中的数据需要持久化，就在哪个 `store` 中去开启。比如：

``` js
// store/user.js

const useUserStore = defineStore('user', {
  persist: true,
  
  // ......
})
```

通过安装、注册插件、给 `store` 增加 `persist` 属性，就完成了持久化。

默认，持久化的数据放在 `localStorage` 中，`key` 就是该 `store` 的 `id`，存储的结构就是 `state` 的类型：

![image-20221010231550229](https://static.kunwu.tech/images/2022-10/202210102315690.webp)



可以通过 `persist` 进行具体的设置，比如：

``` js
const useUserStore = defineStore('user', {
  persist: {
    key: "USER",
    storage: sessionStorage,
    paths: ["token"]
  },
  
  // ......
})
```

这样设置的效果是，数据存储在 `sessionStorage` 中，`key` 是 USER，只持久化 `token`  这个状态：

![image-20221010232522997](https://static.kunwu.tech/images/2022-10/202210102325659.webp)





## 结语

我们用了一个常见的登录场景，先注册好 `pinia` 插件，然后定义需要管理的数据（状态）和方法（登录逻辑），然后在组件中初始化 store，并使用数据，调用方法，演示了使用 `Pinia` 的基本流程，最后还介绍了一个持久化插件，帮助持久化 `Pinia` 中的状态。

从这个过程中很明显体会到，`Pinia` 的使用相比 `Vuex` ，API 更加简单，数据的流转也更加清晰。如果你还没有使用 `Pinia`，强烈推荐！
