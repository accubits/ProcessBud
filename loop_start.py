import os

from PyQt5 import QtCore, QtWidgets
from PyQt5.QtWidgets import QLineEdit, QCompleter

import main

'''
     Loop Operation and its properties
'''


class loopStartWindow(QtWidgets.QMainWindow):
    def __init__(self, obj, node_editor, tbl):
        self.obj = obj
        self.node_editor = node_editor
        self.tbl = tbl
        super(loopStartWindow, self).__init__()
        # sshFile = os.path.join("style", "style.qss")
        # with open(sshFile, "r") as fh:
        #     self.setStyleSheet(fh.read())
        self.initUI()
        print(self.obj)

    def initUI(self):
        self.setObjectName("loopstart")
        self.loop_attr = self.obj.edit.text()
        if self.loop_attr == "":
            self.loop_attr = ["", ""]
        else:
            self.loop_attr = self.loop_attr.replace("for each", "")
            self.loop_attr = self.loop_attr.replace("in", "")
            self.loop_attr = self.loop_attr.split()
            print(self.loop_attr)

        forList = []

        rowCount = self.tbl.rowCount()
        columnCount = self.tbl.columnCount()
        for row in range(rowCount):

            for column in range(columnCount):
                widgetItem = self.tbl.item(row, column)
                heading = self.tbl.horizontalHeaderItem(column).text()
                if heading == "Name" and widgetItem is not None:
                    name = widgetItem.text()
                if heading == "Type":
                    combotxt = self.tbl.cellWidget(row, column)
                    current_value = combotxt.currentText()
                    if current_value == "List":
                        forList.append(name)

                    # forList.append(widgetItem.text())
        print(forList)

        self.resize(650, 250)
        self.setWindowTitle("Properties for loopstart")
        self.looplabel1 = QtWidgets.QLabel(self)
        self.looplabel1.setGeometry(QtCore.QRect(10, 90, 151, 31))
        self.looplabel1.setObjectName("label1")
        self.looplabel1.setText("For each ")

        self.looptextEdit1 = QtWidgets.QLineEdit(self)
        self.looptextEdit1.setGeometry(QtCore.QRect(65, 90, 50, 30))
        self.looptextEdit1.setObjectName("textEdit1")
        # self.looptextEdit1.setText(self.loop_attr[0])
        self.looptextEdit1.setText("item")
        self.looptextEdit1.setReadOnly(True)

        self.looplabel2 = QtWidgets.QLabel(self)
        self.looplabel2.setGeometry(QtCore.QRect(140, 90, 40, 31))
        self.looplabel2.setObjectName("label2")
        self.looplabel2.setText("in")

        completer = QCompleter(forList)
        self.looptextEdit2 = QtWidgets.QLineEdit(self)
        self.looptextEdit2.setGeometry(QtCore.QRect(170, 90, 170, 30))
        self.looptextEdit2.setObjectName("textEdit2")
        self.looptextEdit2.setText(self.loop_attr[1])
        self.looptextEdit2.setPlaceholderText("Enter the List Variable")
        self.looptextEdit2.setCompleter(completer)

        self.loop_Apply_Button = QtWidgets.QPushButton(self)
        self.loop_Apply_Button.setGeometry(QtCore.QRect(260, 180, 75, 31))
        self.loop_Apply_Button.setObjectName("wait_Apply_Button")
        self.loop_Apply_Button.clicked.connect(self.writeScript)
        self.loop_Apply_Button.setText("Apply")


    '''
    Script Generation and write to File
    '''

    def writeScript(self):
        data1 = self.looptextEdit1.text()
        data2 = self.looptextEdit2.text()
        data = "for each  " + data1 + " in " + data2
        self.obj.edit.setText(data)
        self.node_editor.scene.data_changed = 1


    def close_properties(self):
        self.close()
