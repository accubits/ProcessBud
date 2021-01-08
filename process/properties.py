from PyQt5.QtGui import *
from PyQt5.QtCore import *
from PyQt5.QtWidgets import *

DEBUG = False
DEBUG_CONTEXT = False


class PropertiesPanel(QDockWidget):
    def __init__(self):
        super().__init__()

        self.propertytab(self)

    def propertytab(self, controls, obj_val, node_editor, tbl):
        x = 350
        y = 200
        print(obj_val)
        if not hasattr(self, 'nodesPropertyDock'):
            self.nodesPropertyWidget = QListWidget()
            self.nodesPropertyDock = QDockWidget("Properties")
        # print(dir(self))
        if self.nodesPropertyDock.isVisible():
            print("Property Dock Visible")
        else:
            self.nodesPropertyDock.show()

        if controls == "none":
            print(controls)
            self.nodesPropertyDock.setWidget(self.nodesPropertyWidget)
        elif controls == "Click":
            import click
            self.nodesPropertyDock.setWidget(click.clickWindow(obj_val, node_editor))
        elif controls == "Wait":
            import wait
            print("wait")
            self.nodesPropertyDock.setWidget(wait.waitWindow(obj_val, node_editor))
        elif controls == "Open url":
            import url
            print("url")
            self.nodesPropertyDock.setWidget(url.urlWindow(obj_val, node_editor))
        elif controls == "Type":
            import type
            print("type")
            self.nodesPropertyDock.setWidget(type.typeWindow(obj_val, node_editor))
        elif controls == "Read":
            import read_text
            print("read")
            self.nodesPropertyDock.setWidget(read_text.readtextWindow(obj_val, node_editor))
        elif controls == "Fetch Email":
            import fetch_email
            print("read")
            self.nodesPropertyDock.setWidget(fetch_email.fetchemailWindow(obj_val, node_editor))
        elif controls == "Open Session":
            import open_imap
            print("open session")
            self.nodesPropertyDock.setWidget(open_imap.openimapWindow(obj_val, node_editor))
        elif controls == "Close Session":
            import close_imap
            print("close session")
            self.nodesPropertyDock.setWidget(close_imap.closeimapWindow(obj_val, node_editor))
        elif controls == "Send Email":
            import send_email
            print("send email")
            self.nodesPropertyDock.setWidget(send_email.sendemailWindow(obj_val, node_editor))
        elif controls == "Loop start":
            import loop_start
            print("loop started")
            self.nodesPropertyDock.setWidget(loop_start.loopStartWindow(obj_val, node_editor, tbl))
        elif controls == "Loop end":
            import loop_end
            print("loop ended")
            self.nodesPropertyDock.setWidget(loop_end.loopEndWindow(obj_val, node_editor, tbl))
        elif controls == "Short keys":
            x = 440
            y = 300
            import keyboard
            self.nodesPropertyDock.setWidget(keyboard.keyWindow(obj_val, node_editor))

        self.nodesPropertyDock.widget().setMinimumSize(QSize(x, y))
        # self.nodesPropertyDock.widget().setMinimumSize(QSize(350, 200))
        self.nodesPropertyDock.setFloating(False)
        self.addDockWidget(Qt.RightDockWidgetArea, self.nodesPropertyDock)
