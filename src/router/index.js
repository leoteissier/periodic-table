import { createRouter, createWebHistory } from 'vue-router'
import PeriodicTableView from '../views/PeriodicTableView.vue'
import ElementDetailsView from '../views/ElementDetailsView.vue'

const routes = [
  {
    path: '/',
    name: 'PeriodicTable',
    component: PeriodicTableView
  },
  {
    path: '/element/:symbol',
    name: 'ElementDetails',
    component: ElementDetailsView,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
