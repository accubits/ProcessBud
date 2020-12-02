import os

from PyQt5 import QtCore, QtWidgets
from PyQt5.QtWidgets import QLineEdit, QCompleter

import main

'''
     Loop Operation and its properties
'''


class loopEndWindow(QtWidgets.QMainWindow):
    def __init__(self, obj, node_editor, tbl):
        self.obj = obj
        self.node_editor = node_editor
        self.tbl = tbl
        super(loopEndWindow, self).__init__()
        self.initUI()
        print(self.obj)

    def initUI(self):
        self.setObjectName("loopend")

        self.resize(650, 250)
        self.setWindowTitle("Properties for loopend")
        self.looplabel1 = QtWidgets.QLabel(self)
        self.looplabel1.setGeometry(QtCore.QRect(150, 90, 251, 31))
        self.looplabel1.setObjectName("label1")
        self.looplabel1.setText("Loop Ended ")


