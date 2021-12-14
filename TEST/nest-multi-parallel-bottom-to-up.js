
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
> tsk.show()
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
                console.log(self.name_,'succ at',new Date())
                rtrn(self.name_)
            },
            delay
        )
   }
   return(_f)
}


tsk.T_.tsk0020.executor_           = creat_executor(10000)
tsk.T_.tsk0021.executor_           = creat_executor(10000)
tsk.T_.tsk0022.executor_           = creat_executor(10000)
    tsk.T_.tsk002.executor_        = creat_executor(10000)


tsk.T_.tsk001.$sdfs_.forEach(tsk=> {
    tsk.executor_  = creat_executor(10000)
});
    tsk.T_.tsk001.executor_         = creat_executor(10000)


    tsk.T_.tsk000.executor_         = creat_executor(10000)

          tsk.T_.tsk00.executor_    = creat_executor(10000)
               tsk.executor_        =(rtrn,thrw,self) => {
                    rtrn(self.$sdfs_.map(nd=>nd.rslt_))
               }

evt.debug(false)
var p = tsk.launch()
tsk.show()

/*
tsk000 started at 2021-12-14T07:55:42.024Z
tsk0010 started at 2021-12-14T07:55:42.025Z
tsk0011 started at 2021-12-14T07:55:42.026Z
tsk0012 started at 2021-12-14T07:55:42.027Z
tsk0020 started at 2021-12-14T07:55:42.027Z
tsk0021 started at 2021-12-14T07:55:42.028Z
tsk0022 started at 2021-12-14T07:55:42.028Z
undefined
> tsk.show()
(
    {
        [tsk000 : self_executing]         -|
        {
            [tsk0010 : self_executing]-|
            [tsk0011 : self_executing]-|
            [tsk0012 : self_executing]-|
        }-> [tsk001 : opened]             -|
        {
            [tsk0020 : self_executing]-|
            [tsk0021 : self_executing]-|
            [tsk0022 : self_executing]-|
        }-> [tsk002 : opened]             -|
    }-> [tsk00 : opened]
)-> [@root@ : opened]
undefined
> tsk.show()tsk000 succ at 2021-12-14T07:55:52.028Z
tsk0010 succ at 2021-12-14T07:55:52.036Z
tsk0011 succ at 2021-12-14T07:55:52.039Z
tsk0012 succ at 2021-12-14T07:55:52.043Z
tsk001 started at 2021-12-14T07:55:52.048Z
tsk0020 succ at 2021-12-14T07:55:52.049Z
tsk0021 succ at 2021-12-14T07:55:52.051Z
tsk0022 succ at 2021-12-14T07:55:52.054Z
tsk002 started at 2021-12-14T07:55:52.055Z

(
    {
        [tsk000 : resolved]              -|
        {
            [tsk0010 : resolved]     -|
            [tsk0011 : resolved]     -|
            [tsk0012 : resolved]     -|
        }-> [tsk001 : self_executing]    -|
        {
            [tsk0020 : resolved]     -|
            [tsk0021 : resolved]     -|
            [tsk0022 : resolved]     -|
        }-> [tsk002 : self_executing]    -|
    }-> [tsk00 : opened]
)-> [@root@ : opened]
undefined
> tsk.show()
(
    {
        [tsk000 : resolved]              -|
        {
            [tsk0010 : resolved]     -|
            [tsk0011 : resolved]     -|
            [tsk0012 : resolved]     -|
        }-> [tsk001 : self_executing]    -|
        {
            [tsk0020 : resolved]     -|
            [tsk0021 : resolved]     -|
            [tsk0022 : resolved]     -|
        }-> [tsk002 : self_executing]    -|
    }-> [tsk00 : opened]
)-> [@root@ : opened]
undefined
> tsk.show()tsk001 succ at 2021-12-14T07:56:02.050Z
tsk002 succ at 2021-12-14T07:56:02.057Z
tsk00 started at 2021-12-14T07:56:02.062Z

(
    {
        [tsk000 : resolved]             -|
        {
            [tsk0010 : resolved]    -|
            [tsk0011 : resolved]    -|
            [tsk0012 : resolved]    -|
        }-> [tsk001 : resolved]         -|
        {
            [tsk0020 : resolved]    -|
            [tsk0021 : resolved]    -|
            [tsk0022 : resolved]    -|
        }-> [tsk002 : resolved]         -|
    }-> [tsk00 : self_executing]
)-> [@root@ : opened]
undefined
> tsk.show()
(
    {
        [tsk000 : resolved]             -|
        {
            [tsk0010 : resolved]    -|
            [tsk0011 : resolved]    -|
            [tsk0012 : resolved]    -|
        }-> [tsk001 : resolved]         -|
        {
            [tsk0020 : resolved]    -|
            [tsk0021 : resolved]    -|
            [tsk0022 : resolved]    -|
        }-> [tsk002 : resolved]         -|
    }-> [tsk00 : self_executing]
)-> [@root@ : opened]
undefined
> ttsk00 succ at 2021-12-14T07:56:12.065Z
> tsk.show()
(
    {
        [tsk000 : resolved]         -|
        {
            [tsk0010 : resolved]-|
            [tsk0011 : resolved]-|
            [tsk0012 : resolved]-|
        }-> [tsk001 : resolved]     -|
        {
            [tsk0020 : resolved]-|
            [tsk0021 : resolved]-|
            [tsk0022 : resolved]-|
        }-> [tsk002 : resolved]     -|
    }-> [tsk00 : resolved]
)-> [@root@ : resolved]
*/

tsk.soft_reset()







