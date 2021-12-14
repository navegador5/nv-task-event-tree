const evt = require("nv-task-event");


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
        tsk.T_.tsk000.executor_            = creat_executor(3000,true)
            tsk.T_.tsk00.executor_         = creat_executor(4000,false)
                 tsk.executor_             = (rtrn,thrw,self) => {
                         rtrn(self.$sdfs_.map(nd=>nd.rslt_))
                 }

evt.debug(false)
var p = tsk.launch()


/*
> var p = tsk.launch()
tsk00000 started at 2021-12-14T10:18:30.686Z
undefined
> tsk00000 succ at 2021-12-14T10:18:32.691Z
tsk0000 started at 2021-12-14T10:18:32.698Z

> tsk0000 succ at 2021-12-14T10:18:34.704Z
tsk000 started at 2021-12-14T10:18:34.710Z

> tsk000 fail at 2021-12-14T10:18:37.718Z
Uncaught 'tsk000'
> p
Promise {
  <rejected> 'tsk000',
  [Symbol(async_id_symbol)]: 39,
  [Symbol(trigger_async_id_symbol)]: 5,
  [Symbol(destroyed)]: { destroyed: false }
}
> tsk.show()
/*
(
    (
        (
            (
                [tsk00000 : resolved]
            )-> [tsk0000 : resolved]
        )-> [tsk000 : self_rejected]
    )-> [tsk00 : bubble_rejected]
)-> [@root@ : bubble_rejected]

*/


> tsk.stucked_at_
Task [tsk000 : self_rejected] {}
>

tsk.T_.tsk000.executor_            = creat_executor(3000,false)

/*
> tsk.$sdfs_
[
  Task [@root@ : bubble_rejected] {},
  Task [tsk00 : bubble_rejected] {},
  Task [tsk000 : self_rejected] {},
  Task [tsk0000 : resolved] {},
  Task [tsk00000 : resolved] {}
]
*/
var np = tsk.recover()

/*
tsk000 started at 2021-12-14T10:40:52.886Z
undefined
> np
Promise {
  <pending>,
  [Symbol(async_id_symbol)]: 397,
  [Symbol(trigger_async_id_symbol)]: 5,
  [Symbol(destroyed)]: { destroyed: false }
}
> tsk000 succ at 2021-12-14T10:40:55.890Z
tsk00 started at 2021-12-14T10:40:55.894Z

> tsk00 succ at 2021-12-14T10:40:59.900Z

> np
Promise {
  [ Symbol(noexist), 'tsk00', 'tsk000', 'tsk0000', 'tsk00000' ],
  [Symbol(async_id_symbol)]: 397,
  [Symbol(trigger_async_id_symbol)]: 5,
  [Symbol(destroyed)]: { destroyed: false }
}
> tsk
Task [@root@ : resolved] {}
>
*/
