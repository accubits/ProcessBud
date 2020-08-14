import os

from PyQt5 import QtCore, QtWidgets
import main

'''
     Open browser Operation and its properties
'''
class urlWindow(QtWidgets.QMainWindow):
    def __init__(self):
        super(urlWindow, self).__init__()
        sshFile = os.path.join("style", "style.qss")
        with open(sshFile, "r") as fh:
            self.setStyleSheet(fh.read())
        self.initUI()


    def initUI(self):
        self.setObjectName("url")
        self.setWindowTitle("Properties for Visit URL")
        self.resize(650, 230)
        self.urllabel = QtWidgets.QLabel(self)
        self.urllabel.setGeometry(QtCore.QRect(100, 80, 151, 31))
        self.urllabel.setObjectName("label")
        self.urllabel.setText("Enter the website url ")
        self.urltextEdit = QtWidgets.QTextEdit(self)
        self.urltextEdit.setGeometry(QtCore.QRect(260, 80, 301, 30))
        self.urltextEdit.setObjectName("textEdit")
        self.url_OK_Button = QtWidgets.QPushButton(self)
        self.url_OK_Button.setGeometry(QtCore.QRect(260, 160, 75, 31))
        self.url_OK_Button.setObjectName("url_OK_Button")
        self.url_OK_Button.clicked.connect(self.writeScript)
        self.url_OK_Button.setText("OK")
        self.url_Close_Button = QtWidgets.QPushButton(self)
        self.url_Close_Button.setGeometry(QtCore.QRect(360, 160, 75, 31))
        self.url_Close_Button.setObjectName("url_Close_Button")
        self.url_Close_Button.clicked.connect(self.close_properties)
        self.url_Close_Button.setText("CANCEL")
        self.show()

    '''
    Script Generation and write to File
    '''
    def writeScript(self):
        data = self.urltextEdit.toPlainText()
        script = os.path.join("resource", "script.tagui")
        with open(script, "a") as f:
            f.write("\n")
            f.write(str(data))
        self.close_properties()
        main.ProcessWindow.refresh(self)


    def close_properties(self):
        self.close()
