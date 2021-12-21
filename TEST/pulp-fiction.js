var bp = `
(
    {
        (
            [文森特和老黑去一所小公寓里抢箱子]->
            [文森特错手杀死了车上的小混混]->
            [两人去了吉米家里]->
            [打电话给黑帮老大求助]->
            [老大派来狼]->
            [处理完成后狼走了]
        )->   [文森特和老黑前往餐厅]                           -|
        (
    	     [雌雄小贼计划抢劫餐厅]
    	)->    [雌雄小贼前往餐厅]                              -|
    
    } -> [餐厅遭遇]-> 
    
    {
    
        (
    	   [文森特便秘]-> 
    	   [文森特上厕所]
        ) ->  [文森特从厕所出来]                                -|
        (
           [雌雄小贼打劫] ->
           [老黑对峙雌雄小贼]
        ) -> [文森特和老黑制服雌雄小贼]                         -|
    } -> [文森特和老黑驾车前往老大家] ->
) -> [遭遇拳击手]
`



function creat_executor(delay) {
    let _f = (rtrn,thrw,self)=> {
         console.log(`<${self.name_}>`,'started at',new Date())
         setTimeout(
             ()=> {
                 console.log(`</${self.name_}>`,'succ at',new Date())
                 rtrn(self.name_)
             },
             delay
         )
    }
    return(_f)
}

var tsk = evt.load_from_blue_print(bp);

tsk.$sdfs_.forEach(T=>T.executor_ = creat_executor(5000));

tsk.executor_         = (rtrn,thrw,self) => {  
    rtrn(self.$sdfs_.map(nd=>nd.rslt_))    
}

var p = tsk.launch()




