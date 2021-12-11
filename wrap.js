async function try_until_succ(tsk,max_times=Infinity) {
}

async function endless_loop_until_fail(tsk,history_size=10) {
}

async function endless_loop_ignore_fail(tsk,history_size=10) {
}

async function repeat_until_fail(tsk,times=1,history_size=10) {
}

async function repeat_ignore_fail(tsk,times=1,history_size=10) {

}

module.exports = {
    try_until_succ,
    repeat_until_fail,
    repeat_ignore_fail,
    endless_loop_until_fail,
    endless_loop_ignore_fail,
}
