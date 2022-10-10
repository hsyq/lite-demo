import axios from 'axios'
import { defineStore } from 'pinia'

const useUserStore = defineStore('user', {
  persist: true,
  // persist: {
  //   key: "USER",
  //   storage: sessionStorage,
  //   paths: ["token"]
  // },

  state: () => ({
    username: '',
    token: ''
  }),

  getters: {
    hello: state => 'Hello!' + state.username
  },

  actions: {
    // 异步 action
    async login(userData) {
      const result = await axios.post('/api/user/login', userData)
      const { data, code } = result.data
      if (code === 0) {
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