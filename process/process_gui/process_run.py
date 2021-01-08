import json
import os
import re

DEBUG = False
DEBUG_CONTEXT = False


class runProcess():
    def __init__(self):
        super().__init__()

        self.execute_process()

    def execute_process(self, tbl):
        self.file = os.path.join("process/process_gui", "Untitled_Project.json")
        with open(self.file) as f:
            self.data = json.load(f)

            self.data['nodes'] = sorted(self.data['nodes'], key=lambda k: k['pos_x'])
            run_cmd = ""
            steps = ""
            start = 0
            file_empty = 0
            edge_val = []
        for edge in self.data['edges']:
            end_val = edge["end"]
            edge_val.append(end_val)
        for node_dt in self.data['nodes']:
            if node_dt['start'] == '1':
                start = 1
            elif node_dt['start'] == '0' and start == 1:
                if len(self.data['edges']) > 0:
                    if node_dt['inputs'][0]['id'] in edge_val:
                        print("node connected")
                    else:
                        break
                else:
                    break
            else:
                continue
            if node_dt['content']['value'] == "item":
                node_dt['content']['value'] = "'+datalist[i]+'"

            print(node_dt['title'] + " " + node_dt['content']['value'])
            if node_dt['title'] == "Open url":
                steps = node_dt['content']['value'] + "\n"

            elif node_dt['title'] == "Fetch Email":
                session_list = node_dt['content']['value'].split(",")
                session_list[5] = re.escape(session_list[5])
                steps = "py begin\ndatamsg=FetchMail('" + session_list[0] + "'," + session_list[1] + "," + session_list[
                    2] + ",'" + session_list[3] + "','" + session_list[4] + "','" + session_list[
                            5] + "')\nprint(datamsg)\npy finish\necho py_result\n"

            elif node_dt['title'] == "Open Session":
                session_list = node_dt['content']['value'].split(",")
                steps = "py begin\n" + session_list[0] + "= OpenIMAPSession('" + session_list[1] + "','" + session_list[
                    2] + "','" + session_list[3] + "'," + session_list[4] + ")\npy finish\n"

            elif node_dt['title'] == "Close Session":
                session_name = node_dt['content']['value']
                steps = "py begin\nCloseIMAPSession(" + session_name + ")\npy finish\n"

            elif node_dt['title'] == "Send Email":
                send_dt = node_dt['content']['value'].split(",")
                steps = "py begin\n SendMail(""'" + send_dt[0] + "'""," + send_dt[1] + ",""'" + send_dt[2] + "'"",""'" + \
                        send_dt[3] + "'"",""'" + send_dt[4] + "'"",""'" + send_dt[5] + "'"",""'" + send_dt[
                            6] + "'"",""'" + send_dt[7] + "'"",""'" + send_dt[8] + "'"")\npy finish\n"

            elif node_dt['title'] == "Loop start":
                loop_dt = node_dt['content']['value'].split()
                dt = loop_dt[-1]
                if "item" in node_dt['content']['value']:

                    rowCount = tbl.rowCount()
                    columnCount = tbl.columnCount()
                    for row in range(rowCount):
                        for column in range(columnCount):
                            widgetItem = tbl.item(row, column)
                            heading = tbl.horizontalHeaderItem(column).text()
                            if heading == "Name" and widgetItem is not None:
                                if widgetItem.text() == dt:
                                    print(widgetItem.text())
                                else:
                                    break
                            # if heading == "Type" and tbl.cellWidget(row, column).currentText() == "List":
                            #     continue
                            # else:
                            #     break

                            if heading == "Value" and widgetItem is not None:
                                datalist = widgetItem.text()
                                datalist = datalist.replace("[", '')
                                datalist = datalist.replace("]", '')
                                datalist = datalist.split(",")
                                script = os.path.join("resource", "script.tagui")
                                print(run_cmd, "run")
                                if file_empty == 0:
                                    with open(script, "w") as f:
                                        f.write("datalist=")
                                        f.write(json.dumps(datalist))
                                        file_empty = 1
                                else:
                                    with open(script, "a") as f:
                                        f.write("datalist=")
                                        f.write(json.dumps(datalist))

                                steps = "\nlen=datalist.length\n"
                                run_cmd += steps
                                steps = "for (i=0; i <len;i++)\n{\n"

                else:

                    steps = "for (i=0;i<" + dt + ";i++)\n{\n"


            elif node_dt['title'] == "Loop end":
                print("loop end")
                steps = "}\n"

            else:
                steps = node_dt['title'] + " " + node_dt['content']['value'] + "\n"
            if file_empty == 0:
                run_cmd += "\n"
            run_cmd += steps
        script = os.path.join("resource", "script.tagui")
        if file_empty == 0:
            with open(script, "w") as f:
                f.write(run_cmd)
                file_empty = 1
        else:
            with open(script, "a") as f:
                f.write(run_cmd)
