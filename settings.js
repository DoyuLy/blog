module.exports = {
    cookieSecret: 'myblog',
    db: 'blog',
    host: 'localhost',//
    port: '27017',
    //connectURL: 'mongodb://duyu:duyu2008@ds019950.mlab.com:19950/blog' // best way
    connectURL: 'mongodb://localhost:27017/blog?maxPoolSize=10&w=1&journal=true'
}