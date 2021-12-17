const {
    wfs_tac,
}  = require("nv-data-tree-csp-jconvert");

const {
    is_node
} = require("nv-facutil-basic");

function paint_ansi8(fg,content,bg,style) {
    if(fg === undefined)    {fg = 37}
    if(bg === undefined)    {bg = 40}
    if(style === undefined) {style=0}
    let dflt =  "\033[0m"
    let s = "\033[" + style.toString() + ";" + fg.toString()+";" + bg.toString() +"m" + content + dflt
    return(s)
}

function paint_ansi8_normal(fg,content) {
    return(paint_ansi8(fg,content,40,0))
}

function paint_ansi8_underscore(fg,content) {
    return(paint_ansi8(fg,content,40,4))
}



/*
 *
 * underscore :     self          conding |  self_executing | self_rejected | self_paused 
 * bright     :     running       conding |  self_executing
 * normal     :     static        ready   |  opened | resolved | impossible | 
 *                                self_rejected | bubble_rejected |
 *                                self_paused   | bubble_paused   |
 *
 * stable     :                   resolved | impossible | 
 *                                self_rejected | bubble_rejected |
 *                                self_paused   | bubble_paused
 *
 *
 *
 * 白[就绪]-> 
 *          | 紫[上游不可能flooding导致不可能]
 *          | _亮黄_[条件检查中] ->
 *                                | 紫[条件检查失败导致的不可能]
 *                                | 黄[已开始]->
 *                                             | 红[下游状态上传导致间接失败]
 *                                             | 蓝[下游暂停上传导致间接暂停]
 *                                             | _亮cyan_[收尾中] -> 
 *                                                                 |  绿[成功] 
 *                                                                 |  红[失败]  
 *                                                                 |  蓝[暂停]  
 *
 */



const STATE_CLR = {
    "ready": [false,37],           //white
    "conding": [true,93],          //underscore-bright-yellow   
    "opened":[false,33],           //yellow
    "self_executing": [true,96],   //underscore-bright-cyan
    "resolved": [false,32],        //green
    "self_rejected": [true,31],    //underscore-red
    "bubble_rejected": [false,31], //           red       
    "self_paused": [true,34],      //underscore-blue
    "bubble_paused": [false,34],   //           blue
    "impossible": [false,35]       //           magenta     
}

let paint;


if(is_node) {
    paint = (s,state,with_clr=true) => {
        if(with_clr) {
            let [underscore,fg] = STATE_CLR[state];
            if(underscore) {
                return(paint_ansi8_underscore(fg,s))
            } else {
                return(paint_ansi8_normal(fg,s))
            }
        } else {
            return(s)
        }
    }
} else {
    paint = (s,state)=>s;
}

const {
    TYPES,
    ////
    DFLT_CFG,
    ////
    PARSER_USED_PROPS,
    NEXT_SIGN,SLBLK,SRBLK,
    PARA_SIGN,PLBLK,PRBLK
} = require("./const");


const str_bsc = require("nv-string-basic");

const _width = (sary)=> {
    let width = 0;
    for(let s of sary) {
        if(s.length>width) {
            width = s.length
        } else {}
    }
    return(width)
}

function _creat_stag(T,with_state=true) {
    if(with_state) {
        return(`[${T.name_} : ${T.state_}]`)
    } else {
        return(`[${T.name_}]`)
    }
}

function _get_max_width_of_stag(tsk,with_state=true) {
    let sdfs = tsk.$sdfs_;
    let stags = sdfs.map(T=>_creat_stag(T,with_state));
    let max_width = _width(stags);
    return(max_width)
}


function show(tsk,rtrn=false,with_state=true,with_clr=true) {
    let lines= [];
    let height = tsk.$height_;
    let max_width = _get_max_width_of_stag(tsk,with_state);
    tsk.$sedfs_.forEach(r=>{
        let [T,flag] = r;
        let indent = '    '.repeat(T.$depth_);
        let para_indent = '    '.repeat(height-T.$depth_-1);
        if(flag === 'open') {
            if(T.$is_leaf()) {
            } else {
                let s = '';
                if(T.is_serial()) {
                    s = indent + SLBLK;
                } else {
                    s = indent + PLBLK;
                }
                lines.push(s)
            }
        } else {
            let s = _creat_stag(T,with_state);
            let para_sign_pre_padding = ' '.repeat(max_width-s.length);
            s = paint(s,T.state_,with_clr);
            let RBLK = T.is_serial()?SRBLK:PRBLK;
            if(T.$is_root()) {
                s = indent + RBLK + NEXT_SIGN + s;
            } else {
                if(T.$is_leaf()) {
                    if(T.$parent_.is_serial()) {
                        if(T.$is_lstch()) {
                             s = indent + s;      
                        } else {
                             s = indent + s + NEXT_SIGN;
                        }
                    } else {
                        if(T.$has_nonleaf_sib()) {
                            s = indent + s + para_sign_pre_padding + para_indent+ '    '+ PARA_SIGN;
                        } else {
                            s = indent + s + para_sign_pre_padding + PARA_SIGN;
                        }
                    }
                } else {
                    s = indent + RBLK + NEXT_SIGN + s;
                    if(T.$parent_.is_serial()) {
                        if(T.$is_lstch()) {
                        } else {
                             s = s + NEXT_SIGN;
                        }
                    } else {
                        s = s + para_sign_pre_padding + para_indent +PARA_SIGN;
                    }                   
                }
            }
            lines.push(s)
        } 
    });
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
        for(let k of Object.keys(nd)) {
            if(PARSER_USED_PROPS.includes(k)) {
            } else if(typeof(k) === 'string') {
                nd.A.args_dict[k] = nd[k]
            } else {}
        }
    }
    let rslt = wfs_tac.jsonize(tsk);
    sdfs.forEach(nd=>{
        delete nd.T;
        delete nd.A;
    })
    return(rslt)
}


module.exports = {
    paint,
    show,
    dump
}
