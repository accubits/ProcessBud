import os
import pandas as pd
from PyQt5 import QtCore, QtWidgets
from PyQt5.QtWidgets import QApplication
from pynput import keyboard
import pyautogui, time
from pynput import mouse

from node_editor.node_editor_widget import NodeEditorWidget
from node_editor.node_scene import Scene, InvalidFile
from node_editor.node_node import Node

'''
      Click Operation and its properties
'''


class clickWindow(QtWidgets.QMainWindow):

    # NodeEditorWidget_class = NodeEditorWidget
    def __init__(self, obj, node_editor, df=None):
        self.node_editor = node_editor
        self.obj = obj

        super(clickWindow, self).__init__()

        if df is None:
            self.keyEvents = pd.DataFrame(columns=['Type', 'Button', 'Coordinates'])
        else:
            self.keyEvents = df

        self.initUI()

    def initUI(self):

        self.setObjectName("click")
        self.resize(650, 430)
        self.setWindowTitle(" Properties for Click Element")
        self.click_attr = self.obj.edit.text()

        self.click_label = QtWidgets.QLabel(self)
        self.click_label.setGeometry(QtCore.QRect(20, 145, 151, 31))
        self.click_label.setObjectName("click_label")
        self.click_label.setText("Element data")

        self.click_textEdit = QtWidgets.QLineEdit(self)
        self.click_textEdit.setGeometry(QtCore.QRect(100, 140, 151, 35))
        self.click_textEdit.setObjectName("click_textEdit")
        self.click_textEdit.setText(self.click_attr)

        # self.click_textEdit.textChanged(self.onChange)

        self.note_label = QtWidgets.QLabel(self)
        self.note_label.setGeometry(QtCore.QRect(20, 185, 251, 31))
        self.note_label.setObjectName("note_label")
        self.note_label.setText("*Note: Type in to text field to enter data manually ")

        self.element_type_label = QtWidgets.QLabel(self)
        self.element_type_label.setGeometry(QtCore.QRect(20, 230, 151, 31))
        self.element_type_label.setObjectName("element_type_label")
        self.element_type_label.setText("Choose element type:")

        self.element_type = QtWidgets.QComboBox(self)
        self.element_type.setGeometry(QtCore.QRect(150, 230, 150, 22))
        self.element_type.setObjectName("et_comboBox")
        self.element_type.addItem("Xpath")
        self.element_type.addItem("Coordinates")
        self.element_type.addItem("Image")

        self.click_type_label = QtWidgets.QLabel(self)
        self.click_type_label.setGeometry(QtCore.QRect(20, 265, 151, 31))
        self.click_type_label.setObjectName("click_type_label")
        self.click_type_label.setText("Choose type of click:")

        self.click_type = QtWidgets.QComboBox(self)
        self.click_type.setGeometry(QtCore.QRect(150, 270, 150, 22))
        self.click_type.setObjectName("ct_comboBox")
        self.click_type.addItem("Click")
        self.click_type.addItem("Double Click")
        self.click_type.addItem("Right Click")
        self.click_type.addItem("Hover")

        self.indicate_Button = QtWidgets.QPushButton(self)
        self.indicate_Button.setGeometry(QtCore.QRect(59, 60, 150, 31))
        self.indicate_Button.setObjectName("indicate_Button")
        self.indicate_Button.setText("Indicate on Screen")
        self.indicate_Button.clicked.connect(self.indicate_onscreen)

        self.ok_browse_Button = QtWidgets.QPushButton(self)
        self.ok_browse_Button.setGeometry(QtCore.QRect(250, 140, 60, 35))
        self.ok_browse_Button.setObjectName("ok_browse_Button")
        self.ok_browse_Button.setText("Select")

        self.apply_Button = QtWidgets.QPushButton(self)
        self.apply_Button.setGeometry(QtCore.QRect(230, 350, 75, 31))
        self.apply_Button.setObjectName("apply_Button")
        self.apply_Button.setText("Apply")
        self.apply_Button.clicked.connect(self.writeScript)

        self.ok_browse_Button.clicked.connect(self.getfiles)

    def onChange(self):
        print("change")

    '''
       Get Files when the element type is Image
    '''

    def getfiles(self):
        fileName, _ = QtWidgets.QFileDialog.getOpenFileName(self, 'Single File', QtCore.QDir.rootPath(), '*')
        self.click_textEdit.setText(fileName)
        self.element_type.setItemText(0, "Image")

    '''
       Script Generation and write to file
    '''

    def writeScript(self):

        data = self.click_textEdit.text()
        self.obj.edit.setText(data)
        self.node_editor.scene.data_changed = 1

    def close_properties(self):
        self.close()

    '''
    indicate elements or coordinates
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
                self.click_textEdit.setText(dt)

            elif currentOption == 'Coordinates':
                self.click_textEdit.setText("(" + str(x) + "," + str(y) + ")")
            self.keyEvents = pd.DataFrame(None)

            return dt
