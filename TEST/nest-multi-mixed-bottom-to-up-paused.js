
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
> tsk.show()
(
    (
        [tsk000 : ready]->
        {
            [tsk0010 : ready]-|
            [tsk0011 : ready]-|
            [tsk0012 : ready]-|
        }-> [tsk001 : ready]->
        {
            [tsk0020 : ready]-|
            [tsk0021 : ready]-|
            [tsk0022 : ready]-|
        }-> [tsk002 : ready]
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

//evt.debug(true)
var p = tsk.launch()
/*
tsk000 started at 2021-12-15T12:14:32.285Z
tsk000 succ at 2021-12-15T12:14:35.287Z
tsk0010 started at 2021-12-15T12:14:35.288Z
tsk0011 started at 2021-12-15T12:14:35.288Z
tsk0012 started at 2021-12-15T12:14:35.289Z

*/
tsk.pause();

/*
> tsk.pause();
Set(3) {
  Task [tsk0010 : self_paused] {},
  Task [tsk0011 : self_paused] {},
  Task [tsk0012 : self_paused] {}
}

//----------------------------IGNORE THESE, THESE HAPPENED ON OLD TASK-NODE
//----------------------------OLD TASK-NODE WILL BE AUTO-REPLACED after pause
> tsk0010 succ at 2021-12-15T12:14:37.288Z
tsk0011 succ at 2021-12-15T12:14:37.291Z
tsk0012 succ at 2021-12-15T12:14:37.294Z
//----------------------------IGNORE THESE, THESE HAPPENED ON OLD TASK-NODE
//----------------------------OLD TASK-NODE WILL BE AUTO-REPLACED after pause

> tsk.show()
(
    (
        [tsk000 : resolved]->
        {
            [tsk0010 : self_paused] -|
            [tsk0011 : self_paused] -|
            [tsk0012 : self_paused] -|
        }-> [tsk001 : bubble_paused]->
        {
            [tsk0020 : ready]       -|
            [tsk0021 : ready]       -|
            [tsk0022 : ready]       -|
        }-> [tsk002 : ready]
    )-> [tsk00 : bubble_paused]
)-> [@root@ : bubble_paused]

*/


tsk.continue();
/*
tsk0010 started at 2021-12-15T12:18:13.904Z
tsk0011 started at 2021-12-15T12:18:13.905Z
tsk0012 started at 2021-12-15T12:18:13.905Z
tsk0010 succ at 2021-12-15T12:18:15.908Z
tsk0011 succ at 2021-12-15T12:18:15.910Z
tsk0012 succ at 2021-12-15T12:18:15.912Z
tsk001 started at 2021-12-15T12:18:15.912Z
tsk001 succ at 2021-12-15T12:18:18.921Z
tsk0020 started at 2021-12-15T12:18:18.925Z
tsk0021 started at 2021-12-15T12:18:18.930Z
tsk0022 started at 2021-12-15T12:18:18.934Z
tsk0020 succ at 2021-12-15T12:18:20.931Z
tsk0021 succ at 2021-12-15T12:18:20.933Z
tsk0022 succ at 2021-12-15T12:18:20.938Z
tsk002 started at 2021-12-15T12:18:20.941Z
tsk002 succ at 2021-12-15T12:18:23.947Z
tsk00 started at 2021-12-15T12:18:23.948Z
tsk00 succ at 2021-12-15T12:18:27.954Z

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
  [Symbol(async_id_symbol)]: 52,
  [Symbol(trigger_async_id_symbol)]: 5,
  [Symbol(destroyed)]: { destroyed: false }
}
> tsk.show()
(
    (
        [tsk000 : resolved]->
        {
            [tsk0010 : resolved]-|
            [tsk0011 : resolved]-|
            [tsk0012 : resolved]-|
        }-> [tsk001 : resolved]->
        {
            [tsk0020 : resolved]-|
            [tsk0021 : resolved]-|
            [tsk0022 : resolved]-|
        }-> [tsk002 : resolved]
    )-> [tsk00 : resolved]
)-> [@root@ : resolved]
undefined
*/

tsk.soft_reset()

