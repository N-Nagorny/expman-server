const DataTypes = require("sequelize");

class Model {
  constructor (db_connection) {

    // Table Users
    this.user = db_connection.define("User", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      passwordHash: {
        type: DataTypes.STRING,
        unique: false,
        allowNull: false
      }
    });

    // Table Expenses
    this.expense = db_connection.define("Expense", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      purchase: {
        type: DataTypes.STRING,
        allowNull: false
      },
      purchase_type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      is_mandatory: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      commentary: {
        type: DataTypes.STRING,
        allowNull: false
      },
      is_single_time: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      cost: {
        type: DataTypes.FLOAT,
        allowNull: false
      }
    });

    // Table Purchases
    this.purchase = db_connection.define("Purchase", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      purchase: {
        type: DataTypes.STRING,
        allowNull: false
      },
      purchase_type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      is_mandatory: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      is_single_time: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      }
    });

    this.expense.belongsTo(this.user);
    this.user.hasMany(this.expense);

    db_connection.sync({force: true})
      .catch((error)=> {console.log('sync db error...\n' + error.toString())});
  }
}

module.exports = Model;