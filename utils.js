exports.sortObj = function (obj) {
  var keys = [], k, i, len;
  for (k in obj) {
    if (obj.hasOwnProperty(k)) {
      keys.push(k);
    }
  }
  keys.sort();
  len = keys.length;
  var tmp = {};
  for (i = 0; i < len; i++) {
    k = keys[i];
    tmp[k] = obj[k];
  }
  return tmp;
};
