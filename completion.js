const {_psj}    = require("nv-facutil-promise");
const {
    noexist,
    ////
    sym_cond,
    sym_rslt,
    sym_exception,
    sym_psj,
    sym_renew_psj,
    ////
} = require("./const");

const State = require("./state");

class Completion extends State {
    #cond           = true
    #rslt           = noexist
    #exception      = noexist
    #psj            = noexist
    get cond_()                 {return(this.#cond)}
    set [sym_cond](bl)          {this.#cond = bl}
    get rslt_()                 {return(this.#rslt)}
    set [sym_rslt](v)           {this.#rslt = v}
    get exception_()            {return(this.#exception)}
    set [sym_exception](v)      {this.#exception = v}
    get settled_()          {
        if(this.is_resolved()) {
            return(this.#rslt)
        } else if(this.is_rejected()) {
            return(this.#exception)
        } else {
            return(noexist)
        }
    }
    is_promise_enabled() {return(this.#psj !== noexist)}
    enable_promise()     {
        if(this.#psj === noexist){
            this.#psj = _psj()
        } else {}
    }
    disable_promise()    {this.#psj = noexist}
    get [sym_psj]()      {return(this.#psj)}
    [sym_renew_psj]()    {
        if(this.#psj !== noexist){
            this.#psj = _psj()
        } else {}
    }
    get p_()             {return(this.#psj===noexist?this.#psj:this.#psj[0])}
}


module.exports = Completion;
