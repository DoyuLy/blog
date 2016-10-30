/**
 * Created by duyu on 2016/10/30.
 */

function Sandbox(){
    var args = Array.prototype.slice.call(arguments),
        //最后一个参数是回调函数
        cb = args.pop(),
        //参数可以是字符串,也可以是数组
        modules = (args[0] && typeof args[0] === 'string') ? args : args[0],
        i;

    //确保是Sandbox的实例在调用
    if(!(this instanceof Sandbox)){
        return new Sandbox(modules, cb);
    }

    this.a = 1;
    this.b = 2;

    //添加模块
    if(!modules || modules === '*'){
        modules = [];
        for(i in Sandbox.modules){
            if(Sandbox.modules.hasOwnProperty(i)){
                modules.push(i);
            }
        }
    }

    //初始化所需模块
    for(i = 0 ; i < modules.length; i++){
        Sandbox.models[modules[i]](this);
    }

    cb && cb(this);
}

Sandbox.prototype = {
    constructor: Sandbox,
    version: '1.0',
    getName: function(){
        return this.name;
    }
}

Sandbox('dom', 'event', function(box){

})

var inherit = (function(){
    var F = function(){};
    return function(child, parent){
        F.prototype = parent.prototype;
        child.prototype = new F();
        child.uber = parent.prototype;
        child.constructor = child;
    }
}())