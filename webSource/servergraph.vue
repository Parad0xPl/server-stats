<template>
  <canvas id="graph"></canvas>
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
      //this.update();
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
    methods: {
      update: function () {
        this.params = {
          type: 'line',
          data: this.graphdata,
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
                type: 'linear',
                position: 'bottom'
              }]
            }
          }
        };
        if(this.maxplayers > 0){
          this.params.options.scales.yAxes[0].ticks.max = parseInt(this.maxplayers);
        }else if(this.$root.servers[parseInt(this.$root.serversId[this.$route.params.id])].maxPlayers){
          this.params.options.scales.yAxes[0].ticks.max = this.$root.servers[parseInt(this.$root.serversId[this.$route.params.id])].maxPlayers;
        }
        // console.log(this.$root.servers[parseInt(this.$root.serversId[this.$route.params.id])]);
        // console.log(this.$root);
        // console.log("Params ", this.params);
        // console.log(JSON.stringify(this.params));
        this.chart = new Chart(this.$el, this.params);
      },
      updateData: function () {
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
        var req = new XMLHttpRequest();
        var date = new Date();
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
        url += "/day";
        // console.log(url);
        req.open('GET', url);
        req.onreadystatechange = function () {
          if (req.readyState == XMLHttpRequest.DONE &&
            req.status === 200) {
              var obj = JSON.parse(req.response);
              if(obj.length <= 0){
                return -1;
              }
              self.graphdata.datasets[0].data = [];
              self.graphdata.datasets = [];
              var firstStamp = new Date(obj[0].createdAt);
              var dataset = {
                label: "Traffic",
                data: []
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
                    data: []
                  };
                  dataset = Object.assign({}, generateTemplate(), dataset)
                }
                lastStamp = stamp;
                stamp /= 60;
                stamp = Math.floor(stamp);
                dataset.data.push({
                  x: stamp,
                  y: el.players
                });
                // self.graphdata.datasets[0].data.push({
                //   x: stamp,
                //   y: el.players
                // });
                self.graphdata.labels.push(new Date(el.createdAt).toLocaleTimeString());
              });
              // console.log("Dataset ", dataset);
              // self.graphdata.datasets.push(dataset);
              self.graphdata.datasets.push(dataset);
              self.graphdata = JSON.parse(JSON.stringify(self.graphdata));
              // console.log("Graphdata ", self.graphdata);
              self.update();
          }
        };
        req.send(null);
      }
    }
  }
</script>
