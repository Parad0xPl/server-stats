<template>
  <div class="container">
    <div class="row" id="dateControls">
      <div class="col-7">
        <input class="form-control" type="date" v-model.lazy="date">
      </div>
      <div class="col-2">
        <button class="form-control" type="button" @click="today">Today</button>
      </div>
      <div class="col-3">
        <select class="form-control" name="type" v-model.number="type">
          <option value="0">Day</option>
          <option value="1">Month</option>
          <option value="2">Year</option>
        </select>
      </div>
    </div>
    <canvas id="graph"></canvas>
  </div>
</template>
<script>
var generateTemplate = function(){
  var rand = function(){
    return Math.floor(Math.random()*256);
  }
  var color = "rgba("+rand()+","+rand()+","+rand()+",0.1)";
  // console.log(color);
  return {
    label: "Traffic",
    fill: true,
    lineTension: 0.1,
    backgroundColor: "rgba(75,192,192,0.4)",
    borderColor: color,
    borderCapStyle: 'butt',
    borderDash: [],
    borderDashOffset: 0.0,
    borderJoinStyle: 'miter',
    pointBorderColor: color, //"rgba(75,192,192,1)",
    pointBackgroundColor: "#fff",
    // pointBorderWidth: 1,
    // pointHoverRadius: 5,
    // pointHoverBackgroundColor: "rgba(75,192,192,1)",
    // pointHoverBorderColor: "rgba(220,220,220,1)",
    // pointHoverBorderWidth: 2,
    pointRadius: 1,
    pointHitRadius: 10,
    data: [],
    spanGaps: true,
  };
};
  import Chart from "chart.js";
  export default {
    created: function () {
      this.updateData();
    },
    mounted: function () {
      this.initData();
      this.update();
    },
    props: {
      server: {
        type: Number,
        default:-1
      },
      maxplayers: {
        type: Number,
        default:-1
      }
    },
    data: function () {
      return {
        chart: {},
        type: 0,
        date: new Date().toISOString().split("T")[0],
        // labels: {},
        stamp: null
        // datasetTempalte:{
        //   label: "Traffic",
        //   fill: true,
        //   // lineTension: 0.1,
        //   // backgroundColor: "rgba(75,192,192,0.4)",
        //   // borderColor: "rgba(75,192,192,1)",
        //   // borderCapStyle: 'butt',
        //   // borderDash: [],
        //   // borderDashOffset: 0.0,
        //   // borderJoinStyle: 'miter',
        //   // pointBorderColor: "rgba(75,192,192,1)",
        //   // pointBackgroundColor: "#fff",
        //   // pointBorderWidth: 1,
        //   // pointHoverRadius: 5,
        //   // pointHoverBackgroundColor: "rgba(75,192,192,1)",
        //   // pointHoverBorderColor: "rgba(220,220,220,1)",
        //   // pointHoverBorderWidth: 2,
        //   // pointRadius: 1,
        //   // pointHitRadius: 10,
        //   data: [],
        //   // spanGaps: false,
        // },
      }
    },
    watch:{
      type: function (val) {
        this.updateData();
        this.update();
      },
      date: function (val, old) {
        if(val === ""){
          this.date = old;
        }
        if(val === old){
          return 0;
        }
        var self = this;
        if(this.dateInt){
          clearTimeout(this.dateInt);
        }
        this.dateInt = setTimeout(function () {
          console.log(val);
          self.updateData();
          self.update();
        }, 300)
      }
    },
    methods: {
      today: function () {
        this.date = new Date().toISOString().split("T")[0];
      },
      initData: function () {
        this.params = {
          type: 'line',
          data: {},
          options: {
            responsive: true,
            legend:{
              display: false
            },
            scales: {
              yAxes: [{
                ticks: {
                  beginAtZero:true
                }
              }],
              xAxes: [{
                display: true,
                type: 'time',
                time: {
                    tooltipFormat: "H:mm:ss",
                    displayFormat: "H:mm:ss"
                },
                position: 'bottom'
              }]
            }
          }
        };
        this.chartElement = $(this.$el).find("#graph");
        this.chart = new Chart(this.chartElement, this.params);
      },
      update: function () {
        if(this.maxplayers > 0){
          this.params.options.scales.yAxes[0].ticks.max = parseInt(this.maxplayers);
        }else if(this.$root.servers[parseInt(this.$root.serversId[this.$route.params.id])] &&
            this.$root.servers[parseInt(this.$root.serversId[this.$route.params.id])].maxPlayers){
          this.params.options.scales.yAxes[0].ticks.max = this.$root.servers[parseInt(this.$root.serversId[this.$route.params.id])].maxPlayers;
        }
        switch (this.type) {
          case 0:
            this.params.options.scales.xAxes[0].time.displayFormat = "H:mm:ss";
            this.params.options.scales.xAxes[0].time.tooltipFormat = "H:mm:ss";
            break;
          case 1:
            this.params.options.scales.xAxes[0].time.displayFormat = "D";
            this.params.options.scales.xAxes[0].time.tooltipFormat = "D.MM H:mm:ss";
            break;
          case 2:
            this.params.options.scales.xAxes[0].time.displayFormat = "D.MM.YY";
            this.params.options.scales.xAxes[0].time.tooltipFormat = "D.MM.YY H:mm:ss";
            break;
          default:

        }
        this.params.data = this.graphdata;
        this.chart.update();
      },
      updateData: function (type) {
        this.type = this.type || 0;
        this.graphdata = {
          labels: [],
          datasets: [
            {
              label: "Traffic",
              data: null
            }
          ]
        };
        if(this.server === -1){
          return -1;
        }
        var self = this;
        var date = new Date(this.date);
        var year = date.getUTCFullYear();
        var month = date.getUTCMonth() + 1;
        var day = date.getUTCDate();
        var url = '/api/trafic/';
        url += this.server;
        url += "/";
        url += day;
        url += "/";
        url += month;
        url += "/";
        url += year;
        switch (this.type) {
          case 0:
            url += "/day";
            break;
          case 1:
            url += "/month";
            break;
          case 2:
            url += "/year";
            break;
          default:
            url += "/day";
        }
        // console.log(url);
        $.getJSON(url)
          .done(function (obj) {
            if(obj.length <= 0){
              return -1;
            }
            self.graphdata.datasets[0].data = [];
            self.graphdata.datasets = [];
            var firstStamp = new Date(obj[0].createdAt);
            self.params.options.scales.xAxes[0].time.min = firstStamp;
            self.stamp = firstStamp;
            var dataset = {
              label: "Traffic",
              data: [],
              labels: []
            };
            // console.log(dataset);
            dataset = Object.assign({}, generateTemplate(), dataset)
            var lastStamp = firstStamp/1000;
            var gap = firstStamp/1000 - new Date(obj[1].createdAt)/1000;
            gap = Math.abs(Math.floor(gap));
            obj.forEach(function (el) {
              var stamp = new Date(el.createdAt) - firstStamp;
              stamp /= 1000;
              // console.log("Gap: ", gap);
              // console.log("Stamp: ", stamp);
              // console.log("lastStamp: ", lastStamp);
              // console.log(stamp-lastStamp);
              if(stamp-lastStamp >  2*gap){
                // console.log("Dataset ", dataset);
                self.graphdata.datasets.push(dataset);
                dataset = {
                  label: "Traffic",
                  data: [],
                  labels: []
                };
                dataset = Object.assign({}, generateTemplate(), dataset)
              }
              lastStamp = stamp;
              stamp /= 60;
              stamp = Math.floor(stamp);
              stamp = new Date(el.createdAt);
              self.params.options.scales.xAxes[0].time.max = stamp;
              dataset.data.push({
                x: stamp,
                y: el.players
              });
              // self.graphdata.datasets[0].data.push({
              //   x: stamp,
              //   y: el.players
              // });
              // dataset.labels.push(new Date(el.createdAt).toLocaleTimeString());
              //self.labels[stamp] = new Date(el.createdAt).toLocaleTimeString();
            });
            // console.log("Dataset ", dataset);
            // self.graphdata.datasets.push(dataset);
            self.graphdata.datasets.push(dataset);

            self.graphdata = JSON.parse(JSON.stringify(self.graphdata));
            // console.log("Graphdata ", self.graphdata);
            self.update();

          });
      }
    }
  }
</script>
