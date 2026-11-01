#!/usr/bin/env python3
"""Run directly in your terminal. Never accepts the key as a CLI argument."""
import getpass
import re
import shlex
import subprocess
import sys
import unicodedata

REMOTE = r'''
import os, re, sys, tempfile
from pathlib import Path
key=''.join(sys.stdin.read().split())
if not re.fullmatch(r'[a-zA-Z0-9]{16}',key):
    raise SystemExit('Invalid Gmail app password format; nothing saved.')
folder=Path('/home/ubuntu/.config/o1bo')
folder.mkdir(mode=0o700,parents=True,exist_ok=True)
os.chmod(folder,0o700)
fd,tmp=tempfile.mkstemp(dir=folder,prefix='.gmail-')
try:
    with os.fdopen(fd,'w') as f:
        f.write('O1BO_SMTP_HOST=smtp.gmail.com\nO1BO_SMTP_PORT=465\nO1BO_SMTP_USER=rlaskslsl093@gmail.com\nO1BO_MAIL_FROM=rlaskslsl093@gmail.com\nO1BO_SMTP_PASSWORD='+key+'\n')
    os.replace(tmp,folder/'mail.env')
finally:
    if os.path.exists(tmp): os.unlink(tmp)
print('Saved privately on AWS. Key was not printed. Tell Codex: Gmail saved.')
'''

def main():
    if not sys.stdin.isatty():
        raise SystemExit('Run this script yourself in a terminal; do not pipe the key.')
    print('Google에서 발급한 16자리 앱 비밀번호만 붙여넣으세요. 앱 이름이나 안내 문장은 제외합니다.')
    raw=getpass.getpass('Gmail app password (hidden): ')
    normalized=unicodedata.normalize('NFKC',raw).replace('\x1b[200~','').replace('\x1b[201~','')
    key=''.join(c for c in normalized if not c.isspace() and unicodedata.category(c)!='Cf')
    raw=normalized=''
    if not re.fullmatch(r'[a-zA-Z0-9]{16}',key):
        length=len(key)
        invalid=sum(not c.isascii() or not c.isalnum() for c in key)
        key=''
        raise SystemExit(f'저장하지 않았습니다. 공백 제외 {length}자리 / 영문·숫자 외 문자 {invalid}개입니다. Google에서 표시한 16자리 비밀번호 부분만 복사해 주세요. 이 숫자 안내만 Codex에 알려주세요. 비밀번호는 보내지 마세요.')
    result=subprocess.run(['ssh','-i','/home/orora/aws/japan-app-key.pem','-o','IdentitiesOnly=yes','-o','BatchMode=yes','-o','StrictHostKeyChecking=yes','-o','HostKeyAlias=57.182.243.64','-o','ConnectTimeout=10','ubuntu@57.183.24.179','python3 -c '+shlex.quote(REMOTE)],input=key,text=True,capture_output=True)
    key=''
    if result.returncode:
        raise SystemExit('Key storage failed. Check SSH connectivity; no secret output displayed.')
    print('Gmail settings saved privately on AWS. Tell Codex: Gmail saved.')

if __name__=='__main__':main()
