const {
    PARSER_USED_PROPS
} = require("./const");

const {
    wfs_tac,
}  = require("nv-data-tree-csp-jconvert");



function show(tsk,rtrn=false) {
    let lines = tsk.$sdfs_.map(r=>'    '.repeat(r.$depth_)+r[Symbol.toStringTag]);
    let s = lines.join('\n');
    if(rtrn) {
        return(s)
    } else {
        console.log(s)
    }
}

function dump(tsk) {
    let sdfs = tsk.$sdfs_;
    for(let nd of sdfs) {
        nd.T = nd.name_;
        nd.A = DFLT_CFG();
        if(nd.is_serial()) {nd.A.type = TYPES.serial} else {nd.A.type = TYPES.parallel}
        if(nd.is_promise_enabled()) {nd.A.enable_promise = true} else {nd.A.enable_promise = false}
        nd.A.conder   = nd.conder_,
        nd.A.executor = nd.executor_;
        nd.A.args_dict = {}
        for(let k in nd) {
            if(PARSER_USED_PROPS.includes(k)) {
            } else {
                nd.A.args_dict[k] = nd[k]
            }
        }
    }
    let rslt = wfs_tac.jsonize(this);
    sdfs.forEach(nd=>{
        delete nd.T;
        delete nd.A;
    })
    return(rslt)
}


module.exports = {
    show
    dump
}
