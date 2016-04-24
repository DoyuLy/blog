
var mongodb = require('./db');
var crypto = require('crypto');
var settings = require('../settings');
var MongoClient = require('mongodb').MongoClient;

function User(user){
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
}


User.prototype.save = function(cb){
    //var user = {
    //    name: this.name,
    //    password: this.password,
    //    email: this.email
    //};
    var md5 = crypto.createHash('md5'),
        //转换小写再编码
        email_md5 = md5.update(this.email.toLowerCase()).digest('hex'),
        head =  'http://cn.gravatar.com/avatar/' + email_md5 + '?s=48';

    var user = {
        name: this.name,
        password: this.password,
        email: this.email,
        head: head
    };
    //mongodb.open(function(err, db){
    MongoClient.connect(settings.connectURL, function(err, db){
        if(err) return cb(err);
        db.collection('users', function(err, collection){
           if(err) {
               //mongodb.close();
               db.close();
               return cb(err);
           }
            collection.insert(user, {safe: true}, function (err, user) {
                //mongodb.close();
                db.close();
                if(err) return cb(err);
                cb(null, user[0]);
            });
        });
    });
}

User.prototype.get = function(name, cb){
    //mongodb.open(function(err, db){
    MongoClient.connect(settings.connectURL,function(err, db){
        if(err) return cb(err);
        db.collection('users', function(err, collection){
            if(err) {
                //mongodb.close();
                db.close();
                return cb(err);
            }
            collection.findOne({name: name}, function(err, user){
                //mongodb.close();
                db.close();
                if(err) return cb(err);
                cb(null, user);
            });
        });
    });
}

module.exports = User;
