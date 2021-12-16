const evt = require("nv-task-event-tree");

var J = ['tsk0','tsk1','tsk2','tsk3','tsk4','tsk5']


var tsk = evt.load_from_json(J)

/*
> tsk.show()
(
    [tsk0 : ready]->
    [tsk1 : ready]->
    [tsk2 : ready]->
    [tsk3 : ready]->
    [tsk4 : ready]->
    [tsk5 : ready]
)-> [@root@ : ready]

*/

function creat_conder(delay) {
    let _f = (rtrn_tru,rtrn_fls,self)=> {
        console.log(self.name_,'started conder at',new Date())
        setTimeout(
            ()=> {
                console.log(self.name_,'finish conder at',new Date(),self.count)
                if(self.count < 3) {
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
                self.count = self.count +1
                rtrn(self.name_)
            },
            delay
        )
   }
   return(_f)
}


tsk.executor_                   = creat_executor(2000)


tsk.T_.tsk0.count               = 0
tsk.T_.tsk0.conder_             = evt.WHILE(creat_conder(1000))
tsk.T_.tsk0.executor_           = creat_executor(2000)

tsk.T_.tsk1.count               = 1
tsk.T_.tsk1.conder_             = evt.WHILE(creat_conder(1000))
tsk.T_.tsk1.executor_           = creat_executor(2000)


tsk.T_.tsk2.count               = 2
tsk.T_.tsk2.conder_             = evt.WHILE(creat_conder(1000))
tsk.T_.tsk2.executor_           = creat_executor(2000)


tsk.T_.tsk3.count               = 0
tsk.T_.tsk3.conder_             = evt.WHILE(creat_conder(1000))
tsk.T_.tsk3.executor_           = creat_executor(2000)


tsk.T_.tsk4.count               = 1
tsk.T_.tsk4.conder_             = evt.WHILE(creat_conder(1000))
tsk.T_.tsk4.executor_           = creat_executor(2000)


tsk.T_.tsk5.count               = 2
tsk.T_.tsk5.conder_             = evt.WHILE(creat_conder(1000))
tsk.T_.tsk5.executor_           = creat_executor(2000)





var p = tsk.launch()


/*
tsk0 started conder at 2021-12-16T07:34:19.648Z
undefined
> tsk0 finish conder at 2021-12-16T07:34:20.650Z 0
tsk0 started at 2021-12-16T07:34:20.656Z
tsk0 succ at 2021-12-16T07:34:22.665Z
tsk0 started conder at 2021-12-16T07:34:22.674Z
tsk0 finish conder at 2021-12-16T07:34:23.679Z 1
tsk0 started at 2021-12-16T07:34:23.680Z
tsk0 succ at 2021-12-16T07:34:25.683Z
tsk0 started conder at 2021-12-16T07:34:25.684Z
tsk0 finish conder at 2021-12-16T07:34:26.686Z 2
tsk0 started at 2021-12-16T07:34:26.687Z
tsk0 succ at 2021-12-16T07:34:28.690Z
tsk0 started conder at 2021-12-16T07:34:28.695Z
tsk0 finish conder at 2021-12-16T07:34:29.699Z 3
tsk1 started conder at 2021-12-16T07:34:29.700Z
tsk1 finish conder at 2021-12-16T07:34:30.704Z 1
tsk1 started at 2021-12-16T07:34:30.708Z
tsk1 succ at 2021-12-16T07:34:32.713Z
tsk1 started conder at 2021-12-16T07:34:32.715Z
tsk1 finish conder at 2021-12-16T07:34:33.720Z 2
tsk1 started at 2021-12-16T07:34:33.721Z
tsk1 succ at 2021-12-16T07:34:35.725Z
tsk1 started conder at 2021-12-16T07:34:35.727Z
tsk1 finish conder at 2021-12-16T07:34:36.729Z 3
tsk2 started conder at 2021-12-16T07:34:36.729Z
tsk2 finish conder at 2021-12-16T07:34:37.732Z 2
tsk2 started at 2021-12-16T07:34:37.733Z
tsk2 succ at 2021-12-16T07:34:39.736Z
tsk2 started conder at 2021-12-16T07:34:39.737Z
tsk2 finish conder at 2021-12-16T07:34:40.754Z 3
tsk3 started conder at 2021-12-16T07:34:40.756Z
tsk3 finish conder at 2021-12-16T07:34:41.760Z 0
tsk3 started at 2021-12-16T07:34:41.761Z
tsk3 succ at 2021-12-16T07:34:43.765Z
tsk3 started conder at 2021-12-16T07:34:43.766Z
tsk3 finish conder at 2021-12-16T07:34:44.769Z 1
tsk3 started at 2021-12-16T07:34:44.771Z
tsk3 succ at 2021-12-16T07:34:46.773Z
tsk3 started conder at 2021-12-16T07:34:46.774Z
tsk3 finish conder at 2021-12-16T07:34:47.777Z 2
tsk3 started at 2021-12-16T07:34:47.778Z
tsk3 succ at 2021-12-16T07:34:49.782Z
tsk3 started conder at 2021-12-16T07:34:49.786Z
tsk3 finish conder at 2021-12-16T07:34:50.791Z 3
tsk4 started conder at 2021-12-16T07:34:50.795Z
tsk4 finish conder at 2021-12-16T07:34:51.800Z 1
tsk4 started at 2021-12-16T07:34:51.801Z
tsk4 succ at 2021-12-16T07:34:53.804Z
tsk4 started conder at 2021-12-16T07:34:53.805Z
tsk4 finish conder at 2021-12-16T07:34:54.807Z 2
tsk4 started at 2021-12-16T07:34:54.809Z
tsk4 succ at 2021-12-16T07:34:56.814Z
tsk4 started conder at 2021-12-16T07:34:56.815Z
tsk4 finish conder at 2021-12-16T07:34:57.819Z 3
tsk5 started conder at 2021-12-16T07:34:57.823Z
tsk5 finish conder at 2021-12-16T07:34:58.828Z 2
tsk5 started at 2021-12-16T07:34:58.829Z
tsk5 succ at 2021-12-16T07:35:00.832Z
tsk5 started conder at 2021-12-16T07:35:00.838Z
tsk5 finish conder at 2021-12-16T07:35:01.844Z 3
@root@ started at 2021-12-16T07:35:01.850Z
@root@ succ at 2021-12-16T07:35:03.854Z
*/


tsk.soft_reset()

tsk.$sdfs_.forEach(nd=>nd.count=0)



