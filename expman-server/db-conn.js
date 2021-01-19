const async = require('async');
const Sequelize = require("sequelize");

class DbConnection {
  constructor(db, username, password, dbs_host) {
    this.conn = new Sequelize(db, username, password, {
      host: dbs_host,
      dialect: "postgres",
      operatorsAliases: false,
    
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });
  }

  checkConnection = async () => {
    try {
      await this.conn.authenticate();
      console.log('Connection has been established successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
  }
}

module.exports = DbConnection;
