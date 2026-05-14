"""
Bir kullanıcıya Firebase custom claim ile 'admin' rolü atar.

Kullanım:
    python set_admin.py <email_veya_uid>

Örnek:
    python set_admin.py akinbas2002@gmail.com
    python set_admin.py admin@estateflow.com
"""
import sys
import os
from pathlib import Path

# .env dosyasını yükle
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent / ".env")
except ImportError:
    # python-dotenv yoksa manuel yükle
    env_file = Path(__file__).parent / ".env"
    if env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, value = line.partition("=")
                value = value.strip().strip('"')
                os.environ.setdefault(key.strip(), value)

import ssl
ssl._create_default_https_context = ssl._create_unverified_context

# urllib3/requests SSL bypass (Windows kurumsal sertifika sorunu)
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
import requests
_orig_init = requests.Session.__init__
def _patched_init(self, *args, **kwargs):
    _orig_init(self, *args, **kwargs)
    self.verify = False
requests.Session.__init__ = _patched_init

import firebase_admin
from firebase_admin import credentials, auth


def init_firebase():
    project_id    = os.environ["FIREBASE_PROJECT_ID"]
    client_email  = os.environ["FIREBASE_CLIENT_EMAIL"]
    private_key   = os.environ["FIREBASE_PRIVATE_KEY"].replace("\\n", "\n")
    storage_bucket = os.environ.get("FIREBASE_STORAGE_BUCKET", f"{project_id}.appspot.com")

    cred = credentials.Certificate({
        "type": "service_account",
        "project_id": project_id,
        "client_email": client_email,
        "private_key": private_key,
        "token_uri": "https://oauth2.googleapis.com/token",
    })
    firebase_admin.initialize_app(cred, {"storageBucket": storage_bucket})


def set_role(identifier: str, role: str = "admin"):
    # Email mi UID mi?
    if "@" in identifier:
        user = auth.get_user_by_email(identifier)
    else:
        user = auth.get_user(identifier)

    auth.set_custom_user_claims(user.uid, {"role": role})

    print(f"\n[OK] Basarili!")
    print(f"  Kullanici : {user.email or user.uid}")
    print(f"  UID       : {user.uid}")
    print(f"  Yeni rol  : {role}")
    print(f"\nNot: Token yenilenmesi icin cikis yapip tekrar giris yapilmasi gerekir.\n")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    identifier = sys.argv[1]
    role = sys.argv[2] if len(sys.argv) > 2 else "admin"

    if role not in ("admin", "agent", "user"):
        print(f"Geçersiz rol: {role}. Geçerli değerler: admin, agent, user")
        sys.exit(1)

    init_firebase()
    set_role(identifier, role)
