/**
 * Created by duyu on 2016/8/11.
 */

; (function (factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    }
    else if (typeof define === 'function' && define.amd) {
        define([], factory);
    }
    else {
        factory();
    }
}(function () {

    DoubleLinkList.create = DoubleLinkList;
    /**
     * 双向链表(不提供逆序实现)
     * @param list
     * @returns {DoubleLinkList}
     * @constructor
     */
    function DoubleLinkList(list){
        var self = this;
        if(!(this instanceof DoubleLinkList))
            //throw new TypeError("constructor requires 'new'");
            self = new DoubleLinkList();

        this.tail = null;
        this.head = null;
        this.length = 0;

        // it's array
        if(list && typeof list.forEach === 'function'){
            list.forEach(function(obj){
                self.push(obj);
            })
        }else if(arguments.length){
            //arguments
            for(var i = 0, j = arguments.length; i < j; i++){
                this.push(arguments[i]);
            }
        }
        return self;
    }

    /**
     * 队尾入队(多元素)
     */
    DoubleLinkList.prototype.push = function(){
        for(var i = 0, l = arguments.length; i < l; i++){
            this.tail = new Node(arguments[i], this.tail, null, this);
            if(!this.head)
                this.head = this.tail;
            this.length ++;
        }
    }

    /**
     * 队尾出队
     */
    DoubleLinkList.prototype.pop = function(){
        if(!this.tail) return undefined;
        var res = this.tail.value;
        this.tail = this.tail.prev;
        this.tail.next = null;
        this.length --;
        return res;
    }

    /**
     * 队首出队
     */
    DoubleLinkList.prototype.shift = function(){
        if(!this.head) return undefined;
        var res = this.head.value;
        this.head = this.head.next;
        this.head.prev = null;
        this.length--;
        return res;
    }

    /**
     * 队首入队(多元素)
     */
    DoubleLinkList.prototype.unshift = function(){
        for(var i = 0, l = arguments.length; i < l; i++){
            this.head = new Node(arguments[i], null, this.head, this);
            if(!this.tail)
                this.tail = this.head;
            this.length++;
        }
    }

    /**
     * 遍历(头至尾)
     * @param fn
     * @param context
     */
    DoubleLinkList.prototype.forEach = function(fn, context){
        context = context || this;
        for(var walker = this.head, i = 0; walker !== null; i++){
            fn.call(context, walker.value, i, context); // (value, index, context)
            walker = walker.next;
        }
    }

    /**
     * 返回一个新队列
     * @param fn
     * @param context
     */
    DoubleLinkList.prototype.map = function (fn, context) {
        context = context || this;
        var res = new DoubleLinkList();
        for(var walker = this.head; walker !== null;){
            res.push(fn.call(context, walker.value, this));
            walker = walker.next;
        }
        return res;
    }

    /**
     * 归集,返回值与initial一致
     * @param fn
     * @param initial
     */
    DoubleLinkList.prototype.reduce = function (fn, initial) {
        var acc, walker = this.head;
        //若存在initial,则初始值为initial; 不存在则以header.value代替
        if(arguments.length > 1){
            acc = initial;
        }else if(this.head){
            walker = this.head.next;
            acc = this.head.value;
        }else throw new TypeError('reduce of empty list with no initial value');

        for(var i = 0; walker !== null; i++, walker = walker.next){
            acc = fn(acc, walker.value, i);
        }
        return acc;
    }

    DoubleLinkList.prototype.filter = function () {
        throw new Error('filter are not implemented in this version')
    }

    /**
     * 返回指定的队列结点集合
     * @param from
     * @param to
     */
    DoubleLinkList.prototype.slice = function (from, to) {
        from = from || 0;
        to = to || this.length;
        from = from < 0 ? ((from += this.length) < 0 ? 0 : (from += this.length)) : (from < 0 ? 0 : from);
        to = to < 0 ? (to += this.length) : (to > this.length ? this.length : to);

        var ret = new DoubleLinkList();
        if(from < 0 || to < 0 || from < to)
            return ret;

        //首先遍历至from结点的索引处
        for(var i = 0, walker = this.head; i < from && walker !== null; i++){
            walker = walker.next;
        }
        for(; walker !== null && i < to; i++, walker = walker.next){
            ret.push(walker.value);
        }
        return ret;
    }

    /**
     * 逆序
     */
    DoubleLinkList.prototype.reverse = function () {
        for(var walker = this.head; walker !== null; walker = walker.next){
            var p = walker.prev;
            walker.prev = walker.next;
            walker.next = p;
        }
        var temp = this.tail;
        this.tail = this.head;
        this.head = temp;

        return this;
    }


    /**
     * 删除指定结点
     * @param node
     */
    DoubleLinkList.prototype.removeNode = function(node){
        if(node.context !== this)
            throw new TypeError('the node does not belong to this list');
        var next = node.next;
        var prev = node.prev;
        if(next) next.prev = prev;
        if(prev) prev.next = next;

        //处理头尾结点的情况
        if(node === this.head)  this.head = next;
        if(node === this.tail)  this.tail = prev;
        node.context.length--;
        node.next = node.prev = node.value = node.context = null;
    }


    /**
     * 尾部添加结点
     * @param node
     */
    DoubleLinkList.prototype.pushNode = function (node) {
        if(node === this.tail) return;
        //结点若存在于队列中,先删除
        if(node.context)
            node.context.removeNode(node);

        var tail = this.tail;
        node.prev = tail;
        node.context = this;
        //normal
        if(tail) tail.next = node;

        //empty list
        if(!this.head) this.head = node;

        this.tail = node;
        this.length ++;

    }

    /**
     * 首部添加结点
     * @param node
     */
    DoubleLinkList.prototype.unshiftNode = function (node) {
        if(node === this.head) return;
        //结点若存在于队列中,先删除
        if(node.context)
            node.context.removeNode(node);

        var head = this.head;
        node.next = head;
        node.context = this;
        //normal
        if(head) head.prev = node;

        //empty list
        if(!this.tail) this.tail = node;

        this.head = node;
        this.length ++;

    }

    /**
     * 获取第n个结点值
     * @param n
     */
    DoubleLinkList.prototype.get = function(n){
        //先遍历至指定索引
        for(var i = 0, walker = this.head ; i < n && walker !== null; i++){
            walker = walker.next;
        }
        if(i === n && walker !== null)
            return walker.value;
        return null;
    }

    /**
     * 返回结点值的数组
     */
    DoubleLinkList.prototype.toArray = function(){
        var arr = new Array(this.length);
        for(var i = 0, walker = this.head; i < this.length && walker !== null; i++, walker = walker.next){
            arr[i] = walker.value;
        }
        return arr;
    }

    /**
     * 返回结点值的逆序数组
     */
    DoubleLinkList.prototype.toArrayReverse = function () {
        var arr = new Array(this.length);
        for(var i = 0, walker = this.tail; i < this.length && walker !== null; i++, walker = walker.prev){
            arr[i] = walker.value;
        }
        return arr;
    }

    function Node(v, prev, next, context){
        if(!(this instanceof Node)){
            return new Node(v, prev, next, context);
        }

        this.context = context;
        this.value = v;
        if(prev){
            prev.next = this;
            this.prev = prev;
        }else this.prev = null;

        if(next){
            next.prev = this;
            this.next = next;
        }else this.next = null;
    }

    return DoubleLinkList;
}));