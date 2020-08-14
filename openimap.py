import os

from PyQt5 import QtCore, QtGui, QtWidgets

import main

'''
      Open IMap Operation and session creation
'''
class openimapWindow(QtWidgets.QMainWindow):
    def __init__(self,df=None):
        super(openimapWindow, self).__init__()
        sshFile = os.path.join("style", "style.qss")
        with open(sshFile, "r") as fh:
            self.setStyleSheet(fh.read())
        self.initUI()

    def initUI(self):
        self.setWindowTitle("Open Session")
        self.setObjectName("open_session")
        self.resize(650, 400)
        self.hostlabel = QtWidgets.QLabel(self)
        self.hostlabel.setGeometry(QtCore.QRect(150, 60, 151, 31))
        self.hostlabel.setObjectName("hostlabel")
        self.hostlabel.setText("Host")
        self.portlabel = QtWidgets.QLabel(self)
        self.portlabel.setGeometry(QtCore.QRect(150, 100, 151, 31))
        self.portlabel.setObjectName("portlabel")
        self.portlabel.setText("Port")
        self.usernamelabel = QtWidgets.QLabel(self)
        self.usernamelabel.setGeometry(QtCore.QRect(150, 150, 151, 31))
        self.usernamelabel.setObjectName("userlabel")
        self.usernamelabel.setText("Username")
        self.passwordlabel = QtWidgets.QLabel(self)
        self.passwordlabel.setGeometry(QtCore.QRect(150, 190, 151, 31))
        self.passwordlabel.setObjectName("passlabel")
        self.passwordlabel.setText("Password")
        self.sessionlabel = QtWidgets.QLabel(self)
        self.sessionlabel.setGeometry(QtCore.QRect(150, 245, 151, 31))
        self.sessionlabel.setObjectName("sessionlabel")
        self.sessionlabel.setText("Session name")
        self.host = QtWidgets.QLineEdit(self)
        self.host.setGeometry(QtCore.QRect(260, 65, 301, 30))
        self.host.setObjectName("host")
        self.host.setPlaceholderText(" server url: eg imap.gmail.com")
        self.port = QtWidgets.QLineEdit(self)
        self.port.setGeometry(QtCore.QRect(260, 105, 301, 30))
        self.port.setObjectName("port")
        self.port.setPlaceholderText(" port number eg 993")
        self.username = QtWidgets.QLineEdit(self)
        self.username.setGeometry(QtCore.QRect(260, 155, 301, 30))
        self.username.setObjectName("username")
        self.username.setPlaceholderText(" abcd@gmail.com")
        self.password = QtWidgets.QLineEdit(self)
        self.password.setGeometry(QtCore.QRect(260, 195, 301, 30))
        self.password.setObjectName("password")
        self.password.setPlaceholderText(" ********")
        self.password.setEchoMode(QtWidgets.QLineEdit.Password)
        self.sessionname = QtWidgets.QLineEdit(self)
        self.sessionname.setGeometry(QtCore.QRect(260, 245, 301, 30))
        self.sessionname.setObjectName("sessionname")
        self.sessionname.setPlaceholderText(" session name")

        self.ok_Button = QtWidgets.QPushButton(self)
        self.ok_Button.setGeometry(QtCore.QRect(260, 330, 75, 31))
        self.ok_Button.setObjectName("ok_Button")
        self.ok_Button.setText("Ok")
        self.ok_Button.clicked.connect(self.writeScript)
        self.close_Button = QtWidgets.QPushButton(self)
        self.close_Button.setGeometry(QtCore.QRect(360, 330, 75, 31))
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
        sessionname = self.sessionname.text()
        if sessionname =="":
            sessionname = "mail_session"
        script = os.path.join("resource", "script.tagui")
        with open(script, "a") as f:
            f.write("\npy begin\n" + sessionname + "= OpenIMAPSession('"+host+"','"+username+"','"+password+"',"+port+")\npy finish")
        self.close_properties()
        main.ProcessWindow.refresh(self)

    def close_properties(self):
        self.close()