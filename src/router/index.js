import { createRouter, createWebHistory } from 'vue-router';
import LoginComponent from '@/components/LoginComponent.vue';
import Dashboard from '@/views/Dashboard.vue';
import AddTask from '@/components/AddTask.vue';
import ChangePassword from '@/components/ChangePassword.vue';
import SignupComponent from '@/components/SignupComponent.vue';
import UpdateUserProfile from '@/components/UpdateUserProfile.vue';
import EmailVerification from '@/components/EmailVerification.vue';
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginComponent,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true },
    },
    {
      path:'/add-task',
      name:'add-task',
      component: AddTask,
      meta:{requiresAuth:true}
    },
    {
      path:'/change-password', 
      name:'change-password',
      component: ChangePassword,
      meta:{requiresAuth:true}
    },
    {
      path:'/signup',
      name:'signup',
      component: SignupComponent,
    },
    {
      path:'/update-profile',
      name:'update-profile',
      component:UpdateUserProfile,
      meta:{requiresAuth:true}
    },
    {
      path: '/verify-email/',  // Note the :token parameter
      name: 'verify-email',
      component: EmailVerification,
    }
  ],
});

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('access_token');
  console.log(`Navigating to: ${to.name}, Authenticated: ${isAuthenticated}`); // Debugging log

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' }); // Redirect to login if not authenticated
  } else {
    next();
  }
});

export default router;