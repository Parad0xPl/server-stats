<template>
  <div class="container no-gutters" id="serverList">
    <div class="row" id="titles">
      <div class="col-4">
        Server name
      </div>
      <div class="col-3">
        Server Type
      </div>
      <div class="col-3">
        Address
      </div>
      <div class="col-2">
        Players
      </div>
    </div>
    <server v-for="server in servers" :server="server" :update="update"></server>
    <serveredit :update="update" :onSubmit="update"></serveeditr>
  </div>
</template>

<script>
export default {
  created: function () {
    this.servers = this.$root.servers;
    this.update();
  },
  watch: {
    "$root.servers": function (val, old) {
      this.servers = val;
    }
  },
  data: function () {
    return {
      servers: [],
      serversId: {}
    }
  },
  methods: {
    update: function () {
      var self = this;
      $.getJSON('/api/details')
        .done(function (res) {
          self.servers = res;
          var a;
          self.$root.servers = self.servers;
          self.$root.serversId = {};
          for (a in self.servers) {
            if (!self.servers.hasOwnProperty(a)) {
              continue;
            }
            var obj = self.servers[a];
            self.$root.serversId[obj.id] = a;
          }
        });
    }
  }
}
</script>

<style>
</style>
