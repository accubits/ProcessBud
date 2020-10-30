import os

from PyQt5 import QtCore, QtGui, QtWidgets
import re

import main

'''
    Fetch Email Operation and its properties
'''


class fetchemailWindow(QtWidgets.QMainWindow):
    def __init__(self, obj,node_editor):
        self.node_editor = node_editor
        print(obj)
        self.obj = obj

        super(fetchemailWindow, self).__init__()
        # sshFile = os.path.join("style", "style.qss")
        # with open(sshFile, "r") as fh:
        #     self.setStyleSheet(fh.read())
        self.initUI()

    def initUI(self):
        self.setWindowTitle("Fetch Email")
        self.setObjectName("Dialog")
        self.resize(650, 450)
        self.fetchemail_attr = self.obj.edit.text()
        print(self.fetchemail_attr)
        if self.fetchemail_attr == "":
            fetch_email_dt = ["", "", "", "", "", ""]
        else:
            fetch_email_dt = self.fetchemail_attr.split(",")
        self.sessionlabel = QtWidgets.QLabel(self)
        self.sessionlabel.setGeometry(QtCore.QRect(40, 60, 151, 31))
        self.sessionlabel.setObjectName("sessionlabel")
        self.sessionlabel.setText("SESSION NAME")
        self.addresslabel = QtWidgets.QLabel(self)
        self.addresslabel.setGeometry(QtCore.QRect(40, 100, 151, 31))
        self.addresslabel.setObjectName("sessionlabel")
        self.addresslabel.setText("ADDRESS FILTER (OPTIONAL)")
        self.subjectlabel = QtWidgets.QLabel(self)
        self.subjectlabel.setGeometry(QtCore.QRect(40, 150, 151, 31))
        self.subjectlabel.setObjectName("sessionlabel")
        self.subjectlabel.setText("SUBJECT FILTER (OPTIONAL)")
        self.directorylabel = QtWidgets.QLabel(self)
        self.directorylabel.setGeometry(QtCore.QRect(40, 190, 151, 31))
        self.directorylabel.setObjectName("sessionlabel")
        self.directorylabel.setText("ATTACHMENT DIRECTORY")
        self.limitlabel = QtWidgets.QLabel(self)
        self.limitlabel.setGeometry(QtCore.QRect(40, 240, 151, 31))
        self.limitlabel.setObjectName("limitlabel")
        self.limitlabel.setText("LIMIT")
        self.categorylabel = QtWidgets.QLabel(self)
        self.categorylabel.setGeometry(QtCore.QRect(40, 300, 151, 31))
        self.categorylabel.setObjectName("categorylabel")
        self.categorylabel.setText("CATEGORY")
        self.sessionname = QtWidgets.QLineEdit(self)
        self.sessionname.setGeometry(QtCore.QRect(200, 65, 140, 30))
        self.sessionname.setObjectName("sessionname")
        self.sessionname.setPlaceholderText(" session name")
        self.sessionname.setText(fetch_email_dt[2])
        self.address = QtWidgets.QLineEdit(self)
        self.address.setGeometry(QtCore.QRect(200, 105, 140, 30))
        self.address.setObjectName("address")
        self.address.setPlaceholderText(" from address filter")
        self.address.setText(fetch_email_dt[3])
        self.subject = QtWidgets.QLineEdit(self)
        self.subject.setGeometry(QtCore.QRect(200, 155, 140, 30))
        self.subject.setObjectName("subject")
        self.subject.setPlaceholderText(" subject filter")
        self.subject.setText(fetch_email_dt[4])
        self.directory = QtWidgets.QLineEdit(self)
        self.directory.setGeometry(QtCore.QRect(200, 195, 140, 30))
        self.directory.setObjectName("directory")
        self.directory.setPlaceholderText(" eg E:\\")
        fetch_email_dt[5] = fetch_email_dt[5].replace("/", ".")
        # fetch_email_dt[5] = re.escape(fetch_email_dt[5])
        self.directory.setText(fetch_email_dt[5])
        self.limitcnt = QtWidgets.QLineEdit(self)
        self.limitcnt.setGeometry(QtCore.QRect(200, 245, 140, 30))
        self.limitcnt.setObjectName("limitCount")
        self.limitcnt.setPlaceholderText(" eg 5")
        self.limitcnt.setText(fetch_email_dt[1])
        self.comboBox = QtWidgets.QComboBox(self)
        self.comboBox.setGeometry(QtCore.QRect(200, 300, 140, 30))
        self.comboBox.setObjectName("comboBox")
        self.comboBox.addItem(" Un Read")
        self.comboBox.addItem(" Read")
        self.apply_Button = QtWidgets.QPushButton(self)
        self.apply_Button.setGeometry(QtCore.QRect(250, 370, 75, 31))
        self.apply_Button.setObjectName("apply_Button")
        self.apply_Button.setText("Apply")
        self.apply_Button.clicked.connect(self.writeToNode)
        # self.close_Button = QtWidgets.QPushButton(self)
        # self.close_Button.setGeometry(QtCore.QRect(360, 370, 75, 31))
        # self.close_Button.setObjectName("close_Button")
        # self.close_Button.setText("Close")
        # self.close_Button.clicked.connect(self.close_properties)

        # self.show()

    '''
    Script Generation and write to File
    '''

    def writeToNode(self):
        sessionname = self.sessionname.text()
        address = self.address.text()
        subject = self.subject.text()
        directory = self.directory.text()
        directory=directory.replace("/", ".")
        # directory = re.escape(directory)
        print(directory)
        limit = self.limitcnt.text()
        option = str(self.comboBox.currentText())
        print(option)
        if option.strip() != 'Read':
            option = 'UNSEEN'
        else:
            option = 'SEEN'
        # if address=="":
        #     address=''
        # elif subject=="":
        #     subject=''

        # data={'option':option,'limit':limit,'sessionname':sessionname,'address':address,'subject':subject,'directory':directory}
        data = str(option) + "," + limit + "," + sessionname + "," + address + "," + subject + "," + directory
        self.obj.edit.setText(data)
        self.node_editor.scene.data_changed = 1

        # script = os.path.join("resource", "script.tagui")
        # with open(script, "a") as f:
        #     f.write(
        #         "\npy begin\ndatamsg=FetchMail('" + option + "'," + limit + "," + sessionname + ",'" + address + "','" + subject +"','" + directory + "')\nprint(datamsg)\npy finish\necho py_result")
        #
        # self.close_properties()
        # main.ProcessWindow.refresh(self)

    def close_properties(self):
        self.close()
