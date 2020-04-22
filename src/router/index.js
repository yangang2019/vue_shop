import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/users/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    redirect: '/welcome',
    children: [
      // 当前带有斜线时不再拼接父路径
      {path:'/welcome',component: Welcome},
      {path:'/users',component: Users},
      {path:'/rights',component: Rights},
      {path:'/roles',component: Roles}
    ]
  }
]

const router = new VueRouter({
  routes
})

// 路由导航守卫验证
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  // 获取token,判断是否为已登录状态，否则跳转至登录界面
  const token = window.sessionStorage.getItem('token')
  if (!token) return next('/login')
  next()
})

export default router
