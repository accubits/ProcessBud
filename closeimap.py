import os

from PyQt5 import QtCore, QtGui, QtWidgets

import main

'''
      Close IMap Operation and session destruction
'''
class closeimapWindow(QtWidgets.QMainWindow):
    def __init__(self):
        super(closeimapWindow, self).__init__()
        sshFile = os.path.join("style", "style.qss")
        with open(sshFile, "r") as fh:
            self.setStyleSheet(fh.read())
        self.initUI()

    def initUI(self):
        self.setWindowTitle("Close Session")
        self.setObjectName("close_imap")
        self.resize(650, 230)
        self.label = QtWidgets.QLabel(self)
        self.label.setGeometry(QtCore.QRect(150, 60, 151, 31))
        self.label.setObjectName("label")
        self.label.setText("Session Name")
        self.sessionname = QtWidgets.QLineEdit(self)
        self.sessionname.setGeometry(QtCore.QRect(260, 65, 301, 30))
        self.sessionname.setObjectName("sessionname")
        self.ok_Button = QtWidgets.QPushButton(self)
        self.ok_Button.setGeometry(QtCore.QRect(260, 150, 75, 31))
        self.ok_Button.setObjectName("ok_Button")
        self.ok_Button.setText("Ok")
        self.ok_Button.clicked.connect(self.writeScript)
        self.close_Button = QtWidgets.QPushButton(self)
        self.close_Button.setGeometry(QtCore.QRect(360, 150, 75, 31))
        self.close_Button.setObjectName("close_Button")
        self.close_Button.setText("Close")
        self.close_Button.clicked.connect(self.close_properties)

        self.show()

    '''
    Script Generation and write to File
    '''
    def writeScript(self):
        sessionname = self.sessionname.text()
        script = os.path.join("resource", "script.tagui")
        with open(script, "a") as f:
            f.write(
                "\npy begin\n  CloseIMAPSession('" + sessionname + "')\n py finish")

        self.close_properties()
        main.ProcessWindow.refresh(self)

    def close_properties(self):
        self.close()