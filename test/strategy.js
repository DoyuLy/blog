/**
 * Created by duyu on 2016/11/2.
 */
var validator = {
    types: {
        isNotEmpty: {
            validate: function(value){
                return value !== '';
            },
            instruction: 'the value cannot be empty'
        },
        isNumber: {
            validate: function(value){
                return ! isNaN(value);
            },
            instruction: 'the value can only be a valid number'
        },
        //只包含字母与数字
        isAlphaNum: {
            validate: function(value){
                return !/[^a-z0-9]/i.test(value);
            },
            instruction: 'the value can only contain characters and numbers, no special symbols'
        }
    },
    messages: [],
    config: {},
    validate: function(data){
        var i,msg,type,checker,result_ok;
        for(i in data){
            if(data.hasOwnProperty(i)){
                type = this.config[i];
                checker = this.types[type];
                if(!type){
                    continue;
                }
                if(!checker){
                    throw {
                        name: 'ValidationError',
                        message: 'No handler to validate type' + type
                    }
                }

                result_ok = checker.validate(data[i]);
                if(!result_ok){
                    msg = 'invalid value for *' + i + '*, ' + checker.instruction;
                    this.messages.push(msg);
                }
            }
        }
        return this.hasErrors();
    },
    hasErrors: function(){
        return this.messages.length !== 0;
    }
}

//test validate
var data = {
    first_name: 'du',
    last_name: 'yu',
    age: 'unknown',
    username: 'o_0'
}

validator.config = {
    first_name: 'isNotEmpty',
    age: 'isNumber',
    unsername:'isAlphaNum'
}

validator.validate(data);
if(validator.hasErrors()){
    console.log(validator.messages.join('\n'));
}