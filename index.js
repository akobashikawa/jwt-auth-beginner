const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const passportJWT = require('passport-jwt');

let users = [
    {
        id: 1,
        name: 'juan',
        password: '123'
    },
    {
        id: 1,
        name: 'maria',
        password: '123'
    }
];

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

const jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
jwtOptions.secretOrKey = 'mysecret';

const jwtVerify = (jwt_payload, done) => {
    console.log('payload', jwt_payload);
    const user = users.find(user => user.id === jwt_payload.id);
    if (user) {
        done(null, user);
    } else {
        done(null, false);
    }
};

const strategy = new JwtStrategy(jwtOptions, jwtVerify);

passport.use(strategy);

const app = express();
app.use(passport.initialize());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    return res.json({ message: 'Hello, I am a simple auth server' })
});

app.post('/login', (req, res) => {
    if (!req.body.name || !req.body.password) {
        return res.status(401).json({ message: 'name and password are required' });
    }
    const { name, password } = req.body;
    const user = users.find(user => user.name === name && user.password === password);

    if (!user) {
        return res.status(401).json({ message: 'valid name and password are required' });
    }

    const payload = { id: user.id };
    const token = jwt.sign(payload, jwtOptions.secretOrKey);

    return res.json({ message: 'OK', token });
});

app.get('/private', passport.authenticate('jwt', { session: false }), (req, res) => {
    return res.json({ message: 'I am a private endpoint' });
});

app.listen(3000, () => console.log('Simple Auth server running...'));