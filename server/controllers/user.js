const User = require('../models/user');
const MongooseHelpers = require('../helpers/mongoose');
const jwt = require('jsonwebtoken');
const config = require('../config');

exports.auth = function(req, res) {
  const {email, password} = req.body;

  if( !email || !password) {
    return res.status(422).send({errors: [{ title: 'Users data errrors', detail: 'Provide email and password'}]});
  }

  User.findOne({email}, (err, user) => {
    if(err){
      return res.status(422).send({errros: MongooseHelpers.normalizeErrors(err.errors)});
    }

    if(!user) {
      return res.status(422).send({errors: [{ title: 'Invalid User', detail: 'User dont exist'}]});
    }

    if(user.isSamePassword(password)) {
      const token = jwt.sign({
                      userId: user.id,
                      username: user.username
                    }, config.SECRET , { expiresIn: '1h' });

     return res.json(token);
    } else {
      return res.status(422).send({errors: [{ title: 'Wrong data', detail: 'Wrong email or password'}]});
    }

  });
};


exports.register = function(req, res) {
  const {username, email, password, confPassword} = req.body;

  if(!username || !email || !password) {
    return res.status(422).send({errors: [{ title: 'Users data errrors', detail: 'Provide email and password and username'}]});
  }

  if(password !== confPassword) {
    return res.status(422).send({errors: [{ title: 'Password Errors', detail: 'Passwords are to be the same'}]});
  }

  User.findOne({email}, (err, existingUser) => {
    if(err){
      return res.status(422).send({errors: MongooseHelpers.normalizeErrors(err.errors)});
    }

    if(existingUser) {
      return res.status(422).send({errors: [{ title: 'Email Errors', detail: 'Email is already used'}]});
    }

    const user = new User({
      username,
      email,
      password
    });

    user.save((err) => {
      if(err){
        return res.status(422).send({errors: MongooseHelpers.normalizeErrors(err.errors)});
      }

      return res.json({'registered': true});
    });
  });
};

exports.authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  if(token) {
    const  user = parseToken(token);

    User.findById(user.userId, (err, user) => {
      if(err) {
        return res.status(422).send({errors: MongooseHelpers.normalizeErrors(err.errors)});
      }

      if (user) {
        res.locals.user = user;
        next();
      } else {
        return notAuthorized(res);
      }
    });
  } else {
    return notAuthorized(res);
  }
}

function parseToken(token){

  return  jwt.verify(token.split(' ')[1], config.SECRET);
}


function notAuthorized(res){
  return res.status(401).send({errors: [{ title: 'Not Authorize', detail: 'You need to login to access'}]});
}
