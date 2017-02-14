
const tsquery = require('./ts-query').query;
const query = tsquery("parad0x.pl", "10010", function (err, darta) {
  if(err){
    console.log(err);
  }
  console.log(darta);
});
