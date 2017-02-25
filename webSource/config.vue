<template lang="html">
  <form>
    <div class="container" id="config">
      <div class="form-group row">
        <label class="col-2 col-form-label">Update Interval</label>
        <div class="col-10">
          <input v-model="options.updateInterval" class="form-control" type="Number">
        </div>
      </div>
      <div class="form-group row">
        <label class="col-2 col-form-label">Port</label>
        <div class="col-10">
          <input v-model="options.port"  class="form-control" type="number">
        </div>
      </div>
      <div class="form-group row">
        <label class="col-2 col-form-label">Start data collector on start?</label>
        <div class="col-10">
          <select v-model="options.updateState" class="form-control">
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>
      <div class="row">
        <button @click="send" class="btn btn-primary">Save</button>
      </div>
    </div>
  </form>
</template>
<script>
import $ from "jquery";
export default {
  data: function () {
    return {
      options: {
        updateInterval: null,
        port: null,
        updateState: null
      }
    }
  },
  created: function () {
    var config = new XMLHttpRequest();
    var form = $(this.$el);
    var self = this;
    config.open('GET', '/api/config');
    config.onreadystatechange = function () {
      if (config.readyState == XMLHttpRequest.DONE &&
        config.status === 200) {
          self.options = JSON.parse(config.response);
      }
    };
    config.send(form.serialize());
  },
  methods: {
    send(){
      var self = this;
      var config = new XMLHttpRequest();
      config.open('POST', '/api/config');
      config.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      config.onreadystatechange = function () {
        if (config.readyState == XMLHttpRequest.DONE &&
          config.status === 200) {
            // self.$router.push("/");
            console.log(JSON.parse(config.response));
        }
      };
      config.send($.param(self.options));

    }
  }
}
</script>

<style lang="css">
</style>
