import json
import os
import re

DEBUG = False
DEBUG_CONTEXT = False


class runProcess():
    def __init__(self):
        super().__init__()

        self.execute_process()

    def execute_process(self):
        self.file = os.path.join("process/process_gui", "Untitled_Project.json")

        with open(self.file) as f:
            data = json.load(f)
            print(data['nodes'])
            run_cmd = ""
            cnt = 0
            start = 0
        for node_dt in data['nodes']:
            if node_dt['start'] == '1':
                start = 1
            elif node_dt['start'] == '0' and start == 1:
                if len(node_dt['inputs']) == 1:
                    if len(data['edges']) > 0:
                        try:
                            if data['edges'][cnt - 1]['end'] == node_dt['inputs'][0]['id']:
                                print("nodes connected")
                            else:
                                break
                        except IndexError:
                            break

                    else:
                        break
            else:
                continue

            cnt = cnt + 1
            print(node_dt['title'] + " " + node_dt['content']['value'])
            if node_dt['title'] == "Open url":
                steps = node_dt['content']['value'] + "\n"

            elif node_dt['title'] == "Fetch Email":
                print(node_dt['content']['value'])
                session_list = node_dt['content']['value'].split(",")
                session_list[5] = re.escape(session_list[5])
                steps = "py begin\ndatamsg=FetchMail('" + session_list[0] + "'," + session_list[1] + "," + session_list[
                    2] + ",'" + session_list[3] + "','" + session_list[4] + "','" + session_list[
                            5] + "')\nprint(datamsg)\npy finish\necho py_result\n"

                print(steps)

            elif node_dt['title'] == "Open Session":
                print(node_dt['content']['value'])
                session_list = node_dt['content']['value'].split(",")
                steps = "py begin\n" + session_list[0] + "= OpenIMAPSession('" + session_list[1] + "','" + session_list[
                    2] + "','" + session_list[3] + "'," + session_list[4] + ")\npy finish\n"


            elif node_dt['title'] == "Close Session":
                print(node_dt['content']['value'])
                session_name = node_dt['content']['value']
                print(session_name)
                steps = "py begin\nCloseIMAPSession(" + session_name + ")\npy finish\n"

            elif node_dt['title'] == "Send Email":
                print(node_dt['content']['value'])
                send_dt = node_dt['content']['value'].split(",")
                steps = "py begin\n SendMail(""'" + send_dt[0] + "'""," + send_dt[1] + ",""'" + send_dt[2] + "'"",""'" + \
                        send_dt[3] + "'"",""'" + send_dt[4] + "'"",""'" + send_dt[5] + "'"",""'" + send_dt[
                            6] + "'"",""'" + send_dt[7] + "'"",""'" + send_dt[8] + "'"")\npy finish\n"


            else:
                steps = node_dt['title'] + " " + node_dt['content']['value'] + "\n"
                print(node_dt['content']['value'])
            run_cmd += steps
        script = os.path.join("resource", "script.tagui")
        with open(script, "w") as f:
            f.write(run_cmd)
