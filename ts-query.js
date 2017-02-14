const net = require('net');

unescape = function(str) {
  return String(str).replace(/\\\\/g, '\\')
    .replace(/\\\//g, '/')
    .replace(/\\p/g, '|')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\v/g, '\v')
    .replace(/\\f/g, '\f')
    .replace(/\\s/g, ' ');
};

const formated = function (string) {
  string = string.split(" ");
  var obj = {}, temp;
  for (var x in string) {
    if (string.hasOwnProperty(x)) {
      temp = string[x].split("=");
      obj[temp[0].replace("\r", '')] = unescape(temp[1]);
    }
  }
  return obj;
};

exports.query = function(host, port, callback){
  var socket = new net.Socket();
  var temp = String();
  var obj, result, error = "Some problem";
  host = host || "localhost";
  port = port || 10011;
  socket.on("close", function (he) {
    if(typeof(result) == "undefined" || he){
      callback(error);
    }else{
      callback(null, result);
    }
  });
  socket.on("error", function (e) {
    error = e.code;
  });
  socket.on("data", function (data) {
    // console.log(String(data));
    var str = String(data);
    for (var x in str) {
      if (!str.hasOwnProperty(x)) {
        continue;
      }
      var char = str[x];
      // console.log(str[x], "\n");
      if(char === '\n'){
        obj = formated(temp);
        if(!obj.error){
          result = obj;
        }
        temp = String();
      }else{
        temp += char;
      }
    }
  });
  socket.connect({
    port: port,
    host: host
  });
  socket.write("use 1\n");
  socket.write("serverinfo\n");
  socket.end();
};
