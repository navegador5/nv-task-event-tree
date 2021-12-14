
const evt = require("nv-task-event-tree");

var J = [
    'tsk00',{type:'parallel'},[
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
tsk.T_.tsk0021.executor_           = creat_executor(2000,false)
tsk.T_.tsk0022.executor_           = creat_executor(2000,false)
    tsk.T_.tsk002.executor_        = creat_executor(3000,false)


tsk.T_.tsk001.$sdfs_.forEach(tsk=> {
    tsk.executor_  = creat_executor(2000,false)
});
    tsk.T_.tsk001.executor_         = creat_executor(3000,false)


    tsk.T_.tsk000.executor_         = creat_executor(3000,false)

          tsk.T_.tsk00.executor_    = creat_executor(4000,false)
               tsk.executor_        =(rtrn,thrw,self) => {
                    rtrn(self.$sdfs_.map(nd=>nd.rslt_))
               }

evt.debug(false)
var p = tsk.launch()

tsk000 started at 2021-12-14T13:28:39.406Z
tsk0010 started at 2021-12-14T13:28:39.406Z
tsk0011 started at 2021-12-14T13:28:39.407Z
tsk0012 started at 2021-12-14T13:28:39.407Z
tsk0020 started at 2021-12-14T13:28:39.407Z
tsk0021 started at 2021-12-14T13:28:39.407Z
tsk0022 started at 2021-12-14T13:28:39.407Z
tsk0010 succ at 2021-12-14T13:28:41.410Z
tsk0011 succ at 2021-12-14T13:28:41.411Z
tsk0012 succ at 2021-12-14T13:28:41.411Z
tsk001 started at 2021-12-14T13:28:41.412Z
tsk0020 succ at 2021-12-14T13:28:41.412Z
tsk0021 succ at 2021-12-14T13:28:41.412Z
tsk0022 succ at 2021-12-14T13:28:41.413Z
tsk002 started at 2021-12-14T13:28:41.415Z
tsk000 succ at 2021-12-14T13:28:42.428Z


> tsk.pause()
Set(2) {
  Task [tsk001 : self_paused] {},
  Task [tsk002 : self_paused] {}
}
> tsk001 succ at 2021-12-14T13:28:44.413Z
tsk002 succ at 2021-12-14T13:28:44.418Z

/*
> tsk.$sdfs_
[
  Task [@root@ : bubble_paused] {},
  Task [tsk00 : bubble_paused] {},
  Task [tsk000 : resolved] {},
  Task [tsk001 : self_paused] {},
  Task [tsk0010 : resolved] {},
  Task [tsk0011 : resolved] {},
  Task [tsk0012 : resolved] {},
  Task [tsk002 : self_paused] {},
  Task [tsk0020 : resolved] {},
  Task [tsk0021 : resolved] {},
  Task [tsk0022 : resolved] {}
]
>
> tsk.show()
(
    {
        [tsk000 : resolved]             -|
        (
            [tsk0010 : resolved]->
            [tsk0011 : resolved]->
            [tsk0012 : resolved]
        )-> [tsk001 : self_paused]      -|
        (
            [tsk0020 : resolved]->
            [tsk0021 : resolved]->
            [tsk0022 : resolved]
        )-> [tsk002 : self_paused]      -|
    }-> [tsk00 : bubble_paused]
)-> [@root@ : bubble_paused]

*/

> tsk.running_
Set(2) {
  Task [tsk001 : self_paused] {},
  Task [tsk002 : self_paused] {}
}

> tsk.$sdfs_.map(r=>r.rslt_)
[
  Symbol(noexist), Symbol(noexist),
  'tsk000',        Symbol(noexist),
  'tsk0010',       'tsk0011',
  'tsk0012',       Symbol(noexist),
  'tsk0020',       'tsk0021',
  'tsk0022'
]
>

> tsk.is_paused()
true
> tsk.is_bubble_paused()
true
>


> tsk.continue()
tsk001 started at 2021-12-14T13:33:30.926Z
tsk002 started at 2021-12-14T13:33:30.927Z
Set(2) {
  Task [tsk001 : self_executing] {},
  Task [tsk002 : self_executing] {}
}
> tsk001 succ at 2021-12-14T13:33:33.932Z
tsk002 succ at 2021-12-14T13:33:33.933Z
tsk00 started at 2021-12-14T13:33:33.934Z
tsk00 succ at 2021-12-14T13:33:37.940Z

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
  [Symbol(async_id_symbol)]: 51,
  [Symbol(trigger_async_id_symbol)]: 5,
  [Symbol(destroyed)]: { destroyed: false }
}
>
