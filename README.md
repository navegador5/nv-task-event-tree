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
          *   -|  表示该节点的父节点是 并行节点, -| 是可以省略的,只是为了看起来清楚一些,起决定作用的是 外层的{}
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

![mixed-blue-print-state0](https://github.com/navegador5/nv-task-event-tree/blob/master/RESOURCES/mixed-blue-print/0.png)


            tsk0010 succ at 2021-12-16T09:31:44.000Z
            tsk0011 succ at 2021-12-16T09:31:44.007Z
            tsk0012 succ at 2021-12-16T09:31:44.011Z
            tsk001 started at 2021-12-16T09:31:44.014Z
            tsk001 succ at 2021-12-16T09:31:49.022Z
            tsk0020 started at 2021-12-16T09:31:49.024Z
            tsk0021 started at 2021-12-16T09:31:49.024Z
            tsk0022 started at 2021-12-16T09:31:49.028Z

            > tsk.show()

![mixed-blue-print-state1](https://github.com/navegador5/nv-task-event-tree/blob/master/RESOURCES/mixed-blue-print/1.png)


            tsk0020 succ at 2021-12-16T09:31:54.028Z
            tsk0021 succ at 2021-12-16T09:31:54.034Z
            tsk0022 succ at 2021-12-16T09:31:54.042Z
            tsk002 started at 2021-12-16T09:31:54.044Z
            tsk002 succ at 2021-12-16T09:31:59.046Z
            tsk00 started at 2021-12-16T09:31:59.048Z

![mixed-blue-print-state2](https://github.com/navegador5/nv-task-event-tree/blob/master/RESOURCES/mixed-blue-print/2.png)



            tsk00 succ at 2021-12-16T09:32:04.051Z

            > tsk.show()

![mixed-blue-print-state3](https://github.com/navegador5/nv-task-event-tree/blob/master/RESOURCES/mixed-blue-print/3.png)



            > p         //tsk.p_
            Promise {
              [
                Symbol(noexist), 'tsk00',
                'tsk000',        'tsk001',
                'tsk0010',       'tsk0011',
                'tsk0012',       'tsk002',
                'tsk0020',       'tsk0021',
                'tsk0022'
              ],
              [Symbol(async_id_symbol)]: 44,
              [Symbol(trigger_async_id_symbol)]: 5,
              [Symbol(destroyed)]: { destroyed: false }
            }
            >



### reset

#### soft\_reset 
     
         //IF the tsk in a settled-state:
         //    resolved | self_rejected | bubble_rejected | impossible
         //OR ready-state : ready
         //    USE tsk.soft_reset()
     

####  hard\_reset

         //IF the tsk in a pending-state:
         //    opened | self_executing
         //OR in a paused-state:
         //    self_paused | bubble_paused
         //OR in conding-state:            which is USED to support IF/ELIF/ELSE/WHILE
         //    conding
         //USE tsk.hard_reset()      
         //----
         //hard_reset  will respawn many nodes, do NOT use it
         //   coz in JS layer ,you CANT always real pause a executing task,
         //   such as setTimeout USING clearTimeout
         //           fetch      USING AbortController
         //   but NOT all async function has FIXED cancel method  
         //   so  we must replace/respawn the task-node to avoid pollution




### pause    AND continue

       //since the task-tree settled, we first reset the tsk
       //上面的任务树已经执行完一次了,先调用 tsk.soft_reset() 重置一下
        
        > tsk.soft_reset()
        Task [0 : ready] {}
        >
        > tsk.show()
        (
            (
                [tsk000 : ready]->
                {
                    [tsk0010 : ready]-|
                    [tsk0011 : ready]-|
                    [tsk0012 : ready]-|
                }-> [tsk001 : ready]->
                {
                    [tsk0020 : ready]-|
                    [tsk0021 : ready]-|
                    [tsk0022 : ready]-|
                }-> [tsk002 : ready]
            )-> [tsk00 : ready]
        )-> [0 : ready]

        //we change the executor on [tsk0011] to a larger delay, for observing the pause behavior
        //为了进行pause 的实验,我们把 [tsk0011] 上的 executor 换一个deley 大点的

        tsk.T_.tsk0011.executor_         = creat_executor(60000)
         
        var p = tsk.launch();
        /*
            tsk000 started at 2021-12-16T11:07:11.145Z
            tsk000 succ at 2021-12-16T11:07:16.153Z
            tsk0010 started at 2021-12-16T11:07:16.155Z
            tsk0011 started at 2021-12-16T11:07:16.155Z
            tsk0012 started at 2021-12-16T11:07:16.156Z
            tsk0010 succ at 2021-12-16T11:07:21.158Z
            tsk0012 succ at 2021-12-16T11:07:21.162Z
        */
         
        //now we pause it
        //现在我们暂停它
        > tsk.pause()
           Set(1) { Task [tsk0011 : self_paused] {} }
        >
        > tsk.running_
          Set(1) { Task [tsk0011 : self_paused] {} } 
       
        //running_ is a getter for all-currently self-executing|self-paused task-nodes
        //   it is a Set , for support parallel (maybe multi task-nodes self-executing at the same time)
        //running_ 包含所有 self-executing|self-paused 节点
        //   它是一个Set,目的是为了支持!并行!父节点, 因为在JS层宏观上,同一时刻可能有多个节点在执行
        
        > tsk.show()
         

![mixed-blue-print-state4](https://github.com/navegador5/nv-task-event-tree/blob/master/RESOURCES/mixed-blue-print/4.png)


        !!!!IMPORTANT!!!!
        //let we  wait for enough time, you will notice the below log(since [tsk0011] already paused)
        //我们等待足够长时间,能够看到下面的LOG(虽然[tsk0011]已经paused了) 
             !!!【tsk0011 succ at 2021-12-16T11:08:16.157Z】!!!
        //but just IGNORE it, coz its from the executor-frame-on-old-task-node   
        //since you can NOT  always real pause most function in JS layer(
        //         such as fetch USING AbortController;
        //         setTimeout USING clearTimeout;
        //         but NOT all async API provide  cancel/abort/pause method  
        //)
        //so nv-task-event-tree USE a trick: it replace/respawn  the old-task-node with a-new-one 
        //on the same place in task-tree
        //但是不用担心，忽略它好了
        //它其实是从 旧的[tsk0011] 上的executor-frame来的
        //因为在JS层,多大多数函数来说,并不能真正的暂停,即使提供了类似 cancel/abort/pause功能的
        //    接口也不一致 : setTimeout,AbortController.....
        //所以nv-task-event-tree用了一个技巧: replace/respawn  旧的[tsk0011] 
        //此时虽然节点上的属性 executor conder state 与 旧的[tsk0011] 完全一样,但是是一个新节点
        //    旧的[tsk0011] 上的executor虽然还在执行,但是其结果不会污染 task-node 
        > tsk.show()

![mixed-blue-print-state5](https://github.com/navegador5/nv-task-event-tree/blob/master/RESOURCES/mixed-blue-print/5.png)


        > p
        Promise {
          <pending>,                         // still pending
          [Symbol(async_id_symbol)]: 161,
          [Symbol(trigger_async_id_symbol)]: 5,
          [Symbol(destroyed)]: { destroyed: false }
        }
        >

        //now we continue the task-tree
        //现在我们执行 tsk.continue() 

        > tsk.continue()
        tsk0011 started at 2021-12-16T11:11:37.037Z
        Set(1) { Task [tsk0011 : self_executing] {} }
        

![mixed-blue-print-state6](https://github.com/navegador5/nv-task-event-tree/blob/master/RESOURCES/mixed-blue-print/6.png)


            >
            tsk0011 succ at 2021-12-16T11:12:37.049Z
            tsk001 started at 2021-12-16T11:12:37.050Z
            tsk001 succ at 2021-12-16T11:12:42.051Z
            tsk0020 started at 2021-12-16T11:12:42.052Z
            tsk0021 started at 2021-12-16T11:12:42.053Z
            tsk0022 started at 2021-12-16T11:12:42.054Z
            tsk0020 succ at 2021-12-16T11:12:47.058Z
            tsk0021 succ at 2021-12-16T11:12:47.059Z
            tsk0022 succ at 2021-12-16T11:12:47.060Z
            tsk002 started at 2021-12-16T11:12:47.067Z
            tsk002 succ at 2021-12-16T11:12:52.076Z
            tsk00 started at 2021-12-16T11:12:52.077Z
            tsk00 succ at 2021-12-16T11:12:57.081Z

            > tsk.running_
            Set(0) {}
            >


![mixed-blue-print-state7](https://github.com/navegador5/nv-task-event-tree/blob/master/RESOURCES/mixed-blue-print/7.png)

            //OK .done  reset the task-tree
            tsk.soft_reset();



### rejected AND recover

       tsk.soft_reset();

       //we change the executor on [tsk0011] to let it random fail
       //为了进行rejected 的实验,我们把 [tsk0011] 上的 executor 换一个大概率fail 小概率succ的

        tsk.T_.tsk0011.executor_         =  (rtrn,thrw,self) => {
                console.log(self.name_,'started at',new Date())
                setTimeout(
                    ()=> {
                        let failed = Math.random() > 0.25;
                        if(failed) {
                            console.log(self.name_,'failed at',new Date())
                            thrw(new Error(self.name_))
                        } else {
                            console.log(self.name_,'succ at',new Date())
                            rtrn(self.name_)
                        }
                    },
                    delay
                )
        }

        var p = tsk.launch();

        >
        tsk000 started at 2021-12-16T12:09:03.870Z
        tsk000 succ at 2021-12-16T12:09:08.877Z
        tsk0010 started at 2021-12-16T12:09:08.883Z
        tsk0011 started at 2021-12-16T12:09:08.890Z
        tsk0012 started at 2021-12-16T12:09:08.896Z
        tsk0010 succ at 2021-12-16T12:09:13.895Z
        tsk0011 failed at 2021-12-16T12:09:13.898Z
        Uncaught Error: tsk0011                        //----->
        tsk0012 succ at 2021-12-16T12:09:13.918Z
        >

        > tsk
        Task [0 : bubble_rejected] {}


        > tsk.rejected_at_                  //tsk.rejected_at_ is a getter of current-self-rejected node
        Task [tsk0011 : self_rejected] {}
        >

![mixed-blue-print-state8](https://github.com/navegador5/nv-task-event-tree/blob/master/RESOURCES/mixed-blue-print/8.png)


        > p
        Promise {
          <rejected> [Error: tsk0011],
          [Symbol(async_id_symbol)]: 44,
          [Symbol(trigger_async_id_symbol)]: 5,
          [Symbol(destroyed)]: { destroyed: false }
        }
        >

        //now lets try to recover
        //   recover will renew the tsk.p_
        //recover 会产生一个新的promise 
        > var np = tsk.recover()         
        tsk0011 started at 2021-12-16T12:10:13.566Z
        tsk0011 failed at 2021-12-16T12:10:18.569Z
        Uncaught Error: tsk0011
        
        > var np = tsk.recover()                    //---AGAIN
        tsk0011 started at 2021-12-16T12:10:21.757Z
        tsk0011 succ at 2021-12-16T12:10:26.764Z
        tsk001 started at 2021-12-16T12:10:26.765Z
        tsk001 succ at 2021-12-16T12:10:31.773Z
        tsk0020 started at 2021-12-16T12:10:31.775Z
        tsk0021 started at 2021-12-16T12:10:31.776Z
        tsk0022 started at 2021-12-16T12:10:31.782Z
        tsk0020 succ at 2021-12-16T12:10:36.782Z
        tsk0021 succ at 2021-12-16T12:10:36.783Z
        tsk0022 succ at 2021-12-16T12:10:36.787Z
        tsk002 started at 2021-12-16T12:10:36.791Z
        tsk002 succ at 2021-12-16T12:10:41.798Z
        tsk00 started at 2021-12-16T12:10:41.799Z
        tsk00 succ at 2021-12-16T12:10:46.805Z


        > tsk.rejected_at_
        Symbol(noexist)


![mixed-blue-print-state9](https://github.com/navegador5/nv-task-event-tree/blob/master/RESOURCES/mixed-blue-print/9.png)


         tsk.soft_reset();

### carryon
- carryon EQUALS recover() | continue(), based on the stuck-reason


### ctrl keywords 
- IF(conder)
- ELIF(conder)
- ELSE
- WHILE(condet)


#### conder

     conder:(rtrn_tru,rtrn_fls,self) => {...}
     //similar to executor 
     //on each task use .conder_ =   to set it    

#### if/elif/else
- if chain only work on children of serial-task-node

     //let us create a simple task-tree: just a serial-link
     // IF/ELIF/ELSE 只能使用在 串行 父节点的 子节点上

     var bp =`([tsk0]->[tsk1]->[tsk2]->[tsk3]->[tsk4]->[tsk5])`;
     
     var tsk = evt.load_from_blue_print(bp)

        /*
        > tsk.show()
        (
            (
                [tsk0 : ready]->
                [tsk1 : ready]->
                [tsk2 : ready]->
                [tsk3 : ready]->
                [tsk4 : ready]->
                [tsk5 : ready]
            )-> [1 : ready]          //this is the auto-generated anonymous parent
        )-> [0 : ready]              //this is the auto-generated root
        */


       //we use a conder-factory to creat base-conder
       //    which return(true) if [tsk].param === 3
       //    else  return(false)
       //later we will USE evt.IF/evt.ELIF to wrap the base-conder                 
       // 首先写一个简单的生成 conder 模板 的函数
       //    [tsk].param === 3 时满足条件
       //    我们稍后要使用 evt.IF/evt.ELIF 把conder包起来

        function creat_conder(delay) {
            let _f = (rtrn_tru,rtrn_fls,self)=> {
                console.log(self.name_,'started conder at',new Date())
                setTimeout(
                    ()=> {
                        console.log(self.name_,'finish conder at',new Date())
                        if(self.param === 3) {
                            rtrn_tru()
                        } else {
                            rtrn_fls()
                        }
                    },
                    delay
                )
           }
           return(_f)
        }

        //the ctrl logic to impl:
        //我们实现如下逻辑
        /*
            if(param === 0) {
                [tsk0].exec()
            } else if(param ===1) {
                [tsk1].exec()
            } else if(param ===2) {
                [tsk2].exec()
            } else if(param ===3) {
                [tsk3].exec()
            } else if(param ===3) {
                //impossible branch
                [tsk4].exec()
            } else {
                //impossible branch
                [tsk5].exec()
            }

        */

        //使用evt.IF 和  evt.ELIF
        //  需要 evt.IF(conder)  evt.ELIF(conder)
        //使用evt.ELSE 不用带参数
        //   evt.ELSE is internally a special base-conder
        //   it is NOT a conder-wrapper
        //   so use it without conder-param


        tsk.T_.tsk0.param               = 0
        tsk.T_.tsk0.conder_             = evt.IF(creat_conder(10000))
        tsk.T_.tsk0.executor_           = creat_executor(2000)

        tsk.T_.tsk1.param               = 1
        tsk.T_.tsk1.conder_             = evt.ELIF(creat_conder(10000))
        tsk.T_.tsk1.executor_           = creat_executor(2000)


        tsk.T_.tsk2.param               = 2
        tsk.T_.tsk2.conder_             = evt.ELIF(creat_conder(10000))
        tsk.T_.tsk2.executor_           = creat_executor(2000)


        tsk.T_.tsk3.param               = 3
        tsk.T_.tsk3.conder_             = evt.ELIF(creat_conder(10000))
        tsk.T_.tsk3.executor_           = creat_executor(2000)


        tsk.T_.tsk4.param               = 3
        tsk.T_.tsk4.conder_             = evt.ELIF(creat_conder(10000))
        tsk.T_.tsk4.executor_           = creat_executor(2000)


        tsk.T_.tsk5.param               = 3
        tsk.T_.tsk5.conder_             = evt.ELSE 
                                        //ELSE have no conder-param
        tsk.T_.tsk5.executor_           = creat_executor(2000)


        /*
            > tsk.$sdfs_.map(nd=>nd.conder_)
            [
              [Function: DFLT_CU_CONDER],
              [Function: DFLT_CU_CONDER],
              [Function: _if] { [Symbol(if)]: true },
              [Function: _elif] { [Symbol(elif)]: true },
              [Function: _elif] { [Symbol(elif)]: true },
              [Function: _elif] { [Symbol(elif)]: true },
              [Function: _elif] { [Symbol(elif)]: true },
              [Function: ELSE] { [Symbol(else)]: true }
            ]
            > tsk.$sdfs_.map(nd=>nd)
            [
              Task [0 : ready] {},
              Task [1 : ready] {},
              Task [tsk0 : ready] { param: 0 },
              Task [tsk1 : ready] { param: 1 },
              Task [tsk2 : ready] { param: 2 },
              Task [tsk3 : ready] { param: 3 },
              Task [tsk4 : ready] { param: 3 },
              Task [tsk5 : ready] { param: 3 }
            ]

        */

        var p = tsk.launch()
        >
        tsk0 started conder at 2021-12-16T13:06:52.321Z
        >
        tsk.show()


![mixed-blue-print-state10](https://github.com/navegador5/nv-task-event-tree/blob/master/RESOURCES/mixed-blue-print/10.png)


        >
        tsk0 finish conder at 2021-12-16T13:07:02.332Z
        tsk1 started conder at 2021-12-16T13:07:02.339Z
        >
        tsk.show()


![mixed-blue-print-state11](https://github.com/navegador5/nv-task-event-tree/blob/master/RESOURCES/mixed-blue-print/11.png)


        > 
        tsk1 finish conder at 2021-12-16T13:07:12.354Z
        tsk2 started conder at 2021-12-16T13:07:12.355Z
        > 
        tsk.show()


![mixed-blue-print-state12](https://github.com/navegador5/nv-task-event-tree/blob/master/RESOURCES/mixed-blue-print/12.png)

        > 
        tsk2 finish conder at 2021-12-16T13:07:22.364Z
        tsk3 started conder at 2021-12-16T13:07:22.365Z
        tsk3 finish conder at 2021-12-16T13:07:32.374Z
        tsk3 started at 2021-12-16T13:07:32.374Z
        tsk3 succ at 2021-12-16T13:07:34.378Z
        0 started at 2021-12-16T13:07:34.384Z
        0 succ at 2021-12-16T13:07:36.392Z
        >

        tsk.show() 

![mixed-blue-print-state13](https://github.com/navegador5/nv-task-event-tree/blob/master/RESOURCES/mixed-blue-print/13.png)

        tsk.soft_reset()

#### while

        tsk.soft_reset()

        //we change the base-conder and creat_executor to TEST evt.WHILE  
        //我们改变一下creat_conder 和 creat_executor 的逻辑
        //实验一下 WHILE 关键字

        function creat_conder(delay) {
            let _f = (rtrn_tru,rtrn_fls,self)=> {
                console.log(self.name_,'started conder at',new Date())
                setTimeout(
                    ()=> {
                        console.log(self.name_,'finish conder at',new Date(),self.param)
                        if(self.param < 3) {       //==================>
                            rtrn_tru()
                        } else {
                            rtrn_fls()
                        }
                    },
                    delay
                )
           }
           return(_f)
        }

        function creat_executor(delay) {
            let _f = (rtrn,thrw,self)=> {
                console.log(self.name_,'started at',new Date())
                setTimeout(
                    ()=> {
                        console.log(self.name_,'succ at',new Date())
                        self.param = self.param +1       //==================>
                        rtrn(self.name_)
                    },
                    delay
                )
           }
           return(_f)
        }
      
        ////

        tsk.executor_                   = creat_executor(2000)


        tsk.T_.tsk0.param               = 0                 //========================>
        tsk.T_.tsk0.conder_             = evt.WHILE(creat_conder(1000))
        tsk.T_.tsk0.executor_           = creat_executor(2000)

        tsk.T_.tsk1.param               = 0                 //========================>
        tsk.T_.tsk1.conder_             = evt.WHILE(creat_conder(1000))
        tsk.T_.tsk1.executor_           = creat_executor(2000)


        tsk.T_.tsk2.param               = 0                 //========================>
        tsk.T_.tsk2.conder_             = evt.WHILE(creat_conder(1000))
        tsk.T_.tsk2.executor_           = creat_executor(2000)


        tsk.T_.tsk3.param               = 0                 //========================>
        tsk.T_.tsk3.conder_             = evt.WHILE(creat_conder(1000))
        tsk.T_.tsk3.executor_           = creat_executor(2000)


        tsk.T_.tsk4.param               = 0                  //========================>
        tsk.T_.tsk4.conder_             = evt.WHILE(creat_conder(1000))
        tsk.T_.tsk4.executor_           = creat_executor(2000)


        tsk.T_.tsk5.param               = 0                   //========================>
        tsk.T_.tsk5.conder_             = evt.WHILE(creat_conder(1000))       
        tsk.T_.tsk5.executor_           = creat_executor(2000)

        //// 
       
            /*
            > tsk.$sdfs_.map(nd=>nd.conder_)
            [
              [Function: DFLT_CU_CONDER],                         //DFLT_CU_CONDER will do NOTHING
              [Function: DFLT_CU_CONDER],                         //DFLT_CU_CONDER will do NOTHING
              [Function: _while_frame] { [Symbol(while)]: true },
              [Function: _while_frame] { [Symbol(while)]: true },
              [Function: _while_frame] { [Symbol(while)]: true },
              [Function: _while_frame] { [Symbol(while)]: true },
              [Function: _while_frame] { [Symbol(while)]: true },
              [Function: _while_frame] { [Symbol(while)]: true }
            ]
            >

            > tsk.$sdfs_.map(nd=>nd)
            [
              Task [0 : ready] {},
              Task [1 : ready] {},
              Task [tsk0 : ready] { param: 0 },
              Task [tsk1 : ready] { param: 0 },
              Task [tsk2 : ready] { param: 0 },
              Task [tsk3 : ready] { param: 0 },
              Task [tsk4 : ready] { param: 0 },
              Task [tsk5 : ready] { param: 0 }
            ]
            */

            var p = tsk.launch()

            /*
            > var p = tsk.launch()
            tsk0 started conder at 2021-12-17T05:55:10.668Z
            tsk0 finish conder at 2021-12-17T05:55:11.672Z 0
            tsk0 started at 2021-12-17T05:55:11.678Z   <-------------------------------------
            tsk0 succ at 2021-12-17T05:55:13.687Z      ------------------------------------->
            tsk0 started conder at 2021-12-17T05:55:13.689Z
            tsk0 finish conder at 2021-12-17T05:55:14.694Z 1
            tsk0 started at 2021-12-17T05:55:14.698Z   <-------------------------------------
            tsk0 succ at 2021-12-17T05:55:16.705Z      ------------------------------------->
            tsk0 started conder at 2021-12-17T05:55:16.706Z
            tsk0 finish conder at 2021-12-17T05:55:17.709Z 2
            tsk0 started at 2021-12-17T05:55:17.712Z    <-------------------------------------
            tsk0 succ at 2021-12-17T05:55:19.713Z       ------------------------------------->
            tsk0 started conder at 2021-12-17T05:55:19.714Z
            tsk0 finish conder at 2021-12-17T05:55:20.716Z 3
            tsk1 started conder at 2021-12-17T05:55:20.718Z
            tsk1 finish conder at 2021-12-17T05:55:21.720Z 0
            tsk1 started at 2021-12-17T05:55:21.724Z
            tsk1 succ at 2021-12-17T05:55:23.734Z
            tsk1 started conder at 2021-12-17T05:55:23.738Z
            tsk1 finish conder at 2021-12-17T05:55:24.744Z 1
            tsk1 started at 2021-12-17T05:55:24.748Z
            tsk1 succ at 2021-12-17T05:55:26.756Z
            tsk1 started conder at 2021-12-17T05:55:26.757Z
            tsk1 finish conder at 2021-12-17T05:55:27.759Z 2
            tsk1 started at 2021-12-17T05:55:27.759Z
            tsk1 succ at 2021-12-17T05:55:29.762Z
            tsk1 started conder at 2021-12-17T05:55:29.763Z
            tsk1 finish conder at 2021-12-17T05:55:30.766Z 3
            tsk2 started conder at 2021-12-17T05:55:30.767Z
            tsk2 finish conder at 2021-12-17T05:55:31.769Z 0
            tsk2 started at 2021-12-17T05:55:31.770Z
            tsk2 succ at 2021-12-17T05:55:33.774Z
            tsk2 started conder at 2021-12-17T05:55:33.778Z
            tsk2 finish conder at 2021-12-17T05:55:34.782Z 1
            tsk2 started at 2021-12-17T05:55:34.785Z
            tsk2 succ at 2021-12-17T05:55:36.790Z
            tsk2 started conder at 2021-12-17T05:55:36.791Z
            tsk2 finish conder at 2021-12-17T05:55:37.795Z 2
            tsk2 started at 2021-12-17T05:55:37.796Z
            tsk2 succ at 2021-12-17T05:55:39.798Z
            tsk2 started conder at 2021-12-17T05:55:39.801Z
            tsk2 finish conder at 2021-12-17T05:55:40.804Z 3
            tsk3 started conder at 2021-12-17T05:55:40.810Z
            tsk3 finish conder at 2021-12-17T05:55:41.812Z 0
            tsk3 started at 2021-12-17T05:55:41.813Z
            tsk3 succ at 2021-12-17T05:55:43.819Z
            tsk3 started conder at 2021-12-17T05:55:43.820Z
            tsk3 finish conder at 2021-12-17T05:55:44.822Z 1
            tsk3 started at 2021-12-17T05:55:44.822Z
            tsk3 succ at 2021-12-17T05:55:46.827Z
            tsk3 started conder at 2021-12-17T05:55:46.832Z
            tsk3 finish conder at 2021-12-17T05:55:47.839Z 2
            tsk3 started at 2021-12-17T05:55:47.840Z
            tsk3 succ at 2021-12-17T05:55:49.847Z
            tsk3 started conder at 2021-12-17T05:55:49.847Z
            tsk3 finish conder at 2021-12-17T05:55:50.850Z 3
            tsk4 started conder at 2021-12-17T05:55:50.851Z
            tsk4 finish conder at 2021-12-17T05:55:51.855Z 0
            tsk4 started at 2021-12-17T05:55:51.858Z
            tsk4 succ at 2021-12-17T05:55:53.865Z
            tsk4 started conder at 2021-12-17T05:55:53.866Z
            tsk4 finish conder at 2021-12-17T05:55:54.867Z 1
            tsk4 started at 2021-12-17T05:55:54.870Z
            tsk4 succ at 2021-12-17T05:55:56.874Z
            tsk4 started conder at 2021-12-17T05:55:56.879Z
            tsk4 finish conder at 2021-12-17T05:55:57.886Z 2
            tsk4 started at 2021-12-17T05:55:57.888Z
            tsk4 succ at 2021-12-17T05:55:59.894Z
            tsk4 started conder at 2021-12-17T05:55:59.897Z
            tsk4 finish conder at 2021-12-17T05:56:00.902Z 3
            tsk5 started conder at 2021-12-17T05:56:00.903Z
            tsk5 finish conder at 2021-12-17T05:56:01.904Z 0
            tsk5 started at 2021-12-17T05:56:01.905Z
            tsk5 succ at 2021-12-17T05:56:03.910Z
            tsk5 started conder at 2021-12-17T05:56:03.912Z
            tsk5 finish conder at 2021-12-17T05:56:04.914Z 1
            tsk5 started at 2021-12-17T05:56:04.915Z
            tsk5 succ at 2021-12-17T05:56:06.916Z
            tsk5 started conder at 2021-12-17T05:56:06.918Z
            tsk5 finish conder at 2021-12-17T05:56:07.919Z 2
            tsk5 started at 2021-12-17T05:56:07.919Z
            tsk5 succ at 2021-12-17T05:56:09.923Z
            tsk5 started conder at 2021-12-17T05:56:09.926Z
            tsk5 finish conder at 2021-12-17T05:56:10.931Z 3
            0 started at 2021-12-17T05:56:10.936Z
            0 succ at 2021-12-17T05:56:12.944Z
            */
       
            tsk.soft_reset() 

### wrap function for event-loop

- see [APIS.wrap](###wrap) for function-signature-detail

        //nv-task-event-tree provide 7 APIS for run a loop of tsk
        //evt 提供了7个API, 用来启动一个tsk loop
        //主要为方便一些使用,比如你想 24小时不间断的爬一个网站
        //    同时自动重试

            0. try_until_succ                  //直到task-tree 成功，遇到错误自动恢复继续
            1. limited_auto_recover_loop       //有限次数的try_until_succ,
            2. endless_auto_recover_loop       //无限次数的try_until_succ, 除非手动停止
            3. repeat_until_fail               // 有限次数的,直到遇到错误
            4. repeat_ignore_fail              // 有限次数的,忽略错误反复run,不自动恢复,而是每次重新run
            5. endless_repeat_loop_until_fail  //repeat_until_fail 的无限版, 除非手动停止 
            6. endless_repeat_loop_ignore_fail //repeat_ignore_fail 的无限版, 除非手动停止

       //this time we dont USE blue_print, we try load_from_json to build task-tree
       // J is a top-to-down style config

       //这次我们不使用blue_print, 我们使用load_from_json 构造task-tree
       //和blue_print不同, J 是自顶向下书写的传统模型
       //J 的好处是 可以 预先把 conder, executor 添在里面(但是这种方式不好,一团糟)

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

        var tsk = evt.load_from_json(J)



        /*
        tsk.show()

        (
            {
                [tsk000 : ready]         -|
                {
                    [tsk0010 : ready]-|
                    [tsk0011 : ready]-|
                    [tsk0012 : ready]-|
                }-> [tsk001 : ready]     -|
                {
                    [tsk0020 : ready]-|
                    [tsk0021 : ready]-|
                    [tsk0022 : ready]-|
                }-> [tsk002 : ready]     -|
            }-> [tsk00 : ready]
        )-> [@root@ : ready]

        */

        //we creat a random promise factory
        //我们创建一个随机resolve/reject 的 executor工厂

        function creat_executor(delay) {
            let _f = (rtrn,thrw,self)=> {
                console.log(self.name_,'started at',new Date())
                setTimeout(
                    ()=> {
                        let fail = Math.random() > 0.5;         //------------------------->
                        if(fail) {
                            console.log(self.name_,'failed at',new Date());
                            thrw(self.name_)
                        } else {
                            console.log(self.name_,'succ at',new Date());
                            rtrn(self.name_)
                        }
                    },
                    delay
                )
           }
           return(_f)
        }


            tsk.T_.tsk0020.executor_           = creat_executor(2000)
            tsk.T_.tsk0021.executor_           = creat_executor(2000)
            tsk.T_.tsk0022.executor_           = creat_executor(2000)
                tsk.T_.tsk002.executor_        = creat_executor(3000)


            tsk.T_.tsk001.$sdfs_.forEach(tsk=> {
                tsk.executor_  = creat_executor(2000)
            });
                tsk.T_.tsk001.executor_         = creat_executor(3000)


                tsk.T_.tsk000.executor_         = creat_executor(3000)

                      tsk.T_.tsk00.executor_    = creat_executor(4000)
                           tsk.executor_        =(rtrn,thrw,self) => {
                                rtrn(self.$sdfs_.map(nd=>nd.rslt_))
                           }

            ////

            var p = evt.wrap.try_until_succ(tsk)

        /*
        tsk000 started at 2021-12-17T06:27:20.933Z
        tsk000 failed at 2021-12-17T06:27:23.934Z              //------------>
        tsk000 started at 2021-12-17T06:27:23.946Z             //AUTO recover at FAILED node [tsk000]
        tsk000 succ at 2021-12-17T06:27:26.952Z
        tsk0010 started at 2021-12-17T06:27:26.959Z
        tsk0011 started at 2021-12-17T06:27:26.962Z
        tsk0012 started at 2021-12-17T06:27:26.966Z
        tsk0010 succ at 2021-12-17T06:27:28.963Z
        tsk0011 succ at 2021-12-17T06:27:28.966Z
        tsk0012 failed at 2021-12-17T06:27:28.969Z            //------------>
        tsk0012 started at 2021-12-17T06:27:28.971Z           //AUTO recover at FAILED node [tsk0012]
        tsk0012 succ at 2021-12-17T06:27:30.976Z
        tsk001 started at 2021-12-17T06:27:30.977Z
        tsk001 succ at 2021-12-17T06:27:33.984Z
        tsk0020 started at 2021-12-17T06:27:33.989Z
        tsk0021 started at 2021-12-17T06:27:33.993Z
        tsk0022 started at 2021-12-17T06:27:33.995Z
        tsk0020 succ at 2021-12-17T06:27:35.996Z
        tsk0021 succ at 2021-12-17T06:27:35.997Z
        tsk0022 failed at 2021-12-17T06:27:36.003Z             //------------>
        tsk0022 started at 2021-12-17T06:27:36.006Z            //AUTO recover at FAILED node [tsk0022]
        tsk0022 succ at 2021-12-17T06:27:38.010Z
        tsk002 started at 2021-12-17T06:27:38.011Z
        tsk002 succ at 2021-12-17T06:27:41.015Z
        tsk00 started at 2021-12-17T06:27:41.016Z
        tsk00 failed at 2021-12-17T06:27:45.023Z              //------------>
        tsk00 started at 2021-12-17T06:27:45.025Z            //AUTO recover at FAILED node [tsk00]
        tsk00 succ at 2021-12-17T06:27:49.030Z

        */


        /*
        > p
        Promise {
          [
            Symbol(noexist), 'tsk00',
            'tsk000',        'tsk001',
            'tsk0010',       'tsk0011',
            'tsk0012',       'tsk002',
            'tsk0020',       'tsk0021',
            'tsk0022'
          ],
          [Symbol(async_id_symbol)]: 99,
          [Symbol(trigger_async_id_symbol)]: 5,
          [Symbol(destroyed)]: { destroyed: false }
        }
        >

        */



### load\_from\_json
- see [APIS.load\_from\_json](#APIS) for format-detail



PERFORMANCE TEST
================

      //now we try a big-task-tree of 500000 task-nodes to test the performance
      //   coz nv-task-event-tree is pure JS,so its performance NOT good enough

      //接下来我们准备一个巨大的 任务树 来测试下巨量异步任务的performance
      //   因为nv-task-event-tree 是纯JS实现的,所以它的performance一般般
      //   主要是内存耗费比较大(为了提速,使用了一些耗费内存的技巧)

      const {rand} = require("nv-random-tree")

      //准备一个随机产生异步任务的工厂

        function creat_executor(delay) {
            let _f = (rtrn,thrw,self)=> {
                setTimeout(
                    ()=> {
                         rtrn(self.name_)
                    },
                    delay
                )
           }
           return(_f)
        }

       //creat 500000 task,each task have max-of-50 child-task 
       //创建任务树，大小为500000, 每个任务最多50个子任务节点

       var big_task_tree = rand(50,500000,undefined,evt.Task,2)

        /*
        > big_task_tree.$sdfs_.length
        500000
        >
        */


        big_task_tree.enable_promise()


        big_task_tree.$sdfs_.forEach(
            (nd,i)=> {
                nd.name_ = `tsk${i}`;
                let rand_type = (Math.random() >0.5)
                if(rand_type) {                       //随机生成 串行 或 并行 节点
                    nd.set_as_serial()
                } else {
                    nd.set_as_parallel()
                }
                nd.executor_ = creat_executor(Math.random()*2)  //每个任务延时 1-2 毫秒
            }
        );

         
        //you can see ,we have 62789 serial-task, 62454 is_parallel task, 374757 leaf-task 
        //总计 62789 个串行任务, 62454个并行任务,374757个叶子任务

        /*

        > big_task_tree.$sdfs_.filter(nd=>nd.$is_leaf()).length
        374757
        > big_task_tree.$sdfs_.filter(nd=>nd.is_serial() && !nd.$is_leaf()).length
        62789
        > big_task_tree.$sdfs_.filter(nd=>nd.is_parallel() && !nd.$is_leaf()).length
        62454
        >
        */

        /*
         87698 root      20   0 1005916 413616  33404 S  0.0 20.5   0:11.73 node
         
        > process.memoryUsage()
        {
          rss: 423542784,
          heapTotal: 381763584,
          heapUsed: 358841448,                        // about 350M memory for 500000 nodes
          external: 1066990,
          arrayBuffers: 24792
        }
        >
        */


        async function tst() {
            let start = new Date();
            let start_ms = start.getTime()
            console.log('begin at :',start);
            ////
            await big_task_tree.launch();
            ////
            let end = new Date();
            let end_ms = end.getTime()
            console.log('end at: ',end);
            console.log("costed: ", end_ms-start_ms,'ms')
        }


        > big_task_tree.p_
        Promise {
          <pending>,
          [Symbol(async_id_symbol)]: 51,
          [Symbol(trigger_async_id_symbol)]: 5,
          [Symbol(destroyed)]: { destroyed: false }
        }
        >

        tst()



        /*
        > tst()
        begin at : 2021-12-17T10:36:42.526Z
        Promise {
          <pending>,
          [Symbol(async_id_symbol)]: 171,
          [Symbol(trigger_async_id_symbol)]: 5,
          [Symbol(destroyed)]: { destroyed: false }
        }
        */

        //you can observe the current state with .running_  AND .rejected_at_
        //可以使用 .running_  和 .rejected_at_ 在任务树运行过程中观察


        /*
        > big_task_tree.running_
        Set(2) {
          Task [tsk328374 : self_executing] {},
          Task [tsk328488 : self_executing] {}
        }
        > big_task_tree.running_
        Set(16) {
          Task [tsk330086 : self_executing] {},
          Task [tsk330100 : self_executing] {},
          Task [tsk330102 : self_executing] {},
          Task [tsk330105 : self_executing] {},
          Task [tsk330111 : self_executing] {},
          Task [tsk330120 : self_executing] {},
          Task [tsk330122 : self_executing] {},
          Task [tsk330126 : self_executing] {},
          Task [tsk330134 : self_executing] {},
          Task [tsk330138 : self_executing] {},
          Task [tsk330144 : self_executing] {},
          Task [tsk330149 : self_executing] {},
          Task [tsk330157 : self_executing] {},
          Task [tsk330160 : self_executing] {},
          Task [tsk330161 : self_executing] {},
          Task [tsk330166 : self_executing] {}
        }
        .......
        */



        /*
        > end at:  2021-12-17T10:37:07.224Z
        costed:  24698 ms

        > big_task_tree.p_
        Promise {
          'tsk0',
          [Symbol(async_id_symbol)]: 51,
          [Symbol(trigger_async_id_symbol)]: 5,
          [Symbol(destroyed)]: { destroyed: false }
        }
        >
        > big_task_tree.$sdfs_
        [
          Task [tsk0 : resolved] {},
          Task [tsk1 : resolved] {},
          .....
          Task [tsk98 : resolved] {},
          Task [tsk99 : resolved] {},
          ... 499900 more items
        ]
        >
        */


        !!!!IMPORTANT!!!!
        //you can get the blue_print back for topology AND reusing
        //可以使用.unparse() 来获取blue_print
        var blue_print = big_task_tree.unparse()
        

        /* 
                > bp
                '{\n' +
                  '    {\n' +
                  '        (\n' +
                  '            (\n' +
                  '                (\n' +
                  '                    (\n' +
                  '                        (\n' +
                  '                            [tsk7]\n' +
                  '                        )-> [tsk6]-> \n' +
                  '                        (\n' +
                  '                            {\n' +
                  '                                (\n' +
                  '                                    {\n' +
                  '                                        (\n' +
                  '                                            [tsk13]-> \n' +
                  '                                            [tsk14]-> \n' +
                  '                                            [tsk15]-> \n' +
                  '                                            [tsk16]-> \n' +
                  '                                            [tsk17]-> \n' +
                  '                                            [tsk18]-> \n' +
                  '                                            [tsk19]\n' +
                  '                                        )-> [tsk12]        -| \n' +
                  '                                        {\n' +
                  '                                            [tsk21]    -| \n' +
                  '                                            [tsk22]    -| \n' +
                  '                                            [tsk23]    -| \n' +
                  '                                        }-> [tsk20]        -| \n' +
                  ...........

          */

      

### dump

     // .unparse() can ONLY get the topology(blue_print) BACK
     // .unparse() 只能拿回topology(blue_print)


     //if you need full info(conder,executor,props..., task-node-type,) BACK
     // USE .dump()
     // 如果需要详细的全部现场,使用 .dump()

     //dumped JSON could be reload by evt.load_from_json(J)

            > var J = big_task_tree.dump()

            /*
                  .....
                  [Object],    [Array],     'tsk495452', [Object],    [Array],
                  'tsk495495', [Object],    [Array],     'tsk495525', [Object],
                  [Array],     'tsk495533', [Object],    'tsk495534', [Object],
                  [Array],     'tsk495556', [Object],    [Array],     'tsk495572',
                  [Object],    [Array],     'tsk495605', [Object],    'tsk495606',
                  [Object],    [Array],     'tsk495615', [Object],    [Array],
                  'tsk495650', [Object],    'tsk495651', [Object],    'tsk495652',
                  [Object],    [Array],     'tsk495672', [Object],    [Array],
                  'tsk495688', [Object],    [Array],     'tsk495717', [Object],
                  [Array],     'tsk495737', [Object],    [Array],     'tsk495769',
                  [Object],    [Array],     'tsk495817', [Object],    [Array],
                  'tsk495823', [Object],    [Array],     'tsk495839', [Object],
                  'tsk495840', [Object],    [Array],     'tsk495876', [Object],
                  [Array],     'tsk495916', [Object],    [Array],     'tsk495949',
                  [Object],    [Array],     'tsk495983', [Object],    'tsk495984',
                  ... 33 more items
                ],
                'tsk496189',
                {
                  type: '1',
                  enable_promise: false,
                  conder: [Function: DFLT_CU_CONDER],
                  executor: [Function: _f],
                  args_dict: {}
                },
                ... 30 more items
              ]
            ]
            >
            */


            big_task_tree.soft_reset()



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
