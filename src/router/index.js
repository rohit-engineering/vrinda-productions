// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import ShopPage from '../pages/ShopPage.vue'
import LoginPage from '../pages/LoginPage.vue'
import SignupPage from '../pages/SignupPage.vue'
import ProductDetails from '../pages/ProductDetails.vue'
import { session } from '../supabase'

const routes = [
  { path: '/', name: 'Shop', component: ShopPage },
  { path: '/login', name: 'Login', component: LoginPage, meta: { guestOnly: true } },
  { path: '/signup', name: 'Signup', component: SignupPage, meta: { guestOnly: true } },
  { path: '/product/:id', name: 'ProductDetails', component: ProductDetails, props: true }
]

const router = createRouter({
  history: createWebHistory('/vrinda-productions/'),
  routes
})

router.beforeEach((to, from, next) => {
  // prevent visiting login/signup when already logged in
  if (to.meta?.guestOnly && session.value) {
    return next({ path: '/' })
  }
  next()
})

export default router
