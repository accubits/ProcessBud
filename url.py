import os

from PyQt5 import QtCore, QtWidgets
import main

'''
     Open browser Operation and its properties
'''


class urlWindow(QtWidgets.QMainWindow):
    def __init__(self, obj, node_editor):
        self.node_editor = node_editor
        self.obj = obj
        super(urlWindow, self).__init__()
        # sshFile = os.path.join("style", "style.qss")
        # with open(sshFile, "r") as fh:
        #     self.setStyleSheet(fh.read())
        self.initUI()

    def initUI(self):
        self.setObjectName("url")
        self.setWindowTitle("Properties for Visit URL")
        self.resize(650, 230)
        self.url_attr = self.obj.edit.text()
        self.urllabel = QtWidgets.QLabel(self)
        self.urllabel.setGeometry(QtCore.QRect(30, 80, 151, 31))
        self.urllabel.setObjectName("label")
        self.urllabel.setText("Enter the website url ")
        self.urltextEdit = QtWidgets.QLineEdit(self)
        self.urltextEdit.setGeometry(QtCore.QRect(160, 80, 180, 30))
        self.urltextEdit.setObjectName("textEdit")
        self.urltextEdit.setText(self.url_attr)

        self.url_Apply_Button = QtWidgets.QPushButton(self)
        self.url_Apply_Button.setGeometry(QtCore.QRect(260, 160, 75, 31))
        self.url_Apply_Button.setObjectName("url_Apply_Button")
        self.url_Apply_Button.clicked.connect(self.writeToNode)
        self.url_Apply_Button.setText("Apply")
        # self.url_Close_Button = QtWidgets.QPushButton(self)
        # self.url_Close_Button.setGeometry(QtCore.QRect(360, 160, 75, 31))
        # self.url_Close_Button.setObjectName("url_Close_Button")
        # self.url_Close_Button.clicked.connect(self.close_properties)
        # self.url_Close_Button.setText("CANCEL")
        # self.show()

    '''
    Script Generation and write to File
    '''

    def writeToNode(self):
        data = self.urltextEdit.text()
        self.obj.edit.setText(data)
        self.node_editor.scene.data_changed = 1

        # activeSubWindow = self.mdiArea.activeSubWindow()
        # print(activeSubWindow)

    def close_properties(self):
        self.close()
