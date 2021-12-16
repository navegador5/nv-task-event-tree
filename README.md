nv-task-event-tree
============
- nv-task-event-tree 
- simple event tree, bottom-to-up-style
- support two kind task-nodes: serial   AND parallel
- support recover, pause/continue
- support 4 ctrl keywords:   IF and ELIF and ELSE and WHILE



install
=======
- npm install nv-task-event-tree

usage
=====

     const evt = require("nv-task-event-tree")


example
-------

### load\_from\_blue\_print


        const evt = require("nv-task-event-tree");


        //blue_print is in bottom-to-up style

        var bp = `
           (
                [tsk000]->
                {
                    [tsk0010]-|
                    [tsk0011]-|
                    [tsk0012]-|
                }-> [tsk001]->
                {
                    [tsk0020]-|
                    [tsk0021]-|
                    [tsk0022]-|
                }-> [tsk002]->
           )-> [tsk00]
        `



        /*
         *        {...}        means parallel task, 
                               it will start children at the same time,similiar to Promise.all
         *        (...)        means serial task,   
                               it will start in DFS-sequence, similar to html-traverse sequence
         *        [task-name]  task-name MUST be enclosed in []
         *        ->           means parent task is serial,   is OPTIONAL and JUST a SIGN
         *                     (coz '(...)' already decided)
         *        -|           means parent task is parallel, is OPTIONAL  and JUST a SIGN
         *                     (coz '{...}' already decided)
         *
         */

         /*
          *   大括号括起来的 {child,child....}  表示一个!并行!任务节点: child 是同时开始的
          *   小括号括起来的 (child,child....)  表示一个!串行!任务节点: child 是按照DFS序依次执行的
          *   -|  表示该节点的父节点是 串行节点, -> 是可以省略的,只是为了看起来清楚一些,起决定作用的是 外层的{}
          *   ->  表示该节点的父节点是 串行节点, -> 是可以省略的,只是为了看起来清楚一些,起决定作用的是 外层的()
          *   []  表示任务节点名
          */

            /*
             *  the executing sequence as below(
                       its starting from-top-to-down,
                       and executing from-bottom-to-up
                ):
             *
             *     [tsk000] start->
             *
             *     {[tsk0010],[tsk0011],[tsk0012]}  parallel-start  //coz parent [tsk001] is parallel
             *            [tsk001] will handle notifications        //similiar to Promise.all
             *     [tsk001] start->
             *
             *     {[tsk0020],[tsk0021],[tsk0022]}  parallel-start  //coz parent [tsk001] is parallel
             *            [tsk002] will handle notifications        //similiar to Promise.all
             *     [tsk002] start->
             *
             *     [tsk00] start->
             *                            // [tsk000]->[tsk001]->[tsk002] 
                                          //is executed one-after-one,coz parent [tsk00] is serial
             *
             *     at final,[@root@](created by default) will return a promise, 
                   it could be found at tsk.p_ 
             *
             */



            /*
             *  上图表示如下执行顺序(是一个自顶向下开始,但是自底向上执行的模型):
             *
             *     [tsk000] 先开始->
             *
             *     {[tsk0010],[tsk0011],[tsk0012]}  并行开始  //因为父节点[tsk001] 是一个并行节点
             *           结束后通知 [tsk001]                  //行为类似Promise.all
             *     [tsk001] 开始->
             *
             *     {[tsk0020],[tsk0021],[tsk0022]}  并行开始  //因为父节点[tsk002] 是一个并行节点
             *           结束后通知 [tsk002]                  //行为类似Promise.all
             *     [tsk002] 开始->
             *
             *     [tsk00] 开始->
             *          // [tsk000]->[tsk001]->[tsk002] 是按顺序执行的,因为父节点 [tsk00] 是一个串行节点
             *
             *     最后最顶层的[@root@](默认生成的) 
             *     会有一个promise(根节点的一个getter : tsk.p_)
             */


              var tsk = evt.load_from_blue_print(bp)

              //now the task-tree topology is ready
              //现在任务流的 执行树 已经 配置好了

                tsk.show()
                /*
                (
                    (
                        [tsk000 : ready]->
                        {
                            [tsk0010 : ready]      -|
                            [tsk0011 : ready]      -|
                            [tsk0012 : ready]      -|
                        }-> [tsk001 : ready]->
                        {
                            [tsk0020 : ready]      -|
                            [tsk0021 : ready]      -|
                            [tsk0022 : ready]      -|
                        }-> [tsk002 : ready]
                    )-> [tsk00 : ready : ready]
                )-> [0 : ready]
                */

                //now we need to add executor to task-node
                //    executor is a function :  (rtrn,thrw,self)=> {...}
                //        rtrn IS return/resolve
                //        thrw IS throw/reject 
                //        self IS the-task-node  self provide many methods begin with $
                //             SUCH AS .$parent_  .$fstch_  .$lsib_ .$rsib_...
                //             TO GET RELATIONS, its for simulate SCOPE

                //we create a function-factory for testing, which always rtrn(return/resolve)

                 

                //接下来要给节点上添加任务
                //    任务是一个形如  (rtrn,thrw,self)=> {...}  的函数
                //        rtrn 是return
                //        thrw 是throw
                //        self 是任务节点本身 可以通过 提供的很多$开头的方法
                //             比如 .$parent_  .$fstch_  .$lsib_ .$rsib_...
                //             来获取相关的关系, 起到类似定义域查询的功能

                //为了简化，创建一个生成异步任务的函数， 全部是成功


                function creat_executor(delay) {
                    let _f = (rtrn,thrw,self)=> {
                        console.log(self.name_,'started at',new Date())
                        setTimeout(
                            ()=> {
                                console.log(self.name_,'succ at',new Date())
                                rtrn(self.name_)
                            },
                            delay
                        )
                   }
                   return(_f)
                }


                //add executor to task-node
                //   .T_ is a setter Proxy, use tsk.T_.executor_ =  to add executor-func

                //给节点添加任务
                //    .T_ 是一个setter Proxy, 使用它来添加节点任务(.executor_)
                //为了便于观察,延迟设置长一点，比如5秒

                tsk.T_.tsk0020.executor_         = creat_executor(5000)
                tsk.T_.tsk0021.executor_         = creat_executor(5000)
                tsk.T_.tsk0022.executor_         = creat_executor(5000)
                    tsk.T_.tsk002.executor_      = creat_executor(5000)
                tsk.T_.tsk0010.executor_         = creat_executor(5000)
                tsk.T_.tsk0011.executor_         = creat_executor(5000)
                tsk.T_.tsk0012.executor_         = creat_executor(5000)
                    tsk.T_.tsk001.executor_      = creat_executor(5000)
                    tsk.T_.tsk000.executor_      = creat_executor(5000)
                        tsk.T_.tsk00.executor_   = creat_executor(5000)
                           tsk.executor_         = (rtrn,thrw,self) => {  //collect all results on root-node
                                rtrn(self.$sdfs_.map(nd=>nd.rslt_))       //根节点上采集所有任务结果用来观察
                           }


            //launch the task
            //启动任务

            var p = tsk.launch();

            tsk000 started at 2021-12-16T09:31:33.985Z
            tsk000 succ at 2021-12-16T09:31:38.993Z
            tsk0010 started at 2021-12-16T09:31:38.995Z
            tsk0011 started at 2021-12-16T09:31:38.995Z
            tsk0012 started at 2021-12-16T09:31:38.996Z

           
            // when the task-tree is executing USE tsk.show() TO observe the state
            //      if task-nodes too many
            //          do not USE tsk.show(),console will be slow ,coz it will expand the whole tree
            //          should USE tsk.T_[task-name].show(),it only expand the subtree
            //          at the same time USE 
            //               tsk.T_[task-name].$ances_.forEach(pr=>pr.show()),TO observe ancestor-task-nodes

            // 执行过程中使用tsk.show() 观察节点任务执行状态
            //      如果任务节点特别多
            //          不要使用 tsk.show(),console会很卡,因为会展开整棵任务树
            //          应该使用 tsk.T_[task-name].show(),只展开子树
            //          同时使用 tsk.T_[task-name].$ances_.forEach(pr=>pr.show()),来观察 父祖节点状态


            > tsk.show()

