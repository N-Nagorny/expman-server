const bcrypt = require('bcrypt');
const DataTypes = require("sequelize");

class Model {
  constructor (db_connection, users) {

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

    // Table Types
    this.type = db_connection.define("Type", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      }
    });

    this.expense.belongsTo(this.user);
    this.user.hasMany(this.expense);

    db_connection.sync()
      .then(async () => {
        await this.createUsers(users);
        await this.createTypes();
      })
      .catch((err)=> console.log('DB Sync error: ', err));
  }

  async getAllExpenses() {
    return await this.expense.findAll()
  }

  async getAllTypes() {
    return await this.type.findAll()
  }

  async getAllPurchases() {
    return await this.purchase.findAll()
  }

  async addPurchase(new_purchase) {
    if (new_purchase.type in await this.getAllTypes() == false)
      this.addType(new_purchase.type)
    const purchase = await this.purchase.create(new_purchase);
    console.log(JSON.stringify(purchase));
  }

  async getPurchase(purchase_id) {
    const purchases = await this.purchase.findAll({
      where: {
        id: purchase_id
      }
    });
    if (purchases.length == 0)
      throw Error('Purchase doesn\'t exist');
    else return purchases[0].dataValues;
  }

  async deletePurchase(purchase_id) {
    return this.purchase.destroy({
      where: {
        id: purchase_id
      }
    });
  }

  async addExpense(new_expense) {
    if (new_expense.type in this.getAllTypes() == false)
      this.addType(new_expense.type)
    const expense = await this.expense.create(new_expense);
    console.log(JSON.stringify(expense));
  }

  async getUser(name) {
    const users = await this.user.findAll({
      where: {
        username: name
      }
    });
    if (users.length == 0)
      throw Error('User doesn\'t exist');
    else return users[0].dataValues;
  }

  async isUserExisting(name) {
    const users = await this.user.findAll({
      where: {
        username: name
      }
    });
    return users.length == 0 ? false : true;
  }

  async createUsers(users) {
    if (users.length > 0) {
      users.forEach(async (item, i, arr) => {
        let pwd = await bcrypt.hash(item.password, 5);
        this.addUser({ username: item.username, passwordHash: pwd })
          .then(() => console.log('User ', item.username, ' created.'))
          .catch((err) => console.log('User ', item.username, ' wasn\'t created: ', err));
      });
    } else {
      console.log('users array is empty. Missing creating users...');
    }
  }

  async createTypes() {
    let types = [
      'Restaurants',
      'Markets',
      'Transportation',
      'Utilities',
      'Sports and Leisure',
      'Clothing and Shoes',
      'Healthcare',
      'Personal hygiene',
      'Housekeeping'
    ]
    types.forEach(async (item, i, arr) => {
      this.addType(item)
        .then(() => console.log('Type ', item, ' created.'))
        .catch((err) => console.log('Type ', item, ' wasn\'t created: ', err));
    });
  }

  async addType(new_type) {
    const type = await this.type.create({ name: new_type });
    console.log(JSON.stringify(type));
  }

  async addUser(new_user) {
    const user = await this.user.create(new_user);
    console.log(JSON.stringify(user));
  }
}

module.exports = Model;
