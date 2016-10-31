/**
 * Created by duyu on 2016/8/8.
 */
var LimitableMap = function(limit){
    this.limit = limit || {};
    this.map = {};
    this.keys = [];
};

var hasOwnProperty = Object.prototype.hasOwnProperty;

LimitableMap.prototype.set = function(key, value){
    if(!hasOwnProperty.call(this.map, key)){ //查看map对象是否包含了某个属性,类似exists
        if(this.keys.length === this.limit){
            var firstKey = this.keys.shift();
            delete this.map[firstKey];
        }
        this.map[key] = value;
    }
};

LimitableMap.prototype.get = function(key) {
    return this.map[key];
};

module.exports = LimitableMap;
