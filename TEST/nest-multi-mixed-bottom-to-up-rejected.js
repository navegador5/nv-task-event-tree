
const evt = require("nv-task-event-tree");

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

tsk.T_.tsk0020.executor_           = creat_executor(2000,true)
tsk.T_.tsk0021.executor_           = creat_executor(2000,true)
tsk.T_.tsk0022.executor_           = creat_executor(2000,false)
    tsk.T_.tsk002.executor_        = creat_executor(3000,false)


tsk.T_.tsk001.$sdfs_.forEach(tsk=> {
    tsk.executor_  = creat_executor(2000,false)
});
    tsk.T_.tsk001.executor_         = creat_executor(3000,false)


    tsk.T_.tsk000.executor_         = creat_executor(3000,true)

          tsk.T_.tsk00.executor_    = creat_executor(4000,false)
               tsk.executor_        =(rtrn,thrw,self) => {
                    rtrn(self.$sdfs_.map(nd=>nd.rslt_))
               }

//evt.debug(true)
var p = tsk.launch()
/*
tsk000 started at 2021-12-15T08:40:40.512Z
tsk0010 started at 2021-12-15T08:40:40.513Z
tsk0011 started at 2021-12-15T08:40:40.514Z
tsk0012 started at 2021-12-15T08:40:40.514Z
tsk0020 started at 2021-12-15T08:40:40.515Z
tsk0021 started at 2021-12-15T08:40:40.517Z
tsk0022 started at 2021-12-15T08:40:40.517Z
tsk0010 succ at 2021-12-15T08:40:42.516Z
tsk0011 succ at 2021-12-15T08:40:42.518Z
tsk0012 succ at 2021-12-15T08:40:42.519Z
tsk001 started at 2021-12-15T08:40:42.519Z
tsk0020 failed at 2021-12-15T08:40:42.521Z
Uncaught 'tsk0020'
tsk0021 failed at 2021-12-15T08:40:42.527Z
tsk0022 succ at 2021-12-15T08:40:42.527Z
tsk000 failed at 2021-12-15T08:40:43.515Z
tsk001 succ at 2021-12-15T08:40:45.520Z

*/

/*
> tsk.show()
(
    {
        [tsk000 : self_rejected]          -|
        {
            [tsk0010 : resolved]      -|
            [tsk0011 : resolved]      -|
            [tsk0012 : resolved]      -|
        }-> [tsk001 : resolved]           -|
        {
            [tsk0020 : self_rejected] -|
            [tsk0021 : self_rejected] -|
            [tsk0022 : resolved]      -|
        }-> [tsk002 : bubble_rejected]    -|
    }-> [tsk00 : bubble_rejected]
)-> [@root@ : bubble_rejected]
undefined
> tsk.rejected_at_
Task [tsk0020 : self_rejected] {}
> tsk.running_
Set(0) {}
>

*/

tsk.T_.tsk0020.executor_           = creat_executor(2000,false)
var np = tsk.recover()

/*
tsk0020 started at 2021-12-15T08:41:52.692Z
undefined
> tsk0020 succ at 2021-12-15T08:41:54.696Z
Uncaught 'tsk0021'
>
> tsk.show()
(
    {
        [tsk000 : self_rejected]          -|
        {
            [tsk0010 : resolved]      -|
            [tsk0011 : resolved]      -|
            [tsk0012 : resolved]      -|
        }-> [tsk001 : resolved]           -|
        {
            [tsk0020 : resolved]      -|
            [tsk0021 : self_rejected] -|
            [tsk0022 : resolved]      -|
        }-> [tsk002 : bubble_rejected]    -|
    }-> [tsk00 : bubble_rejected]
)-> [@root@ : bubble_rejected]
undefined
> tsk.rejected_at_
Task [tsk0021 : self_rejected] {}
>

*/
tsk.T_.tsk0021.executor_           = creat_executor(2000,false)
var np = tsk.recover()

/*
tsk0021 started at 2021-12-15T08:42:54.351Z
undefined
> tsk0021 succ at 2021-12-15T08:42:56.355Z
tsk002 started at 2021-12-15T08:42:56.355Z
tsk002 succ at 2021-12-15T08:42:59.358Z
Uncaught 'tsk000'
>
> tsk.show()
(
    {
        [tsk000 : self_rejected]          -|
        {
            [tsk0010 : resolved]      -|
            [tsk0011 : resolved]      -|
            [tsk0012 : resolved]      -|
        }-> [tsk001 : resolved]           -|
        {
            [tsk0020 : resolved]      -|
            [tsk0021 : resolved]      -|
            [tsk0022 : resolved]      -|
        }-> [tsk002 : resolved]           -|
    }-> [tsk00 : bubble_rejected]
)-> [@root@ : bubble_rejected]

*/


tsk.T_.tsk000.executor_           = creat_executor(2000,false)
var np = tsk.recover()

/*
> tsk.T_.tsk000.executor_           = creat_executor(2000,false)
[Function: _f]
> var np = tsk.recover()
tsk000 started at 2021-12-15T08:44:21.073Z
undefined
> tsk000 succ at 2021-12-15T08:44:23.074Z
tsk00 started at 2021-12-15T08:44:23.090Z
tsk00 succ at 2021-12-15T08:44:27.098Z

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
undefined
>

*/


tsk.soft_reset();
