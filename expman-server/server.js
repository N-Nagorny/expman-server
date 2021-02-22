// External dependencies
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const express = require('express');
const OpenApiValidator = require('express-openapi-validator');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const path = require('path');
const url = require('url');

// Internal dependencies
const DbConnection = require('./src/db-conn.js');
const Model = require('./src/model.js');
const users = require('./users.json');

// Constants
const PORT = process.env.PORT || 8081;
const HOST = '0.0.0.0';
const public_dir = path.join(__dirname, 'public')
const db_connection = new DbConnection(process.env.DATABASE_URL);

db_connection.checkConnection();
let model = new Model(db_connection.conn, users);

// Express App
const app = express();
const api = express();
const frontend = express();
app.use(express.json()) // for parsing application/json
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'ExpMan',
  keys: ['very secret key'],
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
}));

api.use(
  OpenApiValidator.middleware({
    apiSpec: './api/openapi.json',
    validateRequests: true
  }),
);
api.use((err, req, res, next) => {
  // format error
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

frontend.use(flash());
frontend.use('/public', express.static(public_dir));
console.log("Serving ", public_dir);
frontend.set('view engine', 'pug');
frontend.set('view options', { layout: false });

app.use(passport.initialize());
app.use(passport.session());

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

app.use(['/'], frontend);
app.use(['/api'], api);

frontend.get('/', function (req, res, next) {
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

frontend.get('/sign-in', function (req, res, next) {
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

frontend.post('/sign-in',
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

frontend.get('/sign-out', function(req, res) {
  console.log(req.isAuthenticated());
  req.logout();
  console.log(req.isAuthenticated());
  req.flash('success', "Signed out. See you soon!");
  res.redirect('/');
});

frontend.get('/expenses', async (req, res, next) => {
  if (req.isAuthenticated()) {
    res.render('expenses', {
      title: "Expenses",
      userData: req.user,
      expenseTypes: await model.getAllTypes(),
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

frontend.get('/purchases', async (req, res, next) => {
  if (req.isAuthenticated()) {
    res.render('purchases', {
      title: "Purchases",
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

frontend.get('/add-expense', async (req, res, next) => {
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

api.get('/expenses', async (req, res, next) => {
  if (req.isAuthenticated()) {
    console.log(model.getAllExpenses());
    res.json(await model.getAllExpenses());
  } else {
    res.redirect('/sign-in');
  }
});

api.get('/purchases', async (req, res, next) => {
  if (req.isAuthenticated()) {
    console.log(model.getAllPurchases());
    res.json(await model.getAllPurchases());
  } else {
    res.redirect('/sign-in');
  }
});

api.post('/expense', async (req, res, next) => {
  if (req.isAuthenticated()) {
    let body = req.body;
    const user = await model.getUser(req.user.username);
    body['UserId'] = user.id;
    res.send(model.addExpense(body));
  } else {
    res.redirect('/sign-in');
  }
});

api.post('/purchase-to-expense', async (req, res, next) => {
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

api.post('/purchase', function (req, res, next) {
  if (req.isAuthenticated()) {
    res.send(model.addPurchase(req.body));
  } else {
    res.redirect('/sign-in');
  }
});

api.delete('/purchase', function (req, res, next) {
  if (req.isAuthenticated()) {
    res.send(model.deletePurchase(req.body.id));
  } else {
    res.redirect('/sign-in');
  }
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
