const {
    wfs_eng,
    wfs_tac,
}  = require("nv-data-tree-csp-jconvert");

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
    sym_rerdy,
    ////
    noexist
} = require("./const");

const Node = require("./nd");
const SERIAL_HANDLER = (src,self)=> {
    if(self[sym_state].is_ready()) {
        ////只有非leaf可以收到通知
        if(src[sym_state].is_resolved()) {
            if(src.$is_lstch()) {
                self[sym_start]();
                let rt = self.$root_;
                rt[sym_curr] = self;          //修改当前
                rt.running_.add(self);        //修改并发
            } else {
                let rsib = src.$rsib_;
                rsib[sym_start]();
            }
        } else if(src[sym_state].is_rejected()) {
            //向上蔓延
            self[sym_rj](src);
        } else if(src[sym_state].is_paused()) {
            self[sym_pause](); //pause 向上蔓延
        } else {
            console.log(ERRORS.state_not_supported)
        }
    } else {
        console.log(ERRORS.serial_should_not_recv_child_noti_when_no_ready)
    }
}


function _is_all_children_resolved(self) {
    let children = self.$children_;
    return(children.every(chnd=>chnd[sym_state].is_resolved()))
}

function _find_all_rejected_children(nd) {
    let children = self.$children_;
    return(children.filter(chnd=>chnd[sym_state].is_rejected()))
}

function _find_all_pending_children(nd) {
    let children = self.$children_;
    return(children.filter(chnd=>chnd[sym_state].is_pending()))
}



const PARALLEL_HANDLER = (src,self)=> {
    if(self[sym_state].is_ready()) {
        if(src[sym_state].is_resolved()) {
            if(_is_all_children_resolved(self)) {
                self[sym_start]();
                let rt = self.$root_;
                rt[sym_curr] = self;
                rt.running_.add(self);        //修改并发
            } else {
            }
        } else if(src[sym_state].is_rejected()) {
            //向上蔓延
            self[sym_rj](src);  //src 是触发错误的chnd,src一定是正在执行自己的executor时触发的错误
        } else if(src[sym_state].is_paused()) {
            self[sym_pause](); //pause 向上蔓延
        } else {
            console.log(ERRORS.state_not_supported)
        }
    } else if(self[sym_state].is_pending()) {
        //pending 表示自己已经开始运行，那么deses肯定 都resolved
        console.log(ERRORS.should_not_recv_child_noti_if_pending)
    } else if(self[sym_state].is_resolved()) {
        //do nothing
        //如果src可以发送信号,说明src的deses全部成功,正在执行src
        //如果self resolved,说明所有children resolved;
        //此时不可能再收到信号
        console.log(ERRORS.should_not_recv_child_noti_if_resolved)
    } else if(self[sym_state].is_rejected()) {
        if(src[sym_state].is_resolved()) {
            //不干预
        } else if(src[sym_state].is_rejected()) {
            ////不干预 recover时检查 并respawn
        } else if(src[sym_state].is_paused()) {
            console.log(ERRORS.should_not_recv_child_pause_noti_if_stopped)
        } else {
            console.log(ERRORS.state_not_supported)
        }
    } else if(self[sym_state].is_paused()) {
        if(src[sym_state].is_resolved()) {
            //不干预
        } else if(src[sym_state].is_rejected()) {
            ////不干预 continue时检查
        } else if(src[sym_state].is_paused()) {
            console.log(ERRORS.should_not_recv_child_pause_noti_if_stopped)
        } else {
            console.log(ERRORS.state_not_supported)
        }         
    } else {
        console.log(ERRORS.state_not _supported)
    }
}

const RECV = Node.creat_recv(SERIAL_HANDLER,PARALLEL_HANDLER);

const DFLT_CFG = ()=>({
    type:TYPES.serial,
    enable_promise:false,
    recv:RECV,
    executor:(rs,rj,self)=>{console.log(self)}
    args_dict:{}
})



