const {_Node} = require("nv-data-tree-csp-node");

const ODP = Object.defineProperty;

const {
    sym_state,
    sym_state_rdy,
    sym_state_conding,
    sym_state_open,
    sym_state_exec,
    sym_state_rs,
    sym_state_srj,
    sym_state_brj,
    sym_state_spause,
    sym_state_bpause,
    sym_state_im,
} = require("./const");

const _SN = {
    "ready": 0,
    "conding": 1,
    "opened": 2,
    "self_executing": 3,
    "resolved": 4,
    "self_rejected": 5,
    "bubble_rejected": 6,
    "self_paused": 7,
    "bubble_paused": 8,
    "impossible": 9
}

const _NS = {
    "0": "ready",                 //default
    "1": "conding",               //异步条件回调: async conder 用来实现 IF 控制流
    "2": "opened",                //start DFS(Serial)/WFS(Paralle) descendant
    "3": "self_executing",        //exec-self-executor : closing stage  
    "4": "resolved",              //
    "5": "self_rejected",         //self-executor rejected 
    "6": "bubble_rejected",       //received upward propagating reject msg
    "7": "self_paused",           //self-executor paused          need respawn
    "8": "bubble_paused",         //received upward propagating pause msg
    "9": "impossible"             //conder FAIL ,will set all descendants to impossible
}

const _MAIN_TAC = [
    "ready",
    "started",[
        "conding",
        "pending",[
            "opened",
            "self_executing"
        ]
    ],
    "stopped",[
        "settled",[
            "resolved",
            "rejected",[
                 "self_rejected",
                 "bubble_rejected"
            ],
        ],
        "paused",[
            "self_paused",
            "bubble_paused"
        ],
        "impossible"
    ]
]


const _STUCK_TAC = [
    "ready",
    "started",[
        "conding",
        "pending",[
            "opened",
            "self_executing"
        ]
    ],
    "resolved",
    "stucked",[
        "rejected",[
             "self_rejected",
             "bubble_rejected"
        ],
        "paused",[
            "self_paused",
            "bubble_paused"
        ],
    ],
    "impossible"
]


function _get_fst_ance(that,method) {
     let g = that.$gen_ance();
     for(let an of g) {
         if(an[method]()) {
             return(an)
         } else {}
     }
     return(null)
}

function _get_xxx_deses(that,method) {
     let sdfs = that.$sdfs_;
     return(sdfs.filter(r=>r[method]()))
}



class State extends _Node {
     #curr = 1 
     get state_()               {return(_NS[this.#curr])}
     ////
     get [sym_state]()  {return(this.#curr)}
     ////
     is_pending() {return(this.#curr >=2 && this.#curr <=3)}
     is_started() {return(this.#curr >=1 && this.#curr <=3)}
     ////
     is_rejected() {return(this.#curr >=5 && this.#curr <=6)}
     is_settled()  {return(this.#curr >=4 && this.#curr <=6)}
     is_paused()   {return(this.#curr >=7 && this.#curr <=8)}
     is_stucked()  {return(this.#curr >=5 && this.#curr <=8)}
     is_stopped()  {return(this.#curr >=4 && this.#curr <=9)}
     ////
     [sym_state_rdy]()                 {this.#curr = 0}
     [sym_state_conding]()             {this.#curr = 1}      //其返回结果控制 des + self-exec 能否执行
                                                       //不能的话设为impossible
     [sym_state_open]()                {this.#curr = 2}      //开始执行des
     [sym_state_exec]()                {this.#curr = 3}      //开始执行自己
     [sym_state_rs]()                  {this.#curr = 4}
     [sym_state_srj]()                 {this.#curr = 5}
     [sym_state_brj]()                 {this.#curr = 6}
     [sym_state_spause]()              {this.#curr = 7} 
     [sym_state_bpause]()              {this.#curr = 8}
     [sym_state_im]()                  {this.#curr = 9}
     ////
}

function _add_is() {
    for(let k in _SN) {
        State.prototype[`is_${k}`]  = function() {return(this[sym_state] === _SN[k])}
    }
}

_add_is();

const FST_ANCE_METHODS = [
    'self_rejected',
    'bubble_rejected',
    'rejected',
    'self_paused',
    'bubble_paused',
    'paused'
]

function _add_fst_ance_() {
    for(let k of FST_ANCE_METHODS) {
        ODP(
            State.prototype,
            `fst_${k}_ance_`,
            {get:function(){return(_get_fst_ance(this,k))}}
        );
        State.prototype[`has_${k}_ance_`] = function() {
            return(_get_fst_ance(this,k)!==null)
        }
    }
}

_add_fst_ance_();

const DESES_METHODS = [
    'paused','rejected','stucked'
]

function _add_xxx_deses_() {
        ODP(
            State.prototype,
            `conding_deses_`,
            {get:function(){return(_get_xxx_deses(this,`is_conding`))}}
        );
        ODP(
            State.prototype,
            `self_executing_deses_`,
            {get:function(){return(_get_xxx_deses(this,`is_self_executing`))}}
        );
        ODP(
            State.prototype,
            `self_rejected_deses_`,
            {get:function(){return(_get_xxx_deses(this,`is_self_rejected`))}}
        );
}

_add_xxx_deses_();

module.exports = State;
