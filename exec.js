const {
    sym_debug,
    ////
    noexist,
    ////
    TYPES,
    ERRORS,
    INFOS,
    ////---------------state
    sym_state,         //getter
    sym_state_rdy        ,
    sym_state_conding    ,
    sym_state_open       ,
    sym_state_exec       ,
    sym_state_rs         ,
    sym_state_srj        ,
    sym_state_brj        ,
    sym_state_spause     ,
    sym_state_bpause     ,
    sym_state_im         ,
    ////--------------------completion
    sym_stuck_origin,    //setter 当前停止在哪个nd ,用来recover(self_rejected)/continue(self_paused)
    sym_cond,            //setter conder 的结果
    sym_rslt,            //setter
    sym_exception,       //setter
    sym_psj,             //getter
    sym_renew_psj,
    ////-----------------------exec
    sym_rdy,           //软重启 非conding 非pending 状态可用
    sym_exec_conder,
    sym_open,
    sym_exec,
    sym_rs,
    sym_srj,
    sym_brj,
    sym_spause,
    sym_bpause,
    sym_im,
    sym_respawn,
    sym_reset,          //硬重启 
    //sym_recv,           //getter setter
    //
    DFLT_CU_CONDER,
    DFLT_CU_EXECUTOR,
    DFLT_COPY,
    ////
    sym_if,
    sym_elif,
    sym_else,
    sym_while,
} = require("./const");


const DEBUG = require("./debug");

const Completion = require("./completion");

function _conder_rs(that) {
    if(!that.is_abandoned()) {
        that[sym_cond] = true;
        that[sym_open]();
    } else {
        DEBUG(globalThis[sym_debug])(INFOS.ignore_abandoned_cond_tru)
    }
}

function _conder_rj(that) {
    if(!that.is_abandoned()) {
        that[sym_cond] = false;
        let sdfs = that.$sdfs_;
        DEBUG(globalThis[sym_debug])(that,'set deses',sdfs,'to impossible coz conder false');
        sdfs.forEach(nd=>nd[sym_state_im]()); //impossible 只需要设置状态
        _send_to_parent(that,sym_im); //父节点处理 
    } else {
        DEBUG(globalThis[sym_debug])(INFOS.ignore_abandoned_cond_fls)
    }
}



function _add_to_running(that) {
    let rt = that.$root_;
    DEBUG(globalThis[sym_debug])('add',that,'to',rt.running_,'when executing...');
    rt.running_.add(that);
    DEBUG(globalThis[sym_debug])('running is',rt.running_)
}



function _send_to_parent(that,sig,data=noexist) {
     let parent = that.$parent_;
     DEBUG(globalThis[sym_debug])(that,'send msg',sig,'to parent',parent)
     DFLT_RECV(that,sig,parent,data);
}

function _delete_from_running(that) {
    let rt = that.$root_;
    DEBUG(globalThis[sym_debug])('delete',that,'from',rt.running_,`when ${that.state_}`);
    rt.running_.delete(that);
    DEBUG(globalThis[sym_debug])('running is:',rt.running_)
    return(rt)
}


function _cycle(that) {
    let sdfs= that.$sdfs_;
    sdfs.forEach(nd=>nd[sym_reset](true)}
    that[sym_exec_conder]();
}

function _resolve(that,v,sig) {
    if(!that.is_abandoned()) {
        that[sym_state_rs]();
        that[sym_rslt] = v;
        DEBUG(globalThis[sym_debug])(that,`when ${that.state_}`)
        if(that.$is_root()) {
            ////root 必须有promise
            that[sym_psj][1](v);
            _delete_from_running(that);
            if(that[sym_conder][sym_while]=true) {
                _cycle(that);
            } else {}
        } else if(that.is_serial() || that.is_parallel()) {
            if(that.is_promise_enabled()) {that[sym_psj][1](v)}
            _delete_from_running(that);
            if(that[sym_conder][sym_while]=true) {
                _cycle(that);
            } else {
                _send_to_parent(that,sig);
            }
        } else {
            ////不支持
            DEBUG(globalThis[sym_debug])(ERRORS.not_supported_type)
        }
    } else {
        //abandoned
        DEBUG(globalThis[sym_debug])(INFOS.ignore_abandoned_resolved)
    }    
}

