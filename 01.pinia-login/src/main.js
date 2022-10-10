import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import pinia from './store'

const app = createApp(App)
app.use(pinia).mount('#app')
