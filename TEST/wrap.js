const evt = require("./index");

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

function creat_executor(delay) {
    let _f = (rtrn,thrw,self)=> {
        console.log(self.name_,'started at',new Date())
        setTimeout(
            ()=> {
                let fail = Math.random() > 0.5;
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

//evt.debug(true)
var p = evt.wrap.try_until_succ(tsk)
/*
> var p = evt.wrap.try_until_succ(tsk)
tsk000 started at 2021-12-16T08:13:15.794Z
undefined
> tsk000 failed at 2021-12-16T08:13:18.800Z
tsk000 started at 2021-12-16T08:13:18.804Z

> tsk000 succ at 2021-12-16T08:13:21.806Z
tsk0010 started at 2021-12-16T08:13:21.814Z
tsk0011 started at 2021-12-16T08:13:21.817Z
tsk0012 started at 2021-12-16T08:13:21.822Z
tsk0010 succ at 2021-12-16T08:13:23.821Z
tsk0011 failed at 2021-12-16T08:13:23.847Z
tsk0011 started at 2021-12-16T08:13:23.855Z
tsk0012 failed at 2021-12-16T08:13:23.857Z
tsk0012 started at 2021-12-16T08:13:23.863Z
tsk0011 succ at 2021-12-16T08:13:25.857Z
tsk0012 failed at 2021-12-16T08:13:25.867Z
tsk0012 started at 2021-12-16T08:13:25.872Z
tsk0012 succ at 2021-12-16T08:13:27.881Z
tsk001 started at 2021-12-16T08:13:27.882Z
tsk001 failed at 2021-12-16T08:13:30.888Z
tsk001 started at 2021-12-16T08:13:30.896Z
tsk001 succ at 2021-12-16T08:13:33.909Z
tsk0020 started at 2021-12-16T08:13:33.911Z
tsk0021 started at 2021-12-16T08:13:33.911Z
tsk0022 started at 2021-12-16T08:13:33.912Z
tsk0020 failed at 2021-12-16T08:13:35.914Z
tsk0020 started at 2021-12-16T08:13:35.915Z
tsk0021 failed at 2021-12-16T08:13:35.916Z
tsk0021 started at 2021-12-16T08:13:35.916Z
tsk0022 failed at 2021-12-16T08:13:35.919Z
tsk0022 started at 2021-12-16T08:13:35.923Z
tsk0020 failed at 2021-12-16T08:13:37.917Z
tsk0020 started at 2021-12-16T08:13:37.920Z
tsk0021 succ at 2021-12-16T08:13:37.931Z
tsk0022 failed at 2021-12-16T08:13:37.940Z
tsk0022 started at 2021-12-16T08:13:37.942Z
tsk0020 succ at 2021-12-16T08:13:39.922Z
tsk0022 succ at 2021-12-16T08:13:39.945Z
tsk002 started at 2021-12-16T08:13:39.949Z
tsk002 succ at 2021-12-16T08:13:42.957Z
tsk00 started at 2021-12-16T08:13:42.964Z
tsk00 succ at 2021-12-16T08:13:46.975Z

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
  [Symbol(async_id_symbol)]: 366,
  [Symbol(trigger_async_id_symbol)]: 5,
  [Symbol(destroyed)]: { destroyed: false }
}
>

*/

tsk.soft_reset()
