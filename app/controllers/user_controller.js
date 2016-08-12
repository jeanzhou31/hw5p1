import User from '../models/user_model';
import jwt from 'jwt-simple';
import config from '../config.js';


// encodes a new token for a user object
function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}

export const signin = (req, res, next) => {
  res.send({ token: tokenForUser(req.user) });
};

export const signup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(422).send('You must provide email and password');
  }

  // here you should do a mongo query to find if a user already exists with this email.
  User.findOne({ email })
  .then(result => {
    if (result) {
      // if user exists then return an error.
      res.json({ message: 'User already exists' });
    } else {
      // if not, use the User model to create a new user.
      const user = new User();
      user.email = email;
      user.password = password;

      // Save the new User object
      // this is similar to how you created a Post
      user.save()
      .then(
        // return a token
        res.send({ token: tokenForUser(user) })
      )
      .catch(error => {
        res.json({ message: 'Error saving' });
      });
    }
  })
  .catch(error => {
    res.json({ message: 'Error in user lookup' });
  });
};