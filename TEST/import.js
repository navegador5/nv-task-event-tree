const evt = require("nv-task-event-tree");

/*
{
  debug: [Function: debug],

  noexist: Symbol(noexist),

  TYPES: { '0': 'serial', '1': 'parallel', serial: '0', parallel: '1' },
  DFLT_CFG: [Function: DFLT_CFG],

  load_from_json: [Function: load_from_json],


  IF: [Function: IF],
  ELIF: [Function: ELIF],
  ELSE: [Function: ELSE] { [Symbol(else)]: true },
  WHILE: [Function: WHILE],
  
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
 *  load_from_json(J)
 *  J: [T?,A?,C?]
 *       T@optional : String, if-skipped, it will be a index
         A@optional : CFG 
         C@optional : Array<J>

 *  CFG: {
 *      type: 'serial',                          //'serial' OR 'parallel'
 *                                               //    default is 'serial'
 *      enable_promise: false,                   // enable_promise on task-node , make the task awaitable
 *                                               //    default only on root-task-node is true
 *                                               //                 on nonroot-task-node is false
 *      executor: [Function: DFLT_CU_EXECUTOR],  // (rtrn,thrw,self)=>{...}
                                                 //     rtrn: similiar to return/resolve
                                                 //     thrw: similiar to throw/reject
        conder: [Function: DFLT_CU_CONDER],      // (rtrn_tru,rtrn_fls,self) => {}
                                                 //     supported ctrl-flow keyword
                                                 //        IF(conder)  
                                                 //        ELIF(conder)   ELSE; //ELSE-have-no-params
                                                 //        WHILE(conder)
        args_dict: {}                            // for init props
                                                 //     task-event-tree NOT support variable
                                                 //            use props on task-node instead
 *          
 *  }
 *
 *  valid-ptrn:
 *      [T],[A],[C],
        [T,A],[T,C],[A,C],
        [T,A,C]
 *
 *
 *
 * /



/*
 * support 4 keywords:
 *     //param conder:(rtrn_tru,rtrn_fls,self) => {...}
 *     IF(conder), 
 *     ELIF(conder), 
 *     ELSE,            //no parameter
 *     WHILE(conder)
 *
 */

/*
 * support 5 wrapper:
 *    async function try_until_succ(tsk,max_times=Infinity):any
      async function repeat_until_fail(tsk,times=1,history_size=10):{history:Array,counter:{c:Number}}
      async function repeat_ignore_fail(tsk,times=1,history_size=10):{history:Array,counter:{c:Number}}
            function endless_loop_until_fail(tsk,history_size=10):{history:Array,counter:{c:Number}}
            function endless_loop_ignore_fail(tsk,history_size=10):{history:Array,counter:{c:Number}}
 
 *
 *
 *
 *
 */

