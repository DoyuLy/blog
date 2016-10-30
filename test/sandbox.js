/**
 * Created by duyu on 2016/10/30.
 */

function Sandbox(){
    var args = Array.prototype.slice.call(arguments),
        //���һ�������ǻص�����
        cb = args.pop(),
        //�����������ַ���,Ҳ����������
        modules = (args[0] && typeof args[0] === 'string') ? args : args[0],
        i;

    //ȷ����Sandbox��ʵ���ڵ���
    if(!(this instanceof Sandbox)){
        return new Sandbox(modules, cb);
    }

    this.a = 1;
    this.b = 2;

    //���ģ��
    if(!modules || modules === '*'){
        modules = [];
        for(i in Sandbox.modules){
            if(Sandbox.modules.hasOwnProperty(i)){
                modules.push(i);
            }
        }
    }

    //��ʼ������ģ��
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