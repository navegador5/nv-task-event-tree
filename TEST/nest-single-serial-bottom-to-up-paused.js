const evt = require("nv-task-event-tree");


var J = [
    'tsk00',[
        'tsk000',[
            'tsk0000',[
                'tsk00000'
            ]
        ]
    ]
]

var tsk = evt.load_from_json(J)

/*
> tsk.show()
(
    (
        (
            (
                [tsk00000 : ready]
            )-> [tsk0000 : ready]
        )-> [tsk000 : ready]
    )-> [tsk00 : ready]
)-> [@root@ : ready]
undefined
>
*/

function creat_executor(delay,fail=false) {
    let _f = (rtrn,thrw,self)=> {
        console.log(self.name_,'started at',new Date())
        setTimeout(
            ()=> {
                console.log(self.name_,'succ at',new Date());
                if(fail) {
                    thrw(self.name_)
                } else {
                    rtrn(self.name_)
                }
            },
            delay
        )
   }
   return(_f)
}





tsk.T_.tsk00000.executor_                  = creat_executor(2000,false)
    tsk.T_.tsk0000.executor_               = creat_executor(2000,false)
        tsk.T_.tsk000.executor_            = creat_executor(3000,false)
            tsk.T_.tsk00.executor_         = creat_executor(4000,false)
                 tsk.executor_             = (rtrn,thrw,self) => {
                         rtrn(self.$sdfs_.map(nd=>nd.rslt_))
                 }

evt.debug(false)
var p = tsk.launch()

tsk.pause()

/*
> var p = tsk.launch()
tsk00000 started at 2021-12-14T11:14:14.453Z
undefined
> tsk00000 succ at 2021-12-14T11:14:16.458Z
tsk0000 started at 2021-12-14T11:14:16.459Z
tsk0000 succ at 2021-12-14T11:14:18.462Z
tsk000 started at 2021-12-14T11:14:18.463Z

> tsk.pause()
Set(1) { Task [tsk000 : self_paused] {} }
> tsk000 succ at 2021-12-14T11:14:21.466Z      
           //ignore this, the exec-node already be replaced
           //this will have no effect
> tsk.$sdfs_
[
  Task [@root@ : bubble_paused] {},
  Task [tsk00 : bubble_paused] {},
  Task [tsk000 : self_paused] {},
  Task [tsk0000 : resolved] {},
  Task [tsk00000 : resolved] {}
]
>

*/

tsk.running_
/*
> 
Set(1) { Task [tsk000 : self_paused] {} }
>

*/


> p
Promise {
  <pending>,
  [Symbol(async_id_symbol)]: 39,
  [Symbol(trigger_async_id_symbol)]: 5,
  [Symbol(destroyed)]: { destroyed: false }
}

/*
//---paused must use continue-or-carryon  can NOT use recover 
//---recover is for rejected
> tsk.recover()
Uncaught TypeError: curr?.is_self_rejected is not a function
    at Task.recover (/opt/JS/NV5_/nvtsk-/pkgs/nv-task-event/pkgs/nv-task-event-tree/task.js:162:30)
>
*/

> tsk.continue()
tsk000 started at 2021-12-14T12:00:18.585Z
Set(1) { Task [tsk000 : self_executing] {} }
>
> tsk000 succ at 2021-12-14T12:00:21.589Z
tsk00 started at 2021-12-14T12:00:21.593Z

> p
Promise {
  <pending>,
  [Symbol(async_id_symbol)]: 39,
  [Symbol(trigger_async_id_symbol)]: 5,
  [Symbol(destroyed)]: { destroyed: false }
}
> tsk00 succ at 2021-12-14T12:00:25.598Z

> p
Promise {
  [ Symbol(noexist), 'tsk00', 'tsk000', 'tsk0000', 'tsk00000' ],
  [Symbol(async_id_symbol)]: 39,
  [Symbol(trigger_async_id_symbol)]: 5,
  [Symbol(destroyed)]: { destroyed: false }
}
>
> tsk.soft_reset()
Task [@root@ : ready] {}
>

