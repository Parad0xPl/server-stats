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
  var flag = false;
  if(string.indexOf("client_database_id") >= 0){
    flag = true;
  }
  string = string.split(/ |\|/g);
  var obj = {}, temp;
  if(flag){
    obj = [];
  }
  for (var x in string) {
    if (string.hasOwnProperty(x)) {
      temp = string[x].split("=");
      if(flag && (temp[0].indexOf("client_nickname") === 0)){
        obj.push(unescape(temp[1]));
      }else if(!flag){
        obj[temp[0].replace("\r", '')] = unescape(temp[1]);
      }
    }
  }
  return obj;
};

exports.query = function(host, port, callback){
  var socket = new net.Socket();
  var temp = String();
  var obj, result = {}, error = "Some problem";
  host = host || "localhost";
  port = port || 10011;
  socket.on("close", function (he) {
    arr = temp.replace(/\r/g, "").split("\n");
    arr = arr.slice(3, -1);
    for(var x = 0; x < arr.length; x++){
      var el = arr[x];
      if(el.indexOf("error id=0 msg=ok") === 0){
        var tmpObj = formated(arr[x-1]);
        if(tmpObj instanceof Array){
          tmpObj2 = tmpObj;
          tmpObj = {clients: tmpObj2};
        }
        result = Object.assign(result, tmpObj);
      }
    }
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
      temp += char;
    }
  });
  socket.connect({
    port: port,
    host: host
  });
  socket.write("use 1\n");
  socket.write("serverinfo\n");
  socket.write("clientlist\n");
  socket.write("quit\n");
  socket.end();
};
