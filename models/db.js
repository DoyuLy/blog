
var settings = require('../settings'),
    db = require('mongodb').Db,//1.2版本之前使用Db,之后使用MongoClient
    connection = require('mongodb').Connection,
    server = require('mongodb').Server;
module.exports = new db(settings.db, new server(settings.host,settings.port), {safe: true});
