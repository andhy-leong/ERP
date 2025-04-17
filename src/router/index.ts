import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import HomePage from '@/views/HomePage.vue';
import AboutPage from '@/views/AboutPage.vue';
import ConnexionComponent from "@/components/ConnexionComponent.vue";
import GridPage from '@/views/GridPage.vue';
import PompesView from "@/views/PompesView.vue";
import EmpGerantComponent from '@/components/EmpGerantComponent.vue';

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
    beforeEnter: (to, from, next) => {
      if (localStorage.getItem('user')) {
        next();
      } else {
        next({ name: 'Connexion' });
      }
    }
  },{
    path: '/gerant',
    name: 'Gerant',
    component: GridPage,
    beforeEnter: (to, from, next) => {
      if (localStorage.getItem('user')) {
        next();
      } else {
        next({ name: 'Connexion' });
      }
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
