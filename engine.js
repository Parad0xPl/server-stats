// Requirments

const fs = require('fs');
const path = require('path');
const db = require("./database");
const ut = require("./utils");
const gmquery = require('game-server-query');
const tsquery = require('./ts-query').query;


{ //CODE BLOCK Type list and modifing
  var rawTypes = JSON.parse(fs.readFileSync("availableTypes.json", "utf-8"));
  var types = {};
  var typesFull = {};
  var x;
  for(x in rawTypes){
    if(!rawTypes.hasOwnProperty(x)){
      continue;
    }
    Object.assign(types, rawTypes[x]);
    for(var y in rawTypes[x]){
      if(rawTypes[x].hasOwnProperty(y)){
        typesFull[rawTypes[x][y]] = y;
      }
    }
  }

  types = ut.sortObj(types);
  typesFull = ut.sortObj(typesFull);

  exports.st = {
    getServerTypes: function () {
      return types;
    },
    getServerType: function (id) {
      return types[id];
    },
    getFullServerTypes: function () {
      return typesFull;
    },
    getFullServerType: function (id) {
      return typesFull[id];
    }
  };
}
{ //CODE BLOCK Status Handlers
  var statusHandlers = {
    "game-server-query": function (type, address, callback) {
      var port = parseInt(address.split(":")[1]);
      address = address.split(":")[0];
      var options = {type: type, host: address};
      if(port){
        options.port = port;
      }
      gmquery(
        options,
        function(state) {
          if(state.error){
            callback({
              offline: true
            });
          }else {
            callback(state);
          }
        }
      );
    },
    "teamspeak-query": function (type, address, callback) {
      var port = parseInt(address.split(":")[1]);
      address = address.split(":")[0];
      var options = {type: type, host: address};
      if(port){
        options.port = port;
      }
      const query = tsquery(options.host, options.port, function (err, data) {
        if(err){
          callback({
            offline: true,
            error: err
          });
        }else{
          callback(data);
        }
      });
    }
  };
}
{ //CODE BLOCK Status Grabber
  var searchQueryType = function (type) {
    var x;
    for(x in rawTypes){
      if(!rawTypes.hasOwnProperty(x)){
        continue;
      }
      var y;
      for(y in rawTypes[x]) {
        if(!rawTypes[x].hasOwnProperty(y)) {
          continue;
        }
        if(rawTypes[x][y] == type){
          return x;
        }
      }
    }
  };

  var responseHandlers = require("./responseHandler")(db);
  var trafficAtributes = [
    "players",
    "maxplayers",
    "createdAt",
    "serverId"
  ];
  exports.statusGrabber = {
    getHandler: function (type) {
      var x = statusHandlers[searchQueryType(type)];
      if(x){
        return x;
      }
      throw new Error("No handler for "+type+" type");
    },
    getResponseHandler: function (type) {
      return responseHandlers.getHandler(type, searchQueryType(type));
    },
    getStatus: function (type, address, callback){
      var handler = this.getHandler(type);
      handler(type, address, callback);
    },
    getDetails: function (type, address, callback) {
      var handler = this.getHandler(type);
      var self = this;
      handler(type, address, function (data) {
        var resp = self.getResponseHandler(type);
        var details = resp(data, null, true);
        callback(details);
      });
    },
    getTraffic: function (callback) {
      db.traffic.findAll({
        attributes: trafficAtributes
      }).then(function(servers) {
        callback(servers);
      });
    },
    getTrafficById: function (id, callback) {
      db.traffic.findAll({where: {
          serverId: id
        },
        attributes: trafficAtributes
      }).then(function(servers) {
        callback(servers);
      });
    },
    getTrafficByRange: function (from, to, id, callback) {
      db.traffic.findAll({where: {
          serverId: id,
          createdAt: {
            $gt: from,
            $lt: to
          }
        },
        attributes: trafficAtributes
      }).then(function(records) {
        callback(records);
      });
    },
    pretty: {
      day: function (date, id, callback) {
        var from = new Date(date.toDateString()),
            to = new Date(from.valueOf() + 1000*60*60*24);
        exports.statusGrabber.getTrafficByRange(from, to, id, callback);
      },
      month: function (date, id, callback) {
        var from = new Date(date.toDateString());
        from.setUTCDate(1);
        var to = new Date(from.valueOf() + 1000*60*60*24*32);
        to.setUTCDate(1);
        // for(var m = to.getUTCMonth(); to.getUTCMonth() === m;){
        //   to = new Date(to.valueOf() + 1000*60*60*24);
        // }
        exports.statusGrabber.getTrafficByRange(from, to, id, callback);
      },
      year: function (date, id, callback) {
        var from = new Date(date.toDateString());
        from.setUTCDate(1);
        from.setUTCMonth(0);
        var to = new Date(from);
        to.setUTCFullYear(to.getUTCFullYear() + 1);
        exports.statusGrabber.getTrafficByRange(from, to, id, callback);
      }
    }
  };
}
{ //CODE BLOCK Server menager
  exports.serverMenager = {
    list: function (callback) {
      // callback(serversList)
      //   serversList - Array of servers
      db.server.findAll().then(function(servers) {
        callback(servers);
      });
    },
    getByID: function (id, callback) {
      db.server.findById(id).then(function (server) {
        callback(null, server);
      }).catch(function () {
        callback("No server with this id");
      });
    },
    add: function (type, address, name) {
      db.server.create({
        type: type,
        name: name,
        address: address
      });
    },
    remove: function (id) {
      db.server.destroy({
        where:{
          id: id
        }
      });
    }
  };
}
{ //CODE BLOCK Config menager
  var configFilePath = path.resolve("./config.json");
  const defaultConfig = {
    lang: "en",
    updateInterval : 1000 * 60 * 15,
    port: 8080,
    updateState: true
  };

  exports.configMenager = {
    config: {},
    load: function () {
      if(fs.existsSync(configFilePath)){
        var tmp = JSON.parse(fs.readFileSync(configFilePath));
        var defaultKeys = Object.keys(defaultConfig);
        var safeConfig = {};
        var configProblem = false;
        defaultKeys.forEach(function (key) {
          if(tmp.hasOwnProperty(key)){
            safeConfig[key] = tmp[key];
          }else{
            configProblem = true;
            safeConfig[key] = defaultConfig[key];
          }
        });
        this.config = safeConfig;
        if (configProblem) {
          this.save();
        }
      }else{
        this.config = defaultConfig;
        this.save();
      }
    },
    save: function () {
      fs.writeFileSync(configFilePath, JSON.stringify(this.config, null, "\t"));
    }
  };
  exports.configMenager.load();
}
