const evt = require("nv-task-event-tree");

var J = [
    'tsk00',{type:'serial'},[
        'tsk000',[
        ],
        'tsk001',{type:'serial'},[
            'tsk0010',
            'tsk0011',
            'tsk0012',
        ],
        'tsk002',{type:'serial'},[
            'tsk0020',
            'tsk0021',
            'tsk0022'
        ]
    ]
]



var tsk = evt.load_from_json(J)

/*

> tsk.show()
(
    (
        [tsk000 : ready]->
        (
            [tsk0010 : ready]->
            [tsk0011 : ready]->
            [tsk0012 : ready]
        )-> [tsk001 : ready]->
        (
            [tsk0020 : ready]->
            [tsk0021 : ready]->
            [tsk0022 : ready]
        )-> [tsk002 : ready]
    )-> [tsk00 : ready]
)-> [@root@ : ready]

*/

function creat_executor(delay,fail=false) {
    let _f = (rtrn,thrw,self)=> {
        console.log(self.name_,'started at',new Date())
        setTimeout(
            ()=> {
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

tsk.T_.tsk0020.executor_           = creat_executor(2000,false)
tsk.T_.tsk0021.executor_           = creat_executor(2000,true)
tsk.T_.tsk0022.executor_           = creat_executor(2000,false)
    tsk.T_.tsk002.executor_        = creat_executor(3000,false)


tsk.T_.tsk001.$sdfs_.forEach(tsk=> {
    tsk.executor_  = creat_executor(2000,false)
});
    tsk.T_.tsk001.executor_         = creat_executor(3000,true)


    tsk.T_.tsk000.executor_         = creat_executor(3000,false)

          tsk.T_.tsk00.executor_    = creat_executor(4000,false)
               tsk.executor_        =(rtrn,thrw,self) => {
                    rtrn(self.$sdfs_.map(nd=>nd.rslt_))
               }

evt.debug(false)
var p = tsk.launch()

/*
tsk000 started at 2021-12-14T12:13:17.588Z
undefined
> p
Promise {
  <pending>,
  [Symbol(async_id_symbol)]: 51,
  [Symbol(trigger_async_id_symbol)]: 5,
  [Symbol(destroyed)]: { destroyed: false }
}
> tsk000 succ at 2021-12-14T12:13:20.591Z
tsk0010 started at 2021-12-14T12:13:20.594Z

> tsk0010 succ at 2021-12-14T12:13:22.597Z
tsk0011 started at 2021-12-14T12:13:22.602Z
tsk0011 succ at 2021-12-14T12:13:24.608Z
tsk0012 started at 2021-12-14T12:13:24.609Z
tsk0012 succ at 2021-12-14T12:13:26.612Z
tsk001 started at 2021-12-14T12:13:26.616Z
tsk001 succ at 2021-12-14T12:13:29.624Z
Uncaught 'tsk001'
> p
Promise {
  <rejected> 'tsk001',
  [Symbol(async_id_symbol)]: 51,
  [Symbol(trigger_async_id_symbol)]: 5,
  [Symbol(destroyed)]: { destroyed: false }
}
> tsk
Task [@root@ : bubble_rejected] {}
> tsk.rejected_at_
Task [tsk001 : self_rejected] {}

*/


> tsk
Task [@root@ : bubble_rejected] {}   //bubble-propagated-reject from src: tsk001 
 
> tsk.rejected_at_                   //the reject src: tsk001
Task [tsk001 : self_rejected] {}


tsk.T_.tsk001.executor_         = creat_executor(3000,false)
var np = tsk.recover()

/*
tsk001 started at 2021-12-14T12:16:23.126Z
undefined
> np
Promise {
  <pending>,
  [Symbol(async_id_symbol)]: 358,
  [Symbol(trigger_async_id_symbol)]: 5,
  [Symbol(destroyed)]: { destroyed: false }
}
> tsk001 succ at 2021-12-14T12:16:26.128Z
tsk0020 started at 2021-12-14T12:16:26.134Z
tsk0020 succ at 2021-12-14T12:16:28.141Z
tsk0021 started at 2021-12-14T12:16:28.145Z

> tsk0021 succ at 2021-12-14T12:16:30.153Z
Uncaught 'tsk0021'
> np
Promise {
  <rejected> 'tsk0021',
  [Symbol(async_id_symbol)]: 358,
  [Symbol(trigger_async_id_symbol)]: 5,
  [Symbol(destroyed)]: { destroyed: false }
}
>

*/

tsk.T_.tsk0021.executor_           = creat_executor(2000,false)
var np2 = tsk.recover()

/*
> var np2 = tsk.recover()
tsk0021 started at 2021-12-14T12:17:37.591Z
undefined
> tsk0021 succ at 2021-12-14T12:17:39.596Z
tsk0022 started at 2021-12-14T12:17:39.597Z
tsk0022 succ at 2021-12-14T12:17:41.601Z
tsk002 started at 2021-12-14T12:17:41.602Z

> tsk002 succ at 2021-12-14T12:17:44.606Z
tsk00 started at 2021-12-14T12:17:44.609Z

> tsk00 succ at 2021-12-14T12:17:48.613Z

> np2
Promise {
  [
    Symbol(noexist), 'tsk00',
    'tsk000',        'tsk001',
    'tsk0010',       'tsk0011',
    'tsk0012',       'tsk002',
    'tsk0020',       'tsk0021',
    'tsk0022'
  ],
  [Symbol(async_id_symbol)]: 410,
  [Symbol(trigger_async_id_symbol)]: 5,
  [Symbol(destroyed)]: { destroyed: false }
}
> tsk.soft_reset()
Task [@root@ : ready] {}
>

*/

