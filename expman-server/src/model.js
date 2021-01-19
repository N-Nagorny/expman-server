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
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      type: {
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
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      type: {
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

  async getAllExpenses() {
    return await this.expense.findAll()
  }
  async getAllPurchases() {
    return await this.purchase.findAll()
  }
  async addPurchase(new_purchase) {
    const purchase = await this.purchase.create(new_purchase);
    console.log(JSON.stringify(purchase));
  }
  async addExpense(new_expense) {
    const expense = await this.expense.create(new_expense);
    console.log(JSON.stringify(expense));
  }
}

module.exports = Model;
