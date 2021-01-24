import os

import pandas as pd
from PyQt5 import QtCore, QtWidgets
from PyQt5.QtWidgets import QApplication
from pynput import keyboard
import pyautogui, time
from pynput import mouse

import main

'''
 Read Operation and its properties
'''


class readtextWindow(QtWidgets.QMainWindow):
    def __init__(self, obj,node_editor, df=None):
        self.node_editor = node_editor
        self.obj = obj
        super(readtextWindow, self).__init__()
        # sshFile = os.path.join("style", "style.qss")
        # with open(sshFile, "r") as fh:
        #     self.setStyleSheet(fh.read())
        if df is None:
            self.keyEvents = pd.DataFrame(columns=['Type', 'Button', 'Coordinates'])
        else:
            self.keyEvents = df

        self.initUI()

    def initUI(self):

        self.setObjectName("read")
        self.resize(650, 430)
        self.setWindowTitle(" Properties for Read Element")
        self.read_attr = self.obj.edit.text()
        self.read_attr1 = ""
        self.read_attr2 = ""
        if self.obj.edit.text() == "":
            print("empty read Data")
        else:
            self.read_attr = self.obj.edit.text().replace('to', '')
            self.attr = list(self.type_attr.split(" "))
            self.read_attr1 = str(self.attr[0])
            self.read_attr2 = self.attr[1]

        self.read_label = QtWidgets.QLabel(self)
        self.read_label.setGeometry(QtCore.QRect(50, 145, 151, 31))
        self.read_label.setObjectName("read_label")
        self.read_label.setText("Element data")

        self.read_textEdit = QtWidgets.QLineEdit(self)
        self.read_textEdit.setGeometry(QtCore.QRect(150, 140, 170, 35))
        self.read_textEdit.setObjectName("read_textEdit")
        self.read_textEdit.setText(self.read_attr1)

        self.note_label = QtWidgets.QLabel(self)
        self.note_label.setGeometry(QtCore.QRect(50, 185, 251, 31))
        self.note_label.setObjectName("note_label")
        self.note_label.setText("*Note: Type in to text field to enter data manually ")

        self.element_type_label = QtWidgets.QLabel(self)
        self.element_type_label.setGeometry(QtCore.QRect(50, 230, 151, 31))
        self.element_type_label.setObjectName("element_type_label")
        self.element_type_label.setText("Choose element type:")

        self.element_type = QtWidgets.QComboBox(self)
        self.element_type.setGeometry(QtCore.QRect(200, 230, 100, 22))
        self.element_type.setObjectName("comboBox")
        self.element_type.addItem("Xpath")
        self.element_type.addItem("Image")


        self.output_label=QtWidgets.QLabel(self)
        self.output_label.setGeometry(QtCore.QRect(50, 285, 151, 31))
        self.output_label.setObjectName("out_label")
        self.output_label.setText("Store output")

        self.output_textEdit = QtWidgets.QLineEdit(self)
        self.output_textEdit.setGeometry(QtCore.QRect(150, 285, 170, 35))
        self.output_textEdit.setObjectName("out_textEdit")
        self.output_textEdit.setText(self.read_attr2)


        self.indicate_Button = QtWidgets.QPushButton(self)
        self.indicate_Button.setGeometry(QtCore.QRect(59, 60, 150, 31))
        self.indicate_Button.setObjectName("indicate_Button")
        self.indicate_Button.setText("Indicate on Browser")
        self.indicate_Button.clicked.connect(self.indicate_onscreen)

        self.ok_browse_Button = QtWidgets.QPushButton(self)
        self.ok_browse_Button.setGeometry(QtCore.QRect(500, 140, 60, 35))
        self.ok_browse_Button.setObjectName("ok_browse_Button")
        self.ok_browse_Button.setText("Select")

        self.apply_Button = QtWidgets.QPushButton(self)
        self.apply_Button.setGeometry(QtCore.QRect(230, 350, 75, 31))
        self.apply_Button.setObjectName("ok_Button")
        self.apply_Button.setText("Apply")
        self.apply_Button.clicked.connect(self.writeToNode)


    '''
      Get Files when the element type is Image
    '''

    def getfiles(self):
        fileName, _ = QtWidgets.QFileDialog.getOpenFileName(self, 'Single File', QtCore.QDir.rootPath(), '*')
        self.read_textEdit.setText(fileName)
        self.element_type.setItemText(0, "Image")

    '''
      Script Generation and write to File
    '''

    def writeToNode(self):
        data1 = self.read_textEdit.text()
        data2=self.output_textEdit.text()
        data = data1 + " to " + data2
        self.obj.edit.setText(data)
        self.node_editor.scene.data_changed = 1



    def close_properties(self):
        self.close()

    '''
       Indicate Elements or Coordinates
    '''

    def indicate_onscreen(self):
        self.mListener = mouse.Listener(on_click=self.on_click)
        self.kListener = keyboard.Listener(on_press=self.on_click, on_release=self.on_click)
        QApplication.clipboard().clear()
        pyautogui.hotkey('alt', 'tab')
        time.sleep(1)
        pyautogui.hotkey('ctrl', 'shift', 'u')
        self.mListener.start()
        self.kListener.start()
        time.sleep(.002)

    '''
       Onclick event triggered
    '''

    def on_click(self, x, y, button, pressed):

        self.keyEvents = self.keyEvents.append(
            {'Type': 'Press' if pressed else 'Release',
             'Coordinates': (x, y),
             'Button': button,

             }, ignore_index=True)

        if len(self.keyEvents) > 0:
            self.mListener.stop()
            self.kListener.stop()
            time.sleep(1)
            pyautogui.hotkey('ctrl', 'shift', 'u')
            time.sleep(1)
            pyautogui.hotkey('alt', 'tab')
            dt = QApplication.clipboard().text()
            currentOption = str(self.element_type.currentText())
            if currentOption == 'Xpath':
                self.read_textEdit.setText(dt)
            self.keyEvents = pd.DataFrame(None)

            return dt
