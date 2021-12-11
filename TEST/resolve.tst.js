const {load_from_json,TYPES} = require("./index")

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
tsk.launch()

/*
root Task [@root@] {} nest started...
Task [@root@] {} serial nest start fstch Task [tsk00] {}
Task [tsk00] {} parallel nest start children [ Task [tsk10] {}, Task [tsk11] {} ]
leaf Task [tsk10] {} start
Task [tsk10] {} internal started
Task [tsk10] {} internal resolved
Task [tsk10] {} send resolved msg  to parent Task [tsk00] {}
parallel Task [tsk00] {} recved resolved msg from Task [tsk10] {} but not all resolved
Task [tsk11] {} serial nest start fstch Task [tsk110] {}
leaf Task [tsk110] {} start
Task [tsk110] {} internal started
Task [tsk110] {} internal resolved
Task [tsk110] {} send resolved msg  to parent Task [tsk11] {}
serial Task [tsk11] {} recv notlst child resolved from  Task [tsk110] {}
rsib Task [tsk111] {} of Task [tsk110] {} nest start
leaf Task [tsk111] {} start
Task [tsk111] {} internal started
Task [tsk111] {} internal resolved
Task [tsk111] {} send resolved msg  to parent Task [tsk11] {}
serial Task [tsk11] {} recv lstch resolved from  Task [tsk111] {}
Task [tsk11] {} internal started
Task [tsk11] {} internal resolved
Task [tsk11] {} send resolved msg  to parent Task [tsk00] {}
parallel Task [tsk00] {} recved resolved msg from Task [tsk11] {} all resolved
parallel Task [tsk00] {} start
Task [tsk00] {} internal started
Task [tsk00] {} internal resolved
Task [tsk00] {} send resolved msg  to parent Task [@root@] {}
serial Task [@root@] {} recv lstch resolved from  Task [tsk00] {}
Task [@root@] {} internal started
Task [@root@] {} internal resolved
Promise {
  Task [@root@] {},
  [Symbol(async_id_symbol)]: 39,
  [Symbol(trigger_async_id_symbol)]: 5,
  [Symbol(destroyed)]: { destroyed: false }
}

*/
