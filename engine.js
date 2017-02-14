// Requirments

const fs = require('fs');
const path = require('path');
const db = require("./database");
const gmquery = require('game-server-query');
const tsquery = require('./ts-query').query;

// Status Handler

var rawTypes = JSON.parse(fs.readFileSync("availableTypes.json", "utf-8"));
var types = {};
var x;
for(x in rawTypes){
  if(!rawTypes.hasOwnProperty(x)){
    continue;
  }
  Object.assign(types, rawTypes[x]);
}

exports.getServerTypes = function () {
  return types;
};

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

var responseHandlers = {
  defaultHandler: function (data, server) {
    var frame = {};
    if(typeof(data.players) == "number"){
      frame.players = data.players;
    }else if(data.players && data.players.length >= 0){
      frame.players = data.players.length;
    }
    if(typeof(data.maxplayers) == "number"){
      frame.maxplayers = data.maxplayers;
    }
    console.log(frame);
    if(frame.maxplayers && frame.players >= 0){
      db.traffic.create({
        server: server,
        maxplayers: frame.maxplayers,
        players: frame.players
      }, {
        include: [{
          model: db.server,
          as: 'server'
        }]
      });
    }
  },
  query: {
    "game-server-query": function (data, server) {
      var frame = {};
      if(typeof(data.players) == "number"){
        frame.players = data.players;
      }else if(data.players && data.players.length >= 0){
        frame.players = data.players.length;
      }
      if(typeof(data.maxplayers) == "number"){
        frame.maxplayers = data.maxplayers;
      }
      console.log(frame);
      if(frame.maxplayers && frame.players >= 0){
        db.traffic.create({
          serverId: server,
          maxplayers: frame.maxplayers,
          players: frame.players
        });
      }
    },
    "teamspeak-query": function (data, server) {
      var frame = {};
      if(data.virtualserver_maxclients){
        frame.maxplayers = data.virtualserver_maxclients;
      }
      if(data.virtualserver_clientsonline){
        frame.players = data.virtualserver_clientsonline;
      }
      if(frame.maxplayers && frame.players >= 0){
        db.traffic.create({
          serverId: server,
          maxplayers: frame.maxplayers,
          players: frame.players
        });
      }
    }
  },
  game: {

  }
};

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

exports.statusGrabber = {
  getHandler: function (type) {
    var x = statusHandlers[searchQueryType(type)];
    if(x){
      return x;
    }
    throw new Error("No handler for "+type+" type");
  },
  getStatus: function (type, address, callback){
    var handler = this.getHandler(type);
    handler(type, address, callback);
  },
  getResponseHandler: function (type) {
    var queryType = searchQueryType(type);
    if(responseHandlers.game[type]){
      return responseHandlers.game[type];
    }else if(responseHandlers.query[queryType]){
      return responseHandlers.query[queryType];
    }else{
      return responseHandlers.defaultHandler;
    }
  },
  getTraffic: function (callback) {
    db.traffic.findAll().then(function(servers) {
      callback(servers);
    });
  }
};

// Server menager

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
      callback(server);
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

// Config menager

var configFilePath = path.resolve("./config.json");
const defaultConfig = {
  lang: "en"
};
exports.configMenager = {
  config: {},
  load: function () {
    if(fs.existsSync(configFilePath)){
      this.config = JSON.parse(fs.readFileSync(configFilePath));
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
