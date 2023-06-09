import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useElementStore } from './stores'
import './assets/main.css'

createApp(App)
    .use(router)
    .use(createPinia())
    .mount('#app')

useElementStore().fetchElements()
