const {
    wfs_tac,
}  = require("nv-data-tree-csp-jconvert");

const Task = require("./task");

const {
    TYPES,DFLT_CU_CONDER,DFLT_CU_EXECUTOR
} = require("./const")


const DFLT_CFG = ()=>({
    type:TYPES[0],
    enable_promise:false,
    conder:DFLT_CU_CONDER,
    executor:DFLT_CU_EXECUTOR,
    args_dict:{}
})


function _fill_one_task(nd,cfg=DFLT_CFG()) {
    let _cfg = DFLT_CFG();
    Object.assign(_cfg,cfg);
    let {type,enable_promise,conder,executor,args_dict} = _cfg;
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
    nd.conder_   = conder;
    nd.executor_ = executor;
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
    rt[sym_renew_promise]();  //root must have promise
    if(rtrn_forest) {
        return([rt,forest])
    } else {
        return(rt)
    }
}

module.exports = {
    DFLT_CFG,
    load_from_json
}

