const new_state = require("./state");
const {_Node} = require("nv-data-tree-csp-node");

const  {
    TYPES,
    ERRORS,
    ////
    sym_curr,
    ////
    sym_rs,
    sym_rj,
    sym_start,
    sym_respawn,
    sym_pause,
    sym_rerdy,
    ////
    noexist
} = require("./const");

const DFLT_CU_EXECUTOR = (rs,rj,self)=>{}

function creat_recv(
    serial_handler=(src,self)=>{
        console.log('handle noti to serial: ',src,self)
    },
    parallel_handler=(sec,self)=>{
        console.log('handle noti to parallel: ',src,self)
    }
) {
    let _f = (src,self)=>{
       if(self.$is_leaf()) {
           console.log(ERRORS.leaf_node_should_not_recv_notification);
           return(false)
       } else if(self.$is_serial()) {
           serial_handler(src,self);
           return(true)
       } else if(self.$is_parallel()) {
           parallel_handler(sec,self);
           return(true)
       } else {
           console.log(ERRORS.not_supported_type);
           return(false)
       }
    }
    return(_f)
}


const DFLT_RECV = creat_recv(); 


class Node extends _Node {
    #type = TYPES.serial
    #state = new_state();
    #exec = DFLT_CU_EXECUTOR
    #rslt = noexist
    #exception = noexist
    #psj  = noexist
    #recv = DFLT_RECV
    ////
    set_as_serial()    {this.#type = TYPES.serial}
    set_as_parallel()  {this.#type = TYPES.parallel}
    is_serial()        {return(this.#type === TYPES.serial)}
    is_parallel()      {return(this.#type === TYPES.parallel)}
    ////
    get [sym_state]()       {return(this.#state)}
    ////
    get exec_()             {return(this.#exec)}
    set exec_(executor)     {return(this.#exec=executor)}
    ////
    get rslt_()       {return(this.#rslt)}
    get exception_()  {return(this.#exception)}
    get settled_()    {
       if(this.#state.is_resolved()) {
           return(this.#rslt)
       } else if(this.#state.is_rejected()) {
           return(this.#exception)
       } else {
           return(noexist)
       }
    }
    ////
    is_promise_enabled() {return(this.#psj !== noexist)}
    renew_promise()      {this.#psj = _psj()}
    disable_promise()    {this.#psj = noexist}
    get p_()             {return(this.#psj===noexist?this.#psj:this.#psj[0])}
    ////
    [sym_rs](v) {
        if(this.$forest_!==null) {
            this.#state._resolve();
            this.#rslt = v;
            if(this.$is_root()) {
                ////root 必须有promise
                this.#psj[1](v);
                ////
                let rt = this.$root_;
                rt.running_.delete(this);
                ////
                return(true)
            } else if(this.is_serial() || this.is_parallel()) {
                if(this.is_promise_enabled()) {this.#psj[1](v)}
                ////
                let rt = this.$root_;
                rt.running_.delete(this);
                ////
                let parent = this.$parent_;
                //let parent = (this.$forest_===null)?null:this.$parent_;
                if(parent !== null) {
                    parent.recv_(this,parent)  //通知父节点,父节点判断,如何执行下一步
                } else {}
                return(true)
            } else {
                ////不支持
                console.log(ERRORS.not_supported_type)
                return(false)
            }
        } else {
            //abandoned
        }
    }
    [sym_rj](v) {
        if(this.$forest_!==null) {
            this.#state._reject();
            this.#exception = v;
            if(this.$is_root()) {
                ////root 必须有promise
                this.#psj[2](v);
                ////
                let rt = this.$root_;
                rt.running_.delete(this);
                ////
                return(true)
            } else if(this.is_serial() || this.is_parallel()) {
                if(this.is_promise_enabled()) {this.#psj[2](v)}
                ////
                let rt = this.$root_;
                rt.running_.delete(this);
                ////
                let parent = this.$parent_;
                //let parent = (this.$forest_===null)?null:this.$parent_;
                if(parent !== null) {
                    parent.recv_(this,parent)  //通知父节点,父节点判断,如何执行下一步
                } else {}
                return(true)
            } else {
                ////不支持
                console.log(ERRORS.not_supported_type)
                return(false)
            }
        } else {
            //abandoned
        }
    }
    ////----------------------->
    [sym_start]() {
        let executor = this.#exec;
        executor((v)=>this[sym_rs].call(this,v),(v)=>this[sym_rj].call(this,v),this);
        this.#state._start();
        if(this.$is_leaf()) {
            let rt = this.$root_; 
            rt[sym_curr] = this;  //叶子节点开始执行时,根节点的curr设置为当前节点
            rt.running_.add(this); //parallel node 使用
        } else {
            //非叶子节点在RECV中设置
        }
    }
    [sym_rerdy]() {
        this.#state._ready();
        this.#rslt = noexist;
        this.#exception = noexist;
        this.#psj = this.is_promise_enabled()?_psj():noexist;
    }
    ////
    [sym_respawn]() {
        let forest = this.$forest_;
        let nnd =  forest.node(this.constructor);
        nnd.exec_ = this.exec_;
        nnd.regis_$recv$(this.recv_);
        this.is_promise_enabled()?nnd.renew_promise():nnd.disable_promise();
        let parent = (this.$forest_===null)?null:this.$parent_;
        if(parent!==null) {
            this.$replace_node(nnd);
        } else {}
        ////------------------
        let rt = this.$root_;
        rt.running_.delete(this);
        if(rt.curr_===this) {
            rt[sym_curr] = nnd;
        } else {}
        ////------------------
        this.$erase();
        return(nnd)
    }
    ////
    [sym_pause]() {
        //pause 需要向上蔓延
        if(this.$is_leaf()) {
            let nthis = this[sym_respawn]();   //设置了sym_curr 和running 
            nthis[sym_state]._pause();
            let parent = (nthis.$forest_===null)?null:nthis.$parent_;
            if(parent !== null) {
                parent.recv_(nthis,parent)  //通知父节点,父节点判断,如何执行下一步
            } else {}
        } else {
            this[sym_state]._pause();
            ////
            let rt = this.$root_;
            rt.running_.delete(this);
            ////
            let parent = (this.$forest_===null)?null:this.$parent_;
            if(parent !== null) {
                parent.recv_(this,parent)  //通知父节点,父节点判断,如何执行下一步
            } else {}
        }
    }
    ////
    get recv_()  {return(this.#recv)}
    regis_$recv$(f=DFLT_RECV) {this.#recv = f}
    ////
}

Node.DFLT_CU_EXECUTOR = DFLT_CU_EXECUTOR;
Node.creat_recv       = creat_recv;
Node.DFLT_RECV        = DFLT_RECV;

module.exports = Node;


