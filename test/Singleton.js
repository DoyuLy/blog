/**
 * Created by duyu on 2016/10/30.
 */
function Singleton(){
    //����ʵ��
    var instance;

    //��д���캯��(ʹ�ñհ���ʽ�ͱ�����д���캯��,���ñհ���Ϊ�˱�֤instance�����˽����)
    Singleton = function(){
        return instance;
    }

    //����ԭ�������뷽��(������д���캯���ᶪʧ)
    Singleton.prototype = this;
    //��ʼ��ʵ��
    instance = new Singleton();
    //���ù��캯��ָ��
    instance.constructor = Singleton;
    //���еĹ���(ģ��)
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