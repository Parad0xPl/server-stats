<template>
  <div class="row">
    <div class="col-4">
      <div id="actions">
        <a @click="remove(server.id)"><img src="svg/x.svg"></a>
        <a><img src="svg/pencil.svg"></a>
      </div>
      <router-link :server="server" :to="{ path: '/server/'+server.id}">
        {{ server.name }} <img v-show="server.isPassword" class="icon" src="svg/lock.svg">
      </router-link>
    </div>
    <div class="col-3">
      {{ server.fullType }}
    </div>
    <div class="col-3">
      {{ server.address }}
    </div>
    <div class="col-2">
      {{ server.players }}/{{ server.maxPlayers }}
    </div>
  </div>
</template>
<script>
import swal from "sweetalert2";
import $ from "jquery";
export default {
  props: {
    server: {
      type: Object,
      default:function () {
        return {
          id:0,
          name: "Name",
          address: "Address",
          players: 0,
          maxPlayers: 0,
          isPassword: false
        };
      }
    },
    update: {
      type: Function
    }
  },
  data: function () {
    return {};
  },
  methods: {
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
        $.getJSON('/api/servers/remove/'+ id)
          .done(function (res) {
            self.update();
            var el = $(self.$el);
            el.css("opacity", 0.5);
            var actions = el.find("#actions");
            actions.children().hide();
            actions.append('<img src="svg/loading.svg"></img>');
          });
      }, function () {
      }).catch(console.log);
    }
  }
}
</script>
