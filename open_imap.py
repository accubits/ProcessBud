import os

from PyQt5 import QtCore, QtGui, QtWidgets

import main

'''
      Open IMap Operation and session creation
'''


class openimapWindow(QtWidgets.QMainWindow):
    def __init__(self, obj,node_editor):
        self.node_editor = node_editor
        self.obj = obj
        super(openimapWindow, self).__init__()

        self.initUI()

    def initUI(self):
        self.setWindowTitle("Open Session")
        self.setObjectName("open_session")
        self.resize(650, 400)
        self.opensession_attr = self.obj.edit.text()
        print(self.opensession_attr)
        if self.opensession_attr == "":
            open_session_dt = ["", "", "", "", "", ""]
        else:
            open_session_dt = self.opensession_attr.split(",")
        self.hostlabel = QtWidgets.QLabel(self)
        self.hostlabel.setGeometry(QtCore.QRect(40, 60, 151, 31))
        self.hostlabel.setObjectName("hostlabel")
        self.hostlabel.setText("Host")
        self.portlabel = QtWidgets.QLabel(self)
        self.portlabel.setGeometry(QtCore.QRect(40, 100, 151, 31))
        self.portlabel.setObjectName("portlabel")
        self.portlabel.setText("Port")
        self.usernamelabel = QtWidgets.QLabel(self)
        self.usernamelabel.setGeometry(QtCore.QRect(40, 150, 151, 31))
        self.usernamelabel.setObjectName("userlabel")
        self.usernamelabel.setText("Username")
        self.passwordlabel = QtWidgets.QLabel(self)
        self.passwordlabel.setGeometry(QtCore.QRect(40, 190, 151, 31))
        self.passwordlabel.setObjectName("passlabel")
        self.passwordlabel.setText("Password")
        self.sessionlabel = QtWidgets.QLabel(self)
        self.sessionlabel.setGeometry(QtCore.QRect(40, 245, 151, 31))
        self.sessionlabel.setObjectName("sessionlabel")
        self.sessionlabel.setText("Session name")
        self.host = QtWidgets.QLineEdit(self)
        self.host.setGeometry(QtCore.QRect(200, 65, 140, 30))
        self.host.setObjectName("host")
        self.host.setPlaceholderText(" server url: eg imap.gmail.com")
        self.host.setText(open_session_dt[1])

        self.port = QtWidgets.QLineEdit(self)
        self.port.setGeometry(QtCore.QRect(200, 105, 140, 30))
        self.port.setObjectName("port")
        self.port.setPlaceholderText(" port number eg 993")
        self.port.setText(open_session_dt[4])

        self.username = QtWidgets.QLineEdit(self)
        self.username.setGeometry(QtCore.QRect(200, 155, 140, 30))
        self.username.setObjectName("username")
        self.username.setPlaceholderText(" abcd@gmail.com")
        self.username.setText(open_session_dt[2])

        self.password = QtWidgets.QLineEdit(self)
        self.password.setGeometry(QtCore.QRect(200, 195, 140, 30))
        self.password.setObjectName("password")
        self.password.setPlaceholderText(" ********")
        self.password.setEchoMode(QtWidgets.QLineEdit.Password)
        self.password.setText(open_session_dt[3])

        self.sessionname = QtWidgets.QLineEdit(self)
        self.sessionname.setGeometry(QtCore.QRect(200, 245, 140, 30))
        self.sessionname.setObjectName("sessionname")
        self.sessionname.setPlaceholderText(" session name")
        self.sessionname.setText(open_session_dt[0])

        self.apply_Button = QtWidgets.QPushButton(self)
        self.apply_Button.setGeometry(QtCore.QRect(260, 330, 75, 31))
        self.apply_Button.setObjectName("apply_Button")
        self.apply_Button.setText("Apply")
        self.apply_Button.clicked.connect(self.writeToNode)


    '''
         Script Generation and write to File
    '''

    def writeToNode(self):
        host = self.host.text()
        port = self.port.text()
        username = self.username.text()
        password = self.password.text()
        sessionname = self.sessionname.text()
        data = sessionname + "," + host + "," + username + "," + password + "," + port
        self.obj.edit.setText(data)
        self.node_editor.scene.data_changed = 1



    def close_properties(self):
        self.close()
