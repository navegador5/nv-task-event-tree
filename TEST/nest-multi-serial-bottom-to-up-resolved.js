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

evt.debug(false)
var p = tsk.launch()

/*
tsk000 started at 2021-12-14T07:32:33.617Z
undefined
> tsk000 succ at 2021-12-14T07:32:36.622Z
tsk0010 started at 2021-12-14T07:32:36.630Z
tsk0010 succ at 2021-12-14T07:32:38.635Z
tsk0011 started at 2021-12-14T07:32:38.638Z
tsk0011 succ at 2021-12-14T07:32:40.644Z
tsk0012 started at 2021-12-14T07:32:40.645Z
tsk0012 succ at 2021-12-14T07:32:42.650Z
tsk001 started at 2021-12-14T07:32:42.655Z
tsk001 succ at 2021-12-14T07:32:45.662Z
tsk0020 started at 2021-12-14T07:32:45.668Z
tsk0020 succ at 2021-12-14T07:32:47.674Z
tsk0021 started at 2021-12-14T07:32:47.677Z
tsk0021 succ at 2021-12-14T07:32:49.687Z
tsk0022 started at 2021-12-14T07:32:49.688Z
tsk0022 succ at 2021-12-14T07:32:51.690Z
tsk002 started at 2021-12-14T07:32:51.691Z
tsk002 succ at 2021-12-14T07:32:54.697Z
tsk00 started at 2021-12-14T07:32:54.701Z
tsk00 succ at 2021-12-14T07:32:58.707Z

> tsk
Task [@root@ : resolved] {}
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
  [Symbol(async_id_symbol)]: 50,
  [Symbol(trigger_async_id_symbol)]: 5,
  [Symbol(destroyed)]: { destroyed: false }
}
> tsk.$sdfs_
[
  Task [@root@ : resolved] {},
  Task [tsk00 : resolved] {},
  Task [tsk000 : resolved] {},
  Task [tsk001 : resolved] {},
  Task [tsk0010 : resolved] {},
  Task [tsk0011 : resolved] {},
  Task [tsk0012 : resolved] {},
  Task [tsk002 : resolved] {},
  Task [tsk0020 : resolved] {},
  Task [tsk0021 : resolved] {},
  Task [tsk0022 : resolved] {}
]
*/

tsk.soft_reset()

/*
Task [@root@ : ready] {}
*/

evt.debug(false)
var p = tsk.launch()


tsk.soft_reset()


