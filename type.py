import os
import pandas as pd
from PyQt5 import QtCore, QtWidgets
from PyQt5.QtWidgets import QApplication
from pynput import keyboard
import pyautogui,time
from pynput import mouse

import main

'''
      Type Operation and its properties
'''
class typeWindow(QtWidgets.QMainWindow):
    def __init__(self, df=None):
        super(typeWindow, self).__init__()
        sshFile = os.path.join("style", "style.qss")
        with open(sshFile, "r") as fh:
            self.setStyleSheet(fh.read())
        if df is None:
            self.keyEvents = pd.DataFrame(columns=['Type', 'Button', 'Coordinates'])
        else:
            self.keyEvents = df

        self.initUI()

    def initUI(self):

        self.setObjectName("type")
        self.resize(650, 380)
        self.setWindowTitle(" Properties for Type Element")

        self.typelabel1 = QtWidgets.QLabel(self)
        self.typelabel1.setGeometry(QtCore.QRect(100, 80, 151, 31))
        self.typelabel1.setObjectName("click_label")
        self.typelabel1.setText("Element data")

        self.typetextEdit1 = QtWidgets.QLineEdit(self)
        self.typetextEdit1.setGeometry(QtCore.QRect(260, 80, 301, 30))
        self.typetextEdit1.setObjectName("type_textEdit1")

        self.typelabel2 = QtWidgets.QLabel(self)
        self.typelabel2.setGeometry(QtCore.QRect(100, 140, 151, 31))
        self.typelabel2.setObjectName("label")
        self.typelabel2.setText("Enter Text")

        self.typetextEdit2 = QtWidgets.QLineEdit(self)
        self.typetextEdit2.setGeometry(QtCore.QRect(260, 140, 301, 30))
        self.typetextEdit2.setObjectName("textEdit2")

        self.element_type_label = QtWidgets.QLabel(self)
        self.element_type_label.setGeometry(QtCore.QRect(150, 210, 151, 31))
        self.element_type_label.setObjectName("element_type_label")
        self.element_type_label.setText("Choose element type:")

        self.element_type = QtWidgets.QComboBox(self)
        self.element_type.setGeometry(QtCore.QRect(310, 210, 150, 22))
        self.element_type.setObjectName("comboBox")
        self.element_type.addItem("Xpath")
        self.element_type.addItem("Coordinates")

        self.indicate_Button = QtWidgets.QPushButton(self)
        self.indicate_Button.setGeometry(QtCore.QRect(59, 30, 150, 31))
        self.indicate_Button.setObjectName("indicate_Button")
        self.indicate_Button.setText("Indicate the Input")
        self.indicate_Button.clicked.connect(self.indicate_onscreen)

        self.ok_Button = QtWidgets.QPushButton(self)
        self.ok_Button.setGeometry(QtCore.QRect(230, 280, 75, 31))
        self.ok_Button.setObjectName("ok_Button")
        self.ok_Button.setText("OK")
        self.ok_Button.clicked.connect(self.writeScript)

        self.close_Button = QtWidgets.QPushButton(self)
        self.close_Button.setGeometry(QtCore.QRect(330, 280, 75, 31))
        self.close_Button.setObjectName("close_Button")
        self.close_Button.setText("CANCEL")
        self.close_Button.clicked.connect(self.close_properties)


        self.show()


    '''
       Script Generation and write to file
    '''
    def writeScript(self):
        data1 = self.typetextEdit1.text()
        data2 = self.typetextEdit2.text()
        script = os.path.join("resource", "script.tagui")
        with open(script, "a") as f:
            f.write("\ntype " + str(data1) + " as " + data2)
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
                self.typetextEdit1.setText(dt)

            elif currentOption == 'Coordinates':
                self.typetextEdit1.setText("(" + str(x) + "," + str(y) + ")")
            self.keyEvents = pd.DataFrame(None)

            return dt


