from PyQt5.QtGui import *
from PyQt5.QtCore import *
from PyQt5.QtWidgets import *

DEBUG = False
DEBUG_CONTEXT = False


class PropertiesPanel(QDockWidget):
    def __init__(self):
        super().__init__()

        self.propertytab(self)

    def propertytab(self, controls, obj_val, node_editor):
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
            import readtext
            print("read")
            self.nodesPropertyDock.setWidget(readtext.readtextWindow(obj_val, node_editor))
        elif controls == "Fetch Email":
            import fetchemail
            print("read")
            self.nodesPropertyDock.setWidget(fetchemail.fetchemailWindow(obj_val, node_editor))
        elif controls == "Open Session":
            import openimap
            print("open session")
            self.nodesPropertyDock.setWidget(openimap.openimapWindow(obj_val, node_editor))
        elif controls == "Close Session":
            import closeimap
            print("close session")
            self.nodesPropertyDock.setWidget(closeimap.closeimapWindow(obj_val, node_editor))
        elif controls == "Send Email":
            import sendemail
            print("send email")
            self.nodesPropertyDock.setWidget(sendemail.sendemailWindow(obj_val, node_editor))
        self.nodesPropertyDock.widget().setMinimumSize(QSize(350, 200))
        self.nodesPropertyDock.setFloating(False)
        self.addDockWidget(Qt.RightDockWidgetArea, self.nodesPropertyDock)
