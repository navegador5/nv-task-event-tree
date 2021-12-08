const _SN = {'ready':1,'pending':2,'resolved':3,'rejected':4,'paused':5}
const _NS = {1:'ready',2:'pending',3:'resolved',4:'rejected',5:'paused'}

const sym_curr = Symbol()

class State {
     #curr = 1 
     get [Symbol.toStringTag]() {return(_NS[this.#curr])}
     ////
     get [sym_curr]()   {return(this.#curr)}
     set [sym_curr](v)  {return(this.#curr=v)}
     ////
     is_settled() {return(this.#curr === _SN.resolved || this.#curr === _SN.rejected)}
     is_stucked() {return(this.#curr === _SN.paused || this.#curr === _SN.rejected)}
     is_stopped() {return(this.is_settled() ||this.is_stucked())}
     ////
     can_start()    {return(this.#curr===_SN.ready)}
     ////
     can_resolve()  {return(this.#curr === _SN.pending)}
     can_reject()  {return(this.#curr === _SN.pending)}
     can_settle()   {return(this.#curr === _SN.pending)}
     can_pause()    {return(this.#curr === _SN.pending)}
     ////
     can_continue() {return(this.#curr === _SN.paused)}
     can_recover()  {return(this.#curr === _SN.rejected)}
     can_carryon()  {return(this.#curr === _SN.paused || this.#curr === _SN.rejected)}
     ////
     can_soft_reset()               {return(this.is_settled() || this.#curr === _SN.ready)} 
     need_reready_for_soft_reset()  {return(this.is_settled())}   //_SN.ready 不需要做任何事情
     ////
     need_respawn_for_hard_reset()  {return(this.#curr === _SN.pending || this.#curr === _SN.paused)}
     ////
     _rerdy()      {this.#curr = _SN.ready}
     _start()      {this.#curr = _SN.pending}
     _resolve()    {this.#curr = _SN.resolved}
     _reject()     {this.#curr = _SN.rejected}
     _respawn()    {this.#curr = _SN.ready}     //respawn-a-node
     _pause()      {this.#curr = _SN.paused}    //respawn-a-node AND THEN #curr = _SN.paused
     _continue()   {this.#curr = _SN.pending}   //start-paused-node(exec) AND THEN #curr = _SN.pending
     _soft_reset() {this.#curr = _SN.ready}     //reset rslt/exception   AND THEN #curr = _SN.ready  
     _recover()    {this.#curr = _SN.pending}   //soft-reset-a-node AND then exec AND THEN #curr = _SN.pending
     _carryon()    {this.#curr = _SN.pending}   // _continue OR _recover
     _hard_reset() {this.#curr = _SN.ready}
}


for(let k in _SN) {
    State.prototype[`is_${k}`]  = function() {return(this[sym_curr] === _SN[k])}
}

module.exports = ()=>(new State());
