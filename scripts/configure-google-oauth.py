#!/usr/bin/env python3
"""Import downloaded Google web OAuth JSON over SSH stdin; never print secrets."""
import json
import re
import shlex
import subprocess
import sys
from pathlib import Path

CALLBACK = 'https://api.01bo.cloud/api/gmail/callback'
REMOTE = r'''
import base64,json,os,secrets,sys,tempfile
from pathlib import Path
d=json.load(sys.stdin)
folder=Path('/home/ubuntu/.config/o1bo')
folder.mkdir(mode=0o700,parents=True,exist_ok=True)
os.chmod(folder,0o700)
p=folder/'workflow.env'
values={}
if p.exists():
 for line in p.read_text().splitlines():
  if line and not line.startswith('#') and '=' in line:
   k,v=line.split('=',1);values[k]=v
values.update(d)
values.setdefault('O1BO_TOKEN_KEY',base64.b64encode(secrets.token_bytes(32)).decode())
assert len(base64.b64decode(values['O1BO_TOKEN_KEY'],validate=True))==32
fd,tmp=tempfile.mkstemp(dir=folder,prefix='.oauth-')
try:
 with os.fdopen(fd,'w') as f:
  for k,v in values.items():
   assert '\n' not in v and '\r' not in v
   f.write(k+'='+v+'\n')
 os.replace(tmp,p)
 os.chmod(p,0o600)
finally:
 if os.path.exists(tmp):os.unlink(tmp)
print('OAuth settings stored privately; service activation pending.')
'''

def main():
    if len(sys.argv) != 2:
        raise SystemExit('Usage: configure-google-oauth.py /path/to/downloaded.json')
    try:
        web = json.loads(Path(sys.argv[1]).read_text())['web']
        assert CALLBACK in web['redirect_uris']
        assert re.fullmatch(r'[A-Za-z0-9_.-]+', web['client_id'])
        assert re.fullmatch(r'[A-Za-z0-9_-]+', web['client_secret'])
        payload = {'O1BO_GOOGLE_CLIENT_ID': web['client_id'],
                   'O1BO_GOOGLE_CLIENT_SECRET': web['client_secret'],
                   'O1BO_GOOGLE_REDIRECT_URI': CALLBACK}
    except Exception:
        raise SystemExit('Invalid web OAuth JSON or callback mismatch; nothing saved.')
    result = subprocess.run(['ssh','-i','/home/orora/aws/japan-app-key.pem',
        '-o','IdentitiesOnly=yes','-o','BatchMode=yes','-o','StrictHostKeyChecking=yes',
        '-o','HostKeyAlias=57.182.243.64','-o','ConnectTimeout=10',
        'ubuntu@57.183.24.179','python3 -c '+shlex.quote(REMOTE)],
        input=json.dumps(payload),text=True,capture_output=True)
    if result.returncode:
        raise SystemExit('Private OAuth import failed; no secret output displayed.')
    print('OAuth settings stored privately on AWS (600). Service activation pending.')

if __name__ == '__main__':
    main()
