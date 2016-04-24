var mongodb = require('./db');
var settings = require('../settings');
var MongoClient = require('mongodb').MongoClient;

function Comment(name, day, title, comment){
    this.name = name;
    this.day = day;
    this.title = title;
    this.comment = comment;
}

Comment.prototype.save = function (cb) {
    var name = this.name,
        day = this.day,
        title = this.title,
        comment = this.comment;

    //mongodb.open(function (err, db) {
    MongoClient.connect(settings.connectURL, function (err, db) {
        if(err) return cb(err);
        db.collection('publishs', function (err, collection) {
            if(err){
                //mongodb.close();
                db.close();
                return cb(err);
            }

            collection.update({
                name: name,
                "time.day": day,
                title: title
            },{
                $push: {comments: comment}
            }, function (err) {
                //mongodb.close();
                db.close();
                err ? cb(err) : cb(null);
            })
        })
    })
};

module.exports = Comment;