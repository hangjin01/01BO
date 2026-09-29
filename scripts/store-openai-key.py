#!/usr/bin/env python3
"""Run directly in your terminal. Never accepts the key as a CLI argument."""
import getpass
import re
import shlex
import subprocess
import sys

REMOTE = r'''
import os, re, sys, tempfile
from pathlib import Path
key=sys.stdin.read().strip()
if not re.fullmatch(r'sk-[A-Za-z0-9_-]{20,}',key):
    raise SystemExit('Invalid API key format; nothing saved.')
folder=Path('/home/ubuntu/.config/o1bo')
folder.mkdir(mode=0o700,parents=True,exist_ok=True)
os.chmod(folder,0o700)
fd,tmp=tempfile.mkstemp(dir=folder,prefix='.openai-')
try:
    with os.fdopen(fd,'w') as f:
        f.write('OPENAI_API_KEY='+key+'\n')
    os.replace(tmp,folder/'openai.env')
finally:
    if os.path.exists(tmp): os.unlink(tmp)
print('Saved privately on AWS. Key was not printed. Tell Codex: key saved.')
'''

def main():
    if not sys.stdin.isatty():
        raise SystemExit('Run this script yourself in a terminal; do not pipe the key.')
    key=getpass.getpass('New OpenAI API key (hidden): ').strip()
    if not re.fullmatch(r'sk-[A-Za-z0-9_-]{20,}',key):
        raise SystemExit('Invalid key format; nothing saved.')
    result=subprocess.run(['ssh','-i','/home/orora/aws/japan-app-key.pem','-o','IdentitiesOnly=yes','-o','BatchMode=yes','-o','StrictHostKeyChecking=yes','-o','HostKeyAlias=57.182.243.64','-o','ConnectTimeout=10','ubuntu@57.183.12.111','python3 -c '+shlex.quote(REMOTE)],input=key,text=True,capture_output=True)
    key=''
    if result.returncode:
        raise SystemExit('Key storage failed. Check SSH connectivity; no secret output displayed.')
    print(result.stdout.strip())

if __name__=='__main__':main()