IMG0

            tsk0010 succ at 2021-12-16T09:31:44.000Z
            tsk0011 succ at 2021-12-16T09:31:44.007Z
            tsk0012 succ at 2021-12-16T09:31:44.011Z
            tsk001 started at 2021-12-16T09:31:44.014Z
            tsk001 succ at 2021-12-16T09:31:49.022Z
            tsk0020 started at 2021-12-16T09:31:49.024Z
            tsk0021 started at 2021-12-16T09:31:49.024Z
            tsk0022 started at 2021-12-16T09:31:49.028Z

            > tsk.show()

IMG1

            tsk0020 succ at 2021-12-16T09:31:54.028Z
            tsk0021 succ at 2021-12-16T09:31:54.034Z
            tsk0022 succ at 2021-12-16T09:31:54.042Z
            tsk002 started at 2021-12-16T09:31:54.044Z
            tsk002 succ at 2021-12-16T09:31:59.046Z
            tsk00 started at 2021-12-16T09:31:59.048Z

IMG2


            tsk00 succ at 2021-12-16T09:32:04.051Z

            > tsk.show()

IMG3




### load\_from\_json
- see [APIS.load\_from\_json](#APIS) for format-detail

        var J = [
            'tsk00',{type:'serial'},[
                'tsk000',[
                ],
                'tsk001',{type:'parallel'},[
                    'tsk0010',
                    'tsk0011',
                    'tsk0012',
                ],
                'tsk002',{type:'parallel'},[
                    'tsk0020',
                    'tsk0021',
                    'tsk0022'
                ]
            ]
        ]

        var tsk = evt.load_from_json(J); 




### rejected AND recover


### pause    AND continue


### carryon
- carryon EQUALS recover() | continue(), based on the stuck-reason




APIS
====

### load 

#### load\_from\_blue\_print(bp:BP,max\_size=10000,rtrn\_forest=false,tag\_parser=DFLT\_TAG\_PARSER)


    load_from_blue_print(bp:BP,max_size=10000,rtrn_forest=false,tag_parser=DFLT_TAG_PARSER)

        max_size means must larger than (2* task-node-count)
            1000000 task-nodes will cost about 90M memory
            normally  10000  task-nodes is enough for most secarino
       BP is a string:
           {...}        means parallel task, it will start children at the same time,similiar to Promise.all
           (...)        means serial task,   it will start in DFS-sequence, similar to html-traverse sequence
           [task-name]  task-name MUST be enclosed in []
           ->           means parent task is serial,   is OPTIONAL   (coz '(...)' already decided)
           -|           means parent task is parallel, is OPTIONAL  (coz '{...}' already decided)
       BP is written in BOTTOM-TO-UP style:


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


#### load\_from\_json

        load_from_json(J)
        J: [T?,A?,C?]
             T@optional : String, if-skipped, it will be a DFS-index
             A@optional : CFG
             C@optional : Array<J>

        CFG: {
            type: 'serial',                          //'serial' OR 'parallel'
                                                     //    default is 'serial'
            enable_promise: false,                   // enable_promise on task-node , make the task awaitable
                                                     //    default only on root-task-node is true
                                                     //                 on nonroot-task-node is false
            executor: [Function: DFLT_CU_EXECUTOR],  // (rtrn,thrw,self)=>{...}
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

        }

        valid-ptrn:
            [T],[A],[C],
            [T,A],[T,C],[A,C],
            [T,A,C]





### ctrl keywords

     //param conder:(rtrn_tru,rtrn_fls,self) => {...}
     IF(conder),
     ELIF(conder),
     ELSE,            //no parameter
     WHILE(conder)



### wrap 

     async function try_until_succ(tsk,max_times=Infinity):any
     async function limited_auto_recover_loop(tsk,times=1,history_size=10):{history:Array,counter:{c:Number}}
           function endless_auto_recover_loop(tsk,history_size=10):{history:Array,counter:{c:Number}}
     async function repeat_until_fail(tsk,times=1,history_size=10):{history:Array,counter:{c:Number}}
     async function repeat_ignore_fail(tsk,times=1,history_size=10):{history:Array,counter:{c:Number}}
           function endless_repeat_loop_until_fail(tsk,history_size=10):{history:Array,counter:{c:Number}}
           function endless_repeat_loop_ignore_fail(tsk,history_size=10):{history:Array,counter:{c:Number}}


### brief

        > evt
        {
          debug: [Function: debug],
          noexist: Symbol(noexist),
          TYPES: { '0': 'serial', '1': 'parallel', serial: '0', parallel: '1' },
          DFLT_TAG_PARSER: [Function: DFLT_TAG_PARSER],
          load_from_blue_print: [Function: load_from_blue_print],
          DFLT_CFG: [Function: DFLT_CFG],
          load_from_json: [Function: load_from_json],
          IF: [Function: IF],
          ELIF: [Function: ELIF],
          ELSE: [Function: ELSE] { [Symbol(else)]: true },
          WHILE: [Function: WHILE],
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
        > evt.DFLT_CFG()
        {
          type: 'serial',
          enable_promise: false,
          conder: [Function: DFLT_CU_CONDER],
          executor: [Function: DFLT_CU_EXECUTOR],
          args_dict: {}
        }
        >
        > evt.DFLT_TAG_PARSER.toString()
        '(s)=>s.trim()'
        >
 
METHODS
=======

### task

        tsk.conding_deses_                          tsk.fst_bubble_paused_ance_
        tsk.fst_bubble_rejected_ance_               tsk.fst_paused_ance_
        tsk.fst_rejected_ance_                      tsk.fst_self_paused_ance_
        tsk.fst_self_rejected_ance_                 tsk.has_bubble_paused_ance_
        tsk.has_bubble_rejected_ance_               tsk.has_paused_ance_
        tsk.has_rejected_ance_                      tsk.has_self_paused_ance_
        tsk.has_self_rejected_ance_                 tsk.is_bubble_paused
        tsk.is_bubble_rejected                      tsk.is_conding
        tsk.is_impossible                           tsk.is_opened
        tsk.is_paused                               tsk.is_pending
        tsk.is_ready                                tsk.is_rejected
        tsk.is_resolved                             tsk.is_self_executing
        tsk.is_self_paused                          tsk.is_self_rejected
        tsk.is_settled                              tsk.is_started
        tsk.is_stopped                              tsk.is_stucked
        tsk.self_executing_deses_                   tsk.self_rejected_deses_
        tsk.state_

        tsk.cond_                                   tsk.disable_promise
        tsk.enable_promise                          tsk.exception_
        tsk.is_promise_enabled                      tsk.p_
        tsk.rslt_                                   tsk.settled_

        tsk.conder_                                 tsk.executor_
        tsk.if_head_                                tsk.is_abandoned
        tsk.is_all_if_chain_psib_conder_failed      tsk.is_conder_elif
        tsk.is_conder_else                          tsk.is_conder_if
        tsk.is_conder_while                         tsk.undefined

        tsk.T_                                      tsk.carryon
        tsk.constructor                             tsk.continue
        tsk.dump                                    tsk.hard_reset
        tsk.is_parallel                             tsk.is_serial
        tsk.launch                                  tsk.name_
        tsk.pause                                   tsk.recover
        tsk.rejected_at_                            tsk.running_
        tsk.set_as_parallel                         tsk.set_as_serial
        tsk.show                                    tsk.soft_reset
        tsk.unparse




### internal tree


        tsk.$add_lsib                               tsk.$add_lsibs
        tsk.$add_or_goto_parent                     tsk.$add_parent
        tsk.$add_parent_and_lsib                    tsk.$add_rsib
        tsk.$add_rsibs                              tsk.$ance
        tsk.$ance_dist                              tsk.$ances_
        tsk.$append_child                           tsk.$append_children
        tsk.$are_sibs                               tsk.$bfs_
        tsk.$bfs_des_index                          tsk.$bfs_des_leaf_index
        tsk.$bfs_des_next                           tsk.$bfs_des_nonleaf_index
        tsk.$bfs_des_prev                           tsk.$bfs_index_
        tsk.$bfs_leaf_index_                        tsk.$bfs_next_
        tsk.$bfs_nonleaf_index_                     tsk.$bfs_prev_
        tsk.$block                                  tsk.$blocked_
        tsk.$bpl_                                   tsk.$breadth_
        tsk.$child                                  tsk.$children_
        tsk.$children_count_                        tsk.$clone
        tsk.$cmmn_ances                             tsk.$cond_leaf_sdfs_next
        tsk.$cond_leaf_sedfs_next                   tsk.$connto
        tsk.$deep_lseq                              tsk.$deep_steq
        tsk.$depth_                                 tsk.$des_bfs_
        tsk.$des_bpl                                tsk.$des_breadth
        tsk.$des_lyr                                tsk.$des_lyr_next
        tsk.$des_lyr_prev                           tsk.$des_lyrs_
        tsk.$des_offset                             tsk.$des_own_lyr
        tsk.$des_pbreadth                           tsk.$des_plyr
        tsk.$des_spl                                tsk.$disconn
        tsk.$dist                                   tsk.$dlmost_
        tsk.$drmost_                                tsk.$dump
        tsk.$edfs_                                  tsk.$edfs_des_index
        tsk.$edfs_des_leaf_index                    tsk.$edfs_des_nonleaf_index
        tsk.$edfs_index_                            tsk.$edfs_leaf_index_
        tsk.$edfs_next_                             tsk.$edfs_nonleaf_index_
        tsk.$edfs_prev_                             tsk.$erase
        tsk.$erase_r                                tsk.$fid_
        tsk.$forest_                                tsk.$fsib
        tsk.$fsibs_                                 tsk.$fsibs_count_
        tsk.$fst_cmmn_ance                          tsk.$fstch_
        tsk.$fstpsib_                               tsk.$fstsib_
        tsk.$gen_ance                               tsk.$gen_bfs
        tsk.$gen_child_from_fst                     tsk.$gen_child_from_lst
        tsk.$gen_cond_leaf_sdfs_next                tsk.$gen_cond_leaf_sedfs_next
        tsk.$gen_des_bfs                            tsk.$gen_des_lyr
        tsk.$gen_des_lyr_next                       tsk.$gen_des_lyr_prev
        tsk.$gen_edfs_next                          tsk.$gen_edfs_next_leaf
        tsk.$gen_edfs_next_nonleaf                  tsk.$gen_edfs_prev
        tsk.$gen_edfs_prev_leaf                     tsk.$gen_edfs_prev_nonleaf
        tsk.$gen_fsib                               tsk.$gen_lmost
        tsk.$gen_lyr                                tsk.$gen_lyr_next
        tsk.$gen_lyr_prev                           tsk.$gen_psib
        tsk.$gen_rmost                              tsk.$gen_sdfs_next
        tsk.$gen_sdfs_next_build_action             tsk.$gen_sdfs_next_ignore_blocked
        tsk.$gen_sdfs_next_leaf                     tsk.$gen_sdfs_next_nonleaf
        tsk.$gen_sdfs_next_srch_action              tsk.$gen_sdfs_prev
        tsk.$gen_sdfs_prev_build_action             tsk.$gen_sdfs_prev_leaf
        tsk.$gen_sdfs_prev_nonleaf                  tsk.$gen_sdfs_prev_srch_action
        tsk.$gen_sedfs_next                         tsk.$gen_sedfs_next_after_close
        tsk.$gen_sedfs_next_after_open              tsk.$gen_sedfs_next_ignore_blocked
        tsk.$gen_sedfs_prev                         tsk.$gen_sedfs_prev_before_close
        tsk.$gen_sedfs_prev_before_open             tsk.$gen_sib_from_fst
        tsk.$gen_sib_from_lst                       tsk.$gen_visit
        tsk.$get_leaf_sibs                          tsk.$get_nonleaf_sibs
        tsk.$get_with_spl                           tsk.$has_leaf_sib
        tsk.$has_nonleaf_sib                        tsk.$height_
        tsk.$id_                                    tsk.$insert_child_after
        tsk.$insert_child_before                    tsk.$insert_children_after
        tsk.$insert_children_before                 tsk.$is_ance_blocked
        tsk.$is_ance_of                             tsk.$is_blocked
        tsk.$is_child_of                            tsk.$is_des_lyr_bst
        tsk.$is_des_lyr_fst                         tsk.$is_des_lyr_lst
        tsk.$is_des_of                              tsk.$is_empty
        tsk.$is_fsib_of                             tsk.$is_fstch
        tsk.$is_fstch_of                            tsk.$is_inclusive_ance_of
        tsk.$is_inclusive_des_of                    tsk.$is_inclusive_sib_of
        tsk.$is_isolated                            tsk.$is_leaf
        tsk.$is_lonely                              tsk.$is_lsib_of
        tsk.$is_lstch                               tsk.$is_lstch_of
        tsk.$is_lyr_bst                             tsk.$is_lyr_fst
        tsk.$is_lyr_lst                             tsk.$is_midch
        tsk.$is_nonleaf                             tsk.$is_parent_of
        tsk.$is_psib_of                             tsk.$is_root
        tsk.$is_root_of                             tsk.$is_rsib_of
        tsk.$is_self_blocked                        tsk.$is_sib_of
        tsk.$lcin_                                  tsk.$length_
        tsk.$lsib_                                  tsk.$lsib_of_fst_ance_having_lsib_
        tsk.$lst_des_lyr_                           tsk.$lst_lyr_
        tsk.$lstch_                                 tsk.$lstfsib_
        tsk.$lstsib_                                tsk.$luncle_
        tsk.$lyr                                    tsk.$lyr_next_
        tsk.$lyr_prev_                              tsk.$lyrs_
        tsk.$more_less                              tsk.$new
        tsk.$nonleaf_length_                        tsk.$noop
        tsk.$offset_                                tsk.$own_lyr_
        tsk.$parent_                                tsk.$path_to
        tsk.$pbreadth_                              tsk.$plance
        tsk.$plances_                               tsk.$plyr_
        tsk.$prepend_child                          tsk.$prepend_children
        tsk.$psib                                   tsk.$psibs_
        tsk.$psibs_count_                           tsk.$rcin_
        tsk.$replace_child_node_at                  tsk.$replace_child_tree_at
        tsk.$replace_node                           tsk.$replace_tree
        tsk.$reverse                                tsk.$reverse_children
        tsk.$reverse_children_tree                  tsk.$reverse_tree
        tsk.$rm_child                               tsk.$rm_children
        tsk.$rm_fstch                               tsk.$rm_lstch
        tsk.$rm_some_children                       tsk.$root_
        tsk.$rsib_                                  tsk.$rsib_of_fst_ance_having_rsib_
        tsk.$runcle_                                tsk.$sdfs_
        tsk.$sdfs_des_index                         tsk.$sdfs_des_leaf_index
        tsk.$sdfs_des_nonleaf_index                 tsk.$sdfs_ignore_blocked_
        tsk.$sdfs_index_                            tsk.$sdfs_leaf_index_
        tsk.$sdfs_leafs_                            tsk.$sdfs_next_
        tsk.$sdfs_next_build_action                 tsk.$sdfs_next_build_action_list_
        tsk.$sdfs_next_ignore_blocked_              tsk.$sdfs_next_srch_action
        tsk.$sdfs_next_srch_action_list_            tsk.$sdfs_nonleaf_index_
        tsk.$sdfs_nonleafs_                         tsk.$sdfs_prev_
        tsk.$sdfs_prev_build_action                 tsk.$sdfs_prev_build_action_list_
        tsk.$sdfs_prev_srch_action                  tsk.$sdfs_prev_srch_action_list_
        tsk.$sedfs_                                 tsk.$sedfs_ignore_blocked_
        tsk.$sedfs_next                             tsk.$sedfs_next_after_close_
        tsk.$sedfs_next_after_open_                 tsk.$sedfs_next_ignore_blocked_when_close_
        tsk.$sedfs_next_ignore_blocked_when_open_   tsk.$sedfs_prev
        tsk.$sedfs_prev_before_close_               tsk.$sedfs_prev_before_open_
        tsk.$self_                                  tsk.$sib
        tsk.$sib_dist                               tsk.$sibs_
        tsk.$sibs_count_                            tsk.$sibseq_
        tsk.$some_ances                             tsk.$some_children
        tsk.$some_des_lyrs                          tsk.$some_fsibs
        tsk.$some_lyrs                              tsk.$some_plances
        tsk.$some_psibs                             tsk.$some_sibs
        tsk.$spl_                                   tsk.$swap_node
        tsk.$swap_self_children_with_idx_range      tsk.$swap_self_children_with_nd_range
        tsk.$swap_tree                              tsk.$to_nest
        tsk.$unblock                                tsk.$visit
        tsk.$width_



LICENSE
=======
- ISC 
