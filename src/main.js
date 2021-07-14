import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

import './plugins/element';
import './plugins/vxe-table';

Vue.config.productionTip = false;
Vue.prototype.$error = (...params) =>
  console.error('Error=========================>>>>>>>>>>>>>>>>>>>>>>>>ERROR', ...params);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
