const fh = require('./funtionsHandler');
var handler = new fh();
var db;
handler.registerDefault(function (data, server, returnNotAdd) {
  console.log("Default");
  var frame = {};
  frame.date = data.date || new Date();
  if(typeof(data.players) == "number"){
    frame.players = data.players;
  }else if(data.players && data.players.length >= 0){
    frame.players = data.players.length;
  }
  if(typeof(data.maxplayers) == "number"){
    frame.maxplayers = data.maxplayers;
  }
  if(returnNotAdd){
    return frame;
  }
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
});

handler.registerQuery("game-server-query", function (data, server, returnNotAdd) {
  var frame = {};
  frame.traffic = {};
  frame.date = data.date || new Date();
  if(typeof(data.players) == "number"){
    frame.traffic.players = data.players;
  }else if(data.players && data.players.length >= 0){
    frame.traffic.players = data.players.length;
    frame.players = data.players;
  }
  if(typeof(data.maxplayers) == "number"){
    frame.traffic.maxplayers = data.maxplayers;
  }
  if(typeof(data.password) == "boolean"){
    frame.password = data.password;
  }
  if(typeof(data.map) == "string"){
    frame.map = data.map;
  }
  if(returnNotAdd){
    return frame;
  }
  if(frame.traffic.maxplayers && frame.traffic.players >= 0){
    db.traffic.create({
      createdAt: frame.date,
      serverId: server,
      maxplayers: frame.traffic.maxplayers,
      players: frame.traffic.players
    });
  }
});

handler.registerQuery("teamspeak-query", function (data, server, returnNotAdd) {
  var frame = {};
  frame.traffic = {};
  frame.date = data.date || new Date();
  if(data.virtualserver_maxclients){
    frame.traffic.maxplayers = parseInt(data.virtualserver_maxclients);
  }
  if(data.virtualserver_clientsonline){
    frame.traffic.players = parseInt(data.virtualserver_clientsonline);
  }
  if(data.virtualserver_password && data.virtualserver_password !== "undefined"){
    frame.password = true;
  }
  if(data.virtualserver_name){
    frame.name = data.virtualserver_name;
  }
  if(data.clients){
    var arr = [], unknown = [];
    data.clients.forEach(function (el) {
      if(el.indexOf("Unknown from ") === 0){
        unknown.push({
          name: el
        });
      }else{
        arr.push({
          name: el
        });
      }
    });
    arr.sort();
    arr.forEach(function (el) {
      unknown.push(el);
    });
    frame.players = unknown;
  }
  if(returnNotAdd){
    // DO NOT USE server BEFORE, it could be undefined!!!
    return frame;
  }
  if(frame.traffic.maxplayers && frame.traffic.players >= 0){
    db.traffic.create({
      serverId: server,
      createdAt: frame.date,
      maxplayers: frame.traffic.maxplayers,
      players: frame.traffic.players
    });
  }
});
module.exports = function (gdb) {
  db = gdb;
  return handler;
};
