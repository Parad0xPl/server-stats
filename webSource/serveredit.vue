<template>
  <form action="/api/servers/add" method="post">
    <div class="row editor form-group">
      <div class="col-4">
        <input class="form-control" placeholder="Name" name="name">
        </input>
      </div>
      <div class="col-3">
        <select class="form-control" name="type">
          <option value="">Server type</option>
          <option v-for="(option, key) in $root.types" :value="option">
            {{key}}
          </option>
        </select>
      </div>
      <div class="col-3">
        <input class="form-control" placeholder="Address" name="address">
        </input>
      </div>
      <div class="col-2">
        <button type="submit" class="btn btn-primary">{{buttonText}}</button>
      </div>
    </div>
  </form>
</template>
<script>
import swal from "sweetalert2";
import $ from "jquery";
export default {
  mounted: function () {
    this.request();
  },
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
    },
    onSubmit: {
      type: Function,
      default: function () {
      }
    },
    buttonText: {
      type: String,
      default: function () {
        return "Add";
      }
    }
  },
  data: function () {
    return {};
  },
  methods: {
    request: function () {
      var self = this;
      var form = $(this.$el);
      form.submit(function(e){
          e.preventDefault();

          // Validation
          var ar = form.serializeArray();
          var flags = {
            name: 0,
            type: 0,
            address: 0
          }
          ar.forEach(function (obj) {
            if(!obj.value){
              flags[obj.name] = 1;
            }
          });
          var wrong = false;
          for (var name in flags) {
            var el = $('[name="'+name+'"]')
            if (!flags.hasOwnProperty(name)) {
              continue;
            }
            if(flags[name]){
              wrong = true;
              el.addClass("form-control-danger");
              el.parent().addClass("has-danger");
            }else{
              el.removeClass("form-control-danger");
              el.parent().removeClass("has-danger")
            }
          }
          if(wrong){
            swal({
              titleText: "Wrong input",
              text:"Provide all data about server",
              type:"error"
            });
            return;
          }
          // Request
          $.post('/api/servers/add', form.serialize())
            .done(function () {
              self.$router.push("/");
              form.find("input, select").val("");
              self.onSubmit();
            });
      });
    }
  }
}
</script>
