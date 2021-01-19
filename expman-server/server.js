'use strict';

const express = require('express');
const DbConnection = require('./src/db-conn.js');
const Model = require('./src/model.js');

// Constants
const PORT = process.env.PORT;
const HOST = '0.0.0.0';
const db_connection = new DbConnection(process.env.POSTGRES_DB, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, process.env.POSTGRES_HOST);

// App
const app = express();
app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

db_connection.checkConnection();
let model = new Model(db_connection.conn);
