import os
import pandas as pd
from PyQt5 import QtCore, QtWidgets
from PyQt5.QtWidgets import QApplication
from pynput import keyboard
import pyautogui,time
from pynput import mouse

import main

'''
      Click Operation and its properties
'''
class clickWindow(QtWidgets.QMainWindow):
    def __init__(self, df=None):
        super(clickWindow, self).__init__()
        sshFile = os.path.join("style", "style.qss")
        with open(sshFile, "r") as fh:
            self.setStyleSheet(fh.read())
        if df is None:
            self.keyEvents = pd.DataFrame(columns=['Type', 'Button', 'Coordinates'])
        else:
            self.keyEvents = df

        self.initUI()

    def initUI(self):

        self.setObjectName("click")
        self.resize(650, 430)
        self.setWindowTitle(" Properties for Click Element")

        self.click_label = QtWidgets.QLabel(self)
        self.click_label.setGeometry(QtCore.QRect(150, 145, 151, 31))
        self.click_label.setObjectName("click_label")
        self.click_label.setText("Element data")

        self.click_textEdit = QtWidgets.QLineEdit(self)
        self.click_textEdit.setGeometry(QtCore.QRect(260, 140, 301, 35))
        self.click_textEdit.setObjectName("click_textEdit")

        self.note_label = QtWidgets.QLabel(self)
        self.note_label.setGeometry(QtCore.QRect(150, 185, 251, 31))
        self.note_label.setObjectName("note_label")
        self.note_label.setText("*Note: Type in to text field to enter data manually ")


        self.element_type_label = QtWidgets.QLabel(self)
        self.element_type_label.setGeometry(QtCore.QRect(150, 230, 151, 31))
        self.element_type_label.setObjectName("element_type_label")
        self.element_type_label.setText("Choose element type:")

        self.element_type = QtWidgets.QComboBox(self)
        self.element_type.setGeometry(QtCore.QRect(310, 230, 150, 22))
        self.element_type.setObjectName("et_comboBox")
        self.element_type.addItem("Xpath")
        self.element_type.addItem("Coordinates")
        self.element_type.addItem("Image")

        self.click_type_label = QtWidgets.QLabel(self)
        self.click_type_label.setGeometry(QtCore.QRect(150, 265, 151, 31))
        self.click_type_label.setObjectName("click_type_label")
        self.click_type_label.setText("Choose type of click:")

        self.click_type = QtWidgets.QComboBox(self)
        self.click_type.setGeometry(QtCore.QRect(310, 270, 150, 22))
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
        self.ok_browse_Button.setGeometry(QtCore.QRect(500, 140, 60, 35))
        self.ok_browse_Button.setObjectName("ok_browse_Button")
        self.ok_browse_Button.setText("Select")

        self.ok_Button = QtWidgets.QPushButton(self)
        self.ok_Button.setGeometry(QtCore.QRect(230, 350, 75, 31))
        self.ok_Button.setObjectName("ok_Button")
        self.ok_Button.setText("OK")
        self.ok_Button.clicked.connect(self.writeScript)

        self.close_Button = QtWidgets.QPushButton(self)
        self.close_Button.setGeometry(QtCore.QRect(330, 350, 75, 31))
        self.close_Button.setObjectName("close_Button")
        self.close_Button.setText("CANCEL")
        self.close_Button.clicked.connect(self.close_properties)

        self.ok_browse_Button.clicked.connect(self.getfiles)

        self.show()

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
        type = str(self.click_type.currentText())
        argument = type.replace(" ", "")

        if argument == "Click":
            c_type = "click"
        elif argument == "DoubleClick":
            c_type = "dbclick"
        elif argument == "RightClick":
            c_type = "rclick"
        elif argument == "Hover":
            c_type = "hover"
        script = os.path.join("resource", "script.tagui")
        with open(script, "a") as f:
            f.write("\n")
            f.write(c_type + " " + str(data))
        self.click_textEdit.setText("")
        self.close_properties()
        main.ProcessWindow.refresh(self)

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
                self.click_textEdit.setText(dt)

            elif currentOption == 'Coordinates':
                self.click_textEdit.setText("(" + str(x) + "," + str(y) + ")")
            self.keyEvents = pd.DataFrame(None)

            return dt