function _set_reject_state(that,sig) {
    if(sig === sym_srj) {
        that[sym_state_srj]();
    } else if(sig === sym_brj) {
        that[sym_state_brj]();
    } else {
        DEBUG(globalThis[sym_debug])(ERRORS.not_supported_reject)
    }
}

function _set_stuck_origin_if_self_reject(rt,that,sig) {
    if(sig === sym_srj) {
        DEBUG(globalThis[sym_debug])('set curr_ to',that,`when ${that.state_}`)
        rt[sym_stuck_origin] = that;
        DEBUG(globalThis[sym_debug])('curr_ is',that)
    } else {}
}


function _reject(that,v,sig) {
    if(!that.is_abandoned()) {
        _set_reject_state(that,sig);
        that[sym_exception] = v;
        if(that.$is_root()) {
            ////root 必须有promise
            that[sym_psj][2](v);
            ////
            let rt = _delete_from_running(that);
            _set_stuck_origin_if_self_reject(rt,that,sig);
            ////
        } else if(that.is_serial() || that.is_parallel()) {
            if(that.is_promise_enabled()) {that[sym_psj][2](v)}
            ////
            let rt = _delete_from_running(that);
            _set_stuck_origin_if_self_reject(rt,that,sig);
            ////
            _send_to_parent(that,sig,v); //错误需要向上传播
        } else {
            ////不支持
            DEBUG(globalThis[sym_debug])(ERRORS.not_supported_type)
        }
    } else {
        //abandoned
        DEBUG(globalThis[sym_debug])(INFOS.ignore_abandoned_rejected)
    }
}



function _serial_recv(src,sig,self,data) {
    if(self.is_opened()) {
        if(sig === sym_im) {
             if(src.$is_lstch()) {
                 DEBUG(globalThis[sym_debug])('serial',self, 'recv lstch impossible from ',src);
                 DEBUG(globalThis[sym_debug])('serial',self,'executing')
                 self[sym_exec]();
             } else {
                 DEBUG(globalThis[sym_debug])('serial',self, 'recv notlst child impossible from ',src)
                 let rsib = src.$rsib_;
                 DEBUG(globalThis[sym_debug])('rsib',rsib,'of',src,'exec_conder');
                 rsib[sym_exec_conder]();
             }
        } else if(sig === sym_spause) {
            DEBUG(globalThis[sym_debug])('serial',self, 'recv self pause from ',src);
            self[sym_bpause](data) //透传
        } else if(sig === sym_bpause) {
            DEBUG(globalThis[sym_debug])('serial',self, 'recv bubble pause from ',src);
            self[sym_bpause](data) //透传
        } else if(sig === sym_rs) {
            if(src.$is_lstch()) {
                DEBUG(globalThis[sym_debug])('serial',self, 'recv lstch resolved from ',src)
                DEBUG(globalThis[sym_debug])('serial',self,'executing')
                self[sym_exec](); //closing
            } else {
                DEBUG(globalThis[sym_debug])('serial',self, 'recv notlst child resolved from ',src)
                let rsib = src.$rsib_;
                DEBUG(globalThis[sym_debug])('rsib',rsib,'of',src,'exec_conder');
                rsib[sym_exec_conder]();
            }
        } else if(sig === sym_srj) {
            _reject(self,src[sym_exception],sym_brj);
        } else if(sig === sym_brj) {
            _reject(self,data,sym_brj);
        } else {
            DEBUG(globalThis[sym_debug])(ERRORS.not_supported_signal)
        }
    } else {
        DEBUG(globalThis[sym_debug])(ERRORS.serial_node_should_not_recv_child_noti_when_not_opened) 
    }
}


function _get_children_stats(self) {
    let children = self.$children_;
    let total=children.length;
    let rs=0;
    let rj=0;
    let im=0;
    let rjchild;
    for(let child of children) {
        if(child.is_impossible()) {
            im = im+1;
            rjchild = child
        } else if(child.is_resolved()) {
            rs = rs+1
        } else if(child.is_rejected()) {
            rj = rj+1
        } else {
        }
    }
    return({total,rs,rj,im,rjchild})
}



