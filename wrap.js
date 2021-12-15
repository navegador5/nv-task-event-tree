async function try_until_succ(tsk,max_times=Infinity) {
    let R;
    let flag =false;
    let c = 0;
    try {
        R = await tsk.launch();
        flag = false;
    } catch (err) {
        flag = true
    }
    c = c + 1;
    /////////////////////////////////
    while(flag && c < max_times) {
        try {
            R = await tsk.recover();
            flag = false;
        } catch(err) {
            flag = true
        }
        c = c + 1
    }
    ////
    return(R)
}

function _hist_push(history,history_size,settled) {
    history.push(settled);
    if(history.length>history_size) {
        history.shift()
    } else {}
}

async function limited_auto_recover_loop(tsk,times=1,history_size=10,history=[],counter={}) {
    counter.c =0;
    let flag =false;
    while(true && counter.c <times) {
        if(flag === false) {
            try {
                let rslt = await tsk.launch();
                _hist_push(history,history_size,rslt);
                flag = false;
                tsk.soft_reset();
            } catch (err) {
                _hist_push(history,history_size,err);
                flag = true
            }
            counter.c = counter.c +1
        } else {
            try {
                R = await tsk.recover();
                _hist_push(history,history_size,rslt);
                flag = false;
                tsk.soft_reset();
            } catch(err) {
                _hist_push(history,history_size,err);
                flag = true
            }
            counter.c = counter.c +1
        }
    }
    return({history,counter})
}

function endless_auto_recover_loop(tsk,history_size=10) {
    let history = []
    let counter = {}
    limited_auto_recover_loop(tsk,Infinity,history_size,history,counter);
    return({history,counter})
}


async function repeat_until_fail(tsk,times=1,history_size=10,history=[],counter={}) {
    counter.c =0;
    while(true && counter.c <times) {
        try {
            let rslt = await tsk.launch();
            _hist_push(history,history_size,rslt);
            tsk.soft_reset();
        } catch(err) {
            _hist_push(history,history_size,err)
            break;
        }
        counter.c = counter.c+1
    }
    return({history,counter})
}

async function repeat_ignore_fail(tsk,times=1,history_size=10,history=[],counter={}) {
    counter.c =0;
    while(true && counter.c <times) {
        try {
            let rslt = await tsk.launch();
            _hist_push(history,history_size,rslt);
            tsk.soft_reset();
        } catch(err) {
            _hist_push(history,history_size,err);
            tsk.hard_reset();
        }
        counter.c = counter.c+1
    }
    return({history,counter})
}


function endless_repeat_loop_until_fail(tsk,history_size=10) {
    let history = []
    let counter = {}
    repeat_until_fail(tsk,Infinity,history_size,history,counter);
    return({history,counter})    
}

function endless_repeat_loop_ignore_fail(tsk,history_size=10) {
    let history = []
    let counter = {}
    repeat_ignore_fail(tsk,Infinity,history_size,history,counter);
    return({history,counter})
}


module.exports = {
    ////
    try_until_succ,
    limited_auto_recover_loop,
    endless_auto_recover_loop,
    ////
    repeat_until_fail,
    repeat_ignore_fail,
    endless_repeat_loop_until_fail,
    endless_repeat_loop_ignore_fail,
}
