LISTBOX_MIMETYPE = "application/x-item"

OP_NODE_CLICK = 1
OP_NODE_WAIT = 2
OP_NODE_URL = 3
OP_NODE_TYPE = 4
OP_NODE_READ = 5
OP_Node_OPEN_SESSION = 6
OP_Node_FETCH_EMAIL = 7
OP_Node_CLOSE_SESSION = 8
OP_Node_SEND_EMAIL = 9
OP_Node_Loopstart=10
OP_Node_Loopend=11
OP_NODE_Keys=12


CALC_NODES = {
}


class ConfException(Exception): pass


class InvalidNodeRegistration(ConfException): pass


class OpCodeNotRegistered(ConfException): pass


def register_node_now(op_code, class_reference):
    if op_code in CALC_NODES:
        raise InvalidNodeRegistration("Duplicite node registration of '%s'. There is already %s" % (
            op_code, CALC_NODES[op_code]
        ))
    CALC_NODES[op_code] = class_reference


def register_node(op_code):
    def decorator(original_class):
        register_node_now(op_code, original_class)
        print(original_class)
        return original_class

    return decorator


def get_class_from_opcode(op_code):
    print("opcode is")
    print(op_code)
    if op_code not in CALC_NODES: raise OpCodeNotRegistered("OpCode '%d' is not registered" % op_code)
    print(CALC_NODES[op_code])
    return CALC_NODES[op_code]


# import all nodes and register them
from process.process_gui.nodes import *