function _parallel_recv(src,sig,self,data) {
    if(self.is_opened()) {
        if(sig === sym_im) {
             let {total,rs,rj,im,rjchild} = _get_children_stats(self)
             if(im>0) {
                 DEBUG(globalThis[sym_debug])('parallel',self,'found rejected child');
                 _reject(self,rjchild[sym_exception],sym_brj);
             } else if(total === rs+im) {
                 DEBUG(globalThis[sym_debug])('parallel',self, 'recv impossible msg from ',src,'and all children resolved or impossible');
                 DEBUG(globalThis[sym_debug])('parallel',self,'executing');
                 self[sym_exec]();
             } else {
                 DEBUG(globalThis[sym_debug])('parallel',self,'recved impossible msg from',src,'but not all children resolved or impossible')
             }
        } else if(sig === sym_spause) {
            DEBUG(globalThis[sym_debug])('parallel',self, 'recv self pause from ',src);
            self[sym_bpause](data) //透传
        } else if(sig === sym_bpause) {
            DEBUG(globalThis[sym_debug])('parallel',self, 'recv bubble pause from ',src);
            self[sym_bpause](data) //透传
        } else if(sig === sym_rs) {
            let {total,rs,rj,im,rjchild} = _get_children_stats(self)
            if(im>0) {
                DEBUG(globalThis[sym_debug])('parallel',self,'found rejected child');
                _reject(self,rjchild[sym_exception],sym_brj);
            } else if(total === rs+im) {
                DEBUG(globalThis[sym_debug])('parallel',self,'recved resolved msg from',src,'all children resolved or impossible');
                DEBUG(globalThis[sym_debug])('parallel',self,'executing')
                self[sym_exec]();   //closing
            } else {
                DEBUG(globalThis[sym_debug])('parallel',self,'recved resolved msg from',src,'but not all children resolved or impossible')
            }
        } else if(sig === sym_srj) {
            _reject(self,src[sym_exception],sym_brj);
        } else if(sig === sym_brj) {
            _reject(self,data,sym_brj);
        } else {
            DEBUG(globalThis[sym_debug])(ERRORS.not_supported_signal)
        }
    } else if(self.is_bubble_rejected()) {
         DEBUG(globalThis[sym_debug])('bubble_rejected',self, 'recv',sig,'from',src)
    } else if(self.is_bubble_paused()) {
         DEBUG(globalThis[sym_debug])('bubble_paused',self, 'recv',sig,'from',src)
    } else {
        DEBUG(globalThis[sym_debug])(ERRORS.parallel_node_should_not_recv_child_noti_when_not_OorB)
    }
}


const DFLT_RECV = (src,sig,self,data) => {
    if(self.is_serial()) {
        _serial_recv(src,sig,self,data);
    } else {
        _parallel_recv(src,sig,self,data);
    }
}



