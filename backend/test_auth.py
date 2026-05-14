"""Quick test: admin token verification end-to-end."""
import ssl, os, urllib3, requests as _req

ssl._create_default_https_context = ssl._create_unverified_context
urllib3.disable_warnings()
_orig = _req.Session.__init__
def _p(self, *a, **kw):
    _orig(self, *a, **kw)
    self.verify = False
_req.Session.__init__ = _p

import truststore
truststore.inject_into_ssl()

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

uid = "loF66hNDVSZ4lI0wCY0K6RNgzOw2"  # admin@admin.com
custom_token = auth.create_custom_token(uid).decode("utf-8")
print("[OK] Custom token olusturuldu.")

API_KEY = "AIzaSyDUEbovTYgLkhGcN-UnB68ZLWx62dtRGxM"
r = _req.post(
    f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key={API_KEY}",
    json={"token": custom_token, "returnSecureToken": True},
    verify=False,
)
data = r.json()
if "idToken" not in data:
    print("[HATA] ID token alinamadi:", data)
    exit(1)
id_token = data["idToken"]
print("[OK] ID token alindi.")

try:
    decoded = auth.verify_id_token(id_token)
    print("[OK] verify_id_token basarili!")
    print("  UID :", decoded["uid"])
    print("  role:", decoded.get("role", "(yok - custom claim eksik!)"))
    ignore = {"iat", "exp", "iss", "aud", "sub", "auth_time", "uid",
              "firebase", "user_id", "sign_in_provider"}
    extra = {k: v for k, v in decoded.items() if k not in ignore}
    print("  Extra claims:", extra)
except Exception as e:
    print("[HATA] verify_id_token basarisiz:", e)
