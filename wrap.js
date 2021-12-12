async function try_until_succ(tsk,max_times=Infinity) {
    let R;
    for(let i=0;i<max_times;i++) {
        try {
            R = await tsk.launch();
            return(tsk)
        } catch(err) {}
        tsk.soft_reset()
    }
    return(R)
}


async function repeat_until_fail(tsk,times=1,history_size=10,history=[],counter={}) {
    counter.c =0;
    while(true && counter.c <times) {
        try {
            let rslt = await tsk.launch();
            history.push(rslt);
            if(history.length>history_size) {
                history.shift()
            } else {}
            tsk.soft_reset();
        } catch(err) {
            history.push(err)
            if(history.length>history_size) {
                history.shift()
            } else {}
            break
        }
        counter.c = counter.c+1
    }
    return({history,counter:counter.c})
}

async function repeat_ignore_fail(tsk,times=1,history_size=10,history=[],counter={}) {
    counter.c =0;
    while(true && counter.c <times) {
        try {
            let rslt = await tsk.launch();
            history.push(rslt);
            if(history.length>history_size) {
                history.shift()
            } else {}
            tsk.soft_reset();
        } catch(err) {
            history.push(err)
            if(history.length>history_size) {
                history.shift()
            } else {}
            tsk.hard_reset();
        }
        counter.c = counter.c+1
    }
    return({history,counter:counter.c})
}

function endless_loop_until_fail(tsk,history_size=10) {
    let history = []
    let counter = {}
    repeat_until_fail(tsk,Infinity,history_size,history,counter);
    return({history,counter})    
}

function endless_loop_ignore_fail(tsk,history_size=10) {
    let history = []
    let counter = {}
    repeat_ignore_fail(tsk,Infinity,history_size,history,counter);
    return({history,counter})
}


module.exports = {
    try_until_succ,
    repeat_until_fail,
    repeat_ignore_fail,
    endless_loop_until_fail,
    endless_loop_ignore_fail,
}
