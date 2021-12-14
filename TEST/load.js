const evt = require("nv-task-event-tree");



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

var tsk = evt.load_from_json(J)



