const express = require('express');
const bodyparser = require('body-parser');
const async = require('async');
var app = express();
var engine = require("./engine");

app.use(bodyparser.urlencoded({
  extended: true
}));
app.use(bodyparser.json());

app.get("/", function (req, res) {
  // TODO Frontend app
  return res.send("WIP");
});

app.get("/api/types", function (req, res) {
  res.type('json');
  res.send(JSON.stringify(engine.getServerTypes()));
});

app.get("/api/servers/list", function (req,res) {
  engine.serverMenager.list(function (data) {
    res.type('json');
    res.send(JSON.stringify(data));
  });
});

app.post("/api/servers/add", function (req,res) {
  var type = req.body.type;
  var name = req.body.name;
  var address = req.body.address;
  engine.serverMenager.add(type, address, name);
  res.send("");
});

app.post("/api/servers/remove", function (req, res) {
  var id = req.body.id;
  engine.serverMenager.remove(id);
  res.send("");
});

app.get("/api/trafic/update", function (req, res) {
  engine.serverMenager.list(function (data) {
    async.map(data, function (data, callback) {
      var server = data;
      engine.statusGrabber.getStatus(server.type, server.address, function(data) {
        var h = engine.statusGrabber.getResponseHandler(server.type);
        h(data, server.get("id"));
        callback(null, data);
      });
    }, function (err, map) {
      res.type("json");
      res.send(JSON.stringify(map));
    });
  });
});

app.get("/api/trafic/update/:id", function (req, res) {
  engine.serverMenager.getByID(Number(req.params.id), function (data) {
    if(typeof data == "string"){
      res.type("text");
      res.send(data);
      return;
    }
    var server = data;
    engine.statusGrabber.getStatus(server.type, server.address, function(data) {
      var h = engine.statusGrabber.getResponseHandler(server.type);
      h(data, server.get("id"));
      res.type("json");
      res.send(JSON.stringify(data));
    });
  });
});

app.get("/api/status", function (req, res) {
  engine.serverMenager.list(function (data) {
    async.map(data, function (data, callback) {
      var server = data;
      engine.statusGrabber.getStatus(server.type, server.address, function(data) {
        callback(null, data);
      });
    }, function (err, map) {
      res.type("json");
      res.send(JSON.stringify(map));
    });
  });
});

app.get("/api/status/:id", function (req, res) {
  engine.serverMenager.getByID(Number(req.params.id), function (data) {
    if(typeof data == "string"){
      res.type("text");
      res.send(data);
      return;
    }
    var server = data;
    engine.statusGrabber.getStatus(server.type, server.address, function(data) {
      if(data){
        res.type("json");
        data["_id"] = Number(req.params.id);
        res.send(JSON.stringify(data));
      }else{
        res.send("Intertnal Error");
      }
    });
  });
});

app.get("/api/trafic/get/all", function (req, res) {
  engine.statusGrabber.getTraffic(function (data) {
    res.type('json');
    res.send(JSON.stringify(data));
  });
});

app.listen(80);
