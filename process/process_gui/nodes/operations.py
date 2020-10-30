# from PyQt5.QtCore import *
# from process.process_gui.process_conf import *
# from process.process_gui.process_node_base import *
# from node_editor.utils import dumpException
#
#
# class ClickInputContent(QDMNodeContentWidget):
#     def initUI(self):
#         self.edit = QLineEdit("1", self)
#         self.edit.setAlignment(Qt.AlignRight)
#         self.edit.setObjectName(self.node.content_label_objname)
#
#     def serialize(self):
#         res = super().serialize()
#         res['value'] = self.edit.text()
#         return res
#
#     def deserialize(self, data, hashmap={}):
#         res = super().deserialize(data, hashmap)
#         try:
#             value = data['value']
#             self.edit.setText(value)
#             return True & res
#         except Exception as e:
#             dumpException(e)
#         return res
#
#
#
#
#
#
#
#
#
#
#
# @register_node(OP_NODE_CLICK)
# class ProcessNode_Click(ProcessNode):
#     icon = ""
#     op_code = OP_NODE_CLICK
#     op_title = "Click"
#     content_label = ""
#     content_label_objname = "calc_node_bg"
#
#
# @register_node(OP_NODE_WAIT)
# class ProcessNode_Wait(ProcessNode):
#     icon = ""
#     op_code = OP_NODE_WAIT
#     op_title = "Wait"
#     content_label = ""
#     content_label_objname = "calc_node_bg"
#
#     # def __init__(self, scene):
#     #     super().__init__(scene, inputs=[], outputs=[3])
#     #     self.eval()
#
#     def initInnerClasses(self):
#         self.content =ClickInputContent(self)
#         self.grNode = ProcessGraphicsNode(self)
#         self.content.edit.textChanged.connect(self.onInputChanged)
#
#
# @register_node(OP_NODE_URL)
# class ProcessNode_Url(ProcessNode):
#     icon = ""
#     op_code = OP_NODE_URL
#     op_title = "Open Url"
#     content_label = ""
#     content_label_objname = "calc_node_url"
#
#
# @register_node(OP_NODE_READ)
# class ProcessNode_Read(ProcessNode):
#     icon = ""
#     op_code = OP_NODE_READ
#     op_title = "Read"
#     content_label = ""
#     content_label_objname = "calc_node_read"
#
#
