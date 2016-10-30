/**
 * Created by duyu on 2016/10/30.
 */
function CarMaker(){};

CarMaker.prototype.drive = function(){
    return 'I have' + this.doors + 'doors';
}

CarMaker.factory = function(type){
    var constr = type,
        newcar;
    //若没有此构造函数,则抛出异常
    if(typeof CarMaker[constr] != 'function'){
        throw {
            name: 'Error',
            message: constr + "doesn't exist"
        }
    }
    //继承公共的原型方法drive
    if(typeof CarMaker[constr].prototype.drive !== 'function'){
        CarMaker[constr].prototype = new CarMaker();
    }
    //创建一个具体实例
    newcar = new CarMaker[constr]();
    return newcar;
}

CarMaker.Compact = function(){
    this.doors = 2
}

CarMaker.Convertible = function(){
    this.doors = 4;
}

CarMaker.SUV = function(){
    this.doors = 24
}

var corolla = CarMaker.factory('Compact');
var solstice = CarMaker.factory('Convertible');
var cherokee = CarMaker.factory('SUV');
corolla.drive();// I have 2 doors
solstice.drive();// I have 4 doors
cherokee.drive();// I have 24 doors
