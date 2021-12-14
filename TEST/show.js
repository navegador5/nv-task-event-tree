const evt = require("./index");


var J = [
    'tsk00',{type:'parallel'},[
        'tsk10',[
        ],
        'tsk11',{type:'serial'},[
            'tsk110',
            'tsk111',
            'tsk112',
        ],
        'tsk12',{type:'parallel'},[
            'tsk120',
            'tsk121',
            'tsk122'
        ]
    ]
]

var tsk = evt.load_from_json(J)

/*
> tsk.show()

// this is a bottom-to-up style 
//     (...) means serial-executing-sequence  
//         fstch->sndch->....lstch->parent...
//     {...} means parallel-executing-sequence
           {...childrens}->parent....
//   -> means serail-child 
//   -| means parallel-child


(
    {
        [tsk10 : ready]         -|
        (
            [tsk110 : ready]->
            [tsk111 : ready]->
            [tsk112 : ready]
        )-> [tsk11 : ready]     -|
        {
            [tsk120 : ready]-|
            [tsk121 : ready]-|
            [tsk122 : ready]-|
        }-> [tsk12 : ready]     -|
    }-> [tsk00 : ready]
)-> [@root@ : ready]

*/
