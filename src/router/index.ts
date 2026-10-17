import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import ConnexionComponent from "@/components/ConnexionComponent.vue";
import GridPage from '@/views/GridPage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Connexion',
    component: ConnexionComponent,
  },
  {
    path: '/grid',
    name: 'Grid',
    component: GridPage,
    props: { mode: 'caissier' },
    beforeEnter: (to, from, next) => {
      if (localStorage.getItem('user')) {
        next();
      } else {
        next({ name: 'Connexion' });
      }
    }
  },
  {
    path: '/gerant',
    name: 'Gerant',
    component: GridPage,
    props: { mode: 'gerant' },
    beforeEnter: (to, from, next) => {
      if (localStorage.getItem('user')) {
        next();
      } else {
        next({ name: 'Connexion' });
      }
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
