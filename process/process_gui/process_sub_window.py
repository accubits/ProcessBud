import json
from process.process_gui.process_conf import *
from node_editor.node_editor_widget import NodeEditorWidget
from process.process_gui.process_node_base import *
from node_editor.node_edge import EDGE_TYPE_DIRECT, EDGE_TYPE_BEZIER
from node_editor.node_graphics_view import MODE_EDGE_DRAG  # , MODE_EDGES_REROUTING
from node_editor.utils import dumpException

DEBUG = False
DEBUG_CONTEXT = False


class ProcessSubWindow(NodeEditorWidget):
    def __init__(self):
        super().__init__()
        # self.setAttribute(Qt.WA_DeleteOnClose)

        self.setTitle()

        self.initNewNodeActions()

        self.scene.addHasBeenModifiedListener(self.setTitle)
        self.scene.history.addHistoryRestoredListener(self.onHistoryRestored)
        self.scene.addDragEnterListener(self.onDragEnter)
        self.scene.addDropListener(self.onDrop)
        self.scene.setNodeClassSelector(self.getNodeClassFromData)

        self._close_event_listeners = []
        self.pasteval = 0
        # self.variableDtDock()

    # def variableDtDock(self):
    #     # current_nodeeditor = self.getCurrentNodeEditorWidget()
    #     # if current_nodeeditor==nodeeditor:
    #
    #     print("Variable List")
    #     self.variableWidget = QWidget(self)
    #     # creating a vertical box layout
    #     self.variableLayout = QVBoxLayout(self)
    #     # self.add = QPushButton("+", self)
    #     self.variableTable = QTableWidget()
    #
    #     # adding these buttons to the layout
    #     # self.variableLayout.addWidget(self.add)
    #     self.variableLayout.addWidget(self.variableTable)
    #     # setting the layout to the widget
    #     self.variableWidget.setLayout(self.variableLayout)
    #     self.variableTable.setColumnCount(4)
    #     self.variableTable.setHorizontalHeaderItem(0, QTableWidgetItem("Name"))
    #     self.variableTable.setHorizontalHeaderItem(1, QTableWidgetItem("Type"))
    #     self.variableTable.setHorizontalHeaderItem(2, QTableWidgetItem("Default value"))
    #     self.variableTable.setHorizontalHeaderItem(3, QTableWidgetItem("Action"))
    #     self.variableTable.horizontalHeader().setSectionResizeMode(0, QHeaderView.Stretch)
    #     self.variableTable.horizontalHeader().setSectionResizeMode(1, QHeaderView.Stretch)
    #     self.variableTable.horizontalHeader().setSectionResizeMode(2, QHeaderView.Stretch)
    #     self.variableDock = QDockWidget("Variable Panel")
    #     self.variableDock.setWidget(self.variableWidget)
    #     self.variableDock.setFloating(True)

        # self.addDockWidget(Qt.BottomDockWidgetArea, self.variableDock)




    def getNodeClassFromData(self, data):
        if 'op_code' not in data: return Node
        return get_class_from_opcode(data['op_code'])

    def doEvalOutputs(self):
        # eval all output nodes
        for node in self.scene.nodes:
            if node.__class__.__name__ == "CalcNode_Output":
                node.eval()

    def onHistoryRestored(self):
        self.doEvalOutputs()

    def fileLoad(self, filename):
        if super().fileLoad(filename):
            self.doEvalOutputs()
            return True

        return False

    def initNewNodeActions(self):
        self.node_actions = {}
        keys = list(CALC_NODES.keys())
        keys.sort()
        for key in keys:
            node = CALC_NODES[key]
            self.node_actions[node.op_code] = QAction(QIcon(node.icon), node.op_title)
            self.node_actions[node.op_code].setData(node.op_code)

    def initNodesContextMenu(self):
        context_menu = QMenu(self)
        keys = list(CALC_NODES.keys())
        keys.sort()
        for key in keys: context_menu.addAction(self.node_actions[key])
        return context_menu

    def setTitle(self):
        self.setWindowTitle(self.getUserFriendlyFilename())

    def addCloseEventListener(self, callback):
        self._close_event_listeners.append(callback)

    def closeEvent(self, event):
        for callback in self._close_event_listeners: callback(self, event)

    def onDragEnter(self, event):
        if event.mimeData().hasFormat(LISTBOX_MIMETYPE):
            event.acceptProposedAction()
        else:
            # print(" ... denied drag enter event")
            event.setAccepted(False)

    def onDrop(self, event):
        if event.mimeData().hasFormat(LISTBOX_MIMETYPE):
            eventData = event.mimeData().data(LISTBOX_MIMETYPE)
            dataStream = QDataStream(eventData, QIODevice.ReadOnly)
            pixmap = QPixmap()
            dataStream >> pixmap
            op_code = dataStream.readInt()
            text = dataStream.readQString()

            mouse_position = event.pos()
            scene_position = self.scene.grScene.views()[0].mapToScene(mouse_position)

            if DEBUG: print("GOT DROP: [%d] '%s'" % (op_code, text), "mouse:", mouse_position, "scene:", scene_position)

            try:

                node = get_class_from_opcode(op_code)(self.scene)
                node.setPos(scene_position.x(), scene_position.y())
                self.scene.history.storeHistory("Created node %s" % node.__class__.__name__)
                print(self.scene.history.storeHistory)
            except Exception as e:
                dumpException(e)

            event.setDropAction(Qt.MoveAction)
            event.accept()
        else:
            # print(" ... drop ignored, not requested format '%s'" % LISTBOX_MIMETYPE)
            event.ignore()

    def contextMenuEvent(self, event):
        try:
            item = self.scene.getItemAt(event.pos())
            if DEBUG_CONTEXT: print(item)

            if type(item) == QGraphicsProxyWidget:
                item = item.widget()

            if hasattr(item, 'node') or hasattr(item, 'socket'):
                self.handleNodeContextMenu(event)
            elif hasattr(item, 'edge'):
                self.handleEdgeContextMenu(event)
            # elif item is None:
            else:
                self.handleNewNodeContextMenu(event)

            return super().contextMenuEvent(event)
        except Exception as e:
            dumpException(e)

    def handleNodeContextMenu(self, event):
        action = ""
        print("event", event)
        if DEBUG_CONTEXT: print("CONTEXT: NODE")

        selected = None
        item = self.scene.getItemAt(event.pos())
        if type(item) == QGraphicsProxyWidget:
            item = item.widget()

        if hasattr(item, 'node'):
            selected = item.node
        if hasattr(item, 'socket'):
            selected = item.socket.node
        data = self.scene.clipboard.serializeSelected(delete=False)

        if selected:
            if len(data['nodes']) > 0:
                context_menu = QMenu(self)
                Copy = context_menu.addAction("Copy")
                Cut = context_menu.addAction("Cut")
                Del = context_menu.addAction("Delete")
                if item.node.start == "0":
                    start = context_menu.addAction("Make it start")
                action = context_menu.exec_(self.mapToGlobal(event.pos()))
                if action == Copy:
                    self.pasteval = 1
                    data = self.scene.clipboard.serializeSelected(delete=False)
                    str_data = json.dumps(data, indent=4)
                    QApplication.instance().clipboard().setText(str_data)
                elif action == Cut:
                    self.pasteval = 1
                    data = self.scene.clipboard.serializeSelected(delete=True)
                    str_data = json.dumps(data, indent=4)
                    QApplication.instance().clipboard().setText(str_data)
                elif action == Del:
                    nodelist = self.scene.node_list()
                    self.nextstartdt = ""
                    nodelist = sorted(nodelist, key=lambda x: x.pos.x(), reverse=False)
                    if item.node.start == "1":
                        del_node = 0
                        for node in nodelist:

                            if node.start == "1":
                                del_node = 1
                            else:

                                if del_node == 1:
                                    print("next start node", node)
                                    del_node = 0
                                    self.nextstartdt = node
                                    for socket in self.nextstartdt.inputs:
                                        socket.delete()
                                    self.nextstartdt.start = "1"
                                    self.nextstartdt.content.property_label.setText("Properties | START")

                        self.scene.getView().deleteSelected()

                        inputs = [1]
                        outputs = [1]
                        for node in nodelist:
                            if node.start == "0":
                                node.initSockets(inputs, outputs)
                    else:
                        self.scene.getView().deleteSelected()

                elif action == start:

                    nodelist = self.scene.node_list()
                    inputs = [1]
                    outputs = [1]

                    for node in nodelist:

                        if node == item.node:
                            node.start = "1"
                            node.content.property_label.setText("Properties | Start")

                            for socket in node.inputs:
                                if hasattr(socket, 'grSocket'):
                                    socket.delete()
                                    # if socket.hasEdge():
                                    for edge in socket.edges:
                                        if DEBUG: print("    - removing from socket:", socket, "edge:", edge)
                                        edge.remove()

                            node.inputs = []
                        elif node.start == "1":
                            node.start = "0"
                            node.content.property_label.setText("Properties")
                            node.initSockets(inputs, outputs)

                        else:
                            node.start = "0"
                            node.content.property_label.setText("Properties")

        else:

            context_menu = QMenu(self)
            Paste = context_menu.addAction("Paste")
            action = context_menu.exec_(self.mapToGlobal(event.pos()))

        if DEBUG_CONTEXT: print("got item:", selected)

    def handleEdgeContextMenu(self, event):
        if DEBUG_CONTEXT: print("CONTEXT: EDGE")
        context_menu = QMenu(self)
        bezierAct = context_menu.addAction("Bezier Edge")
        directAct = context_menu.addAction("Direct Edge")
        action = context_menu.exec_(self.mapToGlobal(event.pos()))

        selected = None
        item = self.scene.getItemAt(event.pos())
        if hasattr(item, 'edge'):
            selected = item.edge

        if selected and action == bezierAct: selected.edge_type = EDGE_TYPE_BEZIER
        if selected and action == directAct: selected.edge_type = EDGE_TYPE_DIRECT

    # helper functions
    def determine_target_socket_of_node(self, was_dragged_flag, new_calc_node):
        target_socket = None
        if was_dragged_flag:
            if len(new_calc_node.inputs) > 0: target_socket = new_calc_node.inputs[0]
        else:
            if len(new_calc_node.outputs) > 0: target_socket = new_calc_node.outputs[0]
        return target_socket

    def finish_new_node_state(self, new_calc_node):
        self.scene.doDeselectItems()
        new_calc_node.grNode.doSelect(True)
        new_calc_node.grNode.onSelected()

    def handleNewNodeContextMenu(self, event):
        if self.pasteval == 1:
            context_menu = QMenu(self)
            Paste = context_menu.addAction("Paste")
            action = context_menu.exec_(self.mapToGlobal(event.pos()))
            if action == Paste:
                raw_data = QApplication.instance().clipboard().text()

                try:
                    data = json.loads(raw_data)
                except ValueError as e:
                    print("Pasting of not valid json data!", e)
                    return

                # check if the json data are correct
                if 'nodes' not in data:
                    print("JSON does not contain any nodes!")
                    return

                return self.scene.clipboard.deserializeFromClipboard(data)
