import json
import os
import subprocess
from subprocess import PIPE, run
import time
import logging

from PyQt5 import QtCore
from PyQt5.QtGui import *
from PyQt5.QtWidgets import *
from PyQt5.QtCore import *

import click
from node_editor.node_graphics_scene import QDMGraphicsScene
from node_editor.node_graphics_view import QDMGraphicsView
from node_editor.node_scene import Scene

from node_editor.utils import loadStylesheets
from node_editor.node_editor_window import NodeEditorWindow
from process.process_gui.process_sub_window import ProcessSubWindow
from process.process_gui.process_drag_listbox import QDMDragListbox
from node_editor.utils import dumpException, pp

# Enabling edge validators
from node_editor.node_scene import Scene, InvalidFile
from node_editor.node_edge import Edge
from node_editor.node_edge_validators import *

Edge.registerEdgeValidator(edge_validator_debug)
Edge.registerEdgeValidator(edge_cannot_connect_two_outputs_or_two_inputs)
Edge.registerEdgeValidator(edge_cannot_connect_input_and_output_of_same_node)

from click import clickWindow
from process.properties import PropertiesPanel
from process.process_gui import process_run

# images for the dark skin


DEBUG = False


# class QPlainTextEditLogger(logging.Handler):
#     def __init__(self, parent=None):
#         super().__init__()
#
#         self.widget = QPlainTextEdit(parent)
#         self.widget.setReadOnly(True)
#
#     def emit(self, record):
#         msg = self.format(record)
#         self.widget.textCursor().appendPlainText(msg)
#
#     def write(self, m):
#         pass