/*
> tsk.$sdfs_tsk0020 succ at 2021-12-14T07:36:25.656Z
tsk0021 started at 2021-12-14T07:36:25.659Z

[
  Task [@root@ : opened] {},
  Task [tsk00 : opened] {},
  Task [tsk000 : resolved] {},
  Task [tsk001 : resolved] {},
  Task [tsk0010 : resolved] {},
  Task [tsk0011 : resolved] {},
  Task [tsk0012 : resolved] {},
  Task [tsk002 : opened] {},
  Task [tsk0020 : resolved] {},
  Task [tsk0021 : self_executing] {},
  Task [tsk0022 : ready] {}
]
> tsk.$sdfs_tsk0021 succ at 2021-12-14T07:36:27.676Z
tsk0022 started at 2021-12-14T07:36:27.677Z

[
  Task [@root@ : opened] {},
  Task [tsk00 : opened] {},
  Task [tsk000 : resolved] {},
  Task [tsk001 : resolved] {},
  Task [tsk0010 : resolved] {},
  Task [tsk0011 : resolved] {},
  Task [tsk0012 : resolved] {},
  Task [tsk002 : opened] {},
  Task [tsk0020 : resolved] {},
  Task [tsk0021 : resolved] {},
  Task [tsk0022 : self_executing] {}
]
> tsk.$sdfs_tsk0022 succ at 2021-12-14T07:36:29.680Z
tsk002 started at 2021-12-14T07:36:29.691Z

[
  Task [@root@ : opened] {},
  Task [tsk00 : opened] {},
  Task [tsk000 : resolved] {},
  Task [tsk001 : resolved] {},
  Task [tsk0010 : resolved] {},
  Task [tsk0011 : resolved] {},
  Task [tsk0012 : resolved] {},
  Task [tsk002 : self_executing] {},
  Task [tsk0020 : resolved] {},
  Task [tsk0021 : resolved] {},
  Task [tsk0022 : resolved] {}
]
> tsk.$sdfs_tsk002 succ at 2021-12-14T07:36:32.695Z
tsk00 started at 2021-12-14T07:36:32.698Z

[
  Task [@root@ : opened] {},
  Task [tsk00 : self_executing] {},
  Task [tsk000 : resolved] {},
  Task [tsk001 : resolved] {},
  Task [tsk0010 : resolved] {},
  Task [tsk0011 : resolved] {},
  Task [tsk0012 : resolved] {},
  Task [tsk002 : resolved] {},
  Task [tsk0020 : resolved] {},
  Task [tsk0021 : resolved] {},
  Task [tsk0022 : resolved] {}
]
> tsk.$sdfs_
[
  Task [@root@ : opened] {},
  Task [tsk00 : self_executing] {},
  Task [tsk000 : resolved] {},
  Task [tsk001 : resolved] {},
  Task [tsk0010 : resolved] {},
  Task [tsk0011 : resolved] {},
  Task [tsk0012 : resolved] {},
  Task [tsk002 : resolved] {},
  Task [tsk0020 : resolved] {},
  Task [tsk0021 : resolved] {},
  Task [tsk0022 : resolved] {}
]
> tsk.$sdfs_
[
  Task [@root@ : opened] {},
  Task [tsk00 : self_executing] {},
  Task [tsk000 : resolved] {},
  Task [tsk001 : resolved] {},
  Task [tsk0010 : resolved] {},
  Task [tsk0011 : resolved] {},
  Task [tsk0012 : resolved] {},
  Task [tsk002 : resolved] {},
  Task [tsk0020 : resolved] {},
  Task [tsk0021 : resolved] {},
  Task [tsk0022 : resolved] {}
]
> tsk00 succ at 2021-12-14T07:36:36.702Z
> tsk.$sdfs_
[
  Task [@root@ : resolved] {},
  Task [tsk00 : resolved] {},
  Task [tsk000 : resolved] {},
  Task [tsk001 : resolved] {},
  Task [tsk0010 : resolved] {},
  Task [tsk0011 : resolved] {},
  Task [tsk0012 : resolved] {},
  Task [tsk002 : resolved] {},
  Task [tsk0020 : resolved] {},
  Task [tsk0021 : resolved] {},
  Task [tsk0022 : resolved] {}
]
> tsk.soft_reset()
Task [@root@ : ready] {}
>
> tsk.$sdfs_
[
  Task [@root@ : ready] {},
  Task [tsk00 : ready] {},
  Task [tsk000 : ready] {},
  Task [tsk001 : ready] {},
  Task [tsk0010 : ready] {},
  Task [tsk0011 : ready] {},
  Task [tsk0012 : ready] {},
  Task [tsk002 : ready] {},
  Task [tsk0020 : ready] {},
  Task [tsk0021 : ready] {},
  Task [tsk0022 : ready] {}
]
> var p = tsk.launch()
tsk000 started at 2021-12-14T07:37:02.627Z
undefined
> tsk.$sdfs_
[
  Task [@root@ : opened] {},
  Task [tsk00 : opened] {},
  Task [tsk000 : self_executing] {},
  Task [tsk001 : ready] {},
  Task [tsk0010 : ready] {},
  Task [tsk0011 : ready] {},
  Task [tsk0012 : ready] {},
  Task [tsk002 : ready] {},
  Task [tsk0020 : ready] {},
  Task [tsk0021 : ready] {},
  Task [tsk0022 : ready] {}
]
> tsk.$sdfs_
[
  Task [@root@ : opened] {},
  Task [tsk00 : opened] {},
  Task [tsk000 : self_executing] {},
  Task [tsk001 : ready] {},
  Task [tsk0010 : ready] {},
  Task [tsk0011 : ready] {},
  Task [tsk0012 : ready] {},
  Task [tsk002 : ready] {},
  Task [tsk0020 : ready] {},
  Task [tsk0021 : ready] {},
  Task [tsk0022 : ready] {}
]
> tsk000 succ at 2021-12-14T07:37:05.631Z
tsk0010 started at 2021-12-14T07:37:05.634Z
> tsk.$sdfs_
[
  Task [@root@ : opened] {},
  Task [tsk00 : opened] {},
  Task [tsk000 : resolved] {},
  Task [tsk001 : opened] {},
  Task [tsk0010 : self_executing] {},
  Task [tsk0011 : ready] {},
  Task [tsk0012 : ready] {},
  Task [tsk002 : ready] {},
  Task [tsk0020 : ready] {},
  Task [tsk0021 : ready] {},
  Task [tsk0022 : ready] {}
]
> tsk0010 succ at 2021-12-14T07:37:07.638Z
tsk0011 started at 2021-12-14T07:37:07.639Z
> tsk.$sdfs_
[
  Task [@root@ : opened] {},
  Task [tsk00 : opened] {},
  Task [tsk000 : resolved] {},
  Task [tsk001 : opened] {},
  Task [tsk0010 : resolved] {},
  Task [tsk0011 : self_executing] {},
  Task [tsk0012 : ready] {},
  Task [tsk002 : ready] {},
  Task [tsk0020 : ready] {},
  Task [tsk0021 : ready] {},
  Task [tsk0022 : ready] {}
]
> tsk.$sdfs_
[
  Task [@root@ : opened] {},
  Task [tsk00 : opened] {},
  Task [tsk000 : resolved] {},
  Task [tsk001 : opened] {},
  Task [tsk0010 : resolved] {},
  Task [tsk0011 : self_executing] {},
  Task [tsk0012 : ready] {},
  Task [tsk002 : ready] {},
  Task [tsk0020 : ready] {},
  Task [tsk0021 : ready] {},
  Task [tsk0022 : ready] {}
]
> tsk0011 succ at 2021-12-14T07:37:09.641Z
tsk0012 started at 2021-12-14T07:37:09.644Z
> tsk.$sdfs_
[
  Task [@root@ : opened] {},
  Task [tsk00 : opened] {},
  Task [tsk000 : resolved] {},
  Task [tsk001 : opened] {},
  Task [tsk0010 : resolved] {},
  Task [tsk0011 : resolved] {},
  Task [tsk0012 : self_executing] {},
  Task [tsk002 : ready] {},
  Task [tsk0020 : ready] {},
  Task [tsk0021 : ready] {},
  Task [tsk0022 : ready] {}
]
> tsk.$sdfs_
[
  Task [@root@ : opened] {},
  Task [tsk00 : opened] {},
  Task [tsk000 : resolved] {},
  Task [tsk001 : opened] {},
  Task [tsk0010 : resolved] {},
  Task [tsk0011 : resolved] {},
  Task [tsk0012 : self_executing] {},
  Task [tsk002 : ready] {},
  Task [tsk0020 : ready] {},
  Task [tsk0021 : ready] {},
  Task [tsk0022 : ready] {}
]
> tsk0012 succ at 2021-12-14T07:37:11.648Z
tsk001 started at 2021-12-14T07:37:11.650Z
> tsk.$sdfs_
[
  Task [@root@ : opened] {},
  Task [tsk00 : opened] {},
  Task [tsk000 : resolved] {},
  Task [tsk001 : self_executing] {},
  Task [tsk0010 : resolved] {},
  Task [tsk0011 : resolved] {},
  Task [tsk0012 : resolved] {},
  Task [tsk002 : ready] {},
  Task [tsk0020 : ready] {},
  Task [tsk0021 : ready] {},
  Task [tsk0022 : ready] {}
]
> tsk.$sdfs_
[
  Task [@root@ : opened] {},
  Task [tsk00 : opened] {},
  Task [tsk000 : resolved] {},
  Task [tsk001 : self_executing] {},
  Task [tsk0010 : resolved] {},
  Task [tsk0011 : resolved] {},
  Task [tsk0012 : resolved] {},
  Task [tsk002 : ready] {},
  Task [tsk0020 : ready] {},
  Task [tsk0021 : ready] {},
  Task [tsk0022 : ready] {}
]
> tsk.$sdfs_tsk001 succ at 2021-12-14T07:37:14.654Z
tsk0020 started at 2021-12-14T07:37:14.658Z

[
  Task [@root@ : opened] {},
  Task [tsk00 : opened] {},
  Task [tsk000 : resolved] {},
  Task [tsk001 : resolved] {},
  Task [tsk0010 : resolved] {},
  Task [tsk0011 : resolved] {},
  Task [tsk0012 : resolved] {},
  Task [tsk002 : opened] {},
  Task [tsk0020 : self_executing] {},
  Task [tsk0021 : ready] {},
  Task [tsk0022 : ready] {}
]
> tsk.$sdfs_
[
  Task [@root@ : opened] {},
  Task [tsk00 : opened] {},
  Task [tsk000 : resolved] {},
  Task [tsk001 : resolved] {},
  Task [tsk0010 : resolved] {},
  Task [tsk0011 : resolved] {},
  Task [tsk0012 : resolved] {},
  Task [tsk002 : opened] {},
  Task [tsk0020 : self_executing] {},
  Task [tsk0021 : ready] {},
  Task [tsk0022 : ready] {}
]
> tsk0020 succ at 2021-12-14T07:37:16.663Z
tsk0021 started at 2021-12-14T07:37:16.665Z
> tsk.$sdfs_
[
  Task [@root@ : opened] {},
  Task [tsk00 : opened] {},
  Task [tsk000 : resolved] {},
  Task [tsk001 : resolved] {},
  Task [tsk0010 : resolved] {},
  Task [tsk0011 : resolved] {},
  Task [tsk0012 : resolved] {},
  Task [tsk002 : opened] {},
  Task [tsk0020 : resolved] {},
  Task [tsk0021 : self_executing] {},
  Task [tsk0022 : ready] {}
]
> tsk.$sdfs_
[
  Task [@root@ : opened] {},
  Task [tsk00 : opened] {},
  Task [tsk000 : resolved] {},
  Task [tsk001 : resolved] {},
  Task [tsk0010 : resolved] {},
  Task [tsk0011 : resolved] {},
  Task [tsk0012 : resolved] {},
  Task [tsk002 : opened] {},
  Task [tsk0020 : resolved] {},
  Task [tsk0021 : self_executing] {},
  Task [tsk0022 : ready] {}
]
> tsk0021 succ at 2021-12-14T07:37:18.669Z
tsk0022 started at 2021-12-14T07:37:18.670Z
> tsk.$sdfs_
[
  Task [@root@ : opened] {},
  Task [tsk00 : opened] {},
  Task [tsk000 : resolved] {},
  Task [tsk001 : resolved] {},
  Task [tsk0010 : resolved] {},
  Task [tsk0011 : resolved] {},
  Task [tsk0012 : resolved] {},
  Task [tsk002 : opened] {},
  Task [tsk0020 : resolved] {},
  Task [tsk0021 : resolved] {},
  Task [tsk0022 : self_executing] {}
]
> tsk.$sdfs_tsk0022 succ at 2021-12-14T07:37:20.672Z
tsk002 started at 2021-12-14T07:37:20.677Z

[
  Task [@root@ : opened] {},
  Task [tsk00 : opened] {},
  Task [tsk000 : resolved] {},
  Task [tsk001 : resolved] {},
  Task [tsk0010 : resolved] {},
  Task [tsk0011 : resolved] {},
  Task [tsk0012 : resolved] {},
  Task [tsk002 : self_executing] {},
  Task [tsk0020 : resolved] {},
  Task [tsk0021 : resolved] {},
  Task [tsk0022 : resolved] {}
]
> tsk.$sdfs_
[
  Task [@root@ : opened] {},
  Task [tsk00 : opened] {},
  Task [tsk000 : resolved] {},
  Task [tsk001 : resolved] {},
  Task [tsk0010 : resolved] {},
  Task [tsk0011 : resolved] {},
  Task [tsk0012 : resolved] {},
  Task [tsk002 : self_executing] {},
  Task [tsk0020 : resolved] {},
  Task [tsk0021 : resolved] {},
  Task [tsk0022 : resolved] {}
]
> tsk.$sdfs_tsk002 succ at 2021-12-14T07:37:23.682Z
tsk00 started at 2021-12-14T07:37:23.684Z

[
  Task [@root@ : opened] {},
  Task [tsk00 : self_executing] {},
  Task [tsk000 : resolved] {},
  Task [tsk001 : resolved] {},
  Task [tsk0010 : resolved] {},
  Task [tsk0011 : resolved] {},
  Task [tsk0012 : resolved] {},
  Task [tsk002 : resolved] {},
  Task [tsk0020 : resolved] {},
  Task [tsk0021 : resolved] {},
  Task [tsk0022 : resolved] {}
]
> tsk.$sdfs_
[
  Task [@root@ : opened] {},
  Task [tsk00 : self_executing] {},
  Task [tsk000 : resolved] {},
  Task [tsk001 : resolved] {},
  Task [tsk0010 : resolved] {},
  Task [tsk0011 : resolved] {},
  Task [tsk0012 : resolved] {},
  Task [tsk002 : resolved] {},
  Task [tsk0020 : resolved] {},
  Task [tsk0021 : resolved] {},
  Task [tsk0022 : resolved] {}
]
> tsk.$sdfs_
[
  Task [@root@ : opened] {},
  Task [tsk00 : self_executing] {},
  Task [tsk000 : resolved] {},
  Task [tsk001 : resolved] {},
  Task [tsk0010 : resolved] {},
  Task [tsk0011 : resolved] {},
  Task [tsk0012 : resolved] {},
  Task [tsk002 : resolved] {},
  Task [tsk0020 : resolved] {},
  Task [tsk0021 : resolved] {},
  Task [tsk0022 : resolved] {}
]
> tsk.$sdfs_tsk00 succ at 2021-12-14T07:37:27.687Z

[
  Task [@root@ : resolved] {},
  Task [tsk00 : resolved] {},
  Task [tsk000 : resolved] {},
  Task [tsk001 : resolved] {},
  Task [tsk0010 : resolved] {},
  Task [tsk0011 : resolved] {},
  Task [tsk0012 : resolved] {},
  Task [tsk002 : resolved] {},
  Task [tsk0020 : resolved] {},
  Task [tsk0021 : resolved] {},
  Task [tsk0022 : resolved] {}
]
>

*/
