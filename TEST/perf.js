const evt = require("nv-task-event-tree");


const {rand} = require("nv-random-tree")

function creat_executor(delay) {
    let _f = (rtrn,thrw,self)=> {
        setTimeout(
            ()=> {
                 rtrn(self.name_)
            },
            delay
        )
   }
   return(_f)
}


var big_task_tree = rand(50,500000,undefined,evt.Task,2)

/*
> big_task_tree.$sdfs_.length
500000
>
*/
big_task_tree.enable_promise()

big_task_tree.$sdfs_.forEach(
    (nd,i)=> {
        nd.name_ = `tsk${i}`;
        let rand_type = (Math.random() >0.5)
        if(rand_type) {
            nd.set_as_serial()
        } else {
            nd.set_as_parallel()
        }
        nd.executor_ = creat_executor(Math.random()*2)
    }
);

/*


> big_task_tree.$sdfs_.filter(nd=>nd.$is_leaf()).length
480041
> big_task_tree.$sdfs_.filter(nd=>nd.is_serial() && !nd.$is_leaf()).length
9817
> big_task_tree.$sdfs_.filter(nd=>nd.is_parallel() && !nd.$is_leaf()).length
10142
>

*/

/*
 87698 root      20   0 1005916 413616  33404 S  0.0 20.5   0:11.73 node
 
> process.memoryUsage()
{
  rss: 423542784,
  heapTotal: 381763584,
  heapUsed: 358841448,                        // about 350M memory for 500000 nodes
  external: 1066990,
  arrayBuffers: 24792
}
>


*/


async function tst() {
    let start = new Date();
    let start_ms = start.getTime()
    console.log('begin at :',start);
    ////
    await big_task_tree.launch();
    ////
    let end = new Date();
    let end_ms = end.getTime()
    console.log('end at: ',end);
    console.log("costed: ", end_ms-start_ms,'ms')
}


> big_task_tree.p_
Promise {
  <pending>,
  [Symbol(async_id_symbol)]: 51,
  [Symbol(trigger_async_id_symbol)]: 5,
  [Symbol(destroyed)]: { destroyed: false }
}
>

tst()


/*
> tst()
begin at : 2021-12-17T10:36:42.526Z
Promise {
  <pending>,
  [Symbol(async_id_symbol)]: 171,
  [Symbol(trigger_async_id_symbol)]: 5,
  [Symbol(destroyed)]: { destroyed: false }
}
> end at:  2021-12-17T10:37:07.224Z
costed:  24698 ms

> big_task_tree.p_
Promise {
  'tsk0',
  [Symbol(async_id_symbol)]: 51,
  [Symbol(trigger_async_id_symbol)]: 5,
  [Symbol(destroyed)]: { destroyed: false }
}
>
> big_task_tree.$sdfs_
[
  Task [tsk0 : resolved] {},
  Task [tsk1 : resolved] {},
  Task [tsk2 : resolved] {},
  Task [tsk3 : resolved] {},
  Task [tsk4 : resolved] {},
  Task [tsk5 : resolved] {},
  Task [tsk6 : resolved] {},
  Task [tsk7 : resolved] {},
  Task [tsk8 : resolved] {},
  Task [tsk9 : resolved] {},
  Task [tsk10 : resolved] {},
  Task [tsk11 : resolved] {},
  Task [tsk12 : resolved] {},
  Task [tsk13 : resolved] {},
  Task [tsk14 : resolved] {},
  Task [tsk15 : resolved] {},
  Task [tsk16 : resolved] {},
  Task [tsk17 : resolved] {},
  Task [tsk18 : resolved] {},
  Task [tsk19 : resolved] {},
  Task [tsk20 : resolved] {},
  Task [tsk21 : resolved] {},
  Task [tsk22 : resolved] {},
  Task [tsk23 : resolved] {},
  Task [tsk24 : resolved] {},
  Task [tsk25 : resolved] {},
  Task [tsk26 : resolved] {},
  Task [tsk27 : resolved] {},
  Task [tsk28 : resolved] {},
  Task [tsk29 : resolved] {},
  Task [tsk30 : resolved] {},
  Task [tsk31 : resolved] {},
  Task [tsk32 : resolved] {},
  Task [tsk33 : resolved] {},
  Task [tsk34 : resolved] {},
  Task [tsk35 : resolved] {},
  Task [tsk36 : resolved] {},
  Task [tsk37 : resolved] {},
  Task [tsk38 : resolved] {},
  Task [tsk39 : resolved] {},
  Task [tsk40 : resolved] {},
  Task [tsk41 : resolved] {},
  Task [tsk42 : resolved] {},
  Task [tsk43 : resolved] {},
  Task [tsk44 : resolved] {},
  Task [tsk45 : resolved] {},
  Task [tsk46 : resolved] {},
  Task [tsk47 : resolved] {},
  Task [tsk48 : resolved] {},
  Task [tsk49 : resolved] {},
  Task [tsk50 : resolved] {},
  Task [tsk51 : resolved] {},
  Task [tsk52 : resolved] {},
  Task [tsk53 : resolved] {},
  Task [tsk54 : resolved] {},
  Task [tsk55 : resolved] {},
  Task [tsk56 : resolved] {},
  Task [tsk57 : resolved] {},
  Task [tsk58 : resolved] {},
  Task [tsk59 : resolved] {},
  Task [tsk60 : resolved] {},
  Task [tsk61 : resolved] {},
  Task [tsk62 : resolved] {},
  Task [tsk63 : resolved] {},
  Task [tsk64 : resolved] {},
  Task [tsk65 : resolved] {},
  Task [tsk66 : resolved] {},
  Task [tsk67 : resolved] {},
  Task [tsk68 : resolved] {},
  Task [tsk69 : resolved] {},
  Task [tsk70 : resolved] {},
  Task [tsk71 : resolved] {},
  Task [tsk72 : resolved] {},
  Task [tsk73 : resolved] {},
  Task [tsk74 : resolved] {},
  Task [tsk75 : resolved] {},
  Task [tsk76 : resolved] {},
  Task [tsk77 : resolved] {},
  Task [tsk78 : resolved] {},
  Task [tsk79 : resolved] {},
  Task [tsk80 : resolved] {},
  Task [tsk81 : resolved] {},
  Task [tsk82 : resolved] {},
  Task [tsk83 : resolved] {},
  Task [tsk84 : resolved] {},
  Task [tsk85 : resolved] {},
  Task [tsk86 : resolved] {},
  Task [tsk87 : resolved] {},
  Task [tsk88 : resolved] {},
  Task [tsk89 : resolved] {},
  Task [tsk90 : resolved] {},
  Task [tsk91 : resolved] {},
  Task [tsk92 : resolved] {},
  Task [tsk93 : resolved] {},
  Task [tsk94 : resolved] {},
  Task [tsk95 : resolved] {},
  Task [tsk96 : resolved] {},
  Task [tsk97 : resolved] {},
  Task [tsk98 : resolved] {},
  Task [tsk99 : resolved] {},
  ... 499900 more items
]
>

*/


