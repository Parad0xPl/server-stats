// import $ from "jquery";
// import "bootstrap/dist/js/bootstrap.js";
import "bootstrap/dist/css/bootstrap.css";
import "sweetalert2/dist/sweetalert2.css";
import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

// Debug mode
Vue.config.debug = true;

// Devtools enabled
Vue.config.devtools = true;

// Silence logs and warnings
Vue.config.silent = false;

import comp_serverList from "./serverList.vue";
import comp_serverDetails from "./serverDetails.vue";
import comp_server from "./server.vue";
import comp_serveredit from "./serveredit.vue";

Vue.component('server', comp_server);
Vue.component('serveredit', comp_serveredit);

var routes = [
  { path: "/", component:  comp_serverList },
  { path: "/server/:id", component:  comp_serverDetails }
];

const router = new VueRouter({
  routes: routes,
  mode: 'history'
});

$(function () {
  var app = new Vue({
    router: router,
    el: "#statsApp",
    data: {
      servers: [],
      serversId: {},
      types: []
    },
    created: function(){
      var self = this;
      var types = new XMLHttpRequest();
      types.open('GET', '/api/types');
      types.send(null);
      types.onreadystatechange = function () {
        if (types.readyState == XMLHttpRequest.DONE &&
          types.status === 200) {
          self.types = JSON.parse(types.response);
        }
      };
    }
  });//.$mount("#statsApp");
});
