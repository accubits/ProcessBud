import json

from PyQt5 import QtCore, QtGui, QtWidgets


class keyWindow(QtWidgets.QMainWindow):
    def __init__(self, obj, node_editor):
        super(keyWindow, self).__init__()

        self.obj = obj

        shrtkeys = self.obj.edit.text()
        if shrtkeys == "":
            print("empty keys")
        else:
            keylist = shrtkeys.split(',')
        self.node_editor = node_editor
        self.initUI()

    def initUI(self):
        self.keys = []
        self.bt = []

        self.resize(800, 500)

        self.label = QtWidgets.QLabel(self)
        self.label.setGeometry(QtCore.QRect(50, 1, 500, 50))
        self.label.setObjectName("keylabel")

        self.F1_Button = QtWidgets.QPushButton(self)
        self.F1_Button.setGeometry(QtCore.QRect(50, 50, 75, 31))
        self.F1_Button.setObjectName("F1_Button")
        self.F1_Button.clicked.connect(lambda: self.buttonClick(self.F1_Button, "F1"))
        self.F1_Button.setStyleSheet("background-color: #E7DCD0;;")
        self.F2_Button = QtWidgets.QPushButton(self)
        self.F2_Button.setGeometry(QtCore.QRect(150, 50, 75, 31))
        self.F2_Button.setObjectName("F2_Button")
        self.F2_Button.clicked.connect(lambda: self.buttonClick(self.F2_Button, "F2"))
        self.F2_Button.setStyleSheet("background-color: #E7DCD0;;")
        self.F3_Button = QtWidgets.QPushButton(self)
        self.F3_Button.setGeometry(QtCore.QRect(250, 50, 75, 31))
        self.F3_Button.setObjectName("F3_Button")
        self.F3_Button.clicked.connect(lambda: self.buttonClick(self.F3_Button, "F3"))
        self.F3_Button.setStyleSheet("background-color: #E7DCD0;;")
        self.F4_Button = QtWidgets.QPushButton(self)
        self.F4_Button.setGeometry(QtCore.QRect(350, 50, 75, 31))
        self.F4_Button.setObjectName("F4_Button")
        self.F4_Button.clicked.connect(lambda: self.buttonClick(self.F4_Button, "F4"))
        self.F4_Button.setStyleSheet("background-color: #E7DCD0;;")

        self.F5_Button = QtWidgets.QPushButton(self)
        self.F5_Button.setGeometry(QtCore.QRect(450, 50, 75, 31))
        self.F5_Button.setObjectName("F5_Button")
        self.F5_Button.clicked.connect(lambda: self.buttonClick(self.F5_Button, "F5"))
        self.F5_Button.setStyleSheet("background-color: #E7DCD0;;")

        self.F6_Button = QtWidgets.QPushButton(self)
        self.F6_Button.setGeometry(QtCore.QRect(50, 100, 75, 31))
        self.F6_Button.setObjectName("F6_Button")
        self.F6_Button.clicked.connect(lambda: self.buttonClick(self.F6_Button, "F6"))
        self.F6_Button.setStyleSheet("background-color: #E7DCD0;;")

        self.F7_Button = QtWidgets.QPushButton(self)
        self.F7_Button.setGeometry(QtCore.QRect(150, 100, 75, 31))
        self.F7_Button.setObjectName("F7_Button")
        self.F7_Button.clicked.connect(lambda: self.buttonClick(self.F7_Button, "F7"))
        self.F7_Button.setStyleSheet("background-color: #E7DCD0;;")

        self.F8_Button = QtWidgets.QPushButton(self)
        self.F8_Button.setGeometry(QtCore.QRect(250, 100, 75, 31))
        self.F8_Button.setObjectName("F8_Button")
        self.F8_Button.clicked.connect(lambda: self.buttonClick(self.F8_Button, "F8"))
        self.F8_Button.setStyleSheet("background-color: #E7DCD0;;")

        self.F9_Button = QtWidgets.QPushButton(self)
        self.F9_Button.setGeometry(QtCore.QRect(350, 100, 75, 31))
        self.F9_Button.setObjectName("F9_Button")
        self.F9_Button.clicked.connect(lambda: self.buttonClick(self.F9_Button, "F9"))
        self.F9_Button.setStyleSheet("background-color: #E7DCD0;;")

        self.F10_Button = QtWidgets.QPushButton(self)
        self.F10_Button.setGeometry(QtCore.QRect(450, 100, 75, 31))
        self.F10_Button.setObjectName("F10_Button")
        self.F10_Button.clicked.connect(lambda: self.buttonClick(self.F10_Button, "F10"))
        self.F10_Button.setStyleSheet("background-color: #E7DCD0;;")

        self.F11_Button = QtWidgets.QPushButton(self)
        self.F11_Button.setGeometry(QtCore.QRect(50, 150, 75, 31))
        self.F11_Button.setObjectName("F11_Button")
        self.F11_Button.clicked.connect(lambda: self.buttonClick(self.F11_Button, "F11"))
        self.F11_Button.setStyleSheet("background-color: #E7DCD0;;")

        self.F12_Button = QtWidgets.QPushButton(self)
        self.F12_Button.setGeometry(QtCore.QRect(150, 150, 75, 31))
        self.F12_Button.setObjectName("F12_Button")
        self.F12_Button.clicked.connect(lambda: self.buttonClick(self.F12_Button, "F12"))
        self.F12_Button.setStyleSheet("background-color: #E7DCD0;;")

        self.escape_Button = QtWidgets.QPushButton(self)
        self.escape_Button.setGeometry(QtCore.QRect(250, 150, 75, 31))
        self.escape_Button.setObjectName("escape_Button")
        self.escape_Button.clicked.connect(lambda: self.buttonClick(self.escape_Button, "esc"))
        self.escape_Button.setStyleSheet("background-color: #E7DCD0;;")

        self.enter_Button = QtWidgets.QPushButton(self)
        self.enter_Button.setGeometry(QtCore.QRect(350, 150, 75, 31))
        self.enter_Button.setObjectName("enter_Button")
        self.enter_Button.clicked.connect(lambda: self.buttonClick(self.enter_Button, "enter"))
        self.enter_Button.setStyleSheet("background-color: #E7DCD0;;")

        self.delete_Button = QtWidgets.QPushButton(self)
        self.delete_Button.setGeometry(QtCore.QRect(450, 150, 75, 31))
        self.delete_Button.setObjectName("delete_Button")
        self.delete_Button.clicked.connect(lambda: self.buttonClick(self.delete_Button, "delete"))
        self.delete_Button.setStyleSheet("background-color: #E7DCD0;;")

        self.leftarrow_Button = QtWidgets.QPushButton(self)
        self.leftarrow_Button.setGeometry(QtCore.QRect(50, 200, 75, 31))
        self.leftarrow_Button.setObjectName("leftarrow_Button")
        self.leftarrow_Button.clicked.connect(lambda: self.buttonClick(self.leftarrow_Button, "left"))
        self.leftarrow_Button.setStyleSheet("background-color: #E7DCD0;;")

        self.rightarrow_Button = QtWidgets.QPushButton(self)
        self.rightarrow_Button.setGeometry(QtCore.QRect(150, 200, 75, 31))
        self.rightarrow_Button.setObjectName("rightarrow_Button")
        self.rightarrow_Button.clicked.connect(lambda: self.buttonClick(self.rightarrow_Button, "right"))
        self.rightarrow_Button.setStyleSheet("background-color: #E7DCD0;;")

        self.uparrow_Button = QtWidgets.QPushButton(self)
        self.uparrow_Button.setGeometry(QtCore.QRect(250, 200, 75, 31))
        self.uparrow_Button.setObjectName("uparrow_Button")
        self.uparrow_Button.clicked.connect(lambda: self.buttonClick(self.uparrow_Button, "up"))
        self.uparrow_Button.setStyleSheet("background-color: #E7DCD0;;")

        self.downarrow_Button = QtWidgets.QPushButton(self)
        self.downarrow_Button.setGeometry(QtCore.QRect(350, 200, 75, 31))
        self.downarrow_Button.setObjectName("downarrow_Button")
        self.downarrow_Button.clicked.connect(lambda: self.buttonClick(self.downarrow_Button, "down"))
        self.downarrow_Button.setStyleSheet("background-color: #E7DCD0;;")

        self.tab_Button = QtWidgets.QPushButton(self)
        self.tab_Button.setGeometry(QtCore.QRect(450, 200, 75, 31))
        self.tab_Button.setObjectName("tab_Button")
        self.tab_Button.clicked.connect(lambda: self.buttonClick(self.tab_Button, "tab"))
        self.tab_Button.setStyleSheet("background-color: #E7DCD0;;")

        self.backspace_Button = QtWidgets.QPushButton(self)
        self.backspace_Button.setGeometry(QtCore.QRect(50, 250, 75, 31))
        self.backspace_Button.setObjectName("backspace_Button")
        self.backspace_Button.clicked.connect(lambda: self.buttonClick(self.backspace_Button, "backspace"))
        self.backspace_Button.setStyleSheet("background-color: #E7DCD0;;")

        self.printscreen_Button = QtWidgets.QPushButton(self)
        self.printscreen_Button.setGeometry(QtCore.QRect(150, 250, 75, 31))
        self.printscreen_Button.setObjectName("printscreen_Button")
        self.printscreen_Button.clicked.connect(lambda: self.buttonClick(self.printscreen_Button, "prtscn"))
        self.printscreen_Button.setStyleSheet("background-color: #E7DCD0;;")

        self.insert_Button = QtWidgets.QPushButton(self)
        self.insert_Button.setGeometry(QtCore.QRect(250, 250, 75, 31))
        self.insert_Button.setObjectName("insert_Button")
        self.insert_Button.clicked.connect(lambda: self.buttonClick(self.insert_Button, "ins"))
        self.insert_Button.setStyleSheet("background-color: #E7DCD0;;")

        self.capslock_Button = QtWidgets.QPushButton(self)
        self.capslock_Button.setGeometry(QtCore.QRect(350, 250, 75, 31))
        self.capslock_Button.setObjectName("capslock_Button")
        self.capslock_Button.clicked.connect(lambda: self.buttonClick(self.capslock_Button, "capslock"))
        self.capslock_Button.setStyleSheet("background-color: #E7DCD0;;")

        self.space_Button = QtWidgets.QPushButton(self)
        self.space_Button.setGeometry(QtCore.QRect(450, 250, 75, 31))
        self.space_Button.setObjectName("space_Button")
        self.space_Button.clicked.connect(lambda: self.buttonClick(self.space_Button, "space"))
        self.space_Button.setStyleSheet("background-color: #E7DCD0;;")

        self.windows_Button = QtWidgets.QPushButton(self)
        self.windows_Button.setGeometry(QtCore.QRect(50, 300, 75, 31))
        self.windows_Button.setObjectName("windows_Button")
        self.windows_Button.clicked.connect(lambda: self.buttonClick(self.windows_Button, "windows"))
        self.windows_Button.setStyleSheet("background-color: #E7DCD0;;")

        self.pagedown_Button = QtWidgets.QPushButton(self)
        self.pagedown_Button.setGeometry(QtCore.QRect(150, 300, 75, 31))
        self.pagedown_Button.setObjectName("pagedown_Button")
        self.pagedown_Button.clicked.connect(lambda: self.buttonClick(self.pagedown_Button, "pagedown"))
        self.pagedown_Button.setStyleSheet("background-color: #E7DCD0;;")

        self.pageup_Button = QtWidgets.QPushButton(self)
        self.pageup_Button.setGeometry(QtCore.QRect(250, 300, 75, 31))
        self.pageup_Button.setObjectName("pageup_Button")
        self.pageup_Button.clicked.connect(lambda: self.buttonClick(self.pageup_Button, "pageup"))
        self.pageup_Button.setStyleSheet("background-color: #E7DCD0;;")

        self.leftcntrl_Button = QtWidgets.QPushButton(self)
        self.leftcntrl_Button.setGeometry(QtCore.QRect(350, 300, 75, 31))
        self.leftcntrl_Button.setObjectName("leftcntrl_Button")
        self.leftcntrl_Button.clicked.connect(lambda: self.buttonClick(self.leftcntrl_Button, "left control"))
        self.leftcntrl_Button.setStyleSheet("background-color: #E7DCD0;;")

        self.rightcntrl_Button = QtWidgets.QPushButton(self)
        self.rightcntrl_Button.setGeometry(QtCore.QRect(450, 300, 75, 31))
        self.rightcntrl_Button.setObjectName("rightcntrl_Button")
        self.rightcntrl_Button.clicked.connect(lambda: self.buttonClick(self.rightcntrl_Button, "right control"))
        self.rightcntrl_Button.setStyleSheet("background-color: #E7DCD0;;")

        self.altgr_Button = QtWidgets.QPushButton(self)
        self.altgr_Button.setGeometry(QtCore.QRect(50, 350, 75, 31))
        self.altgr_Button.setObjectName("altgr_Button")
        self.altgr_Button.clicked.connect(lambda: self.buttonClick(self.altgr_Button, "altgr"))
        self.altgr_Button.setStyleSheet("background-color: #E7DCD0;;")

        self.alt_Button = QtWidgets.QPushButton(self)
        self.alt_Button.setGeometry(QtCore.QRect(150, 350, 75, 31))
        self.alt_Button.setObjectName("alt_Button")
        self.alt_Button.clicked.connect(lambda: self.buttonClick(self.alt_Button, "alt"))
        self.alt_Button.setStyleSheet("background-color: #E7DCD0;;")

        self.shift_Button = QtWidgets.QPushButton(self)
        self.shift_Button.setGeometry(QtCore.QRect(250, 350, 75, 31))
        self.shift_Button.setObjectName("shift_Button")
        self.shift_Button.clicked.connect(lambda: self.buttonClick(self.shift_Button, "shift"))
        self.shift_Button.setStyleSheet("background-color: #E7DCD0;;")

        self.home_Button = QtWidgets.QPushButton(self)
        self.home_Button.setGeometry(QtCore.QRect(350, 350, 75, 31))
        self.home_Button.setObjectName("home_Button")
        self.home_Button.clicked.connect(lambda: self.buttonClick(self.home_Button, "home"))
        self.home_Button.setStyleSheet("background-color: #E7DCD0;;")

        self.end_Button = QtWidgets.QPushButton(self)
        self.end_Button.setGeometry(QtCore.QRect(450, 350, 75, 31))
        self.end_Button.setObjectName("end_Button")
        self.end_Button.clicked.connect(lambda: self.buttonClick(self.end_Button, "end"))
        self.end_Button.setStyleSheet("background-color: #E7DCD0;;")

        self.apply_Button = QtWidgets.QPushButton(self)
        # self.apply_Button.setGeometry(QtCore.QRect(375, 430, 100, 31))
        self.apply_Button.setGeometry(QtCore.QRect(350, 8, 75, 31))
        self.apply_Button.setObjectName("apply_Button")
        self.apply_Button.clicked.connect(self.writeScript)
        self.apply_Button.setStyleSheet("background-color:#ebf5ed;padding:4px 4px 4px 4px;")


        _translate = QtCore.QCoreApplication.translate
        self.setWindowTitle(_translate("wait_Dialog", "Properties for Send Hot keys"))
        self.F1_Button.setText(_translate("wait_Dialog", "F1"))
        self.F2_Button.setText(_translate("wait_Dialog", "F2"))
        self.F3_Button.setText(_translate("wait_Dialog", "F3"))
        self.F4_Button.setText(_translate("wait_Dialog", "F4"))
        self.F5_Button.setText(_translate("wait_Dialog", "F5"))
        self.F6_Button.setText(_translate("wait_Dialog", "F6"))
        self.F7_Button.setText(_translate("wait_Dialog", "F7"))
        self.F8_Button.setText(_translate("wait_Dialog", "F8"))
        self.F9_Button.setText(_translate("wait_Dialog", "F9"))
        self.F10_Button.setText(_translate("wait_Dialog", "F10"))
        self.F11_Button.setText(_translate("wait_Dialog", "F11"))
        self.F12_Button.setText(_translate("wait_Dialog", "F12"))
        self.escape_Button.setText(_translate("wait_Dialog", "Escape"))
        self.enter_Button.setText(_translate("wait_Dialog", "Enter"))
        self.delete_Button.setText(_translate("wait_Dialog", "Delete"))
        self.leftarrow_Button.setText(_translate("wait_Dialog", "Left arrow"))
        self.rightarrow_Button.setText(_translate("wait_Dialog", "Right arrow"))
        self.uparrow_Button.setText(_translate("wait_Dialog", "Up arrow"))
        self.downarrow_Button.setText(_translate("wait_Dialog", "Down arrow"))
        self.tab_Button.setText(_translate("wait_Dialog", "Tab"))
        self.backspace_Button.setText(_translate("wait_Dialog", "Backspace"))
        self.printscreen_Button.setText(_translate("wait_Dialog", "Print Screen"))
        self.insert_Button.setText(_translate("wait_Dialog", "Insert"))
        self.capslock_Button.setText(_translate("wait_Dialog", "Caps Lock"))
        self.space_Button.setText(_translate("wait_Dialog", "Space"))
        self.windows_Button.setText(_translate("wait_Dialog", "Windows"))
        self.pagedown_Button.setText(_translate("wait_Dialog", "Page Down"))
        self.pageup_Button.setText(_translate("wait_Dialog", "Page Up"))
        self.leftcntrl_Button.setText(_translate("wait_Dialog", "Left cntrl"))
        self.rightcntrl_Button.setText(_translate("wait_Dialog", "Right cntrl"))
        self.altgr_Button.setText(_translate("wait_Dialog", "Alt gr"))
        self.alt_Button.setText(_translate("wait_Dialog", "Alt"))
        self.shift_Button.setText(_translate("wait_Dialog", "Shift"))
        self.home_Button.setText(_translate("wait_Dialog", "Home"))
        self.end_Button.setText(_translate("wait_Dialog", "End"))
        self.apply_Button.setText(_translate("wait_Dialog", "Apply"))
        self.label.setText(_translate("wait_Dialog", "Choose your keys to insert"))

        # self.wait_Close_Button.setText(_translate("wait_Dialog", "CANCEL"))

    def buttonClick(self, button, val):
        print(val)
        if val in self.keys:
            button.setStyleSheet("background-color:#E7DCD0")
            self.keys.remove(val)
            self.bt.remove(button)

        else:

            button.setStyleSheet("background-color:black;color:white")
            self.keys.append(val)
            self.bt.append((button))



    def writeScript(self):

        data = ",".join(self.keys)

        self.obj.edit.setText(data)
        self.obj.key = self.bt

        self.node_editor.scene.data_changed = 1




