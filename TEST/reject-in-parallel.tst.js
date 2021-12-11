
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

var tsk10 = tsk.get_des_with_name('tsk10')

tsk10.exec_ = (rs,rj,self)=> {
   console.log('tsk10 start')
   setTimeout(
     ()=> {
         console.log('tsk10 rejected')
         self.msg = 'rejected'
         rj(self)
     },
      5000
   )
}


await tsk.launch()

/*
> await tsk.launch()
root Task [@root@ : ready] {} nest started...
Task [@root@ : ready] {} serial nest start fstch Task [tsk00 : ready] {}
Task [tsk00 : ready] {} parallel nest start children [ Task [tsk10 : ready] {}, Task [tsk11 : ready] {} ]
leaf Task [tsk10 : ready] {} start
Task [tsk10 : pending] {} internal started
tsk10 start
Task [tsk11 : ready] {} serial nest start fstch Task [tsk110 : ready] {}
leaf Task [tsk110 : ready] {} start
Task [tsk110 : pending] {} internal started
Task [tsk110 : resolved] {} internal resolved
Task [tsk110 : resolved] {} send resolved msg  to parent Task [tsk11 : ready] {}
serial Task [tsk11 : ready] {} recv notlst child resolved from  Task [tsk110 : resolved] {}
rsib Task [tsk111 : ready] {} of Task [tsk110 : resolved] {} nest start
leaf Task [tsk111 : ready] {} start
Task [tsk111 : pending] {} internal started
Task [tsk111 : resolved] {} internal resolved
Task [tsk111 : resolved] {} send resolved msg  to parent Task [tsk11 : ready] {}
serial Task [tsk11 : ready] {} recv lstch resolved from  Task [tsk111 : resolved] {}
Task [tsk11 : pending] {} internal started
Task [tsk11 : resolved] {} internal resolved
Task [tsk11 : resolved] {} send resolved msg  to parent Task [tsk00 : ready] {}
parallel Task [tsk00 : ready] {} recved resolved msg from Task [tsk11 : resolved] {} but not all resolved
tsk10 rejected
parallel Task [tsk00 : ready] {} recv rejected from  Task [tsk10 : rejected] { msg: 'rejected' }
serial Task [@root@ : ready] {} recv rejected from  Task [tsk00 : rejected] {}
Uncaught Task [tsk10 : rejected] { msg: 'rejected' }
>


*/
