from PyQt5 import QtCore
from PyQt5.QtCore import *
from process.process_gui.process_conf import *
from process.process_gui.process_node_base import *
from node_editor.utils import dumpException


class KeysInputContent(QDMNodeContentWidget):
    def initUI(self):
        self.property_label = QLabel("Properties", self)
        self.property_label.setGeometry(QtCore.QRect(3, 3, 155, 20))
        self.property_label.setFont(QFont('Arial', 10))
        self.property_label.setStyleSheet("background-color:grey; border-radius:o.1px;color:white")
        self.edit = QLabel("", self)
        self.edit.setGeometry(QtCore.QRect(6, 30, 155, 20))
        self.edit.setObjectName(self.node.content_label_objname)

        self.key = []
        # self.key.hide()

    def serialize(self):
        res = super().serialize()
        res['value'] = self.edit.text()
        res['val'] = {"key":self.key}
        return res

    def deserialize(self, data, hashmap={}):
        res = super().deserialize(data, hashmap)
        try:
            value = data['value']
            val = data['val']['key']
            self.edit.setText(value)
            self.key = val
            return True & res
        except Exception as e:
            dumpException(e)
        return res


@register_node(OP_NODE_Keys)
class ProcessNode_Wait(ProcessNode):
    icon = ""
    op_code = OP_NODE_Keys
    op_title = "Short keys"
    content_label = ""
    content_label_objname = "calc_node_bg"

    def __init__(self, scene):
        list = scene.node_list()
        if len(list) == 0:
            super().__init__(scene, inputs="", outputs=[1])
            self.content.property_label.setText("Properties | START")
        else:
            super().__init__(scene, inputs=[1], outputs=[1])
        self.eval()

    def initInnerClasses(self):
        self.content = KeysInputContent(self)
        self.grNode = ProcessGraphicsNode(self)
        # self.content.edit.textChanged.connect(self.onInputChanged)

    def evalImplementation(self):
        u_value = self.content.edit.text()
        s_value = str(u_value)
        return self.value