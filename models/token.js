module.exports = function() {

  var crypto = require('crypto')
    , mongoose = require('mongoose');

  // Token expiration in msecs
  var tokenExpiration = 8 * 60 * 60 * 1000;

  // Creates a new Mongoose Schema object
  var Schema = mongoose.Schema; 

  // Collection to hold users
  var TokenSchema = new Schema({
      user: { type: Schema.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date, required: true },
      token: { type: String, required: true }
    },{ 
      versionKey: false 
    }
  );

  TokenSchema.pre('save', function(next) {
    var token = this;
    token.timestamp = new Date();
    next();
  });

  // Creates the Model for the User Schema
  var Token = mongoose.model('Token', TokenSchema);

  var deleteExpiredTokens = function(callback) {
    var expired = new Date(Date.now() -  tokenExpiration);
    var query = {timestamp: {$lt: expired}};
    Token.remove(query, callback); 
  }

  var getUserForToken = function(token, callback) {
    deleteExpiredTokens(function(err, stuff) {
      var query = {token: token};
      Token.findOne(query).populate('user').exec(function(err, token) {
        var user = null;
        if (token && token.user) {
          user = token.user;
        }

        callback(err, user);
      });
    });
  }

  var createTokenForUser = function(user, callback) {
    var seed = crypto.randomBytes(20);
    var token = crypto.createHash('sha1').update(seed).digest('hex');

    var query = {user: user._id};
    var update = {token: token, timestamp: new Date()};
    var options = {upsert: true};
    Token.findOneAndUpdate(query, update, options, callback);
  }

  return {
    getUserForToken: getUserForToken,
    createTokenForUser: createTokenForUser
  }
}()