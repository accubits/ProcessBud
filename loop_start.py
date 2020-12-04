import os

from PyQt5 import QtCore, QtWidgets
from PyQt5.QtWidgets import QLineEdit, QCompleter, QWidget, QVBoxLayout, QHBoxLayout, QSpinBox

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
        self.initUI()
        print(self.obj)

    def initUI(self):
        self.setObjectName("loopstart")

        self.loop_select_lbl = QtWidgets.QLabel(self)
        self.loop_select_lbl.setGeometry(QtCore.QRect(10, 30, 151, 31))
        self.loop_select_lbl.setObjectName("loopselect")
        self.loop_select_lbl.setText("Loop From ")

        self.loop_combo = QtWidgets.QComboBox(self)
        self.loop_combo.setGeometry(QtCore.QRect(160, 30, 150, 31))
        self.loop_combo.setObjectName("loop_comboBox")
        self.loop_combo.addItem("List")
        self.loop_combo.addItem("Counter")
        self.loop_combo.currentTextChanged.connect(self.loop_combobox_changed)

        self.loop_attr = self.obj.edit.text()
        self.loop_val = []
        if self.loop_attr == "":
            print("empty loop")

        else:
            if "for each" in self.loop_attr:
                self.loop_attr = self.loop_attr.replace("for each", "")
                self.loop_attr = self.loop_attr.replace("in", "")
                self.loop_attr = self.loop_attr.split()
                self.loop_val.append("List")
                self.loop_val.append(self.loop_attr[1])


            else:
                self.loop_attr = self.loop_attr.replace("loop count", "")
                self.loop_attr = self.loop_attr.replace(" ", "")

                self.loop_val.append("Counter")
                self.loop_val.append(self.loop_attr)

        self.forList = []

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
                        self.forList.append(name)

                    # forList.append(widgetItem.text())
        print(self.forList)

        self.resize(650, 250)
        self.setWindowTitle("Properties for loopstart")

        self.loop_list_lbl1 = QtWidgets.QLabel(self)

        self.loop_list_lbl1.setGeometry(QtCore.QRect(10, 90, 151, 31))
        self.loop_list_lbl1.setObjectName("label1")
        self.loop_list_lbl1.setText("For each ")

        self.loop_list_txt1 = QtWidgets.QLineEdit(self)
        self.loop_list_txt1.setGeometry(QtCore.QRect(65, 90, 50, 30))
        self.loop_list_txt1.setObjectName("textEdit1")
        self.loop_list_txt1.setText("item")
        self.loop_list_txt1.setReadOnly(True)

        self.loop_list_lbl2 = QtWidgets.QLabel(self)
        self.loop_list_lbl2.setGeometry(QtCore.QRect(140, 90, 40, 31))
        self.loop_list_lbl2.setObjectName("label2")
        self.loop_list_lbl2.setText("in")

        completer = QCompleter(self.forList)
        self.loop_list_txt2 = QtWidgets.QLineEdit(self)
        self.loop_list_txt2.setGeometry(QtCore.QRect(170, 90, 170, 30))
        self.loop_list_txt2.setObjectName("textEdit2")

        self.loop_list_txt2.setPlaceholderText("Enter the List Variable")
        self.loop_list_txt2.setCompleter(completer)

        self.counter_lbl = QtWidgets.QLabel(self)
        self.counter_lbl.setGeometry(QtCore.QRect(10, 100, 170, 30))
        self.counter_lbl.setText("Input the Count for the loop")

        self.counter = QSpinBox(self)
        self.counter.setGeometry(QtCore.QRect(170, 100, 170, 30))
        self.currentOption = str(self.loop_combo.currentText())

        if len(self.loop_val) > 0:
            if self.loop_val[0] == "List":
                print(self.loop_val[0])
                self.loop_list_txt2.setText(self.loop_val[1])
                self.loop_combo.setCurrentText("List")
            else:

                self.counter.setValue(int(self.loop_val[1]))
                self.loop_combo.setCurrentText("Counter")
        else:

            if self.currentOption == "List":
                self.loop_list_txt2.setText("")
            else:
                self.counter.setValue(0)

        self.loop_Apply_Button = QtWidgets.QPushButton(self)
        self.loop_Apply_Button.setGeometry(QtCore.QRect(260, 180, 75, 31))
        self.loop_Apply_Button.setObjectName("wait_Apply_Button")
        self.loop_Apply_Button.clicked.connect(self.writeScript)
        self.loop_Apply_Button.setText("Apply")

        self.loop_combobox_changed()

    '''
    Script Generation and write to File
    '''

    def loop_combobox_changed(self):
        self.currentOption = str(self.loop_combo.currentText())

        print(self.currentOption)
        if self.currentOption == "List":
            self.loop_list_lbl1.show()
            self.loop_list_txt1.show()
            self.loop_list_lbl2.show()
            self.loop_list_txt2.show()
            self.counter_lbl.hide()
            self.counter.hide()

        else:
            self.loop_list_lbl1.hide()
            self.loop_list_txt1.hide()
            self.loop_list_lbl2.hide()
            self.loop_list_txt2.hide()
            self.counter_lbl.show()
            self.counter.show()


    def writeScript(self):
        if self.currentOption == "List":
            data1 = self.loop_list_txt1.text()
            data2 = self.loop_list_txt2.text()
            data = "for each  " + data1 + " in " + data2

        else:
            data1 = self.counter.text()
            data = "loop count " + data1
        self.obj.edit.setText(data)
        self.node_editor.scene.data_changed = 1

    def close_properties(self):
        self.close()
