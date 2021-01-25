import os

from PyQt5 import QtCore, QtGui, QtWidgets

import main

'''
      Close IMap Operation and session destruction
'''
class closeimapWindow(QtWidgets.QMainWindow):
    def __init__(self,obj,node_editor):
        self.node_editor = node_editor
        self.obj = obj
        super(closeimapWindow, self).__init__()
        self.initUI()

    def initUI(self):
        self.setWindowTitle("Close Session")
        self.setObjectName("close_imap")
        self.resize(650, 230)
        self.close_session_attr = self.obj.edit.text()
        self.label = QtWidgets.QLabel(self)
        self.label.setGeometry(QtCore.QRect(40, 60, 151, 31))
        self.label.setObjectName("label")
        self.label.setText("Session Name")
        self.sessionname = QtWidgets.QLineEdit(self)
        self.sessionname.setGeometry(QtCore.QRect(150, 65, 140, 30))
        self.sessionname.setObjectName("sessionname")
        self.sessionname.setText(self.close_session_attr)
        self.apply_Button = QtWidgets.QPushButton(self)
        self.apply_Button.setGeometry(QtCore.QRect(260, 150, 75, 31))
        self.apply_Button.setObjectName("apply_Button")
        self.apply_Button.setText("Apply")
        self.apply_Button.clicked.connect(self.writeToNode)



    '''
    Script Generation and write to File
    '''
    def writeToNode(self):
        data = self.sessionname.text()
        self.obj.edit.setText(data)
        self.node_editor.scene.data_changed = 1



    def close_properties(self):
        self.close()