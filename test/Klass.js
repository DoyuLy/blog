/**
 * Created by duyu on 2016/10/30.
 */
var klass = function(Parent, props){
    var Child, F, i;

    //1.新构造函数
    Child = function(){
        if(Child.uber && Child.uber.hasOwnProperty('__construct')){
            Child.uber.__construct.apply(this, arguments);
        }
        if(Child.prototype.hasOwnProperty('__construct')){
            Child.prototype.__construct.apply(this, arguments);
        }
    };

    //2.原型继承
    Parent = Parent || Object;
    F = function(){};
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.uber = Parent.prototype;
    Child.prototype.constructor = Child; // Child.constructor也是一个意思

    //3.添加实现方法
    for(i in props){
        if(props.hasOwnProperty(i)){
            Child.prototype[i] = props[i];
        }
    }

    return Child;
}

var Human = klass(null, {
    __construct: function(what){
        console.log("Human's constructor");
        this.name = what;
    },
    getName: function(){
        return this.name;
    }
})

var Woman = klass(Human, {
    __construct: function(what){
        console.log("Woman's constructor");
    },
    getName: function(){
        var name = Human.uber.getName.call(this);
        return "I am " + name;
    }
})
var woman = new Woman('lily');
woman.getName();// 'I am lily'