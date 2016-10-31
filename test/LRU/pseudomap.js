/**
 * Created by duyu on 2016/8/10.
 */
; (function (factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    }
    else if (typeof define === 'function' && define.amd) {
        define([], factory);
    }
    else {
        factory();
    }
}(function () {

    'use strict';

    /**
     * 模拟map
     * @type {Function}
     */
    function PseudoMap(set){
        if(!(this instanceof PseudoMap)){
            throw new TypeError("constructor requires 'new' ");
        }
        this.clear();
        if(set){
            //支持node Map
            if(set instanceof PseudoMap || typeof  Map === 'funcrion' && set instanceof Map){
                set.forEach(function (value, key) {
                    this.set(key, value)
                }, this)
            }else if(Array.isArray(set)){
                set.forEach(function (kv) {
                    this.set(kv[0], kv[1])
                }, this)
            }else
                throw new TypeError('invalid argument');
        }
    }

    function hasOwnProperty(obj, prop){
        return Object.prototype.hasOwnProperty.call(obj, prop);
    }

    PseudoMap.prototype.clear = function(){
        var obj = Object.create(null);
        obj.size = 0;
        Object.defineProperty(this, '_data',{
            value: obj,
            enumerable: false,
            writable: false,
            configurable: true
        });
    }

    PseudoMap.prototype.forEach = function (fn, context) {
        context = context || this;
        Object.keys(this._data).forEach(function(k, i, keys){
            if(k !== 'size')
                fn.apply(context, [this._data[k].value, this._data[k].key])
        }, this);
    }

    PseudoMap.prototype.has = function(k){
        return !! find(this._data, k);
    }

    PseudoMap.prototype.get = function(k){
        var res = find(this._data, k);
        return res && res.value;
    }

    PseudoMap.prototype.set = function(k, v){
        set(this._data, k, v);
    }

    PseudoMap.prototype.delete = function(k){
        var res = find(this._data, k);
        if(res){
            delete this._data[res._index];
            this._data.size --;
        }
    }

    Object.defineProperty(PseudoMap.prototype, 'size', {
        get: function(){
            return this._data.size;
        },
        set: function(n){},
        enumerable: true,
        configurable: true
    })

    PseudoMap.prototype.values =
    PseudoMap.prototype.keys =
    PseudoMap.prototype.entries = function () {
        throw new Error('iterators are not implemented in this version')
    }

    function find(data, k){
        for(var i = 0, s = '_' + k, key = s; hasOwnProperty(data, key); key = s + i++){
            if(same(data[key].key, key)){
                return data[key];
            }
        }
    }

    function same(a, b){
        return a === b || a !== a && b!== b;
    }

    function set(data, k ,v){
        for (var i = 0, s = '_' + k, key = s; hasOwnProperty.call(data, key); key = s + i++) {
            if (same(data[key].key, k)) {
                data[key].value = v
                return
            }
        }
        data.size ++;
        data[key] = new Entry(k, v, key);
    }

    function Entry(k, v, i){
        this.key = k;
        this.value = v;
        this._index = i;
    }

    return PseudoMap;
}));

