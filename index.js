var restify = require('restify');
const nodemailer = require('nodemailer');

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

var server = restify.createServer();
server.get('/hello/:name', respond);
server.head('/hello/:name', respond);

server.listen(3000, function() {
  console.log('%s listening at %s', server.name, server.url);
});
