const {
    sym_cond,
    sym_if,
    sym_elif,
    sym_else,
    sym_while,
} = require("./const");


const IF   = (conder) => {
    let _if = (rtrn_tru,rtrn_fls,self) => {
         conder(rtrn_tru,rtrn_fls,self)
    }
    _if[sym_if] = true;
    return(_if)
}

const ELIF = (conder)=> {
    let _elif = (rtrn_tru,rtrn_fls,self) => {
        let cond = self.is_all_if_chain_psib_conder_failed()
        if(cond) {
            conder(rtrn_tru,rtrn_fls,self) //conder(_conder_rs,_conder_rj,self)
        } else {
            rtrn_fls()
        }
    }
    _elif[sym_elif] = true
    return(_elif)
}


const ELSE = (rtrn_tru,rtrn_fls,self)=> {
    let cond = self.is_all_if_chain_psib_conder_failed()
    if(cond) {
        rtrn_tru()
    } else {
        rtrn_fls()
    }
}
ELSE[sym_else] = true


const WHILE = (conder)=> {
    let _while_frame = (rtrn_tru,rtrn_fls,self)=> {
        conder(rtrn_tru,rtrn_fls,self)
    }
    _while_frame[sym_while] = true
    return(_while_frame)
}

module.exports = {
    IF,ELIF,ELSE,
    WHILE
}
