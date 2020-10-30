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

    # @pyqtSlot(str)
    # def propertiesDock(self, value):
    #     print("parameter" + value)
    #     self.propertiesPanel.propertytab(self, value)

    def initUI(self):
        """Set up this ``QMainWindow``. Create :class:`~node_editor.node_editor_widget.NodeEditorWidget`, Actions and Menus"""
        # self.createActions()
        # self.createMenus()

        # create node editor widget
        self.nodeeditor = self.__class__.NodeEditorWidget_class(self)
        self.nodeeditor.scene.addHasBeenModifiedListener(self.setTitle)
        self.setCentralWidget(self.nodeeditor)
        # self.createNodesDock2()
        # self.createStatusBar()

        # set window properties
        self.setGeometry(200, 200, 900, 600)
        self.setTitle()
        self.scene = Scene()
        # self.view = QDMGraphicsView(self.scene.grScene, self)
        # self.layout.addWidget(self.view)
        # self.view.itemsel.connect(self.propertiesDock)
        # self.nodeeditor.view.itemsel.connect(self.propertiesDock)
        print("testtest")

        # self.propertiesDock()
        if self.getCurrentNodeEditorWidget():
            print("selected")
        # self.addNodes()
        # self.show()

    # def propertiesDock(self):
    #     print("parameter")
    #     self.propertiesPanel.propertytab(self)

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

    # def createStatusBar(self):
    #     """Create Status bar and connect to `Graphics View` scenePosChanged event"""
    #     self.statusBar().showMessage("")
    #     self.status_mouse_pos = QLabel("")
    #     self.statusBar().addPermanentWidget(self.status_mouse_pos)
    #     self.nodeeditor.view.scenePosChanged.connect(self.onScenePosChanged)

    # def createActions(self):
    #     """Create basic `File` and `Edit` actions"""
    #     self.actNew = QAction('&New', self, shortcut='Ctrl+N', statusTip="Create new graph", triggered=self.onFileNew)
    #     self.actOpen = QAction('&Open', self, shortcut='Ctrl+O', statusTip="Open file", triggered=self.onFileOpen)
    #     self.actSave = QAction('&Save', self, shortcut='Ctrl+S', statusTip="Save file", triggered=self.onFileSave)
    #     self.actSaveAs = QAction('Save &As...', self, shortcut='Ctrl+Shift+S', statusTip="Save file as...", triggered=self.onFileSaveAs)
    #     self.actExit = QAction('E&xit', self, shortcut='Ctrl+Q', statusTip="Exit application", triggered=self.close)
    #
    #     self.actUndo = QAction('&Undo', self, shortcut='Ctrl+Z', statusTip="Undo last operation", triggered=self.onEditUndo)
    #     self.actRedo = QAction('&Redo', self, shortcut='Ctrl+Shift+Z', statusTip="Redo last operation", triggered=self.onEditRedo)
    #     self.actCut = QAction('Cu&t', self, shortcut='Ctrl+X', statusTip="Cut to clipboard", triggered=self.onEditCut)
    #     self.actCopy = QAction('&Copy', self, shortcut='Ctrl+C', statusTip="Copy to clipboard", triggered=self.onEditCopy)
    #     self.actPaste = QAction('&Paste', self, shortcut='Ctrl+V', statusTip="Paste from clipboard", triggered=self.onEditPaste)
    #     self.actDelete = QAction('&Delete', self, shortcut='Del', statusTip="Delete selected items", triggered=self.onEditDelete)

    # def createMenus(self):
    #     """Create Menus for `File` and `Edit`"""
    #     self.createFileMenu()
    #     self.createEditMenu()
    #     self.createRunMenu()
    #     self.createStopMenu()
    #     self.createClearMenu()

    # def createFileMenu(self):
    #     menubar = self.menuBar()
    #     self.fileMenu = menubar.addMenu('&File')
    #     self.fileMenu.addAction(self.actNew)
    #     self.fileMenu.addSeparator()
    #     self.fileMenu.addAction(self.actOpen)
    #     self.fileMenu.addAction(self.actSave)
    #     self.fileMenu.addAction(self.actSaveAs)
    #     self.fileMenu.addSeparator()
    #     self.fileMenu.addAction(self.actExit)

    # def propertiesDock(self):
    #     # print(config.property)
    #     self.propertiesPanel.propertytab()

    # def createEditMenu(self):
    #     menubar = self.menuBar()
    #     self.editMenu = menubar.addMenu('&Edit')
    #     # self.editMenu.addAction(self.actUndo)
    #     # self.editMenu.addAction(self.actRedo)
    #     # self.editMenu.addSeparator()
    #     # self.editMenu.addAction(self.actCut)
    #     # self.editMenu.addAction(self.actCopy)
    #     # self.editMenu.addAction(self.actPaste)
    #     self.editMenu.addSeparator()
    #     self.editMenu.addAction(self.actDelete)

    # def createRunMenu(self):
    #     menubar = self.menuBar()
    #     self.runMenu = menubar.addMenu('&Run')
    #
    # def createStopMenu(self):
    #     menubar = self.menuBar()
    #     self.runMenu = menubar.addMenu('Stop')
    #
    # def createClearMenu(self):
    #     menubar = self.menuBar()
    #     self.clearMenu = menubar.addMenu('&Clear')

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

        res = QMessageBox.warning(self, "About to loose your work?",
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

    # def onFileNew(self):
    #     """Hande File New operation"""
    #     if self.maybeSave():
    #         self.getCurrentNodeEditorWidget().fileNew()
    #         self.setTitle()
    #
    #
    # def onFileOpen(self):
    #     """Handle File Open operation"""
    #     if self.maybeSave():
    #         fname, filter = QFileDialog.getOpenFileName(self, 'Open graph from file', self.getFileDialogDirectory(), self.getFileDialogFilter())
    #         if fname != '' and os.path.isfile(fname):
    #             self.getCurrentNodeEditorWidget().fileLoad(fname)
    #             self.setTitle()

    # def onFileSave(self):
    #     """Handle File Save operation"""
    #     current_nodeeditor = self.getCurrentNodeEditorWidget()
    #     if current_nodeeditor is not None:
    #         if not current_nodeeditor.isFilenameSet(): return self.onFileSaveAs()
    #
    #         current_nodeeditor.fileSave()
    #         self.statusBar().showMessage("Successfully saved %s" % current_nodeeditor.filename, 5000)
    #
    #         # support for MDI app
    #         if hasattr(current_nodeeditor, "setTitle"): current_nodeeditor.setTitle()
    #         else: self.setTitle()
    #         return True

    # def onFileSaveAs(self):
    #     """Handle File Save As operation"""
    #     current_nodeeditor = self.getCurrentNodeEditorWidget()
    #     if current_nodeeditor is not None:
    #         fname, filter = QFileDialog.getSaveFileName(self, 'Save graph to file', self.getFileDialogDirectory(), self.getFileDialogFilter())
    #         if fname == '': return False
    #
    #         self.onBeforeSaveAs(current_nodeeditor, fname)
    #         current_nodeeditor.fileSave(fname)
    #         self.statusBar().showMessage("Successfully saved as %s" % current_nodeeditor.filename, 5000)
    #
    #         # support for MDI app
    #         if hasattr(current_nodeeditor, "setTitle"): current_nodeeditor.setTitle()
    #         else: self.setTitle()
    #         return True

    def onBeforeSaveAs(self, current_nodeeditor: 'NodeEditorWidget', filename: str):
        """
        Event triggered after choosing filename and before actual fileSave(). We are passing current_nodeeditor because
        we will loose focus after asking with QFileDialog and therefore getCurrentNodeEditorWidget will return None
        """
        pass

    #
    # def onEditUndo(self):
    #     """Handle Edit Undo operation"""
    #     if self.getCurrentNodeEditorWidget():
    #         self.getCurrentNodeEditorWidget().scene.history.undo()
    #
    # def onEditRedo(self):
    #     """Handle Edit Redo operation"""
    #     if self.getCurrentNodeEditorWidget():
    #         self.getCurrentNodeEditorWidget().scene.history.redo()
    #
    # def onEditDelete(self):
    #     """Handle Delete Selected operation"""
    #     if self.getCurrentNodeEditorWidget():
    #         self.getCurrentNodeEditorWidget().scene.getView().deleteSelected()
    #
    # def onEditCut(self):
    #     """Handle Edit Cut to clipboard operation"""
    #     if self.getCurrentNodeEditorWidget():
    #         data = self.getCurrentNodeEditorWidget().scene.clipboard.serializeSelected(delete=True)
    #         str_data = json.dumps(data, indent=4)
    #         QApplication.instance().clipboard().setText(str_data)
    #
    # def onEditCopy(self):
    #     """Handle Edit Copy to clipboard operation"""
    #     if self.getCurrentNodeEditorWidget():
    #         data = self.getCurrentNodeEditorWidget().scene.clipboard.serializeSelected(delete=False)
    #         str_data = json.dumps(data, indent=4)
    #         QApplication.instance().clipboard().setText(str_data)
    #
    # def onEditPaste(self):
    #     """Handle Edit Paste from clipboard operation"""
    #     if self.getCurrentNodeEditorWidget():
    #         raw_data = QApplication.instance().clipboard().text()
    #
    #         try:
    #             data = json.loads(raw_data)
    #         except ValueError as e:
    #             print("Pasting of not valid json data!", e)
    #             return
    #
    #         # check if the json data are correct
    #         if 'nodes' not in data:
    #             print("JSON does not contain any nodes!")
    #             return
    #
    #         return self.getCurrentNodeEditorWidget().scene.clipboard.deserializeFromClipboard(data)

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