/*
> var blue_print = big_task_tree.unparse()
Uncaught RangeError: Maximum call stack size exceeded
    at _width (/opt/JS/NV5_/nvtsk-/pkgs/nv-task-event/pkgs/nv-task-event-tree/repr.js:104:34)
    at _get_max_width_of_stag (/opt/JS/NV5_/nvtsk-/pkgs/nv-task-event/pkgs/nv-task-event-tree/repr.js:117:21)
    at show (/opt/JS/NV5_/nvtsk-/pkgs/nv-task-event/pkgs/nv-task-event-tree/repr.js:125:21)
    at Task.unparse (/opt/JS/NV5_/nvtsk-/pkgs/nv-task-event/pkgs/nv-task-event-tree/task.js:271:12)
>

*/


> var J = big_task_tree.dump()

/*
      .....
      [Object],    [Array],     'tsk495452', [Object],    [Array],
      'tsk495495', [Object],    [Array],     'tsk495525', [Object],
      [Array],     'tsk495533', [Object],    'tsk495534', [Object],
      [Array],     'tsk495556', [Object],    [Array],     'tsk495572',
      [Object],    [Array],     'tsk495605', [Object],    'tsk495606',
      [Object],    [Array],     'tsk495615', [Object],    [Array],
      'tsk495650', [Object],    'tsk495651', [Object],    'tsk495652',
      [Object],    [Array],     'tsk495672', [Object],    [Array],
      'tsk495688', [Object],    [Array],     'tsk495717', [Object],
      [Array],     'tsk495737', [Object],    [Array],     'tsk495769',
      [Object],    [Array],     'tsk495817', [Object],    [Array],
      'tsk495823', [Object],    [Array],     'tsk495839', [Object],
      'tsk495840', [Object],    [Array],     'tsk495876', [Object],
      [Array],     'tsk495916', [Object],    [Array],     'tsk495949',
      [Object],    [Array],     'tsk495983', [Object],    'tsk495984',
      ... 33 more items
    ],
    'tsk496189',
    {
      type: '1',
      enable_promise: false,
      conder: [Function: DFLT_CU_CONDER],
      executor: [Function: _f],
      args_dict: {}
    },
    ... 30 more items
  ]
]
>
*/


big_task_tree.soft_reset()
