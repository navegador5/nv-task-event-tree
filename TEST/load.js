const evt = require("nv-task-event-tree");


var blue_print = `
    {
        [tsk000]         -|
        (
            [tsk0010]->
            [tsk0011]->
            [tsk0012]
        )-> [tsk001]     -|
        {
            [tsk0020]-|
            [tsk0021]-|
            [tsk0022]-|
        }-> [tsk002]     -|
    }-> [tsk00]
`

var tsk = evt.load_from_blue_print(blue_print)

> tsk.show()
{
    {
        [tsk000 : ready]         -|
        (
            [tsk0010 : ready]->
            [tsk0011 : ready]->
            [tsk0012 : ready]
        )-> [tsk001 : ready]     -|
        {
            [tsk0020 : ready]-|
            [tsk0021 : ready]-|
            [tsk0022 : ready]-|
        }-> [tsk002 : ready]     -|
    }-> [tsk00 : ready]          -|
}-> [0 : ready]



var blue_print = `
    {
        [tsk000]
        (
            [tsk0010]
            [tsk0011]
            [tsk0012]
        ) [tsk001]   
        {
            [tsk0020]
            [tsk0021]
            [tsk0022]
        } [tsk002]     
    } [tsk00]
`
var tsk = evt.load_from_blue_print(blue_print)
tsk.show()

/*
> tsk.show()
{
    {
        [tsk000 : ready]         -|
        (
            [tsk0010 : ready]->
            [tsk0011 : ready]->
            [tsk0012 : ready]
        )-> [tsk001 : ready]     -|
        {
            [tsk0020 : ready]-|
            [tsk0021 : ready]-|
            [tsk0022 : ready]-|
        }-> [tsk002 : ready]     -|
    }-> [tsk00 : ready]          -|
}-> [0 : ready]

*/



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



