# -*- coding: utf-8 -*-
"""
A module containing Main Window class
"""
import os
import json
from PyQt5.QtWidgets import *
from PyQt5.QtCore import *
from node_editor.node_editor_widget import NodeEditorWidget
from node_editor.node_scene import Scene
from node_editor.node_node import Node
from node_editor.node_edge import Edge, EDGE_TYPE_BEZIER
from node_editor.node_graphics_view import QDMGraphicsView


class NodeEditorWindow(QMainWindow):
    NodeEditorWidget_class = NodeEditorWidget

    """Class representing NodeEditor's Main Window"""

    def __init__(self, parent=None):
        """
        :Instance Attributes:

        - **name_company** - name of the company, used for permanent profile settings
        - **name_product** - name of this App, used for permanent profile settings
        """
        super().__init__(parent)

        self.name_company = 'Blenderfreak'
        self.name_product = 'NodeEditor'

        self.initUI()

    def initUI(self):
        """Set up this ``QMainWindow``. Create :class:`~node_editor.node_editor_widget.NodeEditorWidget`, Actions and Menus"""

        self.nodeeditor = self.__class__.NodeEditorWidget_class(self)
        self.nodeeditor.scene.addHasBeenModifiedListener(self.setTitle)
        self.setCentralWidget(self.nodeeditor)

        self.setGeometry(200, 200, 900, 600)
        self.setTitle()
        self.scene = Scene()
        if self.getCurrentNodeEditorWidget():
            print("selected")


    def sizeHint(self):
        return QSize(800, 600)

    def addNodes(self):
        script = os.path.join("resource", "script.tagui")
        with open(script, 'r') as f:
            self.file_text = f.read()
            lines = self.file_text.splitlines()
            line_number = 0

            x = -350
            y = -250
            nodelist = []
            del_key = ['py begin', 'py finish', 'echo readmsg', 'read_info(readmsg)', 'echo py_result',
                       'print(datamsg)']
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



    def setTitle(self):
        """Function responsible for setting window title"""
        title = "Node Editor - "
        title += self.getCurrentNodeEditorWidget().getUserFriendlyFilename()

        self.setWindowTitle(title)

    def closeEvent(self, event):
        """Handle close event. Ask before we loose work"""
        if self.maybeSave():
            event.accept()
        else:
            event.ignore()

    def isModified(self) -> bool:
        """Has current :class:`~node_editor.node_scene.Scene` been modified?

        :return: ``True`` if current :class:`~node_editor.node_scene.Scene` has been modified
        :rtype: ``bool``
        """
        nodeeditor = self.getCurrentNodeEditorWidget()

        return nodeeditor.scene.isModified() if nodeeditor else False

    def getCurrentNodeEditorWidget(self) -> NodeEditorWidget:
        """get current :class:`~node_editor.node_editor_widget`

        :return: get current :class:`~node_editor.node_editor_widget`
        :rtype: :class:`~nodeeditor.node_editor_widget`
        """
        return self.centralWidget()

    def maybeSave(self) -> bool:
        """If current `Scene` is modified, ask a dialog to save the changes. Used before
        closing window / mdi child document

        :return: ``True`` if we can continue in the `Close Event` and shutdown. ``False`` if we should cancel
        :rtype: ``bool``
        """
        nodeeditor = self.getCurrentNodeEditorWidget()
        if not self.isModified():
            print("Not modified")
            print(nodeeditor.scene.data_changed)
            # print(self.update_change)

            if nodeeditor.scene.data_changed == 0:
                print(nodeeditor.scene.data_changed)
                return True

        res = QMessageBox.warning(self, "About to lose your work?",
                                  "The document has been modified.\n Do you want to save your changes?",
                                  QMessageBox.Save | QMessageBox.Discard | QMessageBox.Cancel
                                  )

        if res == QMessageBox.Save:
            nodeeditor.scene.data_changed = 0

            return self.onFileSave()

        elif res == QMessageBox.Cancel:
            return False

        return True

    def onScenePosChanged(self, x: int, y: int):
        """Handle event when cursor position changed on the `Scene`

        :param x: new cursor x position
        :type x:
        :param y: new cursor y position
        :type y:
        """
        self.status_mouse_pos.setText("Scene Pos: [%d, %d]" % (x, y))

    def getFileDialogDirectory(self):
        """Returns starting directory for ``QFileDialog`` file open/save"""
        return ''

    def getFileDialogFilter(self):
        """Returns ``str`` standard file open/save filter for ``QFileDialog``"""
        return 'Graph (*.json);;All files (*)'



    def onBeforeSaveAs(self, current_nodeeditor: 'NodeEditorWidget', filename: str):
        """
        Event triggered after choosing filename and before actual fileSave(). We are passing current_nodeeditor because
        we will loose focus after asking with QFileDialog and therefore getCurrentNodeEditorWidget will return None
        """
        pass


    def readSettings(self):
        """Read the permanent profile settings for this app"""
        settings = QSettings(self.name_company, self.name_product)
        pos = settings.value('pos', QPoint(200, 200))
        size = settings.value('size', QSize(400, 400))
        self.move(pos)
        self.resize(size)

    def writeSettings(self):
        """Write the permanent profile settings for this app"""
        settings = QSettings(self.name_company, self.name_product)
        settings.setValue('pos', self.pos())
        settings.setValue('size', self.size())
