'use strict';

const express = require('express');
const DbConnection = require('./src/db-conn.js');
const Model = require('./src/model.js');

// Constants
const PORT = process.env.PORT;
const HOST = '0.0.0.0';
const db_connection = new DbConnection(process.env.POSTGRES_DB, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, process.env.POSTGRES_HOST);

db_connection.checkConnection();
let model = new Model(db_connection.conn);

// App
const app = express();
app.use(express.json()) // for parsing application/json

app.get('/expenses', async (req, res) => {
  console.log(model.getAllExpenses());
  res.json(await model.getAllExpenses());
});
app.get('/purchases', async (req, res) => {
  console.log(model.getAllPurchases());
  res.json(await model.getAllPurchases());
});
app.post('/expense', function (req, res) {
  res.send(model.addExpense(req.body));
});
app.post('/purchase', function (req, res) {
  res.send(model.addPurchase(req.body));
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
