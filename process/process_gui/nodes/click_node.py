from PyQt5 import QtCore
from PyQt5.QtCore import *
from process.process_gui.process_conf import *
from process.process_gui.process_node_base import *
from nodeeditor.utils import dumpException

# from node_editor.node_content_widget import QDMNodeContentWidget


class ClickInputContent(QDMNodeContentWidget):
    def initUI(self):
        print("This is Click node")
        self.property_label=QLabel("Properties", self)
        self.property_label.setGeometry(QtCore.QRect(3, 3, 155, 20))
        self.property_label.setFont(QFont('Arial', 10))
        self.property_label.setStyleSheet("background-color:grey; border-radius:o.1px;color:white")
        self.edit = QLabel("", self)
        self.edit.setGeometry(QtCore.QRect(6, 30, 155, 20))



    def serialize(self):
        print("Serialisation of Click node")
        res = super().serialize()
        res['value'] = self.edit.text()
        print(res)
        return res

    def deserialize(self, data, hashmap={}):
        print("DeSerialisation of Click node")
        res = super().deserialize(data, hashmap)
        try:
            value = data['value']
            self.edit.setText(value)
            return True & res
        except Exception as e:
            dumpException(e)
        return res

@register_node(OP_NODE_CLICK)
class ProcessNode_Click(ProcessNode):
    icon = ""
    op_code = OP_NODE_CLICK
    op_title = "Click"
    content_label = ""
    content_label_objname = "calc_node_bg"

    def __init__(self, scene):
        print("Registration of Click node")
        print("Node list is")
        print(scene.node_list())
        list=scene.node_list()
        if len(list) == 0:
            super().__init__(scene, inputs="", outputs=[1])
            self.content.property_label.setText("Properties | START")
        else:
            super().__init__(scene, inputs=[1], outputs=[1])

        # super().__init__(scene, inputs=[1], outputs=[1])
        # edge1 = Edge(scene, node1.outputs[0], node2.inputs[0], edge_type=EDGE_TYPE_BEZIER)
        # edge2 = Edge(wnd.scene, node2.outputs[0], node3.inputs[0], edge_type=EDGE_TYPE_BEZIER)

        self.eval()


    def initInnerClasses(self):
        print("InitInnerclasses of Click node")
        self.content = ClickInputContent(self)
        self.grNode = ProcessGraphicsNode(self)
        # self.content.edit.textChanged.connect(self.onInputChanged)


    def evalImplementation(self):
        print("evalImplement of Click node")
        u_value = self.content.edit.text()
        s_value = str(u_value)
        self.value = s_value

        return self.value