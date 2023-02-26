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
        allowNull: true
      },
      is_single_time: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      cost: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      next_id: {
        type: DataTypes.INTEGER,
        allowNull: true
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
      .then(() => {
        this.createUsers(users);
        this.createTypes();
      })
      .catch((err)=> console.log('DB Sync error: ', err));
  }

  async getAllExpenses() {
    return await this.expense.findAll({
      where: {
        next_id: null
      }
    });
  }

  async getUserExpenses(user_id) {
    const users = await this.user.findAll({
      where: {
        id: user_id
      },
      include: this.expense
    });
    return users[0].dataValues;
  }

  async addExpense(new_expense) {
    if (!(await this.getAllTypes()).includes(new_expense.type))
      await this.addType(new_expense.type)
    return this.expense.create(new_expense);
  }

  async getExpense(expense_id) {
    const expenses = await this.expense.findAll({
      where: {
        id: expense_id
      }
    });
    if (expenses.length == 0)
      throw Error('Expense ' + expense_id + ' doesn\'t exist');
    else return expenses[0].dataValues;
  }

  async updateExpense(expense_id, new_expense) {
    this.expense.findAll({
      where: {
        id: expense_id,
        next_id: null
      }
    }).then((records) => {
      if (records.length) {
        this.expense.create(new_expense).then((expense) => {
          return this.expense.update({ next_id: expense.id }, {
            where: {
              id: expense_id
            }
          });
        }, (err) => {
          throw ("Expense " + JSON.stringify(new_expense) + " is not created: ", err);
        })
      } else {
        throw ("Expense " + expense_id + " is not found.");
      }
    }, (e) => {
      throw ("Expense " + expense_id + " search is failed: " + e);
    });
  }

  async getAllTypes() {
    const types = await this.type.findAll();
    return types.map((item) => {
      return item.dataValues.name;
    });
  }

  async getAllPurchases() {
    return await this.purchase.findAll()
  }

  async addPurchase(new_purchase) {
    if (!(await this.getAllTypes()).includes(new_purchase.type))
      await this.addType(new_purchase.type)
    return this.purchase.create(new_purchase);
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

  createUsers(users) {
    console.log('Creating %i users', users.length);
    users.forEach(async (item) => {
      if (!(await this.isUserExisting(item.username))) {
        let pwd = await bcrypt.hash(item.password, 5);
        await this.addUser({ username: item.username, passwordHash: pwd })
          .then(() => console.log('User ', item.username, ' created.'))
          .catch((err) => console.log('User ', item.username, ' wasn\'t created: ', err));
      }
    });
  }

  createTypes() {
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
    console.log('Creating %i types', types.length);
    types.forEach(async (item) => {
      if (!(await this.getAllTypes()).includes(item)) {
        await this.addType(item)
          .then(() => console.log('Type ', item, ' created.'))
          .catch((err) => console.log('Type ', item, ' wasn\'t created: ', err));
      }
    });
  }

  async addType(new_type) {
    return this.type.create({ name: new_type });
  }

  async addUser(new_user) {
    return this.user.create(new_user);
  }
}

module.exports = Model;
