from PyQt5.QtGui import *
from PyQt5.QtCore import *
from PyQt5.QtWidgets import *

from process.process_gui.process_conf import *
from node_editor.utils import dumpException


class QDMDragListbox(QListWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.initUI()

    def initUI(self):
        # init
        self.setIconSize(QSize(32, 32))
        self.setSelectionMode(QAbstractItemView.SingleSelection)
        self.setDragEnabled(True)
        self.baseval=0
        self.emailval=0
        self.basic_controls = QPushButton("Basic Controls >>")
        self.basic_controls.setStyleSheet("background-color: #F9EBEA")
        self.basic_controls.clicked.connect(lambda: self.toggleItem("basiccontrols"))
        self.email_controls=QPushButton("Email Controls >>")
        self.email_controls.clicked.connect(lambda: self.toggleItem("emailcontrols"))
        self.email_controls.setStyleSheet("background-color: #F9EBEA")

        self.addMyItems()
        for dt in self.email_control_list:
            dt.setHidden(True)
        for dt in self.basic_control_list:
            dt.setHidden(True)

    def addMyItems(self):
        self.basic_control_list=[]
        self.email_control_list=[]
        keys = list(CALC_NODES.keys())
        print(keys)
        keys.sort()
        cnt = 0
        font = QFont('Ariel', 8, QFont.Light)
        font.setBold(True)
        font.setWeight(75)
        self.textPen = QPen(QColor(255, 255, 0), 0, Qt.SolidLine)
        for key in keys:
            if cnt == 0:

                headName = "Basic Controls >>"
                listitem = QListWidgetItem(headName)
                QListWidget.addItem(self, listitem)
                QListWidget.setItemWidget(self, listitem,self.basic_controls)
                QListWidget.addItem(self, listitem)
                listitem.setSizeHint(QSize(32, 32))

            elif cnt == 5:
                headName = "Email Controls"
                listitem = QListWidgetItem(headName)
                QListWidget.addItem(self, listitem)
                QListWidget.setItemWidget(self, listitem, self.email_controls)
                QListWidget.addItem(self, listitem)
                listitem.setSizeHint(QSize(32, 32))

            node = get_class_from_opcode(key)
            self.addMyItem(node.op_title, node.icon, node.op_code)
            cnt = cnt + 1


    def toggleItem(self, feature):

        if feature=="basiccontrols":

            print(self.basic_control_list)
            if self.baseval==1:
                for dt in self.basic_control_list:
                    dt.setHidden(True)
                self.baseval = 0
            else:
                for dt in self.basic_control_list:
                    dt.setHidden(False)
                self.baseval = 1

        elif feature=="emailcontrols":
            if self.emailval == 1:
                for dt in self.email_control_list:
                    dt.setHidden(True)
                self.emailval = 0
            else:
                for dt in self.email_control_list:
                    dt.setHidden(False)
                self.emailval = 1


    def addMyItem(self, name, icon=None, op_code=0):

        print(QListWidget)
        print(dir(QListWidget))



        item = QListWidgetItem(name, self)  # can be (icon, text, parent, <int>type)
        if op_code < 6:
            print("data1 opcode is")
            print(op_code)
            self.basic_control_list.append(item)
            print(self.basic_control_list)
        elif 5 < op_code < 10:
            self.email_control_list.append(item)
        pixmap = QPixmap(icon if icon is not None else ".")
        print("item is")
        print(item)
        item.setIcon(QIcon(pixmap))
        item.setSizeHint(QSize(32, 32))

        item.setFlags(Qt.ItemIsEnabled | Qt.ItemIsSelectable | Qt.ItemIsDragEnabled)

        # setup data
        item.setData(Qt.UserRole, pixmap)
        item.setData(Qt.UserRole + 1, op_code)

    def startDrag(self, *args, **kwargs):
        try:
            item = self.currentItem()
            print(item)
            op_code = item.data(Qt.UserRole + 1)
            print(op_code)

            pixmap = QPixmap(item.data(Qt.UserRole))
            print(pixmap)

            itemData = QByteArray()
            dataStream = QDataStream(itemData, QIODevice.WriteOnly)
            print(dataStream)
            dataStream << pixmap
            dataStream.writeInt(op_code)
            dataStream.writeQString(item.text())

            mimeData = QMimeData()
            mimeData.setData(LISTBOX_MIMETYPE, itemData)
            print(mimeData)

            drag = QDrag(self)
            drag.setMimeData(mimeData)
            # drag.setHotSpot(QPoint(pixmap.width() / 2, pixmap.height() / 2))
            # drag.setPixmap(pixmap)

            drag.exec_(Qt.MoveAction)

        except Exception as e:
            dumpException(e)
