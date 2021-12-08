const {noexist} = require("nv-facutil-basic");

const TYPES = {
   'serial':0,'parallel':1,
    0:'serial',1:'parallel'
}

const ERRORS = {
    'not_supported_type':'not_supported_type',
    'leaf_node_should_not_recv_notification':'leaf_node_should_not_recv_notification',
    'only_on_root_task':'only_on_root_task',
    'can_only_start_when_ready':'can_only_start_when_ready',
    'can_only_pause_when_pending':'can_only_pause_when_pending',
    'can_only_continue_when_pause':'can_only_continue_when_pause',
    'state_not_supported':'state_not_supported',
    'serial_should_not_recv_child_noti_when_no_ready':'serial_should_not_recv_child_noti_when_no_ready',
    'should_not_recv_child_noti_if_pending':'should_not_recv_child_noti_if_pending',
    'should_not_recv_child_noti_if_resolved':'should_not_recv_child_noti_if_resolved',
    'should_not_recv_child_pause_noti_if_stopped':'should_not_recv_child_pause_noti_if_stopped',
    'can_soft_reset_only_when_settled':'can_soft_reset_only_when_settled',
}

const sym_curr    = Symbol("")

const sym_state   = Symbol("")

const sym_rs      = Symbol("")
const sym_rj      = Symbol("")
const sym_start   = Symbol("")
const sym_respawn = Symbol("")
const sym_pause   = Symbol("")
const sym_rerdy   = Symbol("")


module.exports = {
    TYPES,
    ERRORS,
    ////
    sym_curr,
    ////
    sym_state,
    ////
    sym_rs,
    sym_rj,
    sym_start,
    sym_respawn,
    sym_rerdy,
    ////
    noexist
}
