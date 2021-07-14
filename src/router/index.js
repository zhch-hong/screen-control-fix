import Vue from 'vue';
import VueRouter from 'vue-router';

import Layout from '@/components/layout/index.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '',
        name: '门户',
        component: () => import('@/views/portal-list/portal-list.vue'),
        meta: {
          icon: 'el-icon-menu',
        },
      },
    ],
  },
  {
    path: '/update-portal',
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: 'update/:uuid',
        name: '更新门户',
        component: () => import('@/views/update-portal/update/update-portal.vue'),
      },
      {
        path: 'create',
        name: '新增门户',
        component: () => import('@/views/update-portal/create/create-portal.vue'),
      },
    ],
  },
  {
    path: '/page-list',
    component: Layout,
    children: [
      {
        path: '',
        name: '栏目',
        component: () => import('@/views/page-list/page-list.vue'),
        meta: {
          icon: 'el-icon-s-platform',
        },
      },
    ],
  },
  {
    path: '/preview-portal/:uuid/:space',
    name: '门户预览',
    component: () => import('@/views/preview-portal/preview-portal.vue'),
    meta: { hidden: true },
  },
];

const router = new VueRouter({
  routes,
});

export { routes };
export default router;
