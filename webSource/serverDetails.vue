<template>
  <div class="container no-gutters">
    <div class="row">
      <h1>{{server.name}}  <small class="text-muted">{{details.name}}</small></h1>
    </div>
    <div class="row">
      <div class="col-5">
        <ul class="list-unstyled">
          <li v-if="server && server.address !== undefined">
            Address: {{server.address}}
          </li>
          <li v-if="details && details.map !== undefined">
            Map: {{details.map}}
          </li>
          <li v-if="details && details.password !== undefined">
            Password: {{details.password?"true":"false"}}
          </li>
          <li v-if="details && details.traffic !== undefined">
            Actual: {{details.traffic.players}}/{{details.traffic.maxplayers}}
          </li>
        </ul>
      </div>
      <div class="col-5">
        <div v-if="details.players !== undefined && details.traffic">
          Players:<span>{{details.players.length}}/{{details.traffic.maxplayers}}</span>
        </div>
        <ul class="list-group" v-if="details.players !== undefined">
          <li v-for="player in details.players" class="list-group-item">{{player.name}}</li>
        </ul>
      </div>
      <div class="col-2">
        <button type="button" class="btn btn-danger" @click="remove($route.params.id)">Remove</button>
      </div>
    </div>
    <div class="row">
      <servergraph :server="parseInt($route.params.id)" :maxplayers="server.maxPlayers"></servergraph>
    </div>
  </div>
</template>
<script>
import swal from "sweetalert2";

export default {
  created: function () {
    this.update();
  },
  data: function () {
    return {
      details: {
        traffic: {

        }
      },
      server: {}
    }
  },
  methods: {
    update: function () {
      if(this.$root.servers.length !== 0 && this.$root.serversId){
        this.server = this.$root.servers[parseInt(this.$root.serversId[this.$route.params.id])];
      }
      var self = this;
      var req = new XMLHttpRequest();
      req.open('GET', '/api/servers/get/'+this.$route.params.id);
      req.send(null);
      req.onreadystatechange = function () {
        if (req.readyState == XMLHttpRequest.DONE &&
          req.status === 200) {
          self.details = JSON.parse(req.response);
        }
      };
    },
    remove: function (id) {
      var self = this;
      swal({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then(function () {
        var req = new XMLHttpRequest();
        req.open('GET', '/api/servers/remove/'+ id);
        req.send(null);
        req.onreadystatechange = function () {
          if (req.readyState == XMLHttpRequest.DONE &&
            req.status === 200) {
          }
        };
        self.$router.push("/");
      }, function () {
      }).catch(console.log);
    }
  }
}
</script>
