/**
 * Created by duyu on 2016/10/30.
 */
function Singleton(){
    //缓存实例
    var instance;

    //重写构造函数(使用闭包方式就必须重写构造函数,采用闭包是为了保证instance缓存的私有性)
    Singleton = function(){
        return instance;
    }

    //保留原型属性与方法(由于重写构造函数会丢失)
    Singleton.prototype = this;
    //初始化实例
    instance = new Singleton();
    //重置构造函数指针
    instance.constructor = Singleton;
    //所有的功能(模拟)
    this.start_time = 0;
    this.bang = 'big';

    return instance;
}

//--------------------------------------------
var Singleton;
(function(){
   var instance;
    Singleton = function(){
        if(instance){
            return instance;
        }

        instance = this;
        this.xxx = 0
    }
}())