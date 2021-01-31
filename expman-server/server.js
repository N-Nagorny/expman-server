'use strict';

const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const flash = require('connect-flash');
const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const path = require('path');
const cookieSession = require('cookie-session');
const DbConnection = require('./src/db-conn.js');
const Model = require('./src/model.js');
const users = require('./users.json');
const url = require('url');

// Constants
const PORT = process.env.PORT || 8081;
const HOST = '0.0.0.0';
const public_dir = path.join(__dirname, 'public')
const db_connection = new DbConnection(process.env.DATABASE_URL);

db_connection.checkConnection();
let model = new Model(db_connection.conn, users);

// App
const app = express();
app.use(express.json()) // for parsing application/json
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'MyAppName',
  keys: ['very secret key'],
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use('/public', express.static(public_dir));
console.log("Serving ", public_dir);
app.set('view engine', 'pug');
app.set('view options', { layout: false });

passport.use('local', new LocalStrategy(
  { passReqToCallback: true },
  (req, username, password, done) => {
    loginAttempt();
    async function loginAttempt() {
      if (! await model.isUserExisting(username)) {
        req.flash('danger', "Oops. Incorrect sign in details.");
        return done(null, false);
      } else {
        const user = await model.getUser(username);
        console.log("Password checking. User: ", user);
        bcrypt.compare(password, user.passwordHash, function(err, check) {
          if (err) {
            console.log('Error while checking password: ', err);
            return done();
          }
          else if (check){
            return done(null, { username: user.username });
          } else {
            req.flash('danger', "Oops. Incorrect sign in details.");
            return done(null, false);
          }
        });
      }
    };
  })
)

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get('/', function (req, res, next) {
  res.render('index', {
    title: "Home",
    userData: req.user,
    messages: {
      danger: req.flash('danger'),
      warning: req.flash('warning'),
      success: req.flash('success')
    }
  });
  console.log(req.user);
});

app.get('/sign-in', function (req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/expenses');
  } else {
    res.render('sign-in', {
      title: "Sign in",
      userData: req.user,
      redirectUri: req.query.redirectUri,
      messages: {
        danger: req.flash('danger'),
        warning: req.flash('warning'),
        success: req.flash('success')
      }
    });
  }
});

app.post('/sign-in',
  passport.authenticate('local', {
    failureRedirect: '/sign-in',
    failureFlash: true
  }),
  function(req, res) {
    if (!req.body.remember) {
      req.sessionOptions.expires = false; // Cookie expires at end of session
    }
    res.redirect(req.body.redirectUri ? req.body.redirectUri : "/expenses");
  }
);

app.get('/sign-out', function(req, res) {
  console.log(req.isAuthenticated());
  req.logout();
  console.log(req.isAuthenticated());
  req.flash('success', "Signed out. See you soon!");
  res.redirect('/');
});

app.get('/expenses', async (req, res, next) => {
  if (req.isAuthenticated()) {
    res.render('expenses', {
      title: "Expenses",
      userData: req.user,
      expenses: await model.getAllExpenses(),
      messages: {
        danger: req.flash('danger'),
        warning: req.flash('warning'),
        success: req.flash('success')
      }
    });
  } else {
    res.redirect(url.format({
      pathname:"/sign-in",
      query: {
        "redirectUri": req.originalUrl
      }
    }));
  }
});

app.get('/purchases', async (req, res, next) => {
  if (req.isAuthenticated()) {
    res.render('purchases', {
      title: "Purchases",
      userData: req.user,
      purchases: await model.getAllPurchases(),
      messages: {
        danger: req.flash('danger'),
        warning: req.flash('warning'),
        success: req.flash('success')
      }
    });
  } else {
    res.redirect(url.format({
      pathname:"/sign-in",
      query: {
        "redirectUri": req.originalUrl
      }
    }));
  }
});

app.get('/add-expense', async (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.query.hasOwnProperty('purchaseId')) {
      res.render('add-expense', {
        title: "Add new expense",
        userData: req.user,
        expenseTypes: await model.getAllTypes(),
        purchase: await model.getPurchase(req.query.purchaseId),
        messages: {
          danger: req.flash('danger'),
          warning: req.flash('warning'),
          success: req.flash('success')
        }
      });
    } else {
      res.render('add-expense', {
        title: "Add new expense",
        userData: req.user,
        expenseTypes: await model.getAllTypes(),
        messages: {
          danger: req.flash('danger'),
          warning: req.flash('warning'),
          success: req.flash('success')
        }
      });
    }
  } else {
    res.redirect(url.format({
      pathname:"/sign-in",
      query: {
        "redirectUri": req.originalUrl
      }
    }));
  }
});

app.get('/add-purchase', async (req, res, next) => {
  if (req.isAuthenticated()) {
    res.render('add-purchase', {
      title: "Add new purchase",
      userData: req.user,
      purchaseTypes: await model.getAllTypes(),
      messages: {
        danger: req.flash('danger'),
        warning: req.flash('warning'),
        success: req.flash('success')
      }
    });
  } else {
    res.redirect(url.format({
      pathname:"/sign-in",
      query: {
        "redirectUri": req.originalUrl
      }
    }));
  }
});

app.get('/api/expenses', async (req, res, next) => {
  if (req.isAuthenticated()) {
    console.log(model.getAllExpenses());
    res.json(await model.getAllExpenses());
  } else {
    res.redirect('/sign-in');
  }
});

app.get('/api/purchases', async (req, res, next) => {
  if (req.isAuthenticated()) {
    console.log(model.getAllPurchases());
    res.json(await model.getAllPurchases());
  } else {
    res.redirect('/sign-in');
  }
});

app.post('/api/expense', async (req, res, next) => {
  if (req.isAuthenticated()) {
    let body = req.body;
    const user = await model.getUser(req.user.username);
    body['UserId'] = user.id;
    res.send(model.addExpense(body));
  } else {
    res.redirect('/sign-in');
  }
});

app.post('/api/purchase-to-expense', async (req, res, next) => {
  if (req.isAuthenticated()) {
    let body = req.body;
    const purchase_id = body.id;
    delete body.id;
    const purchase = await model.getPurchase(purchase_id);
    delete purchase.id;
    const expense = {...purchase, ...body};
    model.addExpense(expense);
    res.send(model.deletePurchase(purchase_id));
  } else {
    res.redirect('/sign-in');
  }
});

app.post('/api/purchase', function (req, res, next) {
  if (req.isAuthenticated()) {
    res.send(model.addPurchase(req.body));
  } else {
    res.redirect('/sign-in');
  }
});

app.delete('/api/purchase', function (req, res, next) {
  if (req.isAuthenticated()) {
    res.send(model.deletePurchase(req.body.id));
  } else {
    res.redirect('/sign-in');
  }
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
