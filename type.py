import os
import pandas as pd
from PyQt5 import QtCore, QtWidgets
from PyQt5.QtWidgets import QApplication
from pynput import keyboard
import pyautogui, time
from pynput import mouse

import main

'''
      Type Operation and its properties
'''


class typeWindow(QtWidgets.QMainWindow):
    def __init__(self, obj,node_editor, df=None):
        self.node_editor = node_editor
        self.obj = obj
        super(typeWindow, self).__init__()

        if df is None:
            self.keyEvents = pd.DataFrame(columns=['Type', 'Button', 'Coordinates'])
        else:
            self.keyEvents = df

        self.initUI()

    def initUI(self):

        self.setObjectName("type")
        self.resize(650, 380)
        self.setWindowTitle(" Properties for Type Element")
        self.type_attr = self.obj.edit.text()
        self.type_attr1 = ""
        self.type_attr2 = ""
        if self.obj.edit.text() == "":
            print("empty type Data")
        else:
            self.type_attr = self.obj.edit.text().replace('as', '')
            self.attr = list(self.type_attr.split(" "))
            self.type_attr1 = str(self.attr[0])
            self.type_attr2 = self.attr[1]

        self.typelabel1 = QtWidgets.QLabel(self)
        self.typelabel1.setGeometry(QtCore.QRect(40, 80, 151, 31))
        self.typelabel1.setObjectName("click_label")
        self.typelabel1.setText("Element data")

        self.typetextEdit1 = QtWidgets.QLineEdit(self)
        self.typetextEdit1.setGeometry(QtCore.QRect(150, 80, 180, 30))
        self.typetextEdit1.setObjectName("type_textEdit1")
        self.typetextEdit1.setText(self.type_attr1)

        self.typelabel2 = QtWidgets.QLabel(self)
        self.typelabel2.setGeometry(QtCore.QRect(40, 140, 151, 31))
        self.typelabel2.setObjectName("label")
        self.typelabel2.setText("Enter Text")

        self.typetextEdit2 = QtWidgets.QLineEdit(self)
        self.typetextEdit2.setGeometry(QtCore.QRect(150, 140, 180, 30))
        self.typetextEdit2.setObjectName("textEdit2")
        self.typetextEdit2.setText(self.type_attr2)

        self.element_type_label = QtWidgets.QLabel(self)
        self.element_type_label.setGeometry(QtCore.QRect(100, 210, 151, 31))
        self.element_type_label.setObjectName("element_type_label")
        self.element_type_label.setText("Choose element type:")

        self.element_type = QtWidgets.QComboBox(self)
        self.element_type.setGeometry(QtCore.QRect(250, 210, 80, 22))
        self.element_type.setObjectName("comboBox")
        self.element_type.addItem("Xpath")
        self.element_type.addItem("Coordinates")

        self.indicate_Button = QtWidgets.QPushButton(self)
        self.indicate_Button.setGeometry(QtCore.QRect(59, 30, 150, 31))
        self.indicate_Button.setObjectName("indicate_Button")
        self.indicate_Button.setText("Indicate the Input")
        self.indicate_Button.clicked.connect(self.indicate_onscreen)

        self.apply_Button = QtWidgets.QPushButton(self)
        self.apply_Button.setGeometry(QtCore.QRect(230, 280, 75, 31))
        self.apply_Button.setObjectName("type_apply_Button")
        self.apply_Button.setText("Apply")
        self.apply_Button.clicked.connect(self.writeToNode)

    '''
       Script Generation and write to file
    '''

    def writeToNode(self):
        data1 = self.typetextEdit1.text()
        data2 = self.typetextEdit2.text()
        data = data1 + " as " + data2
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
                self.typetextEdit1.setText(dt)

            elif currentOption == 'Coordinates':
                self.typetextEdit1.setText("(" + str(x) + "," + str(y) + ")")
            self.keyEvents = pd.DataFrame(None)

            return dt
