"""Test Firestore via REST transport (no gRPC)."""
import ssl, os, truststore

truststore.inject_into_ssl()

from pathlib import Path
for line in Path(".env").read_text(encoding="utf-8").splitlines():
    line = line.strip()
    if line and not line.startswith("#") and "=" in line:
        k, _, v = line.partition("=")
        os.environ.setdefault(k.strip(), v.strip().strip('"'))

import firebase_admin
from firebase_admin import credentials

cred = credentials.Certificate({
    "type": "service_account",
    "project_id": os.environ["FIREBASE_PROJECT_ID"],
    "client_email": os.environ["FIREBASE_CLIENT_EMAIL"],
    "private_key": os.environ["FIREBASE_PRIVATE_KEY"].replace("\\n", "\n"),
    "token_uri": "https://oauth2.googleapis.com/token",
})
app = firebase_admin.initialize_app(cred)
google_cred = app.credential.get_credential()
print("[OK] Credentials ready")

# Use FirestoreClient with REST transport directly
from google.cloud import firestore as gc_fs
from google.cloud.firestore_v1.services.firestore import FirestoreClient
from google.cloud.firestore_v1.services.firestore.transports.rest import FirestoreRestTransport

PROJECT = os.environ["FIREBASE_PROJECT_ID"]

transport = FirestoreRestTransport(
    credentials=google_cred,
    host="firestore.googleapis.com",
)
print("[OK] REST transport created")

# High-level client, inject REST transport
db = gc_fs.Client(project=PROJECT, credentials=google_cred)
db._firestore_api_internal = FirestoreClient(transport=transport)
print("[OK] Firestore client ready, querying...")

docs = list(db.collection("properties").limit(3).stream())
print(f"[OK] Got {len(docs)} documents")
for d in docs:
    data = d.to_dict()
    print("  -", data.get("title", "")[:60])
