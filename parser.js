const {
    wfs_tac,
}  = require("nv-data-tree-csp-jconvert");

const Task = require("./task");

const {
    sym_renew_psj,
    TYPES,DFLT_CU_CONDER,DFLT_CU_EXECUTOR,
    PARSER_USED_PROPS, 
    DFLT_CFG,
} = require("./const")




function _fill_one_task(nd,cfg=DFLT_CFG()) {
    let _cfg = DFLT_CFG();
    Object.assign(_cfg,cfg);
    let {type,enable_promise,conder,executor,args_dict} = _cfg;
    ////
    if(type === TYPES[0] || type === TYPES.serial) {
        nd.set_as_serial();
    } else if(type === TYPES[1] || type === TYPES.parallel) {
        nd.set_as_parallel();
    } else {
        throw(ERRORS.not_supported_type)
    }
    ////
    if(enable_promise) {nd[sym_renew_psj]()} else {}
    ////
    nd.conder_   = conder;
    nd.executor_ = executor;
    ////
    for(let k in args_dict) {
        if(!PARSER_USED_PROPS.includes(k)) {
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
    rt.enable_promise();  //root must have promise
    if(rtrn_forest) {
        return([rt,forest])
    } else {
        return(rt)
    }
}


const {
    NEXT_SIGN,SLBLK,SRBLK,
    PARA_SIGN,PLBLK,PRBLK,
    DFLT_TAG_PARSER,
} = require("./const");

const {
   SimpleStack
} = require("nv-facutil-basic");



function _is_open_flag(ch)  {
    return(ch==='{' || ch === '(')
}

function _init_bp_ctx(sarr,rt,stack) {
    let ctx   = {tag:'',state:'',c:0}
    while(ctx.c<sarr.length) {
        let ch = sarr[ctx.c];
        if(ch==='[') {
            rt.set_as_serial();
            stack.push([rt,')']);
            ctx.state = '[';
            break;
        } else if(ch==='{') {
            rt.set_as_parallel();
            stack.push([rt,'{']);
            ctx.state = '{';
            break;
        } else if(ch=== '(') {
            rt.set_as_serial();
            stack.push([rt,'(']);
            ctx.state = '(';
            break;
        } else {
        }
        ctx.c = ctx.c + 1;
    }
    return(ctx)
}


function _append(forest,stack,ctx,nd_state,ctx_state,method='set_as_serial') {
   let pnd = stack.lst[0];
   let nd = forest.node(Task);
   nd[method]();
   if(pnd!==null) { 
       pnd.$append_child(nd);
   } else {}
   stack.push([nd,nd_state]);
   ctx.state = ctx_state;
}

function _enter_close(stack,ctx,state) {
    stack.lst[1] = state;
    ctx.state = state;
}

function _pop_without_name(stack,ctx) {
    let [nd,flag] = stack.pop();
    nd.name_ = nd.$sdfs_index_;
    ctx.tag = '';
    if(stack.length >0 ) {
        ctx.state = stack.lst[1];
    } else {}
}

function _finish_tag(stack,ctx,tag_parser) {
   let [nd,flag] = stack.pop();
   if(_is_open_flag(flag)) {
       console.log('impossible: open-flag meet ]')
   } else {
       nd.name_ = tag_parser(ctx.tag);
       ctx.tag = '';
       ctx.state = stack.lst[1];
   }
}


function _handle_bp(forest,sarr,stack,ctx,tag_parser) {
    ////
    while(ctx.c<sarr.length) {
       let ch = sarr[ctx.c]
       if(ctx.state === '}' || ctx.state === ')') {
           if(ch === '[') {
               ctx.state = '[';
           } else if(ch === '(') {
               _pop_without_name(stack,ctx);
               _append(forest,stack,ctx,'(','(','set_as_serial');
           } else if(ch === '{') {
               _pop_without_name(stack,ctx);
               _append(forest,stack,ctx,'{','{','set_as_serial');
           } else if(ch === ')') {
               _pop_without_name(stack,ctx);
               if(stack.lst[1] === '(') {
                   _pop_without_name(stack,ctx);
               } else {
                   console.log('impossible: open-flag not match ')
               }
           } else if(ch === '}'){
               _pop_without_name(stack,ctx);
               if(stack.lst[1] === '{') {
                   _pop_without_name(stack,ctx);
               } else {
                   console.log('impossible: open-flag not match ')
               }
           } else {
           }
       } else if(ctx.state === '[') {
           if(ch === ']') {
               _finish_tag(stack,ctx,tag_parser);
           } else {
               ctx.tag = ctx.tag + ch
           }
       } else if(ctx.state === '(') {
           if(ch === ')') {
               _enter_close(stack,ctx,')')
           } else if(ch === '[') {
               //leaf
               _append(forest,stack,ctx,')','[','set_as_serial')
           } else if(ch === '(') {
               //serial
               _append(forest,stack,ctx,'(','(','set_as_serial')
           } else if(ch === '{') {
               ///parallel
               _append(forest,stack,ctx,'{','{','set_as_parallel')
           } else {
               //ignore
           }
       } else if(ctx.state === '{') {
           if(ch === '}') {
               _enter_close(stack,ctx,'}');
           } else if(ch === '[') {
               //leaf
               _append(forest,stack,ctx,'}','[','set_as_serial')
           } else if(ch === '(') {
               //serial
               _append(forest,stack,ctx,'(','(','set_as_serial')
           } else if(ch === '{') {
               ///parallel
               _append(forest,stack,ctx,'{','{','set_as_parallel')
           } else {
               //ignore
           }
       } else {
           //ingore
       }
       ctx.c = ctx.c +1;
    }
    ////
}

function _finish_bp(stack,ctx,tag_parser) {
   if(ctx.state === '[') {
       _finish_tag(stack,ctx,tag_parser)
   } else {
       while(stack.length>0) {
           _pop_without_name(stack,ctx);
       }
   }
}

function _parse_blue_print(bp,forest,tag_parser=DFLT_TAG_PARSER) {
    ////
    let rt    = forest.node(Task);
    rt.enable_promise();
    ////
    let sarr   = Array.from(bp);
    let stack = new SimpleStack(); 
    let ctx   = _init_bp_ctx(sarr,rt,stack); 
    ////
    _handle_bp(forest,sarr,stack,ctx,tag_parser);
    ////
    _finish_bp(stack,ctx,tag_parser);
    return(rt)
}


const Forest = require("nv-data-tree-csp-forest");

function load_from_blue_print(bp,max_size=10000,rtrn_forest=false,tag_parser=DFLT_TAG_PARSER) {
    let forest = new Forest(max_size);
    let rt = _parse_blue_print(bp,forest,tag_parser)
    if(rtrn_forest) {
        return([rt,forest])
    } else {
        return(rt)
    }
}

module.exports = {
    DFLT_TAG_PARSER,
    load_from_blue_print,
    load_from_json,
}