class Exec extends Completion {
     #conder = DFLT_CU_CONDER
     #exec   = DFLT_CU_EXECUTOR
     ////
     get conder_()                 {return(this.#conder)}
     set conder_(f)                {this.#conder=f}
     is_conder_if()                {return(this.#conder[sym_if]===true)}
     is_conder_elif()              {return(this.#conder[sym_elif]===true)}
     is_conder_else()              {return(this.#conder[sym_else]===true)}
     get if_head_()                {
          let lsib = this
          while(lsib !== null) {
              if(lsib.is_conder_if()) {
                  return(lsib)
              } else {
                  lsib = lsib.$lsib_
              }
          }
          return(lsib)
     }
     is_all_if_chain_psib_conder_failed() {
         let lsib = this.$lsib_;
         while(lsib !== null) {
             if(lsib.is_conder_if()) {
                if(lsib[sym_cond] === true) {
                    return(false)
                } else {
                    return(true)
                }
             } else if(lsib.is_conder_elif()) {
                 if(lsib[sym_cond] === true) {
                     return(false)
                 } else {}
             } else {
                 return(true)
             }
             lsib = lsib.$lsib_
         }
         return(true)
     }
     is_conder_while()             {return(this.#conder[sym_while]===true)}
     ////
     get executor_()               {return(this.#exec)}
     set executor_(f)              {this.#exec=f}
     ////
     is_abandoned()                {return(this.$forest_===null)}
     ////
     [sym_exec_conder]() {
         [sym_state_conding]();
         DEBUG(globalThis[sym_debug])(this,'begin check conder... on self');
         let conder_executor = this.#conder;
         conder_executor(()=>{_conder_rs(this)},()=>{_conder_rj(this)},this)
     }
     [sym_open]() {
         //一定是conder 结果为true
         this[sym_state_open]();   //设置状态为opened
         if(this.$is_leaf()) {
             DEBUG(globalThis[sym_debug])(this,'leaf open self',this);
             this[sym_exec]();
         } else if(this.is_serial()) {
             let fstch = this.$fstch_;
             DEBUG(globalThis[sym_debug])(this,'serial check fstch conder',fstch);
             fstch[sym_exec_conder]();
         } else if(this.is_parallel()) {
             let children = this.$children_;
             DEBUG(globalThis[sym_debug])(this,'parallel check children conder',children);
             children.forEach(chnd=>chnd[sym_exec_conder]());
         } else {
             DEBUG(globalThis[sym_debug])(ERRORS.not_supported_type)
         }
    }
    [sym_exec]() {
        this[sym_state_exec]();
        DEBUG(globalThis[sym_debug])(this,'start exec on self');
        _add_to_running(that);
        let executor = this.#exec;
        let resolve = (v)=>{    _resolve(this,v,sym_rs)}
        let reject  = (v)=>{    _reject(this,v,sym_srj)}
        executor(resolve,reject,this);
    }
    [sym_spause]() {
        if(this.is_self_executing()) {
            let nthis = this[sym_respawn]();  //复制,running delete 动作在respawn种完成
            nthis[sym_state_spause]();
            DEBUG(globalThis[sym_debug])(this,'self paused');
            if(this.$parent_ !== null) {
                _send_to_parent(this,sym_spause,this);
            } else {
                DEBUG(globalThis[sym_debug])('self is root')
            }
        } else {
            DEBUG(globalThis[sym_debug])(ERRORS.can_only_spause_when_self_executing);
        }
    }
    [sym_bpause](spause_src) {
        //不能直接调用,只能在recv中调用
        if(this.is_opened()) {
            this[sym_state_bpause]();
            DEBUG(globalThis[sym_debug])(this,'recv pause from child');
            if(this.$parent_ !== null) {
                _send_to_parent(this,sym_bpause,spause_src);
            } else {
                DEBUG(globalThis[sym_debug])('self is root')
            }
        } else {
            DEBUG(globalThis[sym_debug])(ERRORS.can_only_bpause_when_opened);
        }
    }
    [sym_respawn](copy=false,copy_func=DFLT_COPY) {
        let forest = this.$forest_;
        let nnd =  forest.node(this.constructor);
        nnd.conder_ = this.conder_;
        nnd.executor_ = this.executor_;
        nnd[sym_renew_psj]();
        let parent = (this.$forest_===null)?null:this.$parent_;
        if(parent!==null) {
            this.$replace_node(nnd);
        } else {}
        let rt = this.$root_;
        if(rt.running_.has(this)){
            rt.running_.add(nnd)
        } else {}
        _delete_from_running(this);
        if(rt.stucked_at_ === this) {
             rt[sym_stuck_origin] = nnd;
        } else {}
        ////
        if(copy) {
            copy_func(nnd,this);
        } else {}
        ////
        this.$erase();
        return(nnd)
    }
    [sym_rdy](clear_cond=false) {
        //soft  不可用于 conding self_executing paused 
        this[sym_renew_psj]();
        if(clear_cond) {
            this[sym_cond] = noexist
        } else {}
        this[sym_rslt] = noexist;
        this[sym_exception] = noexist;
        this[sym_state_rdy]();
        DEBUG(globalThis[sym_debug])(this,'self reready');
    }
    [sym_reset](copy=false,copy_func=DFLT_COPY) {
        //判断状态
        if(this.is_conding() || this.is_self_pending()) {
            let nthis = this[sym_respawn](copy,copy_func);
            _delete_from_running(nthis);
        } else {
            this[sym_rdy](true);
        }
        DEBUG(globalThis[sym_debug])(this,'self reset');
    }
    ////
}

module.exports = Exec; 
