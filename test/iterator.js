/**
 * Created by duyu on 2016/10/30.
 */
var agg = (function(){
    var index = 0,
        data = [1,2,3,4,5,6],
        length = data.length;
    return {
        next: function(){
            var element;
            if(!this.hasNext()){
                return null;
            }
            element = data[index];
            index += 2;
            return element;
        },
        hasNext: function(){
            return index < length;
        }
    }
}())


var element;
while(element = agg.hasNext()){
    console.log(element);
}