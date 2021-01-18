import os
import datetime
import time

import simplejson as json
import pymsgbox

__version__ = "1.0.3"

from resource.tagui_py import keyboard

'''
Email Operations
'''
import email
import imaplib
import smtplib


def OpenIMAPSession(host, user, password, port):
    emailsession = imaplib.IMAP4_SSL(host, port)
    emailsession.login(user, password)
    emailsession.select('inbox')
    return emailsession


def CloseIMAPSession(session):
    session.logout()


def FetchMail(option, limit, session, fromaddress='', subject='', directory=''):
    retcode = data = None

    command = __prepareMailCommand(option, fromaddress, subject)
    retcode, data = session.uid('search', None, command)

    if retcode != 'OK':
        return

    email_count = len(data[0].split())
    if email_count < limit:
        limit = email_count
    res = []
    msg_id = []
    for x in range(limit):
        cnt = x + 1
        index = email_count - cnt
        res = __getMailByIndex(session, data, directory, index)
        try:
            if res['message_id'] in msg_id:
                limit = limit + 1
            else:
                msg_id.append(res['message_id'])
                print(res['message_id'])

        except:
            print("No Unread messages")
            break


def SendMail(host, port, username, password, to_addr, cc_addr="", bcc_addr="", subject="", message="",
             reply_message_id=""):
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart

    newMail = MIMEMultipart("alternative")
    newMail["Message-ID"] = email.utils.make_msgid()
    newMail.attach(MIMEText(message, "html"))
    newMail.attach(MIMEText(message, "plain"))

    newMail['To'] = to_addr
    if reply_message_id:
        subject = 'RE: ' + subject
        newMail["In-Reply-To"] = reply_message_id
        newMail["References"] = reply_message_id

    newMail["Subject"] = subject

    if cc_addr:
        newMail["CC"] = cc_addr
        to_addr = to_addr + ',' + cc_addr
    if bcc_addr:
        newMail["BCC"] = bcc_addr
        to_addr = to_addr + ',' + bcc_addr

    smptsession = smtplib.SMTP(host, port)
    smptsession.starttls()
    smptsession.ehlo()
    smptsession.login(username, password)
    smptsession.sendmail(username, to_addr.split(','), newMail.as_string())
    smptsession.quit()


def __prepareMailCommand(option, fromaddress=None, subject=None):
    command = option
    print(command)
    if (subject is not None and subject != ''):
        command = command + ' SUBJECT "%s"' % subject
    if (fromaddress is not None and fromaddress != ''):
        command = command + ' FROM "%s"' % fromaddress
    return '(' + command + ')'


def __getMailByIndex(session, data, directory, index):
    response = {}
    if len(data[0].split()) <= 0:
        return

    latest_email_uid = data[0].split()[index]
    retcode, email_data = session.uid('fetch', latest_email_uid, '(RFC822)')
    if retcode != 'OK':
        return

    raw_email = email_data[0][1]
    raw_email_string = raw_email.decode('utf-8')
    email_message = email.message_from_string(raw_email_string)

    date_tuple = email.utils.parsedate_tz(email_message['Date'])
    if date_tuple:
        local_date = datetime.datetime.fromtimestamp(email.utils.mktime_tz(date_tuple))
        local_message_date = "%s" % (str(local_date.strftime("%d.%m.%Y %H:%M:%S")))

    message_id = email_message["Message-ID"]
    email_from = str(email.header.make_header(email.header.decode_header(email_message['From'])))
    email_to = str(email.header.make_header(email.header.decode_header(email_message['To'])))
    subject = str(email.header.make_header(email.header.decode_header(email_message['Subject'])))
    response = {'from': email_from, 'to': email_to, 'subject': subject, 'message_id': message_id,
                'datetime': local_message_date}
    attachments = []
    for part in email_message.walk():
        if part.get_content_type() == "text/plain":
            body = part.get_payload(decode=True)
            response['body'] = body
        if part.get_content_maintype() == 'multipart':
            continue
        if part.get('Content-Disposition') is None:
            continue

        if directory is not None and directory != '' and len(directory) > 0:
            filename = part.get_filename()
            att_path = os.path.join(directory, filename)

            fp = open(att_path, 'wb')
            fp.write(part.get_payload(decode=True))
            fp.close()
            attachments.append(filename)

    response.update({'attachments': attachments})
    print(json.dumps(response, indent=4, sort_keys=True, default=str))
    return response


def read_info(message):
    pymsgbox.alert(message, 'Read Element')


'''
Keyboard Events
'''
initKeyboard = None
def KeyboardWrite(value):
    global initKeyboard
    if initKeyboard == None:
        value = " " + value
        initKeyboard = True

    keyboard.write(value,delay=0.05)

def KeyboardSend(value):
    keyboard.send(value)

def Sleep(seconds):
    time.sleep(seconds)
