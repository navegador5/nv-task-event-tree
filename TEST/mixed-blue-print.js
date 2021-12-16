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
 *        {...}        means parallel task, it will start children at the same time,similiar to Promise.all
 *        (...)        means serial task,   it will start in DFS-sequence, similar to html-traverse sequence
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
 *     最后最顶层的[@root@](默认生成的) 会返回一个promise
 *
 */


var tsk = evt.load_from_blue_print(bp)


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
           tsk.executor_         = (rtrn,thrw,self) => {
                rtrn(self.$sdfs_.map(nd=>nd.rslt_))       //根节点上采集所有任务结果用来观察
           }     


//启动任务

var p = tsk.launch();


tsk000 started at 2021-12-16T09:31:33.985Z
tsk000 succ at 2021-12-16T09:31:38.993Z
tsk0010 started at 2021-12-16T09:31:38.995Z
tsk0011 started at 2021-12-16T09:31:38.995Z
tsk0012 started at 2021-12-16T09:31:38.996Z

// 执行过程中使用tsk.show() 观察节点任务执行状态
//      如果任务节点特别多不要使用 tsk.show(),console会很卡,因为会展开整棵任务树
//                        应该使用 tsk.T_[task-name].show(),只展开子树
//                        同时使用 tsk.T_[task-name].$ances_.forEach(pr=>pr.show()),来观察 父祖节点状态
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

