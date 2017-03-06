const fh = require('./funtionsHandler');
const gmquery = require('game-server-query');
const tsquery = require('./ts-query').query;
var handler = new fh();
var db;
handler.registerDefault(function (data, server, returnNotAdd) {
  console.log("Somethink is fucked up");
  console.log("Status Handler Error");
});

handler.registerQuery("game-server-query", function (type, address, callback) {
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
});

handler.registerQuery("teamspeak-query", function (type, address, callback) {
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
});
module.exports = function (gdb) {
  db = gdb;
  return handler;
};
