import os

from PyQt5 import QtCore, QtGui, QtWidgets
import re

import main

'''
    Fetch Email Operation and its properties
'''

class fetchemailWindow(QtWidgets.QMainWindow):
    def __init__(self):
        super(fetchemailWindow, self).__init__()
        sshFile = os.path.join("style", "style.qss")
        with open(sshFile, "r") as fh:
            self.setStyleSheet(fh.read())
        self.initUI()

    def initUI(self):
        self.setWindowTitle("Fetch Email")
        self.setObjectName("Dialog")
        self.resize(650, 450)
        self.sessionlabel = QtWidgets.QLabel(self)
        self.sessionlabel.setGeometry(QtCore.QRect(150, 60, 151, 31))
        self.sessionlabel.setObjectName("sessionlabel")
        self.sessionlabel.setText("SESSION NAME")
        self.addresslabel = QtWidgets.QLabel(self)
        self.addresslabel.setGeometry(QtCore.QRect(150, 100, 151, 31))
        self.addresslabel.setObjectName("sessionlabel")
        self.addresslabel.setText("ADDRESS FILTER (OPTIONAL)")
        self.subjectlabel = QtWidgets.QLabel(self)
        self.subjectlabel.setGeometry(QtCore.QRect(150, 150, 151, 31))
        self.subjectlabel.setObjectName("sessionlabel")
        self.subjectlabel.setText("SUBJECT FILTER (OPTIONAL)")
        self.directorylabel = QtWidgets.QLabel(self)
        self.directorylabel.setGeometry(QtCore.QRect(150, 190, 151, 31))
        self.directorylabel.setObjectName("sessionlabel")
        self.directorylabel.setText("ATTACHMENT DIRECTORY")
        self.limitlabel = QtWidgets.QLabel(self)
        self.limitlabel.setGeometry(QtCore.QRect(150, 240, 151, 31))
        self.limitlabel.setObjectName("limitlabel")
        self.limitlabel.setText("LIMIT")
        self.categorylabel = QtWidgets.QLabel(self)
        self.categorylabel.setGeometry(QtCore.QRect(150, 300, 151, 31))
        self.categorylabel.setObjectName("categorylabel")
        self.categorylabel.setText("CATEGORY")
        self.sessionname = QtWidgets.QLineEdit(self)
        self.sessionname.setGeometry(QtCore.QRect(310, 65, 301, 30))
        self.sessionname.setObjectName("sessionname")
        self.sessionname.setPlaceholderText(" session name")
        self.address = QtWidgets.QLineEdit(self)
        self.address.setGeometry(QtCore.QRect(310, 105, 301, 30))
        self.address.setObjectName("address")
        self.address.setPlaceholderText(" from address filter")
        self.subject = QtWidgets.QLineEdit(self)
        self.subject.setGeometry(QtCore.QRect(310, 155, 301, 30))
        self.subject.setObjectName("subject")
        self.subject.setPlaceholderText(" subject filter")
        self.directory = QtWidgets.QLineEdit(self)
        self.directory.setGeometry(QtCore.QRect(310, 195, 301, 30))
        self.directory.setObjectName("directory")
        self.directory.setPlaceholderText(" eg E:\\")
        self.limitcnt = QtWidgets.QLineEdit(self)
        self.limitcnt.setGeometry(QtCore.QRect(310, 245, 301, 30))
        self.limitcnt.setObjectName("limitCount")
        self.limitcnt.setPlaceholderText(" eg 5")
        self.comboBox = QtWidgets.QComboBox(self)
        self.comboBox.setGeometry(QtCore.QRect(310, 300, 301, 30))
        self.comboBox.setObjectName("comboBox")
        self.comboBox.addItem(" Un Read")
        self.comboBox.addItem(" Read")
        self.ok_Button = QtWidgets.QPushButton(self)
        self.ok_Button.setGeometry(QtCore.QRect(260, 370, 75, 31))
        self.ok_Button.setObjectName("ok_Button")
        self.ok_Button.setText("Ok")
        self.ok_Button.clicked.connect(self.writeScript)
        self.close_Button = QtWidgets.QPushButton(self)
        self.close_Button.setGeometry(QtCore.QRect(360, 370, 75, 31))
        self.close_Button.setObjectName("close_Button")
        self.close_Button.setText("Close")
        self.close_Button.clicked.connect(self.close_properties)

        self.show()

    '''
    Script Generation and write to File
    '''

    def writeScript(self):
        sessionname = self.sessionname.text()
        address = self.address.text()
        subject = self.subject.text()
        directory = self.directory.text()
        directory = re.escape(directory)
        limit = self.limitcnt.text()
        option = str(self.comboBox.currentText())
        print(option)
        if option.strip() != 'Read':
            option = 'UNSEEN'
        else:
            option = 'SEEN'
        script = os.path.join("resource", "script.tagui")
        with open(script, "a") as f:
            f.write(
                "\npy begin\ndatamsg=FetchMail('" + option + "'," + limit + "," + sessionname + ",'" + address + "','" + subject +"','" + directory + "')\nprint(datamsg)\npy finish\necho py_result")

        self.close_properties()
        main.ProcessWindow.refresh(self)

    def close_properties(self):
        self.close()
