import os

from PyQt5 import QtCore, QtWidgets
from PyQt5.QtWidgets import QLineEdit

import main

'''
     Wait Operation and its properties
'''

class waitWindow(QtWidgets.QMainWindow):
    def __init__(self,obj,node_editor):
        self.obj = obj
        self.node_editor = node_editor
        super(waitWindow, self).__init__()
        # sshFile = os.path.join("style", "style.qss")
        # with open(sshFile, "r") as fh:
        #     self.setStyleSheet(fh.read())
        self.initUI()
        print(self.obj)

    def initUI(self):
        self.setObjectName("wait")
        self.wait_attr = self.obj.edit.text()

        self.resize(650, 250)
        self.setWindowTitle("Properties for wait")
        self.waitlabel = QtWidgets.QLabel(self)
        self.waitlabel.setGeometry(QtCore.QRect(100, 90, 151, 31))
        self.waitlabel.setObjectName("label")
        self.waitlabel.setText("Enter the wait time in sec ")
        self.waittextEdit = QtWidgets.QLineEdit(self)
        self.waittextEdit.setGeometry(QtCore.QRect(260, 90, 65, 30))
        self.waittextEdit.setObjectName("textEdit")
        self.waittextEdit.setText(self.wait_attr)

        self.wait_Apply_Button = QtWidgets.QPushButton(self)
        self.wait_Apply_Button.setGeometry(QtCore.QRect(260, 180, 75, 31))
        self.wait_Apply_Button.setObjectName("wait_Apply_Button")
        self.wait_Apply_Button.clicked.connect(self.writeScript)
        self.wait_Apply_Button.setText("Apply")
        # self.wait_Close_Button = QtWidgets.QPushButton(self)
        # self.wait_Close_Button.setGeometry(QtCore.QRect(360, 180, 75, 31))
        # self.wait_Close_Button.setObjectName("wait_Close_Button")
        # self.wait_Close_Button.clicked.connect(self.close_properties)
        # self.wait_Close_Button.setText("CANCEL")
        # self.show()


    '''
    Script Generation and write to File
    '''

    def writeScript(self):
        data = self.waittextEdit.text()
        self.obj.edit.setText(data)
        self.node_editor.scene.data_changed = 1

        # script = os.path.join("resource", "script.tagui")
        # with open(script, "a") as f:
        #     f.write("\n")
        #     f.write("wait " + str(data))
        # self.close_properties()
        # main.ProcessWindow.refresh(self)

    def close_properties(self):
        self.close()
