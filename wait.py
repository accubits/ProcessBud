import os

from PyQt5 import QtCore, QtWidgets

import main

'''
     Wait Operation and its properties
'''

class waitWindow(QtWidgets.QMainWindow):
    def __init__(self):
        super(waitWindow, self).__init__()
        sshFile = os.path.join("style", "style.qss")
        with open(sshFile, "r") as fh:
            self.setStyleSheet(fh.read())
        self.initUI()

    def initUI(self):

        self.setObjectName("wait")
        self.resize(650, 250)
        self.setWindowTitle("Properties for wait")
        self.waitlabel = QtWidgets.QLabel(self)
        self.waitlabel.setGeometry(QtCore.QRect(100, 90, 151, 31))
        self.waitlabel.setObjectName("label")
        self.waitlabel.setText("Enter the wait time in sec ")
        self.waittextEdit = QtWidgets.QTextEdit(self)
        self.waittextEdit.setGeometry(QtCore.QRect(260, 90, 301, 30))
        self.waittextEdit.setObjectName("textEdit")
        self.wait_OK_Button = QtWidgets.QPushButton(self)
        self.wait_OK_Button.setGeometry(QtCore.QRect(260, 180, 75, 31))
        self.wait_OK_Button.setObjectName("wait_OK_Button")
        self.wait_OK_Button.clicked.connect(self.writeScript)
        self.wait_OK_Button.setText("OK")
        self.wait_Close_Button = QtWidgets.QPushButton(self)
        self.wait_Close_Button.setGeometry(QtCore.QRect(360, 180, 75, 31))
        self.wait_Close_Button.setObjectName("wait_Close_Button")
        self.wait_Close_Button.clicked.connect(self.close_properties)
        self.wait_Close_Button.setText("CANCEL")
        self.show()


    '''
    Script Generation and write to File
    '''

    def writeScript(self):
        data = self.waittextEdit.toPlainText()
        script = os.path.join("resource", "script.tagui")
        with open(script, "a") as f:
            f.write("\n")
            f.write("wait " + str(data))
        self.close_properties()
        main.ProcessWindow.refresh(self)

    def close_properties(self):
        self.close()
