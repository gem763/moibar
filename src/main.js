// import { createApp } from 'vue'
const { createApp } = Vue
// import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'
// import { createPinia } from 'pinia'

import App from './App.vue'
// import router from './router'

// import './assets/main.css'

const app = createApp(App)

// app.use(createPinia())
// app.use(router)

app.mount('#app')
