var restify = require('restify');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
// const restifyPlugins = require('restify-plugins');
const restifyPlugins = require('restify').plugins;
const jwt = require('jsonwebtoken');
const corsMiddleware = require('restify-cors-middleware');
var passport = require('passport');
var GithubStrategy = require('passport-github').Strategy;
const request = require('request');

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GithubClientID,
      clientSecret: process.env.GithubClientSecret,
      callbackURL: process.env.GithubCallbackURL,
    },
    function(accessToken, refreshToken, profile, done) {
      console.log(profile);
      console.log('Access Token ', accessToken);
      done(null, profile);
    }
  )
);

// serialize and deserialize
passport.serializeUser(function(user, done) {
  console.log('serializeUser: ' + user._id);
  done(null, user._id);
});
passport.deserializeUser(function(id, done) {
  done(null, id);
});

function respond(req, res, next) {
  res.send('hello test yeah ' + req.params.name);
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_PROTOCOL,
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
    subject: 'TEST Restify 2',
    html: `<h1>Hello ${req.params.name} From Your Friend</h1>`,
  };

  transporter.sendMail(mailOptions, function(err, res) {
    if (err) {
      next(err);
    } else {
      next();
    }
  });
}

const cors = corsMiddleware({
  preflightMaxAge: 5, //Optional
  origins: ['http://api.myapp.com', 'http://web.myapp.com'],
  allowHeaders: ['API-Token'],
  exposeHeaders: ['API-Token-Expiry'],
});

var server = restify.createServer();

/**
 * Middleware
 */
// server.use(restifyPlugins.jsonBodyParser({ mapParams: true }));
server.use(
  restifyPlugins.bodyParser({
    mapParams: true,
  })
);
server.use(restifyPlugins.acceptParser(server.acceptable));
server.use(
  restifyPlugins.queryParser({
    mapParams: true,
  })
);
server.use(restifyPlugins.fullResponse());

server.pre(restifyPlugins.pre.context()); // set and get

server.pre(cors.preflight);
server.use(cors.actual);

server.get(
  '/auth/github/browser',
  passport.authenticate('github', { session: false }),
  function(req, res) {}
);

server.get(
  '/auth/github/checkToken',
  (req, res, next) => {
    console.log(req.params.access_token);
    request(
      {
        url: 'https://api.github.com/user',
        headers: {
          'User-Agent': 'request',
        },
        qs: {
          access_token: req.params.access_token,
        },
      },
      (error, response, body) => {
        if (!error && response.statusCode == 200) {
          console.log('body ', body); // Show the HTML for the Google homepage.
          return next();
        } else {
          console.log('err ', error);
          console.log('code ', response.statusCode);
          console.log('response ', response);
          res.send(response.statusCode, {
            err: 'Error !!',
          });
          return next(false);
        }
      }
    );
    // Facebook: https://graph.facebook.com/me
    //   Github: https://api.github.com/user
    //   Google: https://www.googleapis.com/oauth2/v3/tokeninfo
  },
  function(req, res, next) {
    console.log('called');
    res.send(200, 'True User');
    return next();
    // GET /auth/github?access_token=<TOKEN>
  }
);

server.get(
  '/auth/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/',
  }),
  function(req, res, next) {
    console.log('callback called');
    return next();
  }
);

server.pre((req, res, next) => {
  console.log('pre');
  req.set('userData', {
    id: 123,
  });
  next();
});

function authorization(req, res, next) {
  let token;

  if (req.headers && req.headers.authorization) {
    let parts = req.headers.authorization.split(' ');
    if (parts.length == 2) {
      let scheme = parts[0],
        credentials = parts[1];

      if (/^Bearer$/i.test(scheme)) {
        token = credentials;
      }
    } else {
      res.send(401, {
        err: 'Format is Authorization: Bearer [token]',
      });
      return next(false);
    }
  } else if (req.params.token) {
    token = req.params.token;
    // We delete the token from param to not mess with blueprints
    delete req.query.token;
  } else {
    res.send(401, {
      err: 'No Authorization header was found',
    });
    return next(false);
  }

  try {
    const decoded = jwt.verify(token, 'secret ndes');
    req.userData = decoded.id;
    return next();
  } catch (error) {
    res.send(401, {
      err: 'error decode',
    });
    return next(false);
  }
}

// server.get('/hello/:name', respond);
// server.head('/hello/:name', respond);

server.get('/test', authorization, (req, res, next) => {
  console.log(req.get('userData'));
  console.log(req.userData);
  console.log(req.headers);
  res.send(200, req.params);
  next();
});

server.get('/token', (req, res, next) => {
  const token = jwt.sign(
    {
      id: 123,
    },
    'secret ndes'
  );
  res.send(200, token);
  next();
});

/**
 * Start Server, Connect to DB & Require Routes
 */
server.listen(3000, function() {
  // console.log('%s listening at %s', server.name, server.url);

  mongoose.Promise = global.Promise;
  mongoose.connect(process.env.MONGO_URI);

  const db = mongoose.connection;

  db.on('error', err => {
    console.error(err);
    process.exit(1);
  });

  db.once('open', () => {
    require('./routes')(server);
    console.log(`Server is listening on port ${server.url}`);
  });
});