class main_Window(NodeEditorWindow):
    def __init__(self, parent=None):
        self.threadpool = QThreadPool()
        super().__init__(parent)
        # self.out=outPanel()
        # self.out.runsignal.connect(lambda: self.addToOutput(line=""))

        # logTextBox = QPlainTextEditLogger(self)
        # # You can format what is printed to text box
        # logTextBox.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
        # logging.getLogger().addHandler(logTextBox)
        # # You can control the logging level
        # logging.getLogger().setLevel(logging.DEBUG)
        # self._button = QPushButton(self)
        # self._button.setText('Test Me')
        # layout = QVBoxLayout()
        # layout.addWidget(self._button)
        # layout.addWidget(logTextBox.widget)
        # self.setLayout(layout)
        # print(logTextBox)

    def initUI(self):
        self.showMaximized()
        self.propertiesPanel = PropertiesPanel
        self.stylesheet_filename = os.path.join(os.path.dirname(__file__), "qss/node_editor.qss")
        loadStylesheets(
            os.path.join(os.path.dirname(__file__), "qss/node_editor-dark.qss"),
            self.stylesheet_filename
        )

        self.empty_icon = QIcon(".")

        if DEBUG:
            print("Registered nodes:")

        self.mdiArea = QMdiArea()
        self.mdiArea.setHorizontalScrollBarPolicy(Qt.ScrollBarAsNeeded)
        self.mdiArea.setVerticalScrollBarPolicy(Qt.ScrollBarAsNeeded)
        self.mdiArea.setViewMode(QMdiArea.TabbedView)
        self.mdiArea.setDocumentMode(True)
        self.mdiArea.setTabsClosable(True)
        self.mdiArea.setTabsMovable(True)
        self.setCentralWidget(self.mdiArea)

        self.mdiArea.subWindowActivated.connect(self.updateMenus)
        self.windowMapper = QSignalMapper(self)
        self.windowMapper.mapped[QWidget].connect(self.setActiveSubWindow)

        self.createNodesDock()
        self.outputDock()
        # self.propertiesDock("none","")
        self.createActions()
        self.createMenus()
        self.createToolBars()
        self.createStatusBar()
        self.updateMenus()

        self.readSettings()

        self.setWindowTitle("ProcessBud")

    def closeEvent(self, event):
        self.mdiArea.closeAllSubWindows()
        if self.mdiArea.currentSubWindow():
            event.ignore()
        else:
            self.writeSettings()
            event.accept()
            # hacky fix for PyQt 5.14.x
            import sys
            sys.exit(0)

    def createActions(self):
        # super().createActions()
        self.actNew = QAction('&New', self, shortcut='Ctrl+N', statusTip="Create new graph", triggered=self.onFileNew)
        self.actOpen = QAction('&Open', self, shortcut='Ctrl+O', statusTip="Open file", triggered=self.onFileOpen)
        self.actSave = QAction('&Save', self, shortcut='Ctrl+S', statusTip="Save file", triggered=self.onFileSave)
        self.actSaveAs = QAction('Save &As...', self, shortcut='Ctrl+Shift+S', statusTip="Save file as...",
                                 triggered=self.onFileSaveAs)
        self.actExit = QAction('E&xit', self, shortcut='Ctrl+Q', statusTip="Exit application", triggered=self.close)

        self.actUndo = QAction('&Undo', self, shortcut='Ctrl+Z', statusTip="Undo last operation",
                               triggered=self.onEditUndo)
        self.actRedo = QAction('&Redo', self, shortcut='Ctrl+Shift+Z', statusTip="Redo last operation",
                               triggered=self.onEditRedo)
        self.actCut = QAction('Cu&t', self, shortcut='Ctrl+X', statusTip="Cut to clipboard", triggered=self.onEditCut)
        self.actCopy = QAction('&Copy', self, shortcut='Ctrl+C', statusTip="Copy to clipboard",
                               triggered=self.onEditCopy)
        self.actPaste = QAction('&Paste', self, shortcut='Ctrl+V', statusTip="Paste from clipboard",
                                triggered=self.onEditPaste)
        self.actDelete = QAction('&Delete', self, shortcut='Del', statusTip="Delete selected items",
                                 triggered=self.onEditDelete)

        self.actClose = QAction("Cl&ose", self, statusTip="Close the active window",
                                triggered=self.mdiArea.closeActiveSubWindow)
        self.actCloseAll = QAction("Close &All", self, statusTip="Close all the windows",
                                   triggered=self.mdiArea.closeAllSubWindows)
        self.actTile = QAction("&Tile", self, statusTip="Tile the windows", triggered=self.mdiArea.tileSubWindows)
        self.actCascade = QAction("&Cascade", self, statusTip="Cascade the windows",
                                  triggered=self.mdiArea.cascadeSubWindows)
        self.actNext = QAction("Ne&xt", self, shortcut=QKeySequence.NextChild,
                               statusTip="Move the focus to the next window",
                               triggered=self.mdiArea.activateNextSubWindow)
        self.actPrevious = QAction("Pre&vious", self, shortcut=QKeySequence.PreviousChild,
                                   statusTip="Move the focus to the previous window",
                                   triggered=self.mdiArea.activatePreviousSubWindow)

        self.actSeparator = QAction(self)
        self.actSeparator.setSeparator(True)

        self.actAbout = QAction("&About", self, statusTip="Show the application's About box", triggered=self.about)
        self.actRun = QAction("Run", self, shortcut='Ctrl+R', statusTip="Run the application",
                              triggered=self.run)
        self.actStop = QAction("Stop", self, shortcut='Ctrl+T', statusTip="Stop the application",
                               triggered=self.stopapp)

    def getCurrentNodeEditorWidget(self):
        """ we're returning nodeeditorwidget here... """
        activeSubWindow = self.mdiArea.activeSubWindow()
        if activeSubWindow:
            return activeSubWindow.widget()
        return None

    def onFileNew(self):
        try:
            subwnd = self.createMdiChild()
            subwnd.widget().fileNew()
            subwnd.show()
        except Exception as e:
            dumpException(e)

    def onFileOpen(self):
        fnames, filter = QFileDialog.getOpenFileNames(self, 'Open graph from file', self.getFileDialogDirectory(),
                                                      self.getFileDialogFilter())

        try:
            for fname in fnames:
                if fname:
                    existing = self.findMdiChild(fname)
                    if existing:
                        self.mdiArea.setActiveSubWindow(existing)
                    else:
                        # we need to create new subWindow and open the file
                        nodeeditor = ProcessSubWindow()
                        if nodeeditor.fileLoad(fname):

                            nodeeditor.scene.data_changed = 0

                            self.statusBar().showMessage("File %s loaded" % fname, 5000)
                            nodeeditor.setTitle()
                            subwnd = self.createMdiChild(nodeeditor)
                            subwnd.show()
                        else:
                            nodeeditor.close()
        except Exception as e:
            dumpException(e)

    def about(self):
        QMessageBox.about(self, "About Proocess Bud",
                          "The <b>Process Bud</b> is an RPA Tool that allows you to automate the mundane task. This is the First Version of Process Bud and this interface applications using PyQt5 and NodeEditor. For more information visit: "
                          "<a href='https://www.accubits.com/'>www.accubits.com</a>")

    def run(self):
        self.outputWidget.clear()

        print("Run")
        current_nodeeditor = self.getCurrentNodeEditorWidget()
        current_nodeeditor.save_temp()
        process_run.runProcess.execute_process(self)
        runner = Runner(self.outputWidget)
        self.threadpool.start(runner)



    def createMenus(self):
        # super().createMenus()

        self.createFileMenu()
        self.createEditMenu()
        self.createUndoMenu()
        self.createRedoMenu()
        self.createRunMenu()
        self.createStopMenu()

        self.windowMenu = self.menuBar().addMenu("&Window")
        self.updateWindowMenu()
        self.windowMenu.aboutToShow.connect(self.updateWindowMenu)

        self.menuBar().addSeparator()

        self.helpMenu = self.menuBar().addMenu("&Help")
        self.helpMenu.addAction(self.actAbout)

        self.editMenu.aboutToShow.connect(self.updateEditMenu)

    def createFileMenu(self):
        menubar = self.menuBar()
        self.fileMenu = menubar.addMenu('&File')
        self.fileMenu.addAction(self.actNew)
        self.fileMenu.addSeparator()
        self.fileMenu.addAction(self.actOpen)
        self.fileMenu.addAction(self.actSave)
        self.fileMenu.addAction(self.actSaveAs)
        self.fileMenu.addSeparator()
        self.fileMenu.addAction(self.actExit)

    def createEditMenu(self):
        menubar = self.menuBar()
        self.editMenu = menubar.addMenu('&Edit')
        # self.editMenu.addAction(self.actUndo)
        # self.editMenu.addAction(self.actRedo)
        self.editMenu.addSeparator()
        self.editMenu.addAction(self.actCut)
        self.editMenu.addAction(self.actCopy)
        self.editMenu.addAction(self.actPaste)
        self.editMenu.addSeparator()
        self.editMenu.addAction(self.actDelete)

    def createRunMenu(self):
        menubar = self.menuBar()
        menubar.addAction(self.actRun)

    def createUndoMenu(self):
        menubar = self.menuBar()
        menubar.addAction(self.actUndo)

    def createRedoMenu(self):
        menubar = self.menuBar()
        menubar.addAction(self.actRedo)

    def createStopMenu(self):
        menubar = self.menuBar()
        menubar.addAction(self.actStop)
        # self.runMenu = menubar.addMenu('Stop')

    def createClearMenu(self):
        menubar = self.menuBar()
        self.clearMenu = menubar.addMenu('&Clear')

    def onFileSave(self):
        """Handle File Save operation"""
        current_nodeeditor = self.getCurrentNodeEditorWidget()
        print("name")
        print(current_nodeeditor.filename)
        if current_nodeeditor is not None:
            if not current_nodeeditor.isFilenameSet():
                print("untitled project")
                return self.onFileSaveAs()
            elif "Untitled_Project" in current_nodeeditor.getUserFriendlyFilename():
                print("untitled json")
                return self.onFileSaveAs()

            current_nodeeditor.fileSave()
            self.statusBar().showMessage("Successfully saved %s" % current_nodeeditor.filename, 5000)

            # support for MDI app
            if hasattr(current_nodeeditor, "setTitle"):
                current_nodeeditor.setTitle()
            else:
                self.setTitle()
            return True

    def onFileSaveAs(self):
        """Handle File Save As operation"""
        current_nodeeditor = self.getCurrentNodeEditorWidget()
        if current_nodeeditor is not None:
            fname, filter = QFileDialog.getSaveFileName(self, 'Save graph to file', self.getFileDialogDirectory(),
                                                        self.getFileDialogFilter())
            if fname == '': return False

            self.onBeforeSaveAs(current_nodeeditor, fname)
            current_nodeeditor.fileSave(fname)
            self.statusBar().showMessage("Successfully saved as %s" % current_nodeeditor.filename, 5000)

            # support for MDI app
            if hasattr(current_nodeeditor, "setTitle"):
                current_nodeeditor.setTitle()
            else:
                self.setTitle()
            return True

    def onEditUndo(self):
        """Handle Edit Undo operation"""
        if self.getCurrentNodeEditorWidget():
            self.getCurrentNodeEditorWidget().scene.history.undo()

    def onEditRedo(self):
        """Handle Edit Redo operation"""
        if self.getCurrentNodeEditorWidget():
            self.getCurrentNodeEditorWidget().scene.history.redo()

    def onEditDelete(self):
        """Handle Delete Selected operation"""
        if self.getCurrentNodeEditorWidget():
            self.getCurrentNodeEditorWidget().scene.getView().deleteSelected()

    def onEditCut(self):
        """Handle Edit Cut to clipboard operation"""
        if self.getCurrentNodeEditorWidget():
            data = self.getCurrentNodeEditorWidget().scene.clipboard.serializeSelected(delete=True)
            str_data = json.dumps(data, indent=4)
            QApplication.instance().clipboard().setText(str_data)

    def onEditCopy(self):
        """Handle Edit Copy to clipboard operation"""
        if self.getCurrentNodeEditorWidget():
            data = self.getCurrentNodeEditorWidget().scene.clipboard.serializeSelected(delete=False)
            str_data = json.dumps(data, indent=4)
            QApplication.instance().clipboard().setText(str_data)

    def onEditPaste(self):
        """Handle Edit Paste from clipboard operation"""
        if self.getCurrentNodeEditorWidget():
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

            return self.getCurrentNodeEditorWidget().scene.clipboard.deserializeFromClipboard(data)

    def updateMenus(self):
        # print("update Menus")
        active = self.getCurrentNodeEditorWidget()
        hasMdiChild = (active is not None)

        self.actSave.setEnabled(hasMdiChild)
        self.actSaveAs.setEnabled(hasMdiChild)
        self.actClose.setEnabled(hasMdiChild)
        self.actCloseAll.setEnabled(hasMdiChild)
        self.actTile.setEnabled(hasMdiChild)
        self.actCascade.setEnabled(hasMdiChild)
        self.actNext.setEnabled(hasMdiChild)
        self.actPrevious.setEnabled(hasMdiChild)
        self.actSeparator.setVisible(hasMdiChild)

        self.updateEditMenu()

    def updateEditMenu(self):
        try:
            # print("update Edit Menu")
            active = self.getCurrentNodeEditorWidget()
            hasMdiChild = (active is not None)

            self.actPaste.setEnabled(hasMdiChild)

            self.actCut.setEnabled(hasMdiChild and active.hasSelectedItems())
            self.actCopy.setEnabled(hasMdiChild and active.hasSelectedItems())
            self.actDelete.setEnabled(hasMdiChild and active.hasSelectedItems())

            self.actUndo.setEnabled(hasMdiChild and active.canUndo())
            self.actRedo.setEnabled(hasMdiChild and active.canRedo())
        except Exception as e:
            dumpException(e)

    def updateWindowMenu(self):
        self.windowMenu.clear()

        featurecheck = self.windowMenu.addAction("Features Panel")
        featurecheck.setCheckable(True)
        featurecheck.triggered.connect(self.onWindowNodesToolbar)
        outcheck = self.windowMenu.addAction("output Panel")
        outcheck.setCheckable(True)
        outcheck.triggered.connect(self.onWindowOutput)
        # toolbar_nodes.setChecked(self.nodesDock.isVisible())

        self.windowMenu.addSeparator()

        self.windowMenu.addAction(self.actClose)
        self.windowMenu.addAction(self.actCloseAll)
        self.windowMenu.addSeparator()
        # self.windowMenu.addAction(self.actTile)
        # self.windowMenu.addAction(self.actCascade)
        # self.windowMenu.addSeparator()
        self.windowMenu.addAction(self.actNext)
        self.windowMenu.addAction(self.actPrevious)
        self.windowMenu.addAction(self.actSeparator)

        windows = self.mdiArea.subWindowList()
        self.actSeparator.setVisible(len(windows) != 0)

        for i, window in enumerate(windows):
            child = window.widget()

            text = "%d %s" % (i + 1, child.getUserFriendlyFilename())
            if i < 9:
                text = '&' + text

            action = self.windowMenu.addAction(text)
            action.setCheckable(True)
            action.setChecked(child is self.getCurrentNodeEditorWidget())
            action.triggered.connect(self.windowMapper.map)
            self.windowMapper.setMapping(action, window)

    def onWindowNodesToolbar(self):

        if self.nodesDock.isVisible():
            self.nodesDock.hide()
        else:
            self.nodesDock.show()

    def onWindowOutput(self):

        if self.outDock.isVisible():
            self.outDock.hide()
        else:
            self.outDock.show()

    def createToolBars(self):
        pass

    def createNodesDock(self):

        self.nodesListWidget = QDMDragListbox()

        self.nodesDock = QDockWidget("Features Panel")
        self.nodesDock.setWidget(self.nodesListWidget)
        self.nodesDock.setFloating(False)

        self.addDockWidget(Qt.LeftDockWidgetArea, self.nodesDock)

    def outputDock(self):

        self.outputWidget = QListWidget()
        # self.outputWidget = QPushButton("test")

        self.outDock = QDockWidget("Output Panel")
        self.outDock.setWidget(self.outputWidget)
        self.outDock.setFloating(True)

        self.addDockWidget(Qt.BottomDockWidgetArea, self.outDock)

    @pyqtSlot(str)
    def addToOutput(self, line):
        self.outputWidget.addItem(line)

    @pyqtSlot(str, object)
    def propertiesDock(self, value, objval):
        print("parameter" + value)
        current_nodeeditor = self.getCurrentNodeEditorWidget()
        self.propertiesPanel.propertytab(self, value, objval, current_nodeeditor)

    def createStatusBar(self):
        self.statusBar().showMessage("Ready")

    def createMdiChild(self, child_widget=None):

        nodeeditor = child_widget if child_widget is not None else ProcessSubWindow()

        subwnd = self.mdiArea.addSubWindow(nodeeditor)

        subwnd.setWindowIcon(self.empty_icon)
        nodeeditor.view.itemsel.connect(self.propertiesDock)
        nodeeditor.scene.history.addHistoryModifiedListener(self.updateEditMenu)
        nodeeditor.addCloseEventListener(self.onSubWndClose)

        nodeeditor.scene.data_changed = 0
        return subwnd

    def onSubWndClose(self, widget, event):
        existing = self.findMdiChild(widget.filename)
        self.mdiArea.setActiveSubWindow(existing)

        if self.maybeSave():
            event.accept()
        else:
            event.ignore()

    def findMdiChild(self, filename):
        for window in self.mdiArea.subWindowList():
            if window.widget().filename == filename:
                return window
        return None

    def setActiveSubWindow(self, window):
        if window:
            self.mdiArea.setActiveSubWindow(window)

    def stopapp(self):
        stop_process = os.path.join("resource", "end_processes.cmd")
        subprocess.call(stop_process)
        msg = QMessageBox()
        msg.setIcon(QMessageBox.Information)
        msg.setText("Curent Process Excecution has been Stopped ")
        msg.setWindowTitle("Information")
        msg.setStandardButtons(QMessageBox.Ok)
        returnValue = msg.exec()


class Runner(QRunnable):
    '''
    Runner thread
    '''

    def __init__(self, out_list, parent=None):
        self.outputWidget = out_list
        super().__init__()
        # self.run()


    @pyqtSlot()
    def run(self):
        '''
        Your code goes in this function
        '''

        dir = os.path.join("resource")
        script = os.path.join("resource", "script.tagui")
        with open(script) as f:
            if 'http' in f.read():
                command="cd " + dir + " & tagui script.tagui chrome"
                # subprocess.call(command, shell=True)

            else:

                command="cd " + dir + " & tagui script.tagui"
            proc = subprocess.Popen(command,
                                    shell=True,
                                    stdin=subprocess.PIPE,
                                    stdout=subprocess.PIPE,
                                    )
            # output=proc.communicate('\tstdin: to stdin\n')
            output = proc.communicate()[0]
            output = output.decode('UTF-8')
            # print(output)
            self.outputWidget.addItem(output)

        time.sleep(1)

