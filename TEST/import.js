const evt = require("nv-task-event-tree");

/*
{
  debug: [Function: debug],
  noexist: Symbol(noexist),
  TYPES: { '0': 'serial', '1': 'parallel', serial: '0', parallel: '1' },
  DFLT_CFG: [Function: DFLT_CFG],
  IF: [Function: IF],
  ELIF: [Function: ELIF],
  ELSE: [Function: ELSE] { [Symbol(else)]: true },
  WHILE: [Function: WHILE],
  load_from_json: [Function: load_from_json],
  wrap: {
    try_until_succ: [AsyncFunction: try_until_succ],
    repeat_until_fail: [AsyncFunction: repeat_until_fail],
    repeat_ignore_fail: [AsyncFunction: repeat_ignore_fail],
    endless_loop_until_fail: [Function: endless_loop_until_fail],
    endless_loop_ignore_fail: [Function: endless_loop_ignore_fail]
  }
}
*/

/*
> evt.DFLT_CFG()
{
  type: 'serial',
  enable_promise: false,
  conder: [Function: DFLT_CU_CONDER],
  executor: [Function: DFLT_CU_EXECUTOR],
  args_dict: {}
}
>
*/
