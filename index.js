const express = require('express');
const bodyparser = require('body-parser');
const async = require('async');
const ejs = require('ejs');
const serve = require('./serve');
const im = require("./intervalMenager");
var app = express();
var engine = require("./engine");

app.set('view engine', 'ejs');
app.set('views', __dirname + '/web');
// app.engine('ejs', require('ejs').renderFile);
var updateInterval = new im();

var locals = {
  title: "Simple Stats"
};
var localf = function (req, res, next) {
  res.locals = Object.assign(res.locals, locals);
  next();
};
app.use(localf);

app.use(bodyparser.urlencoded({
  extended: true
}));
app.use(bodyparser.json());

// Space for site requests

app.use(serve("web", "ejs"));

app.use("/api", function (req, res, next) {
  res.type("json");
  next();
});

app.get("/api/types", function (req, res) {
  res.send(JSON.stringify(engine.st.getServerTypes()));
});

app.get("/api/servers/list", function (req,res) {
  engine.serverMenager.list(function (data) {
    res.send(JSON.stringify(data));
  });
});

app.get("/api/servers/get/:id", function (req,res) {
  engine.serverMenager.getByID(Number(req.params.id), function (err, data) {
    if(err){
      res.send(JSON.stringify({
        success:false,
        msg: err
      }));
      return;
    }
    var server = data;
    engine.statusGrabber.getDetails(server.type, server.address, function(data) {
      if(data){
        data._id = Number(req.params.id);
        res.send(JSON.stringify(data));
      }else{
        res.send(JSON.stringify({
          success:false,
          msg: "Intertnal Error"
        }));
      }
    });
  });

});

app.post("/api/servers/add", function (req,res) {
  var type = req.body.type;
  var name = req.body.name;
  var address = req.body.address;
  engine.serverMenager.add(type, address, name);
  res.send(JSON.stringify({
    success: true
  }));
});

app.get("/api/servers/remove/:id", function (req, res) {
  var id = req.params.id;
  engine.serverMenager.remove(id);
  res.send(JSON.stringify({
    success: true
  }));
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
      res.send(JSON.stringify(map));
    });
  });
});

app.get("/api/trafic/update/:id", function (req, res) {
  engine.serverMenager.getByID(Number(req.params.id), function (err, data) {
    if(err){
      res.send(JSON.stringify({
        success:false,
        msg: err
      }));
      return;
    }
    var server = data;
    engine.statusGrabber.getStatus(server.type, server.address, function(data) {
      var h = engine.statusGrabber.getResponseHandler(server.type);
      h(data, server.get("id"));
      res.send(JSON.stringify(data));
    });
  });
});

app.get("/api/trafic/last", function (req, res) {
  res.send(JSON.stringify({
    success: true,
    last: updateInterval.getLast()
  }));
});

app.get("/api/trafic/start", function (req, res) {
  try {
    updateInterval.start();
    res.send(JSON.stringify({
      success: true
    }));
  } catch (e) {
    res.send(JSON.stringify({
      success: false
    }));
  }
});

app.get("/api/trafic/stop", function (req, res) {
  try {
    updateInterval.stop();
    res.send(JSON.stringify({
      success: true
    }));
  } catch (e) {
    res.send(JSON.stringify({
      success: false
    }));
  }
});

app.get("/api/trafic/get/all", function (req, res) {
  engine.statusGrabber.getTraffic(function (data) {
    res.send(JSON.stringify(data));
  });
});

app.get("/api/trafic/get/:id", function (req, res) {
  engine.statusGrabber.getTrafficById(req.params.id ,function (data) {
    res.send(JSON.stringify(data));
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
      res.send(JSON.stringify(map));
    });
  });
});

app.get("/api/status/:id", function (req, res) {
  engine.serverMenager.getByID(Number(req.params.id), function (err, data) {
    if(err){
      res.send(JSON.stringify({
        success:false,
        msg: err
      }));
      return;
    }
    var server = data;
    engine.statusGrabber.getStatus(server.type, server.address, function(data) {
      if(data){
        data._id = Number(req.params.id);
        res.send(JSON.stringify(data));
      }else{
        res.send("Intertnal Error");
      }
    });
  });
});

var cache = "";
app.get("/api/details/cached", function (req, res) {
  res.send(cache);
});

app.get("/api/details", function (req, res) {
  engine.serverMenager.list(function (data) {
    async.map(data, function (data, callback) {
      var server = data;
      engine.statusGrabber.getStatus(server.type, server.address, function(data) {
        var h = engine.statusGrabber.getResponseHandler(server.type);
        data = h(data, server.get("id"), true);
        // data.name = server.name;
        var temp = {
          id: server.id,
          address: server.address,
          type: server.type,
          fullType: engine.st.getFullServerType(server.type),
          name: server.name,
          maxPlayers: data.traffic.maxplayers,
          players: data.traffic.players
        };
        callback(null, temp);
      });
    }, function (err, map) {
      var obj = JSON.stringify(map);
      cache = obj;
      res.send(obj);
    });
  });
});

app.use(function(req, res, next){
  res.render('index');
});

var onInit = function () {
  updateInterval
    .setInterval(engine.configMenager.config.updateInterval)
    .setFunction(function () {
      engine.serverMenager.list(function (data) {
        async.map(data, function (data, callback) {
          var server = data;
          engine.statusGrabber.getStatus(server.type, server.address, function(data) {
            var h = engine.statusGrabber.getResponseHandler(server.type);
            h(data, server.get("id"));
            callback(null, data);
          });
        }, function (err, map) {
        });
      });
    })
    .start();
};

var onExit = function () {
  updateInterval.stop();
};

app.listen(engine.configMenager.config.port, function () {
  onInit();
});
