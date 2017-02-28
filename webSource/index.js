// import $ from "jquery";
// import "bootstrap/dist/js/bootstrap.js";
import "bootstrap/dist/css/bootstrap.css";
import "sweetalert2/dist/sweetalert2.css";
import Vue from "vue";
import VueRouter from "vue-router";
import $ from "jquery";

Vue.use(VueRouter);

// Debug mode
Vue.config.debug = true;

// Devtools enabled
Vue.config.devtools = true;

// Silence logs and warnings
Vue.config.silent = false;

import comp_config from "./config.vue";
import comp_serverList from "./serverList.vue";
import comp_serverDetails from "./serverDetails.vue";
import comp_server from "./server.vue";
import comp_serveredit from "./serveredit.vue";
import comp_servergraph from "./servergraph.vue";

Vue.component('server', comp_server);
Vue.component('serveredit', comp_serveredit);
Vue.component('servergraph', comp_servergraph);

var routes = [
  { path: "/", component:  comp_serverList },
  { path: "/server/:id", component:  comp_serverDetails },
  { path: "/config", component:  comp_config }
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
      $.getJSON('/api/types')
        .done(function (types) {
          self.types = types;
        });
      $.getJSON('/api/details/cached')
        .done(function (res) {
          self.$root.servers = res;
          self.$root.serversId = {};
          for (var a in self.servers) {
            if (!self.servers.hasOwnProperty(a)) {
              continue;
            }
            var obj = self.servers[a];
            self.$root.serversId[obj.id] = a;
          }
        });
      if(this.$route.path !== "/"){
        $.getJSON('/api/details')
          .done(function (details) {
            self.$root.servers = details;
            self.$root.serversId = {};
            for (var a in self.servers) {
              if (!self.servers.hasOwnProperty(a)) {
                continue;
              }
              var obj = self.servers[a];
              self.$root.serversId[obj.id] = a;
            }
          });
      }
    }
  });//.$mount("#statsApp");
});
