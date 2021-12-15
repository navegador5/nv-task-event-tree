const evt = require("nv-task-event-tree");

/*
{
  debug: [Function: debug],   //debug(true) ,default is false
  
  ////
  noexist: Symbol(noexist),  // avoid confilict with undefined
  
  ////
  load_from_blue_print: [Function: load_from_blue_print],

  ////
  TYPES: { '0': 'serial', '1': 'parallel', serial: '0', parallel: '1' },
  DFLT_CFG: [Function: DFLT_CFG],
  load_from_json: [Function: load_from_json],  //load_from_json(J), default is DFLT_CFG()

  ////
  IF: [Function: IF],                                
  ELIF: [Function: ELIF],
  ELSE: [Function: ELSE] { [Symbol(else)]: true },
  WHILE: [Function: WHILE],
  
  ////
  wrap: {
    try_until_succ: [AsyncFunction: try_until_succ],
    limited_auto_recover_loop: [AsyncFunction: limited_auto_recover_loop],
    endless_auto_recover_loop: [Function: endless_auto_recover_loop],
    repeat_until_fail: [AsyncFunction: repeat_until_fail],
    repeat_ignore_fail: [AsyncFunction: repeat_ignore_fail],
    endless_repeat_loop_until_fail: [Function: endless_repeat_loop_until_fail],
    endless_repeat_loop_ignore_fail: [Function: endless_repeat_loop_ignore_fail]
  }
}
*/


/*
 * WRITE IN BOTTOM-TO-UP  STYLE: use load_from_blue_print
 *     
 *
 * load_from_blue_print(bp:BP,max_size=10000,rtrn_forest=false,tag_parser=DFLT_TAG_PARSER)
 *     max_size means must larger than (2* task-node-count)
 *         1000000 task-nodes will cost about 90M memory  
 *         normally  10000  task-nodes is enough for most secarino
 *    BP is a string:
 *        {...}        means parallel task, it will start children at the same time,similiar to Promise.all
 *        (...)        means serial task,   it will start in DFS-sequence, similar to html-traverse sequence
 *        [task-name]  task-name MUST be enclosed in [] 
 *        ->           means parent task is serial,   is OPTIONAL   (coz '(...)' already decided) 
 *        -|           means parent task is parallel, is OPTIONAL  (coz '{...}' already decided)
 *    BP is written in BOTTOM-TO-UP style:
 *
 *
        var blue_print = `
            {
                [tsk000]         -|
                (
                    [tsk0010]->
                    [tsk0011]->
                    [tsk0012]
                )-> [tsk001]     -|
                {
                    [tsk0020]-|
                    [tsk0021]-|
                    [tsk0022]-|
                }-> [tsk002]     -|
            }-> [tsk00]
        `
        the task execute sequence for each layer will be:
         

                <Serial>([tsk0010]->[tsk0011]->[tsk0012])->[tsk001];
        
                <Parallel>{
                    [tsk0020]-|
                    [tsk0021]-| ->[tsk002];
                    [tsk0022]-|
                }

            <Parallel>{
               [tsk000] -|
               [tsk001] -| -> [tsk00]
               [tsk002] -|
            }

        the details are:

            <Parallel>[tsk00] ^start
                <Leaf>    [tsk000] ^start executing... -> &[tsk000] ended$        -|
                </Leaf>   [tsk000]
                    -> %notify-to(&[tsk00])

                <Serial>  [tsk001] ^start-first-child                             -|
                     [tsk0010] ^start executing... -> [tsk0010] ended$ ->
                     [tsk0011] ^start executing... -> [tsk0011] ended$ ->
                     [tsk0012] ^start executing... -> [tsk0012] ended$ ->
                         %notify-to(&[tsk001])
                </serial> [tsk001] 
                     %recv-from-last-child(&[tsk0012]) ->
                     [tsk001] ^start executing... ended$ 
                     -> %notify-to(&[tsk00])
                
                <Parallel>[tsk002] ^start-children-at-same-time                    -|
                      <Leaf>    [tsk0020] ^start-at-same-time-with-siblings  -|
                          [tsk0020] ^start executing... -> [tsk0020] ended$ 
                      </Leaf>   [tsk0020]
                           -> %notify-to(&[tsk002]) 
                
                      <Leaf>    [tsk0021] ^start-at-same-time-with-siblings  -|
                          [tsk0021] ^start executing... -> [tsk0021] ended$
                      </Leaf>   [tsk0021]
                           -> %notify-to(&[tsk002])

                      <Leaf>    [tsk0022] ^start-at-same-time-with-siblings  -|
                          [tsk0022] ^start executing... -> [tsk0022] ended$
                      </Leaf>   [tsk0022]
                           -> %notify-to(&[tsk002]) 

               </Parallel>[tsk002] 
                    %recv-from-children(&[tsk0020],&[tsk0021],&[tsk0022]) ->
                    [tsk002] ^start executing... ended$ 
                    -> %notify-to(&[tsk00])

          </Parallel>[tsk00] 
               %recv-from-children(&[tsk000],&[tsk001],&[tsk002]) ->
               [tsk00] ^start executing... ended$
               -> %notify-to(@root@)

          @root@ will settle promise on It
 *
 *
 */


/*
 *  WRITE IN TOP-TO-DOWN  STYLE: use load_from_json
 *
 *
 *
 *  load_from_json(J)
 *  J: [T?,A?,C?]
 *       T@optional : String, if-skipped, it will be a DFS-index
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
 *    async function limited_auto_recover_loop(tsk,times=1,history_size=10):{history:Array,counter:{c:Number}}
 *          function endless_auto_recover_loop(tsk,history_size=10):{history:Array,counter:{c:Number}}
      async function repeat_until_fail(tsk,times=1,history_size=10):{history:Array,counter:{c:Number}}
      async function repeat_ignore_fail(tsk,times=1,history_size=10):{history:Array,counter:{c:Number}}
            function endless_repeat_loop_until_fail(tsk,history_size=10):{history:Array,counter:{c:Number}}
            function endless_repeat_loop_ignore_fail(tsk,history_size=10):{history:Array,counter:{c:Number}}
 
 *
 *
 *
 *
 */

