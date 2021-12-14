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

tsk.pause()

/*
> var p = tsk.launch()
tsk000 started at 2021-12-14T12:54:55.722Z
undefined
> tsk000 succ at 2021-12-14T12:54:58.726Z
tsk0010 started at 2021-12-14T12:54:58.726Z

> p.pause()
Uncaught TypeError: p.pause is not a function
> tsk0010 succ at 2021-12-14T12:55:00.729Z
tsk0011 started at 2021-12-14T12:55:00.732Z

> tsk0011 succ at 2021-12-14T12:55:02.735Z
tsk0012 started at 2021-12-14T12:55:02.736Z
tsk0012 succ at 2021-12-14T12:55:04.741Z
tsk001 started at 2021-12-14T12:55:04.744Z
tsk001 succ at 2021-12-14T12:55:07.749Z
tsk0020 started at 2021-12-14T12:55:07.749Z

> tsk0020 succ at 2021-12-14T12:55:09.752Z
tsk0021 started at 2021-12-14T12:55:09.752Z
tsk0021 succ at 2021-12-14T12:55:11.756Z
tsk0022 started at 2021-12-14T12:55:11.759Z

> tsk.pause()
Set(1) { Task [tsk0022 : self_paused] {} }
> tsk0022 succ at 2021-12-14T12:55:13.760Z

> tsk.$sdfs_
[
  Task [@root@ : bubble_paused] {},
  Task [tsk00 : bubble_paused] {},
  Task [tsk000 : resolved] {},
  Task [tsk001 : resolved] {},
  Task [tsk0010 : resolved] {},
  Task [tsk0011 : resolved] {},
  Task [tsk0012 : resolved] {},
  Task [tsk002 : bubble_paused] {},
  Task [tsk0020 : resolved] {},
  Task [tsk0021 : resolved] {},
  Task [tsk0022 : self_paused] {}
]
> tsk.show()
(
    (
        [tsk000 : resolved]->
        (
            [tsk0010 : resolved]->
            [tsk0011 : resolved]->
            [tsk0012 : resolved]
        )-> [tsk001 : resolved]->
        (
            [tsk0020 : resolved]->
            [tsk0021 : resolved]->
            [tsk0022 : self_paused]
        )-> [tsk002 : bubble_paused]
    )-> [tsk00 : bubble_paused]
)-> [@root@ : bubble_paused]

*/

/*
// recover is for rejected , paused SHOULD use continue
> tsk.recover()
Uncaught TypeError: curr?.is_self_rejected is not a function
    at Task.recover (/opt/JS/NV5_/nvtsk-/pkgs/nv-task-event/pkgs/nv-task-event-tree/task.js:162:30)
>

*/

> tsk.running_                               //this is for paused
Set(1) { Task [tsk0022 : self_paused] {} }
>
> tsk.stucked_at_              //this is for rejected
Symbol(noexist)
>


