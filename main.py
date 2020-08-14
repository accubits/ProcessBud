import sys
import os
from PyQt5 import QtCore, QtWidgets,QtGui
import time
from PyQt5.QtCore import QRunnable, QThreadPool, pyqtSlot, Qt
from PyQt5.QtWidgets import QWidget, QScrollArea, QHBoxLayout, QGridLayout, QPushButton, QToolBar, \
    QToolButton, QVBoxLayout, QMessageBox
import url
import click
import wait
import type
import readtext
import openimap
import closeimap
import sendemail
import fetchemail
from node_editor.node_editor_wnd import NodeEditorWnd


import subprocess

'''
Main Window for the interface
'''


class ProcessWindow(QWidget):
    def __init__(self, parent=None):
        QWidget.__init__(self, parent)
        self.setObjectName("main_process")
        sshFile = os.path.join("style", "style.qss")
        with open(sshFile, "r") as fh:
            self.setStyleSheet(fh.read())
        self.threadpool = QThreadPool()
        self.initUI()


    def initUI(self):
        self.setWindowTitle("Process Bud")
        self.showMaximized()
        self.centralwidget = QtWidgets.QWidget(self)
        self.centralwidget.setObjectName("centralwidget")
        self.centralwidget.setGeometry(QtCore.QRect(100, 10, 1000, 1000))
        self.horizontalLayout_1 = QHBoxLayout(self)
        self.scrollArea = QScrollArea(self)
        self.scrollAreaWidgetContents = QWidget()
        self.scrollArea.setWidgetResizable(True)
        self.scrollAreaWidgetContents.setGeometry(QtCore.QRect(0, 0, 380, 280))

        self.horizontalLayout_2 = QHBoxLayout(self.scrollAreaWidgetContents)
        self.gridLayout = QGridLayout()
        self.gridLayout.setSpacing(20)
        self.horizontalLayout_2.addLayout(self.gridLayout)
        self.verticalLayout_1 = QVBoxLayout()
        self.horizontalLayout_3 = QHBoxLayout()
        self.verticalLayout_1.addLayout(self.horizontalLayout_3)
        self.listWidget = QtWidgets.QListWidget(self.centralwidget)
        self.listWidget.setMinimumWidth(950)
        self.scrollArea.setWidget(self.scrollAreaWidgetContents)
        self.wnd = NodeEditorWnd()
        self.verticalLayout_1.addWidget(self.wnd)

        '''
        Controls for Basic Operations
        '''
        self.basictool_button = QToolButton(self.centralwidget)
        self.basictool_button.setText(" Basic Controls")
        self.basictool_button.setFixedWidth(150)
        self.basictool_button.setFixedHeight(30)
        self.basictool_button.setToolButtonStyle(Qt.ToolButtonTextBesideIcon)
        self.click_button = QPushButton("Click")
        self.wait_button = QPushButton("Wait")
        self.type_button = QPushButton("Type")
        self.read_button = QPushButton("Read")
        self.url_button = QPushButton("Visit Url")

        '''
        Controls for Email Operations
        '''
        self.emailtool_button = QToolButton(self.centralwidget)
        self.emailtool_button.setText("Email")
        self.emailtool_button.setFixedWidth(150)
        self.emailtool_button.setFixedHeight(30)

        self.open_imap_session_button = QPushButton("Open session")
        self.fetch_email_button = QPushButton("Fetch Email")
        self.close_imap_session_button = QPushButton("Close session")
        self.send_email_button = QPushButton("Send Email")

        '''
        # Controls for Application/Windows Operations
        # '''
        # self.applicationtool_button = QToolButton(self.centralwidget)
        # self.applicationtool_button.setText("Application/Windows")
        # self.applicationtool_button.setFixedWidth(150)
        # self.applicationtool_button.setFixedHeight(30)
        # self.open_application_button = QPushButton("Open Application")
        # self.close_application_button = QPushButton("Close Application")
        # self.focus_application_button = QPushButton("Focus Application")
        #
        # '''
        # Controls for Keyboard Operations
        # '''
        # self.keyboardtool_button = QToolButton(self.centralwidget)
        # self.keyboardtool_button.setText("Keyboard Controls")
        # self.keyboardtool_button.setFixedWidth(150)
        # self.keyboardtool_button.setFixedHeight(30)
        # self.key_button = QPushButton("Send Hotkeys")

        self.run_application_button = QPushButton("Run Application")
        self.run_application_button.setFixedWidth(150)
        self.run_application_button.setFixedHeight(30)
        self.run_application_button.setGeometry(QtCore.QRect(450, 50, 75, 31))
        self.run_application_button.clicked.connect(self.runappWindow)

        self.stop_application_button = QPushButton("STOP")
        self.stop_application_button.setFixedWidth(150)
        self.stop_application_button.setFixedHeight(30)
        self.stop_application_button.setGeometry(QtCore.QRect(550, 50, 75, 31))

        self.clear_button = QPushButton("CLEAR")
        self.clear_button.setFixedWidth(150)
        self.clear_button.setFixedHeight(30)
        self.clear_button.setGeometry(QtCore.QRect(650, 50, 75, 31))

        self.about_button = QPushButton("ABOUT")
        self.about_button.setFixedWidth(150)
        self.about_button.setFixedHeight(30)
        self.about_button.setGeometry(QtCore.QRect(750, 50, 75, 31))

        '''
        Addition of Widget to corresponding Layouts
        '''
        self.horizontalLayout_1.addWidget(self.scrollArea)
        self.horizontalLayout_1.addLayout(self.verticalLayout_1)

        self.horizontalLayout_3.addWidget(self.run_application_button)
        self.horizontalLayout_3.addWidget(self.stop_application_button)
        self.horizontalLayout_3.addWidget(self.clear_button)
        self.horizontalLayout_3.addWidget(self.about_button)

        self.horizontalLayout_3.addStretch()

        self.gridLayout.addWidget(self.basictool_button)
        self.gridLayout.addWidget(self.click_button)
        self.gridLayout.addWidget(self.wait_button)
        self.gridLayout.addWidget(self.type_button)
        self.gridLayout.addWidget(self.read_button)
        self.gridLayout.addWidget(self.url_button)
        self.gridLayout.addWidget(self.emailtool_button)
        self.gridLayout.addWidget(self.open_imap_session_button)
        self.gridLayout.addWidget(self.fetch_email_button)
        self.gridLayout.addWidget(self.close_imap_session_button)
        self.gridLayout.addWidget(self.send_email_button)
        # self.gridLayout.addWidget(self.applicationtool_button)
        # self.gridLayout.addWidget(self.open_application_button)
        # self.gridLayout.addWidget(self.close_application_button)
        # self.gridLayout.addWidget(self.focus_application_button)
        # self.gridLayout.addWidget(self.keyboardtool_button)
        # self.gridLayout.addWidget(self.key_button)

        self.click_button.clicked.connect(self.open_click_window)
        self.wait_button.clicked.connect(self.open_wait_window)
        self.type_button.clicked.connect(self.open_type_window)
        self.read_button.clicked.connect(self.read_text_window)
        self.url_button.clicked.connect(self.open_url_window)
        self.open_imap_session_button.clicked.connect(self.openimapWindow)
        self.close_imap_session_button.clicked.connect(self.closeimapWindow)
        self.send_email_button.clicked.connect(self.sendemailWindow)
        self.fetch_email_button.clicked.connect(self.fetchemailWindow)
        self.stop_application_button.clicked.connect(self.stopapp)
        self.clear_button.clicked.connect(self.clearscript)
        self.about_button.clicked.connect(self.aboutTool)
        self.setGeometry(10, 10, 1320, 700)

    def refresh(self):
        _close=QtWidgets.QApplication.closeAllWindows()
        self.window=ProcessWindow()

    def open_click_window(self):
        self.click_window = click.clickWindow()

    def open_wait_window(self):
        self.wait_window = wait.waitWindow()

    def open_type_window(self):
        self.type_window = type.typeWindow()

    def read_text_window(self):
        self.read_window = readtext.readtextWindow()

    def open_url_window(self):
        self.url_window = url.urlWindow()

    def openimapWindow(self):
        self.openimapWindow = openimap.openimapWindow()

    def closeimapWindow(self):
        self.closeimapWindow = closeimap.closeimapWindow()

    def sendemailWindow(self):
        self.sendemailWindow = sendemail.sendemailWindow()

    def fetchemailWindow(self):
        self.fetchemailWindow = fetchemail.fetchemailWindow()

    def aboutTool(self):
        msg = QMessageBox()
        msg.setIcon(QMessageBox.Information)
        msg.setText("Process Bud is an RPA Tool that allows you to automate the mundane task. This is the First Version of Process Bud")
        msg.setWindowTitle("About")
        msg.setStandardButtons(QMessageBox.Ok)
        msg.exec()



    def clearscript(self):
        msg = QMessageBox()
        msg.setIcon(QMessageBox.Warning)
        msg.setText("Are you sure you want to clear the script? ")
        msg.setWindowTitle("Warning")
        msg.setStandardButtons(QMessageBox.Yes | QMessageBox.No)
        returnValue = msg.exec()
        if returnValue == QMessageBox.Yes:
            script = os.path.join("resource", "script.tagui")
            with open(script, "r+") as f:
                f.truncate(0)
        self.refresh()


    def runappWindow(self):
        runner = Runner()
        self.threadpool.start(runner)

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

    @pyqtSlot()
    def run(self):
        '''
        Your code goes in this function
        '''
        dir = os.path.join("resource")
        script = os.path.join("resource", "script.tagui")
        with open(script) as f:
            if 'http' in f.read():

                subprocess.call("cd " + dir + " & tagui script.tagui chrome", shell=True)
            else:

                subprocess.call("cd " + dir + " & tagui script.tagui", shell=True)

        time.sleep(1)


def main():
    app = QtWidgets.QApplication(sys.argv)
    gui = ProcessWindow()
    gui.show()
    sys.exit(app.exec_())




if __name__ == '__main__':
    main()
