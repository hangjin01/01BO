#!/usr/bin/env python3
"""Provision the pinned Apache-2.0 Korean Vosk model, with digest verification."""
import hashlib, pathlib, tempfile, urllib.request, zipfile, shutil
URL='https://alphacephei.com/vosk/models/vosk-model-small-ko-0.22.zip'
SHA256='eea36124087fed26c59996a4761519458e3bd185e8ea9d9865ad8760c4a1d989'
root=pathlib.Path(__file__).resolve().parents[1]/'android/app/src/main/assets/wake-ko'
with tempfile.TemporaryDirectory() as temp:
    archive=pathlib.Path(temp)/'model.zip'
    urllib.request.urlretrieve(URL,archive)
    if hashlib.sha256(archive.read_bytes()).hexdigest()!=SHA256:raise SystemExit('Model checksum mismatch')
    staged=pathlib.Path(temp)/'model'
    with zipfile.ZipFile(archive) as z:
        for entry in z.infolist():
            parts=pathlib.PurePosixPath(entry.filename).parts
            if not parts or parts[0]!='vosk-model-small-ko-0.22' or '..' in parts:raise SystemExit('Unexpected archive path')
            dest=staged.joinpath(*parts[1:])
            if entry.is_dir():dest.mkdir(parents=True,exist_ok=True)
            else:
                dest.parent.mkdir(parents=True,exist_ok=True)
                dest.write_bytes(z.read(entry))
    (staged/'uuid').write_text('o1bo-ko-0.22-v1\n')
    shutil.copytree(staged,root,dirs_exist_ok=True)
print('Verified offline Korean model installed:',root)
