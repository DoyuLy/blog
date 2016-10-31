/**
 * Created by duyu on 2016/8/10.
 */


; (function (factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    }
    else if (typeof define === 'function' && define.amd) {
        define(['pseudomap', 'doubleLinkedList'], factory);
    }
    else {
        factory();
    }
}(function (map, dlist) {
    var util;
    if(typeof exports === 'object'){
        map = require('pseudomap');
        dlist = require('doubleLinkedList');
        util = require('util');
    }


}));