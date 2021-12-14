const evt = require("./index");


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

tsk.T_.tsk00000.executor_                  = creat_executor(2000)
    tsk.T_.tsk0000.executor_               = creat_executor(2000)
        tsk.T_.tsk000.executor_            = creat_executor(3000)
            tsk.T_.tsk00.executor_         = creat_executor(4000)
                 tsk.executor_             = (rtrn,thrw,self) => {
                         rtrn(self.$sdfs_.map(nd=>nd.rslt_))
                 }

evt.debug(false)
var p = tsk.launch()
/*
> var p = tsk.launch()
tsk00000 started at 2021-12-14T07:18:29.878Z
tsk00000 succ at 2021-12-14T07:18:31.881Z
tsk0000 started at 2021-12-14T07:18:31.882Z
tsk0000 succ at 2021-12-14T07:18:33.885Z
tsk000 started at 2021-12-14T07:18:33.885Z
tsk000 succ at 2021-12-14T07:18:36.890Z
tsk00 started at 2021-12-14T07:18:36.890Z
tsk00 succ at 2021-12-14T07:18:40.893Z

>
> tsk.$sdfs_
[
  Task [@root@ : resolved] {},
  Task [tsk00 : resolved] {},
  Task [tsk000 : resolved] {},
  Task [tsk0000 : resolved] {},
  Task [tsk00000 : resolved] {}
]
>
*/

tsk.soft_reset()


evt.debug(true)
var p = tsk.launch()


/*
root Task [@root@ : ready] {} nest started...
Task [@root@ : ready] {} enter sym_conding
Task [@root@ : conding] {} state is conding
Task [@root@ : conding] {} begin check conder... on self
conder match
leave sym conding
Task [@root@ : opened] {} serial check fstch conder Task [tsk00 : ready] {}
Task [tsk00 : ready] {} enter sym_conding
Task [tsk00 : conding] {} state is conding
Task [tsk00 : conding] {} begin check conder... on self
conder match
leave sym conding
Task [tsk00 : opened] {} serial check fstch conder Task [tsk000 : ready] {}
Task [tsk000 : ready] {} enter sym_conding
Task [tsk000 : conding] {} state is conding
Task [tsk000 : conding] {} begin check conder... on self
conder match
leave sym conding
Task [tsk000 : opened] {} serial check fstch conder Task [tsk0000 : ready] {}
Task [tsk0000 : ready] {} enter sym_conding
Task [tsk0000 : conding] {} state is conding
Task [tsk0000 : conding] {} begin check conder... on self
conder match
leave sym conding
Task [tsk0000 : opened] {} serial check fstch conder Task [tsk00000 : ready] {}
Task [tsk00000 : ready] {} enter sym_conding
Task [tsk00000 : conding] {} state is conding
Task [tsk00000 : conding] {} begin check conder... on self
conder match
leave sym conding
Task [tsk00000 : opened] {} leaf open self Task [tsk00000 : opened] {}
Task [tsk00000 : self_executing] {} start exec on self
add Task [tsk00000 : self_executing] {} to Set(0) {} when executing...
running is Set(1) { Task [tsk00000 : self_executing] {} }
tsk00000 started at 2021-12-14T07:16:16.835Z
undefined
> tsk00000 succ at 2021-12-14T07:16:18.841Z
Task [tsk00000 : resolved] {} when resolved
delete Task [tsk00000 : resolved] {} from Set(1) { Task [tsk00000 : resolved] {} } when resolved
running is: Set(0) {}
Task [tsk00000 : resolved] {} send msg Symbol(rs) to parent Task [tsk0000 : opened] {}
serial Task [tsk0000 : opened] {} recv lstch resolved from  Task [tsk00000 : resolved] {}
serial Task [tsk0000 : opened] {} executing
Task [tsk0000 : self_executing] {} start exec on self
add Task [tsk0000 : self_executing] {} to Set(0) {} when executing...
running is Set(1) { Task [tsk0000 : self_executing] {} }
tsk0000 started at 2021-12-14T07:16:18.885Z

> tsk0000 succ at 2021-12-14T07:16:20.889Z
Task [tsk0000 : resolved] {} when resolved
delete Task [tsk0000 : resolved] {} from Set(1) { Task [tsk0000 : resolved] {} } when resolved
running is: Set(0) {}
Task [tsk0000 : resolved] {} send msg Symbol(rs) to parent Task [tsk000 : opened] {}
serial Task [tsk000 : opened] {} recv lstch resolved from  Task [tsk0000 : resolved] {}
serial Task [tsk000 : opened] {} executing
Task [tsk000 : self_executing] {} start exec on self
add Task [tsk000 : self_executing] {} to Set(0) {} when executing...
running is Set(1) { Task [tsk000 : self_executing] {} }
tsk000 started at 2021-12-14T07:16:20.905Z

> tsk000 succ at 2021-12-14T07:16:23.915Z
Task [tsk000 : resolved] {} when resolved
delete Task [tsk000 : resolved] {} from Set(1) { Task [tsk000 : resolved] {} } when resolved
running is: Set(0) {}
Task [tsk000 : resolved] {} send msg Symbol(rs) to parent Task [tsk00 : opened] {}
serial Task [tsk00 : opened] {} recv lstch resolved from  Task [tsk000 : resolved] {}
serial Task [tsk00 : opened] {} executing
Task [tsk00 : self_executing] {} start exec on self
add Task [tsk00 : self_executing] {} to Set(0) {} when executing...
running is Set(1) { Task [tsk00 : self_executing] {} }
tsk00 started at 2021-12-14T07:16:23.928Z

> tsk00 succ at 2021-12-14T07:16:27.933Z
Task [tsk00 : resolved] {} when resolved
delete Task [tsk00 : resolved] {} from Set(1) { Task [tsk00 : resolved] {} } when resolved
running is: Set(0) {}
Task [tsk00 : resolved] {} send msg Symbol(rs) to parent Task [@root@ : opened] {}
serial Task [@root@ : opened] {} recv lstch resolved from  Task [tsk00 : resolved] {}
serial Task [@root@ : opened] {} executing
Task [@root@ : self_executing] {} start exec on self
add Task [@root@ : self_executing] {} to Set(0) {} when executing...
running is Set(1) { Task [@root@ : self_executing] {} }
Task [@root@ : resolved] {} when resolved
delete Task [@root@ : resolved] {} from Set(1) { Task [@root@ : resolved] {} } when resolved
running is: Set(0) {}

>
> tsk.rslt_
[ Symbol(noexist), 'tsk00', 'tsk000', 'tsk0000', 'tsk00000' ]
> tsk.$sdfs_
[
  Task [@root@ : resolved] {},
  Task [tsk00 : resolved] {},
  Task [tsk000 : resolved] {},
  Task [tsk0000 : resolved] {},
  Task [tsk00000 : resolved] {}
]
> p
Promise {
  [ Symbol(noexist), 'tsk00', 'tsk000', 'tsk0000', 'tsk00000' ],
  [Symbol(async_id_symbol)]: 39,
  [Symbol(trigger_async_id_symbol)]: 5,
  [Symbol(destroyed)]: { destroyed: false }
}
>

*/

tsk.soft_reset()
