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


tsk.executor_                   = creat_executor(2000)


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
tsk.T_.tsk5.conder_             = evt.ELSE                                   //ELSE have no conder-param
tsk.T_.tsk5.executor_           = creat_executor(2000)



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
undefined
> tsk.$sdfs_.map(nd=>nd.conder_)
[
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
  Task [@root@ : ready] {},
  Task [tsk0 : ready] { param: 0 },
  Task [tsk1 : ready] { param: 1 },
  Task [tsk2 : ready] { param: 2 },
  Task [tsk3 : ready] { param: 3 },
  Task [tsk4 : ready] { param: 3 },
  Task [tsk5 : ready] { param: 3 }
]
>

*/


var p = tsk.launch()


/*
> var p = tsk.launch()
tsk0 started conder at 2021-12-16T03:20:49.570Z
undefined
> tsk.show()
(
    [tsk0 : conding]->
    [tsk1 : ready]->
    [tsk2 : ready]->
    [tsk3 : ready]->
    [tsk4 : ready]->
    [tsk5 : ready]
)-> [@root@ : opened]
undefined
> tsk0 finish conder at 2021-12-16T03:20:59.578Z
tsk1 started conder at 2021-12-16T03:20:59.586Z

> tsk.show()
(
    [tsk0 : impossible]->
    [tsk1 : conding]->
    [tsk2 : ready]->
    [tsk3 : ready]->
    [tsk4 : ready]->
    [tsk5 : ready]
)-> [@root@ : opened]
undefined
> tsk1 finish conder at 2021-12-16T03:21:09.594Z
tsk2 started conder at 2021-12-16T03:21:09.597Z

> tsk.show()
(
    [tsk0 : impossible]->
    [tsk1 : impossible]->
    [tsk2 : conding]->
    [tsk3 : ready]->
    [tsk4 : ready]->
    [tsk5 : ready]
)-> [@root@ : opened]
undefined
> tsk2 finish conder at 2021-12-16T03:21:19.608Z
tsk3 started conder at 2021-12-16T03:21:19.614Z

> tsk.show()
(
    [tsk0 : impossible]->
    [tsk1 : impossible]->
    [tsk2 : impossible]->
    [tsk3 : conding]->
    [tsk4 : ready]->
    [tsk5 : ready]
)-> [@root@ : opened]
undefined
> tsk3 finish conder at 2021-12-16T03:21:29.618Z
tsk3 started at 2021-12-16T03:21:29.621Z
tsk3 succ at 2021-12-16T03:21:31.624Z
> tsk.show()

(
    [tsk0 : impossible]->
    [tsk1 : impossible]->
    [tsk2 : impossible]->
    [tsk3 : resolved]->
    [tsk4 : impossible]->
    [tsk5 : impossible]
)-> [@root@ : resolved]
undefined
>
.....

@root@ started at 2021-12-16T03:25:33.613Z
@root@ succ at 2021-12-16T03:25:35.616Z




*/

/*
> p
Promise {
  '@root@',
  [Symbol(async_id_symbol)]: 565,
  [Symbol(trigger_async_id_symbol)]: 5,
  [Symbol(destroyed)]: { destroyed: false }
}
> tsk
Task [@root@ : resolved] {}
> tsk.show()
(
    [tsk0 : impossible]->
    [tsk1 : impossible]->
    [tsk2 : impossible]->
    [tsk3 : resolved]->
    [tsk4 : impossible]->
    [tsk5 : impossible]
)-> [@root@ : resolved]

*/