class Task extends Node {
    #name
    #curr = noexist
    #running = new Set()
    ////
    get name_()     {return(this.#name??this.$id_)}
    set name_(name) {this.#name = name}
    get [Symbol.toStringTag]() {return(this.#name)}
    get_des_with_name(name) {
        let sdfs = this.$sdfs_;
        sdfs = sdfs.filter(nd=>nd.name_ === name);
        if(sdfs.length === 0) {
            return(null)
        } else if(sdfs.length === 1) {
            return(sdfs[0])
        } else {
            return(sdfs)
        }
    }
    ////
    get curr_() {
        if(this.$is_root()) {
            return(this.#curr)
        } else {
            let rt = this.$root_;
            return(rt.curr_)
        }
    }
    set [sym_curr](nd) {this.#curr = nd}
    get running_() {
        if(this.$is_root()) {
            return(this.#running)
        } else {
            let rt = this.$root_;
            return(rt.running_)
        }        
    }
    ////
    is_ready() {
        if(this.$is_root()) {
            let curr = this.curr_;
            return(curr === noexist)
        } else {
            console.log(ERRORS.only_on_root_task)
            return(noexist)
        }
    }
    is_pending() {
        if(this.$is_root()) {
            let curr = this.curr_;
            return(curr[sym_state]?.is_pending())
        } else {
            console.log(ERRORS.only_on_root_task)
            return(noexist)
        }
    }
    is_resolved() {
        if(this.$is_root()) {
            let curr = this.curr_;
            return(curr[sym_state]?.is_resolved())
        } else {
            console.log(ERRORS.only_on_root_task)
            return(noexist)
        }
    }
    is_rejected() {
        if(this.$is_root()) {
            let curr = this.curr_;
            return(curr[sym_state]?.is_rejected())
        } else {
            console.log(ERRORS.only_on_root_task)
            return(noexist)
        }
    }
    is_settled() {
        if(this.$is_root()) {
            let curr = this.curr_;
            return(curr[sym_state]?.is_settled())
        } else {
            console.log(ERRORS.only_on_root_task)
            return(noexist)
        }
    }
    is_paused() {
        if(this.$is_root()) {
            let curr = this.curr_;
            return(curr[sym_state]?.is_paused())
        } else {
            console.log(ERRORS.only_on_root_task)
            return(noexist)
        }
    }
    ////
    is_passive_rejected() {
        //parallel siblings
        let curr = this.curr_;
        let cond = curr[sym_state]?.is_rejected();
        return(cond && curr!==this)
    }
    is_initiative_rejected() {
        //并行父任务 rejected 后,再次收到child reject的通知
        let curr = this.curr_;
        let cond = curr[sym_state]?.is_rejected();
        return(cond && curr===this)
    }
    ////
    is_stucked() {
        //paused 或 rejected
        if(this.$is_root()) {
            let curr = this.curr_;
            return(curr[sym_state]?.is_stucked())
        } else {
            console.log(ERRORS.only_on_root_task)
            return(noexist)
        }
    }
    is_stopped() {
        //paused 或 settled
        if(this.$is_root()) {
            let curr = this.curr_;
            return(curr[sym_state]?.is_stopped())
        } else {
            console.log(ERRORS.only_on_root_task)
            return(noexist)
        }
    }
    ////
    start() {
        if(this.$is_root()) {
            if(this.$is_leaf()) {
                if(this[sym_state].can_start()) {
                    this[sym_start]();
                    return(this.p_)
                } else {
                    console.log(ERRORS.can_only_start_when_ready)
                    return(noexist)
                }
            } else {
                //非leaf root
                if(this.is_ready()) {
                     if(this.is_serial()) {
                         let fstch = this.$fstch_;
                         fstch[sym_start]();
                         return(this.p_)
                     } else if(this.is_parallel) {
                         let children = this.$children_;
                         children.forEach(chnd=>chnd[sym_start]());
                         return(this.p_)
                     } else {
                         console.log(ERRORS.not_supported_type)
                         return(noexist)
                     }
                } else {
                    console.log(ERRORS.can_only_start_when_ready)
                    return(noexist)
                }                
            }
        } else {
            console.log(ERRORS.only_on_root_task)
            return(noexist) 
        }
    }
    carryon() {
        if(this.$is_root()) {
            if(this.is_paused()) {
                this.continue();
            } else if(this.is_rejected) {
                this.recover();
            } else {
                console.log(ERRORS.state_not_supported)
            }
        } else {
            console.log(ERRORS.only_on_root_task)
            return(noexist)
        }
    }
    recover() {
       if(this.$is_root()) {
            let curr = this.curr_;
            let cond = curr[sym_state]?.is_rejected()
            if(cond) {
                ////
                if(curr.is_parallel()) {
                    let pending_children = curr.$children_.filter(
                        chnd=>chnd[sym_state].is_pending()
                    );
                    pending_children.forEach(chnd=>{chnd[sym_respawn]();});
                    ////
                    let rejected_children = curr.$children_.filter(
                        chnd=>chnd[sym_state].is_rejected()
                    );
                    rejected_children.forEach(chnd=>{chnd[sym_respawn]();});
                    ////
                } else {}
                let ances = curr.$ances_;
                ances.forEach(ance=>ance[sym_rerdy]());
                curr[sym_rerdy]();
                if(curr.is_parallel()) {
                    let ready_children = curr.$children_.filter(
                        chnd=>chnd[sym_state].is_ready()
                    );
                    if(ready_children.length ===0) {
                        curr[sym_start]();
                        return(curr)
                    } else {
                        ready_children.forEach(chnd=>{chnd[sym_start]()})
                    }
                } else {
                    curr[sym_start]();
                    return(curr)
                }
                return(curr)
            } else {
                console.log(ERRORS.can_only_continue_when_pause);
                return(noexist)
            }
       } else {
           console.log(ERRORS.only_on_root_task)
           return(noexist)
       }
    }
    pause() {
       if(this.$is_root()) {
            let curr = this.curr_;
            let cond = curr[sym_state]?.is_pending()
            if(cond) {
                curr[sym_pause]();
                return(curr)
            } else {
                console.log(ERRORS.can_only_pause_when_pending);
                return(noexist)
            }
       } else {
           console.log(ERRORS.only_on_root_task)
           return(noexist)
       }
    }
    continue() {
       if(this.$is_root()) {
            let curr = this.curr_;
            let cond = curr[sym_state]?.is_paused()
            if(cond) {
                let ances = curr.$ances_;
                ances.forEach(ance=>ance[sym_state]._ready());
                 let parent = (curr.$forest_===null)?null:curr.$parent_;
                 if(parent !== null) {
                     if(parent.is_serial()) {
                         curr[sym_start]();  //会添加running
                         return(curr)
                     } else if(parent.is_parallel()) {
                         //被pause后收到的子节点的reject
                         let rejecteds = _find_all_rejected_children(parent);
                         if(rejecteds.length>0) {
                             curr[sym_rj](rejecteds)
                             //不返回
                         } else {
                             curr[sym_start](); //会添加running
                             return(curr)
                         }
                     } else {
                         console.log(ERRORS.type_not_supported);
                         return(noexist)
                     }
                 } else {
                     curr[sym_start](); //会添加running
                     return(curr)
                 }
            } else {
                console.log(ERRORS.can_only_continue_when_pause);
                return(noexist)
            }
       } else {
           console.log(ERRORS.only_on_root_task)
           return(noexist)
       }
    }
    soft_reset() {
       if(this.$is_root()) {
           if(this.is_settled()) {
               let sdfs = this.$sdfs_;
               sdfs.forEach(nd=>{
                   if(this.is_ready()) {
                   } else if(this.is_settled()) {
                       nd[sym_rerdy]()
                   } else {
                       nd[sym_respawn]();
                   }
               });
               this.#curr = noexist;
               this.running_.clear();
               return(this)
           } else {
               console.log(ERRORS.can_soft_reset_only_when_settled)
               return(noexist)
           }
       } else {
           console.log(ERRORS.only_on_root_task)
           return(noexist)
       }
    }
    hard_reset() {
       if(this.$is_root()) {
            if(this.is_ready()) {
                return(this.soft_reset());
            } else {
                let edfs = this.$edfs_;
                for(let i=0;i<edfs.length-1;i++) {
                    let nd = efds[i];
                    if(nd[sym_state].is_settled() || nd[sym_state].is_ready()) {
                        nd[sym_rerdy]()
                    } else {
                        nd[sym_respawn]()
                    }
                }
                let nrt = edfs[edfs.length-1]
                if(nd[sym_state].is_settled() || nd[sym_state].is_ready()) {
                    nrt = nrt[sym_rerdy]();
                } else {
                    nrt = nrt[sym_respawn]();
                }
                nrt[sym_curr] = noexist;
                nrt.running_.clear();
                return(nrt)
            }
       } else {
           console.log(ERRORS.only_on_root_task)
           return(noexist)
       }        
    }
    ////
    dump() {
        let sdfs = this.$sdfs_;
        for(let nd of sdfs) {
            nd.T = nd.name_;
            nd.A = DFLT_CFG();
            if(nd.is_serial()) {nd.A.type = TYPES.serial} else {nd.A.type = TYPES.parallel}
            if(nd.is_promise_enabled()) {nd.A.enable_promise = true} else {nd.A.enable_promise = false}
            nd.A.recv = nd.recv_;
            nd.A.executor = nd.exec_;
            nd.A.args_dict = {}
            for(let k in nd) {
                if(k!=='T' && k!=='A') {
                    nd.A.args_dict[k] = nd[k]
                } else {}
            }
        }
        let rslt = wfs_tac.jsonize(this);
        sdfs.forEach(nd=>{
            delete nd.T;
            delete nd.A;
        })
        return(rslt)
    }
}


function _fill_one_task(tsk,cfg=DFLT_CFG()) {
    let _cfg = DFLT_CFG();
    Object.assign(_cfg,cfg);
    let {type,enable_promise,recv,executor,args_dict} = _cfg;
    ////
    if(type === TYPES[0]) {
        nd.set_as_serial();
    } else if(type === TYPES[1]) {
        nd.set_as_parallel();
    } else {
        throw(ERRORS.not_supported_type)
    }
    ////
    if(enable_promise) {nd.renew_promise()} else {}
    ////
    nd.regis_$recv$(recv);
    nd.exec_ = executor;
    ////
    for(let k in args_dict) {
        if(k!=='T' && k!=='A') {
            nd[k] = args_dict[k]
        } else {
        }
    }
    return(nd)
}




function load_from_json(J,rtrn_forest=false,max_size) {
    let [rt,forest] = wfs_tac.tree_lize(J,max_size,Task);
    let sdfs = rt.$sdfs_;
    sdfs.forEach(nd=>{
        _fill_one_task(nd,nd.A);
        delete nd.A;
        nd.name_ = nd.T;
        delete nd.T;
    });
    rt.renew_promise();  //root must have promise
    if(rtrn_forest) {
        return([rt,forest])
    } else {
        return(rt)
    }
}


module.exports = load_from_json;



