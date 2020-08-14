import os

from PyQt5 import QtCore, QtGui, QtWidgets

import main

'''
   Send Email Operation and its properties
'''
class sendemailWindow(QtWidgets.QMainWindow):
    def __init__(self, df=None):
        super(sendemailWindow, self).__init__()
        sshFile = os.path.join("style", "style.qss")
        with open(sshFile, "r") as fh:
            self.setStyleSheet(fh.read())
        self.initUI()

    def initUI(self):
        self.setWindowTitle("Send Email")
        self.setObjectName("send")
        self.resize(650, 620)
        self.hostlabel = QtWidgets.QLabel(self)
        self.hostlabel.setGeometry(QtCore.QRect(150, 60, 151, 31))
        self.hostlabel.setObjectName("hostlabel")
        self.hostlabel.setText("HOST")
        self.portlabel = QtWidgets.QLabel(self)
        self.portlabel.setGeometry(QtCore.QRect(150, 100, 151, 31))
        self.portlabel.setObjectName("portlabel")
        self.portlabel.setText("PORT")
        self.usernamelabel = QtWidgets.QLabel(self)
        self.usernamelabel.setGeometry(QtCore.QRect(150, 150, 151, 31))
        self.usernamelabel.setObjectName("usernamelabel")
        self.usernamelabel.setText("USERNAME")
        self.passwordlabel = QtWidgets.QLabel(self)
        self.passwordlabel.setGeometry(QtCore.QRect(150, 190, 151, 31))
        self.passwordlabel.setObjectName("passwordlabel")
        self.passwordlabel.setText("PASSWORD")
        self.tolabel = QtWidgets.QLabel(self)
        self.tolabel.setGeometry(QtCore.QRect(150, 245, 151, 31))
        self.tolabel.setObjectName("tolabel")
        self.tolabel.setText("TO")
        self.cclabel = QtWidgets.QLabel(self)
        self.cclabel.setGeometry(QtCore.QRect(150, 300, 151, 31))
        self.cclabel.setObjectName("cclabel")
        self.cclabel.setText("CC")
        self.bcclabel = QtWidgets.QLabel(self)
        self.bcclabel.setGeometry(QtCore.QRect(150, 350, 151, 31))
        self.bcclabel.setObjectName("bcclabel")
        self.bcclabel.setText("BCC")
        self.subjectlabel = QtWidgets.QLabel(self)
        self.subjectlabel.setGeometry(QtCore.QRect(150, 395, 151, 31))
        self.subjectlabel.setObjectName("subjectlabel")
        self.subjectlabel.setText("SUBJECT")
        self.messagelabel = QtWidgets.QLabel(self)
        self.messagelabel.setGeometry(QtCore.QRect(150, 450, 151, 31))
        self.messagelabel.setObjectName("messagelabel")
        self.messagelabel.setText("MESSAGE")
        self.host = QtWidgets.QLineEdit(self)
        self.host.setGeometry(QtCore.QRect(260, 65, 301, 30))
        self.host.setObjectName("host")
        self.host.setPlaceholderText("server url: eg smtp.gmail.com")
        self.port = QtWidgets.QLineEdit(self)
        self.port.setGeometry(QtCore.QRect(260, 105, 301, 30))
        self.port.setObjectName("host")
        self.port.setPlaceholderText(" port number eg 587")
        self.username = QtWidgets.QLineEdit(self)
        self.username.setGeometry(QtCore.QRect(260, 155, 301, 30))
        self.username.setPlaceholderText(" user name")
        self.username.setObjectName("host")
        self.password = QtWidgets.QLineEdit(self)
        self.password.setGeometry(QtCore.QRect(260, 195, 301, 30))
        self.password.setObjectName("host")
        self.password.setPlaceholderText(" password")
        self.password.setEchoMode(QtWidgets.QLineEdit.Password)
        self.to = QtWidgets.QLineEdit(self)
        self.to.setGeometry(QtCore.QRect(260, 245, 301, 30))
        self.to.setObjectName("host")
        self.to.setPlaceholderText(" to address")
        self.cc = QtWidgets.QLineEdit(self)
        self.cc.setGeometry(QtCore.QRect(260, 295, 301, 30))
        self.cc.setObjectName("host")
        self.cc.setPlaceholderText(" cc address")
        self.bcc = QtWidgets.QLineEdit(self)
        self.bcc.setGeometry(QtCore.QRect(260, 345, 301, 30))
        self.bcc.setObjectName("host")
        self.bcc.setPlaceholderText(" bcc address")
        self.subject = QtWidgets.QLineEdit(self)
        self.subject.setGeometry(QtCore.QRect(260, 395, 301, 30))
        self.subject.setObjectName("host")
        self.subject.setPlaceholderText(" subject")
        self.message = QtWidgets.QLineEdit(self)
        self.message.setGeometry(QtCore.QRect(260, 445, 301, 30))
        self.message.setObjectName("host")
        self.message.setPlaceholderText(" message")

        self.ok_Button = QtWidgets.QPushButton(self)
        self.ok_Button.setGeometry(QtCore.QRect(260, 520, 75, 31))
        self.ok_Button.setObjectName("ok_Button")
        self.ok_Button.setText("Ok")
        self.ok_Button.clicked.connect(self.writeScript)
        self.close_Button = QtWidgets.QPushButton(self)
        self.close_Button.setGeometry(QtCore.QRect(360, 520, 75, 31))
        self.close_Button.setObjectName("close_Button")
        self.close_Button.setText("Close")
        self.close_Button.clicked.connect(self.close_properties)

        self.show()

    '''
         Script Generation and write to File
    '''

    def writeScript(self):

        host = self.host.text()
        port = self.port.text()
        username = self.username.text()
        password = self.password.text()
        to = self.to.text()
        cc = self.cc.text()
        bcc = self.bcc.text()
        subject = self.subject.text()
        message = self.message.text()
        script = os.path.join("resource", "script.tagui")
        with open(script, "a") as f:
            f.write(
                 "\npy begin\n SendMail(""'"+host+"'"","+port+",""'"+username+"'"",""'"+password+"'"",""'"+to+"'"",""'"+cc+"'"",""'"+bcc+"'"",""'"+subject+"'"",""'"+message+"'"")\npy finish")

        self.close_properties()
        main.ProcessWindow.refresh(self)

    def close_properties(self):
        self.close()
