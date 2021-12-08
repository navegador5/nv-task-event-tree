async function repeat(tsk,n) {
    for(let i=0;i<n;i++) {
        await tsk.start();
        tsk.soft_reset()
    }
    return(tsk)
}

async try_until_succ(tsk,max_times=Infinity) {
    for(let i=0;i<max_times;i++) {
        try {
            await tsk.start();
            return(tsk)
        } catch(err) {}
        tsk.soft_reset()
    }
    return(tsk)
}


module.exports = {
    repeat,
    try_until_succ,
}

