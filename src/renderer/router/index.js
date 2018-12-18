import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/books',
      name: 'books',
      // component: require('@/components/LandingPage').default
      component: require('@/components/BooksPage').default
    },
    {
      path: '/edit',
      name: 'edit',
      component: require('@/components/EditPage').default
    },
    {
      path: '/share',
      name: 'share',
      component: require('@/components/SharePage').default
    },
    {
      path: '/setting',
      name: 'setting',
      component: require('@/components/SettingPage').default
    },
    {
      path: '*',
      redirect: '/books'
    }
  ]
})
