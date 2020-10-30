import os

from PyQt5 import QtCore, QtGui, QtWidgets

import main

'''
   Send Email Operation and its properties
'''
class sendemailWindow(QtWidgets.QMainWindow):
    def __init__(self, obj,node_editor):
        self.node_editor = node_editor
        self.obj = obj
        super(sendemailWindow, self).__init__()
        self.initUI()

    def initUI(self):
        self.setWindowTitle("Send Email")
        self.setObjectName("send")
        self.resize(650, 620)
        self.sendemail_attr = self.obj.edit.text()
        print(self.sendemail_attr)
        if self.sendemail_attr == "":
            send_email_dt = ["", "", "", "", "", "","","",""]
        else:
            send_email_dt = self.sendemail_attr.split(",")
        self.hostlabel = QtWidgets.QLabel(self)
        self.hostlabel.setGeometry(QtCore.QRect(40, 60, 151, 31))
        self.hostlabel.setObjectName("hostlabel")
        self.hostlabel.setText("HOST")
        self.portlabel = QtWidgets.QLabel(self)
        self.portlabel.setGeometry(QtCore.QRect(40, 100, 151, 31))
        self.portlabel.setObjectName("portlabel")
        self.portlabel.setText("PORT")
        self.usernamelabel = QtWidgets.QLabel(self)
        self.usernamelabel.setGeometry(QtCore.QRect(40, 150, 151, 31))
        self.usernamelabel.setObjectName("usernamelabel")
        self.usernamelabel.setText("USERNAME")
        self.passwordlabel = QtWidgets.QLabel(self)
        self.passwordlabel.setGeometry(QtCore.QRect(40, 190, 151, 31))
        self.passwordlabel.setObjectName("passwordlabel")
        self.passwordlabel.setText("PASSWORD")
        self.tolabel = QtWidgets.QLabel(self)
        self.tolabel.setGeometry(QtCore.QRect(40, 245, 151, 31))
        self.tolabel.setObjectName("tolabel")
        self.tolabel.setText("TO")
        self.cclabel = QtWidgets.QLabel(self)
        self.cclabel.setGeometry(QtCore.QRect(40, 300, 151, 31))
        self.cclabel.setObjectName("cclabel")
        self.cclabel.setText("CC")
        self.bcclabel = QtWidgets.QLabel(self)
        self.bcclabel.setGeometry(QtCore.QRect(40, 350, 151, 31))
        self.bcclabel.setObjectName("bcclabel")
        self.bcclabel.setText("BCC")
        self.subjectlabel = QtWidgets.QLabel(self)
        self.subjectlabel.setGeometry(QtCore.QRect(40, 395, 151, 31))
        self.subjectlabel.setObjectName("subjectlabel")
        self.subjectlabel.setText("SUBJECT")
        self.messagelabel = QtWidgets.QLabel(self)
        self.messagelabel.setGeometry(QtCore.QRect(40, 450, 151, 31))
        self.messagelabel.setObjectName("messagelabel")
        self.messagelabel.setText("MESSAGE")
        self.host = QtWidgets.QLineEdit(self)
        self.host.setGeometry(QtCore.QRect(200, 65, 140, 30))
        self.host.setObjectName("host")
        self.host.setPlaceholderText("server url: eg smtp.gmail.com")
        self.host.setText(send_email_dt[0])
        self.port = QtWidgets.QLineEdit(self)
        self.port.setGeometry(QtCore.QRect(200, 105, 140, 30))
        self.port.setObjectName("host")
        self.port.setPlaceholderText(" port number eg 587")
        self.port.setText(send_email_dt[1])
        self.username = QtWidgets.QLineEdit(self)
        self.username.setGeometry(QtCore.QRect(200, 155, 140, 30))
        self.username.setPlaceholderText(" user name")
        self.username.setObjectName("user")
        self.username.setText(send_email_dt[2])
        self.password = QtWidgets.QLineEdit(self)
        self.password.setGeometry(QtCore.QRect(200, 195, 140, 30))
        self.password.setObjectName("pass")
        self.password.setPlaceholderText(" password")
        self.password.setEchoMode(QtWidgets.QLineEdit.Password)
        self.password.setText(send_email_dt[3])
        self.to = QtWidgets.QLineEdit(self)
        self.to.setGeometry(QtCore.QRect(200, 245, 140, 30))
        self.to.setObjectName("to")
        self.to.setPlaceholderText(" to address")
        self.to.setText(send_email_dt[4])
        self.cc = QtWidgets.QLineEdit(self)
        self.cc.setGeometry(QtCore.QRect(200, 295, 140, 30))
        self.cc.setObjectName("cc")
        self.cc.setPlaceholderText(" cc address")
        self.cc.setText(send_email_dt[5])
        self.bcc = QtWidgets.QLineEdit(self)
        self.bcc.setGeometry(QtCore.QRect(200, 345, 140, 30))
        self.bcc.setObjectName("bcc")
        self.bcc.setPlaceholderText(" bcc address")
        self.bcc.setText(send_email_dt[6])
        self.subject = QtWidgets.QLineEdit(self)
        self.subject.setGeometry(QtCore.QRect(200, 395, 140, 30))
        self.subject.setObjectName("sub")
        self.subject.setPlaceholderText(" subject")
        self.subject.setText(send_email_dt[7])
        self.message = QtWidgets.QLineEdit(self)
        self.message.setGeometry(QtCore.QRect(200, 445, 140, 30))
        self.message.setObjectName("msg")
        self.message.setPlaceholderText(" message")
        self.message.setText(send_email_dt[8])

        self.apply_Button = QtWidgets.QPushButton(self)
        self.apply_Button.setGeometry(QtCore.QRect(260, 520, 75, 31))
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
        to = self.to.text()
        cc = self.cc.text()
        bcc = self.bcc.text()
        subject = self.subject.text()
        message = self.message.text()
        data = host + "," + port + "," + username + "," + password + "," + to + "," + cc + "," + bcc + "," + subject + "," + message
        self.obj.edit.setText(data)
        self.node_editor.scene.data_changed = 1

        # script = os.path.join("resource", "script.tagui")
        # with open(script, "a") as f:
        #     f.write(
        #          "\npy begin\n SendMail(""'"+host+"'"","+port+",""'"+username+"'"",""'"+password+"'"",""'"+to+"'"",""'"+cc+"'"",""'"+bcc+"'"",""'"+subject+"'"",""'"+message+"'"")\npy finish")
        #
        # self.close_properties()
        # main.ProcessWindow.refresh(self)

    def close_properties(self):
        self.close()
