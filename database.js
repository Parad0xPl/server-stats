var Sequelize = require('sequelize');

exports.sequelize = new Sequelize('stats', '', '', {
  host: 'localhost',
  dialect: 'sqlite',
  storage: './database.sqlite',
  // logging: true
});

exports.server = exports.sequelize.define("server", {
  type: {
    type: Sequelize.STRING
  },
  name:{
    type: Sequelize.STRING
  },
  address:{
    type: Sequelize.STRING
  }
});

exports.traffic = exports.sequelize.define("traffic", {
  players:{
    type: Sequelize.INTEGER
  },
  maxplayers:{
    type: Sequelize.INTEGER
  }
});

var Traffic = exports.traffic;
var Server = exports.server;

Traffic.belongsTo(Server);

exports.sequelize.sync();
