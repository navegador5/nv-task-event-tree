const {load_from_json,TYPES,debug} = require("./index")

debug(true);

var J = [
    'tsk00',{type:'parallel'},[
        'tsk10',[
        ],
        'tsk11',{type:'serial'},[
            'tsk110',
            'tsk111'
        ]
    ]
]

var tsk = load_from_json(J)

var tsk110 = tsk.get_des_with_name('tsk110')

tsk110.exec_ = (rs,rj,self)=> {
   console.log('tsk110 start')
   setTimeout(
     ()=> {
         console.log('tsk110 rejected')
         self.msg = 'rejected'
         rj(self)
     },
      5000
   )
}


tsk.launch()

/*
> await tsk.launch()
root Task [@root@ : ready] {} nest started...
Task [@root@ : ready] {} serial nest start fstch Task [tsk00 : ready] {}
Task [tsk00 : ready] {} parallel nest start children [ Task [tsk10 : ready] {}, Task [tsk11 : ready] {} ]
leaf Task [tsk10 : ready] {} start
Task [tsk10 : pending] {} internal started
Task [tsk10 : resolved] {} internal resolved
Task [tsk10 : resolved] {} send resolved msg  to parent Task [tsk00 : ready] {}
parallel Task [tsk00 : ready] {} recved resolved msg from Task [tsk10 : resolved] {} but not all resolved
Task [tsk11 : ready] {} serial nest start fstch Task [tsk110 : ready] {}
leaf Task [tsk110 : ready] {} start
Task [tsk110 : pending] {} internal started
tsk110 start
tsk110 rejected
serial Task [tsk11 : ready] {} recv rejected from  Task [tsk110 : rejected] { msg: 'rejected' }
parallel Task [tsk00 : ready] {} recv rejected from  Task [tsk11 : rejected] {}
serial Task [@root@ : ready] {} recv rejected from  Task [tsk00 : rejected] {}
Uncaught Task [tsk110 : rejected] { msg: 'rejected' }
> tsk.show()
@root@ : rejected
    tsk00 : rejected
        tsk10 : resolved
        tsk11 : rejected
            tsk110 : rejected
            tsk111 : ready
undefined
> tsk.is_rejected()
true
>
> tsk.$sdfs_
[
  Task [@root@ : rejected] {},
  Task [tsk00 : rejected] {},
  Task [tsk10 : resolved] {},
  Task [tsk11 : rejected] {},
  Task [tsk110 : rejected] { msg: 'rejected' },
  Task [tsk111 : ready] {}
]
>
*/

