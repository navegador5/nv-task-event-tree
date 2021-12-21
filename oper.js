const {
    newSetTimeout,
	newClearTimeout,
} = require("nv-facutil-promise");


const creat_wait_executor   = (delay,value) => {
    let _f = (rs,rj,self) => {
         let ids = newSetTimeout(
             ()=>{
                 rs(value);
                 newClearTimeout(ids);
             },
             delay
         )
    }
    return(_f)
}


module.exports = {
   creat_wait_executor
}
