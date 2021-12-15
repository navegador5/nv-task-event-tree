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
    sym_reject_origin,    //setter 当前停止在哪个nd ,用来recover(self_rejected)/continue(self_paused)
    sym_cond,            //setter conder 的结果
    sym_rslt,            //setter
    sym_exception,       //setter
    sym_psj,             //getter
    sym_renew_psj,
    ////-----------------------exec
    sym_rdy,           //软重启 非conding 非pending 状态可用
    sym_conding,
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

const Exec = require("./exec");

function _reset(that,copy_func) {
     if(that.is_ready()) {
     } else if(that.is_settled()) {
          that[sym_rdy](true,true)
     } else if(that.is_impossible()){
          that[sym_state_rdy]();
     } else if(that.is_paused()) {
          that[sym_state_rdy]();
     } {
          that[sym_reset](copy_func);
     }
}

function _get_des(that,name) {
    let sdfs = that.$sdfs_;
    sdfs = sdfs.filter(nd=>nd.name_ === name);
    if(sdfs.length === 0) {
        return(null)
    } else if(sdfs.length === 1) {
        return(sdfs[0])
    } else {
        return(sdfs)
    }
}

function _creat_proxy(that) {
    let h = {
        get: function(target, property, receiver) {
             let nds = _get_des(target,property);
             return(nds)
        },
    }
    let P =new Proxy(that,h)
    return(P)
}


const {paint} = require("./repr");

class Task extends Exec {
    #name
    #type = TYPES.serial
    #reject_origin = noexist
    #running = new Set()
    #proxy   = _creat_proxy(this) 
    ////
    get name_()     {return(this.#name??this.$id_)}
    set name_(name) {this.#name = name}
    get [Symbol.toStringTag]() {
        return(this.#name+' : '+paint(this.state_,this.state_))
    }
    ////
    set_as_serial()    {this.#type = TYPES.serial}
    set_as_parallel()  {this.#type = TYPES.parallel}
    is_serial()        {return(this.#type === TYPES.serial)}
    is_parallel()      {return(this.#type === TYPES.parallel)}
    ////
    get [sym_reject_origin]()    {return(this.#reject_origin)}
    set [sym_reject_origin](nd)  {this.#reject_origin = nd}
    get rejected_at_()  {
         let rt = this.$root_;
         return(rt[sym_reject_origin])
    }
    ////
    get running_() {
        let rt = this.$root_;
        if(rt === this) {
            return(this.#running)
        } else {
            return(rt.running_)
        }
    }
    ////
    get T_() {return(this.#proxy)}
    ////
    launch() {
        if(this.$is_root()) {
            if(this.is_ready()) {
                DEBUG(globalThis[sym_debug])('root',this,'nest started...')
                this[sym_conding]();
                return(this.p_)
            } else {
                DEBUG(globalThis[sym_debug])(ERRORS.can_only_start_when_ready)
            }
        } else {
            DEBUG(globalThis[sym_debug])(ERRORS.only_on_root_task)
        }
    }
    carryon() {
        if(this.$is_root()) {
            if(this.is_paused()) {
                return(this.continue());
            } else if(this.is_rejected()) {
                return(this.recover());
            } else {
                DEBUG(globalThis[sym_debug])(ERRORS.state_not_supported)
            }
        } else {
            DEBUG(globalThis[sym_debug])(ERRORS.only_on_root_task)
        }
    }
    recover() {
       if(this.$is_root()) {
            let curr = this.rejected_at_;
            let cond = curr?.is_self_rejected();
            if(cond) {
                ////
                let ances = curr.$ances_;
                ances.forEach(ance=>{
                    ance[sym_rdy](false,true);
                    ance[sym_state_open]();
                });
                curr[sym_rdy](false,true);
                curr[sym_exec]();
                return(this.p_)
            } else {
                DEBUG(globalThis[sym_debug])(ERRORS.can_only_recover_when_rejected);
            }
       } else {
           DEBUG(globalThis[sym_debug])(ERRORS.only_on_root_task)
       }
    }
    pause() {
       if(this.$is_root()) {
            let old_running = Array.from(this.running_);
            let cond = this.is_pending();
            if(cond) {
                old_running.forEach(nd=>nd[sym_spause]());
                return(this.running_)
            } else {
                DEBUG(globalThis[sym_debug])(ERRORS.can_only_pause_when_pending);
            }
       } else {
           DEBUG(globalThis[sym_debug])(ERRORS.only_on_root_task)
       }
    }
    continue() {
       if(this.$is_root()) {
            let old_paused = this.running_;
            let cond = this.is_paused();
            if(cond) {
                for(let curr of old_paused) {
                    let ances = curr.$ances_;
                    ances.forEach(ance=>{
                        ance[sym_rdy](false,false);    //bpaused no-renew-psj
                        ance[sym_state_open]();
                    });
                }
                old_paused.forEach(nd=>{
                    nd[sym_rdy](false,true);
                    nd[sym_state_open]();
                    nd[sym_exec]();
                });
                return(old_paused)
            } else {
                DEBUG(globalThis[sym_debug])(ERRORS.can_only_continue_when_paused);
            }
       } else {
           DEBUG(globalThis[sym_debug])(ERRORS.only_on_root_task)
       }
    }
    /////---------------
    soft_reset(copy_func=DFLT_COPY) {
       if(this.$is_root()) {
           if(this.is_settled() || this.is_impossible()) {
               let sdfs = this.$sdfs_;
               sdfs.forEach(nd=>{_reset(nd,copy_func)});
               this[sym_reject_origin] = noexist;
               this.running_.clear();
               return(this)
           } else {
               DEBUG(globalThis[sym_debug])(ERRORS.can_soft_reset_only_when_settled_or_impossible)
           }
       } else {
           DEBUG(globalThis[sym_debug])(ERRORS.only_on_root_task)
       }
    }
    hard_reset(copy_func=DFLT_COPY) {
       if(this.$is_root()) {
            let self = this;
            if(this.is_ready()) {
            } else if(this.is_settled() || this.is_impossible()) {
                this.soft_reset(copy_func);
            } else {
                let edfs = this.$edfs_;
                for(let i=0;i<edfs.length-1;i++) {
                    let nd = efds[i];
                    _reset(nd,copy_func)
                }
                self = edfs[edfs.length-1];
                _reset(self,copy_func)
            }
            self[sym_reject_origin] = noexist;
            self.running_.clear();
            return(self)
       } else {
           DEBUG(globalThis[sym_debug])(ERRORS.only_on_root_task)
           return(noexist)
       }
    }
    ////
}

const {
    show,
    dump
} = require("./repr");

Task.prototype.show = function(rtrn=false) {
    return(show(this,rtrn,true,true))
}

Task.prototype.unparse = function() {
    return(show(this,true,false,false))
}

Task.prototype.dump = function() {
    return(dump(this))
}

module.exports = Task;

