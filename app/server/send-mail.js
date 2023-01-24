

var express = require('express');
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/send-email', function (req, res) {
    var message = req.body.message;
    var transporter = nodemailer.createTransport({
        service: '',
        auth: {
            user: '',
            pass: ''
        }
    });
    var mailOptions = {
        from: 'your-email@gmail.com',
        to: 'sylvain@uniris.io',
        subject: 'Nouveau message',
        text: message
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            res.status(500).send(error);
        } else {
            console.log('Email envoyé: ' + info.response);
            res.send('Email envoyé avec succès !');
        }
    });
});

app.listen(3000, function () {
    console.log('Server listening on port 3000');
});
