var mongodb = require('./db');
var markdown = require('markdown').markdown;
var settings = require('../settings');
var MongoClient = require('mongodb').MongoClient;

function Publish(name, title, content, tags, head){
    this.name = name;
    this.title = title;
    this.content = content;
    this.tags = tags;
    this.head = head;
}

Publish.prototype.save = function (cb) {
    var date = new Date();
    var time = {
        date: date,
        year: date.getFullYear(),
        month: date.getFullYear() + '-' + (date.getMonth() + 1),
        day: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(),
        minute: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getHours() + ':' +
            (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    }

    var pub = {
        name: this.name,
        time: time,
        title: this.title,
        content: this.content,
        comments: [],
        tags: this.tags,
        pv: 0,
        head: this.head
    }
    //mongodb.open(function (err, db) {
    MongoClient.connect(settings.connectURL, function (err, db) {
        if(err) return cb(err);
        //读取集合
        db.collection('publishs', function(err, collection){
            if(err) {
                //mongodb.close();
                db.close();
                return cb(err);
            }
            collection.insert(pub, {safe: true}, function (err) {
                //mongodb.close();
                db.close();
                err ? cb(err) : cb(null)
            });
        });
    });
};

//获取某人前10篇文章
Publish.prototype.getTen = function (name, page, cb) {
    //mongodb.open(function (err, db) {
    MongoClient.connect(settings.connectURL,function (err, db) {
        if(err) return cb(err);
        db.collection('publishs', function(err, collection){
            if(err) {
                //mongodb.close();
                db.close();
                return cb(err);
            }

            var query = name ? {name: name} : {};
            collection.count(query, function (err, total) {
                collection.find(query, {
                    skip:(page - 1) * 10,
                    limit: 10
                }).sort({
                    time: -1
                }).toArray(function (err, docs) {
                    //mongodb.close();
                    db.close();
                    if(err) return cb(err);
                    docs.forEach(function (doc) {
                        if(doc)
                            doc.content = markdown.toHTML(doc.content);
                    });
                    cb(null, docs, total);
                })
            })
        });
    });
};

//获取所有文章存档信息
Publish.prototype.getArchive = function (cb) {
    //mongodb.open(function (err, db) {
    MongoClient.connect(settings.connectURL,function (err, db) {
        if(err) return cb(err);
        db.collection('publishs', function(err, collection){
            if(err) {
                //mongodb.close();
                db.close();
                return cb(err);
            }
            collection.find({}, {
                name: 1,
                time: 1,
                title: 1
            }).sort({
                time: -1
            }).toArray(function (err, docs) {
                //mongodb.close();
                db.close();
                err ? cb(err) : cb(null, docs);
            })
        });
    });
};

//获取所有标签
Publish.prototype.getTags = function (cb) {
    //mongodb.open(function (err, db) {
    MongoClient.connect(settings.connectURL,function (err, db) {
        if(err) return cb(err);
        db.collection('publishs', function(err, collection){
            if(err) {
                //mongodb.close();
                db.close();
                return cb(err);
            }
            collection.distinct('tags', function (err, docs) {
                //mongodb.close();
                db.close();
                err ? cb(err) : cb(null, docs);
            })
        });
    });
};

//点击标签获取包含该标签的文章信息
Publish.prototype.getTag = function (tag, cb) {
    //mongodb.open(function (err, db) {
    MongoClient.connect(settings.connectURL,function (err, db) {
        if(err) return cb(err);
        db.collection('publishs', function(err, collection){
            if(err) {
                //mongodb.close();
                db.close();
                return cb(err);
            }
            //tags[] 包含tag的文档,只返回部分field
            collection.find({
                tags: tag
            },{
                name: 1,
                time: 1,
                title: 1
            }).sort({time: -1}).toArray(function (err, docs) {
                //mongodb.close();
                db.close();
                err ? cb(err) : cb(null, docs);
            });
        });
    });
};

//获取某人的所有文章 or 获取所有人的文章
Publish.prototype.getAll = function (name, cb) {
    //mongodb.open(function (err, db) {
    MongoClient.connect(settings.connectURL,function (err, db) {
        if(err) return cb(err);
        db.collection('publishs', function(err, collection){
            if(err) {
                //mongodb.close();
                db.close();
                return cb(err);
            }

            var query = name ? {name: name} : {};
            collection.find(query).sort({time: -1}).toArray(function(err, docs){
                //mongodb.close();
                db.close();
                //解析markdown为html
                docs.forEach(function(doc){
                   doc.content = markdown.toHTML(doc.content);
                });
                err ? cb(err) : cb(null, docs);
            });
        });
    });
};

Publish.prototype.getOne = function (name, day, title, cb) {
    //mongodb.open(function (err, db) {
    MongoClient.connect(settings.connectURL,function (err, db) {
        if(err) return cb(err);
        db.collection('publishs', function(err, collection){
            if(err) {
                //mongodb.close();
                db.close();
                return cb(err);
            }
            collection.findOne({
                name: name,
                "time.day": day,
                title: title
            }, function(err, doc){
                if(err){
                    //mongodb.close();
                    db.close();
                    return cb(err);
                }
                if(doc){
                    //--------添加pv值---------
                    collection.update({
                        name: name,
                        "time.day": day,
                        title: title
                    },{
                        $inc: {pv :1}
                    }, function (err) {
                        //mongodb.close();
                        db.close();
                        if(err) return cb(err);
                    });
                    //--------end---------
                    doc.content = markdown.toHTML(doc.content);
                    if(doc.comments && doc.comments.length)
                        doc.comments.forEach(function (comment) {
                            comment.content = comment.content ?  markdown.toHTML(comment.content) :  null;
                        })
                    cb(null, doc);
                }else cb(null, null);

            });
        });
    });
};

Publish.prototype.edit = function (name, day, title, cb) {
    //mongodb.open(function (err, db) {
    MongoClient.connect(settings.connectURL,function (err, db) {
        if(err) return cb(err);
        db.collection('publishs', function(err, collection){
            if(err) {
                //mongodb.close();
                db.close();
                return cb(err);
            }
            collection.findOne({
                name: name,
                "time.day": day,
                title: title
            }, function(err, doc){
                //mongodb.close();
                db.close();
                //console.log('========error======'+ err.toString());
                if(err) return cb(err);
                //doc.content = markdown.toHTML(doc.content);
                cb(null, doc);
            });
        });
    });
};

Publish.prototype.update = function (name, day, title, content, cb) {
    //mongodb.open(function (err, db) {
    MongoClient.connect(settings.connectURL,function (err, db) {
        if(err) return cb(err);
        db.collection('publishs', function(err, collection){
            if(err) {
                //mongodb.close();
                db.close();
                return cb(err);
            }
            collection.update({
                name: name,
                "time.day": day,
                title: title
            }, {
                $set: {content: content}
            }, function(err){
                //mongodb.close();
                db.close();
                if(err) return cb(err);
                cb(null);
            });
        });
    });
};

Publish.prototype.remove = function (name, day, title, cb) {
    //mongodb.open(function (err, db) {
    MongoClient.connect(settings.connectURL,function (err, db) {
        if(err) return cb(err);
        db.collection('publishs', function(err, collection){
            if(err) {
                //mongodb.close();
                db.close();
                return cb(err);
            }
            collection.remove({
                name: name,
                "time.day": day,
                title: title
            }, {
                w:1
            }, function(err){
                //mongodb.close();
                db.close();
                if(err) return cb(err);
                cb(null);
            });
        });
    });
};

//全文搜索
Publish.prototype.search = function (keyword, cb) {
    //mongodb.open(function (err, db) {
    MongoClient.connect(settings.connectURL,function (err, db) {
        if(err) return cb(err);
        db.collection('publishs', function(err, collection){
            if(err) {
                //mongodb.close();
                db.close();
                return cb(err);
            }
            var partten = new RegExp(keyword, 'i');
            collection.find({
                title: partten
            },{
                name: 1,
                "time": 1,
                title: 1
            }).sort({time: -1}).toArray(function (err, docs) {
                //mongodb.close();
                db.close();
                err ? cb(err) : cb(null, docs);
            })
        });
    });
};

module.exports = Publish;