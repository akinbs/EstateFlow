import ssl
ssl._create_default_https_context = ssl._create_unverified_context
import urllib3
urllib3.disable_warnings()
import requests
_orig = requests.Session.__init__
def _p(self, *a, **kw):
    _orig(self, *a, **kw)
    self.verify = False
requests.Session.__init__ = _p

import os
from pathlib import Path

for line in Path(".env").read_text(encoding="utf-8").splitlines():
    line = line.strip()
    if line and not line.startswith("#") and "=" in line:
        k, _, v = line.partition("=")
        os.environ.setdefault(k.strip(), v.strip().strip('"'))

import firebase_admin
from firebase_admin import credentials, auth

cred = credentials.Certificate({
    "type": "service_account",
    "project_id": os.environ["FIREBASE_PROJECT_ID"],
    "client_email": os.environ["FIREBASE_CLIENT_EMAIL"],
    "private_key": os.environ["FIREBASE_PRIVATE_KEY"].replace("\\n", "\n"),
    "token_uri": "https://oauth2.googleapis.com/token",
})
firebase_admin.initialize_app(cred)

EMAIL    = "admin@admin.com"
PASSWORD = "admin123"  # Firebase min 6 karakter zorunlu

try:
    user = auth.get_user_by_email(EMAIL)
    print(f"Kullanici zaten var: {EMAIL}")
except auth.UserNotFoundError:
    user = auth.create_user(email=EMAIL, password=PASSWORD, display_name="Admin")
    print(f"Kullanici olusturuldu: {EMAIL}")

auth.set_custom_user_claims(user.uid, {"role": "admin"})
print(f"Admin claim atandi.")
print(f"UID  : {user.uid}")
print(f"Email: {EMAIL}")
print(f"Sifre: {PASSWORD}")
