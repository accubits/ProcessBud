import os

from PyQt5.QtWidgets import *
from PyQt5.QtGui import *
from PyQt5.QtCore import *

from node_editor.node_scene import Scene
from node_editor.node_node import Node
from node_editor.node_edge import Edge, EDGE_TYPE_BEZIER
from node_editor.node_graphics_view import QDMGraphicsView


class NodeEditorWnd(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)

        self.stylesheet_filename = 'qss/nodestyle.qss'
        self.loadStylesheet(self.stylesheet_filename)


        self.initUI()

    def initUI(self):
        self.setGeometry(200, 200, 800, 600)

        self.layout = QVBoxLayout()
        self.layout.setContentsMargins(0, 0, 0, 0)
        self.setLayout(self.layout)

        # crate graphics scene
        self.scene = Scene()

        self.addNodes()


        # create graphics view
        self.view = QDMGraphicsView(self.scene.grScene, self)
        self.layout.addWidget(self.view)

        self.setWindowTitle("Node Editor")
        self.show()



    def addNodes(self):
        script = os.path.join("resource", "script.tagui")
        with open(script, 'r') as f:
            self.file_text = f.read()
            lines = self.file_text.splitlines()
            line_number = 0

            x = -350
            y = -250
            nodelist = []
            del_key=['py begin','py finish','echo readmsg','read_info(readmsg)','echo py_result','print(datamsg)']
            while "" in lines:
                lines.remove("")
            for line in lines:
                if line not in del_key and 'py_step' not in line:
                    line = line[0:25]
                    number = line_number + 1
                    node = str("node") + str(line_number)
                    if line_number == 0:
                        node = Node(self.scene, line, outputs=[1])
                    elif line_number == len(lines) - 1:
                        node = Node(self.scene, line, inputs=[0])
                    else:
                        node = Node(self.scene, line, inputs=[0], outputs=[1])

                    nodelist.append(node)
                    node.setPos(x, y)
                    x = x + 250
                    y = y + 150

                    if line_number > 0:
                        edge = str("edge") + str(line_number)

                        edge = Edge(self.scene, nodelist[line_number - 1].outputs[0], nodelist[line_number].inputs[0],
                                    edge_type=EDGE_TYPE_BEZIER)

                    line_number = line_number + 1


    def addDebugContent(self):
        greenBrush = QBrush(Qt.green)
        outlinePen = QPen(Qt.black)
        outlinePen.setWidth(2)

        rect = self.grScene.addRect(-100, -100, 80, 100, outlinePen, greenBrush)
        rect.setFlag(QGraphicsItem.ItemIsMovable)

        text = self.grScene.addText("This is my Awesome text!", QFont("Ubuntu"))
        text.setFlag(QGraphicsItem.ItemIsSelectable)
        text.setFlag(QGraphicsItem.ItemIsMovable)
        text.setDefaultTextColor(QColor.fromRgbF(1.0, 1.0, 1.0))

        widget1 = QPushButton("Hello World")
        proxy1 = self.grScene.addWidget(widget1)
        proxy1.setFlag(QGraphicsItem.ItemIsMovable)
        proxy1.setPos(0, 30)

        widget2 = QTextEdit()
        proxy2 = self.grScene.addWidget(widget2)
        proxy2.setFlag(QGraphicsItem.ItemIsSelectable)
        proxy2.setPos(0, 60)

        line = self.grScene.addLine(-200, -200, 400, -100, outlinePen)
        line.setFlag(QGraphicsItem.ItemIsMovable)
        line.setFlag(QGraphicsItem.ItemIsSelectable)

    def loadStylesheet(self, filename):
        print('STYLE loading:', filename)
        file = QFile(filename)
        file.open(QFile.ReadOnly | QFile.Text)
        stylesheet = file.readAll()
        QApplication.instance().setStyleSheet(str(stylesheet, encoding='utf-8'))

    def onEditDelete(self):
        """Handle Delete Selected operation"""
        if self.getCurrentNodeEditorWidget():
            self.getCurrentNodeEditorWidget().scene.getView().deleteSelected()
