/**
 * Created by duyu on 2016/10/30.
 */

function deepCopy(parent, child){
    var i,
        toStr = Object.prototype.toString,
        asStr = '[object Array]';
    child = child || {};
    for(i in parent){
        if(parent.hasOwnProperty[i]){
            if(typeof parent[i] === 'object'){
                child[i] = (toStr.call(parent[i]) === asStr) ? [] : {};
                deepCopy(parent[i], child[i]);
            }else{
                child[i] = parent[i];
            }
        }
    }
    return child;
}