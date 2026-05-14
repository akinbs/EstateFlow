"""50 dummy property seeder — Firestore REST API (no gRPC, Windows SSL bypass)."""

# ─── 1. SSL bypass — must come before ALL google/grpc imports ──────────────
import ssl, os, re, unicodedata, random, datetime
import urllib3, requests

ssl._create_default_https_context = ssl._create_unverified_context
urllib3.disable_warnings()

_orig_sess = requests.Session.__init__
def _patch_sess(self, *a, **kw):
    _orig_sess(self, *a, **kw)
    self.verify = False
requests.Session.__init__ = _patch_sess

# ─── 2. .env ───────────────────────────────────────────────────────────────
from pathlib import Path
for line in Path(".env").read_text(encoding="utf-8").splitlines():
    line = line.strip()
    if line and not line.startswith("#") and "=" in line:
        k, _, v = line.partition("=")
        os.environ.setdefault(k.strip(), v.strip().strip('"'))

PROJECT_ID   = os.environ["FIREBASE_PROJECT_ID"]
CLIENT_EMAIL = os.environ["FIREBASE_CLIENT_EMAIL"]
PRIVATE_KEY  = os.environ["FIREBASE_PRIVATE_KEY"].replace("\\n", "\n")
OWNER_ID     = "loF66hNDVSZ4lI0wCY0K6RNgzOw2"

# ─── 3. OAuth2 access token ────────────────────────────────────────────────
from google.oauth2 import service_account
import google.auth.transport.requests as _ga_req

# Patch AuthorizedSession after import so token refresh also skips SSL verify
_orig_as = _ga_req.AuthorizedSession.__init__
def _patch_as(self, *a, **kw):
    _orig_as(self, *a, **kw)
    self.verify = False
_ga_req.AuthorizedSession.__init__ = _patch_as

_creds = service_account.Credentials.from_service_account_info(
    {"type": "service_account", "project_id": PROJECT_ID,
     "client_email": CLIENT_EMAIL, "private_key": PRIVATE_KEY,
     "token_uri": "https://oauth2.googleapis.com/token"},
    scopes=["https://www.googleapis.com/auth/datastore"],
)
_auth_sess = requests.Session()
_auth_sess.verify = False
_creds.refresh(_ga_req.Request(session=_auth_sess))
TOKEN = _creds.token
print(f"[OK] Token alindi: {TOKEN[:30]}...")

# ─── 4. Firestore REST helpers ─────────────────────────────────────────────
BASE = (
    f"https://firestore.googleapis.com/v1"
    f"/projects/{PROJECT_ID}/databases/(default)/documents"
)
HDR = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}


def fv(v):
    """Python value -> Firestore REST typed value."""
    if v is None:            return {"nullValue": None}
    if isinstance(v, bool):  return {"booleanValue": v}
    if isinstance(v, int):   return {"integerValue": str(v)}
    if isinstance(v, float): return {"doubleValue": v}
    if isinstance(v, str):   return {"stringValue": v}
    if isinstance(v, list):  return {"arrayValue": {"values": [fv(i) for i in v]}}
    if isinstance(v, dict):  return {"mapValue": {"fields": {k: fv(x) for k, x in v.items()}}}
    return {"stringValue": str(v)}


def post_doc(collection: str, data: dict):
    r = requests.post(
        f"{BASE}/{collection}",
        json={"fields": {k: fv(v) for k, v in data.items()}},
        headers=HDR, verify=False,
    )
    if r.status_code not in (200, 201):
        raise RuntimeError(f"HTTP {r.status_code}: {r.text[:300]}")


def get_existing_slugs(collection: str) -> set:
    slugs, pt = set(), None
    while True:
        url = f"{BASE}/{collection}?pageSize=300&mask.fieldPaths=slug"
        if pt:
            url += f"&pageToken={pt}"
        data = requests.get(url, headers=HDR, verify=False).json()
        for d in data.get("documents", []):
            s = d.get("fields", {}).get("slug", {}).get("stringValue")
            if s:
                slugs.add(s)
        pt = data.get("nextPageToken")
        if not pt:
            break
    return slugs


# ─── 5. Source data ────────────────────────────────────────────────────────
def slugify(text: str) -> str:
    tr = str.maketrans("çğıİöşüÇĞÖŞÜ", "cgiIosuCGOSU")
    text = text.translate(tr)
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


CITIES = [
    {"city": "İstanbul", "lat": 41.0082, "lng": 28.9784, "districts": [
        {"district": "Kadıköy",   "hoods": ["Moda", "Fenerbahçe", "Bağlarbaşı"]},
        {"district": "Beşiktaş",  "hoods": ["Levent", "Etiler", "Bebek"]},
        {"district": "Sarıyer",   "hoods": ["Tarabya", "Rumelihisarı", "Zekeriyaköy"]},
        {"district": "Üsküdar",   "hoods": ["Çengelköy", "Beylerbeyi", "Kuzguncuk"]},
        {"district": "Bakırköy",  "hoods": ["Ataköy", "Florya", "Yeşilköy"]},
    ]},
    {"city": "Ankara", "lat": 39.9334, "lng": 32.8597, "districts": [
        {"district": "Çankaya",   "hoods": ["Kavaklıdere", "Gaziosmanpaşa", "Balgat"]},
        {"district": "Keçiören",  "hoods": ["Etlik", "Kalaba", "Ovacık"]},
        {"district": "Mamak",     "hoods": ["Yenimahalle", "Demirlibahçe", "Karakusunlar"]},
    ]},
    {"city": "İzmir", "lat": 38.4192, "lng": 27.1287, "districts": [
        {"district": "Konak",     "hoods": ["Alsancak", "Kahramanlar", "Hatay"]},
        {"district": "Karşıyaka", "hoods": ["Bostanlı", "Mavişehir", "Alaybey"]},
        {"district": "Bornova",   "hoods": ["Işıkkent", "Kazımdirik", "Yeşilova"]},
    ]},
    {"city": "Antalya", "lat": 36.8969, "lng": 30.7133, "districts": [
        {"district": "Muratpaşa", "hoods": ["Konyaaltı", "Lara", "Fener"]},
        {"district": "Kepez",     "hoods": ["Varsak", "Uncalı", "Santral"]},
    ]},
    {"city": "Bursa", "lat": 40.1956, "lng": 29.0601, "districts": [
        {"district": "Nilüfer",   "hoods": ["Görükle", "Özlüce", "İhsaniye"]},
        {"district": "Osmangazi", "hoods": ["Heykel", "Çekirge", "Demirtaş"]},
    ]},
]

PROPERTY_TYPES  = ["apartment", "house", "villa", "land", "office", "commercial"]
ROOM_OPTIONS    = ["1+0", "1+1", "2+1", "3+1", "4+1", "5+1", "6+1"]
HEATING_OPTIONS = ["Doğalgaz", "Kombi", "Merkezi Sistem", "Klima", "Yerden Isıtma", "Soba"]
CURRENCIES      = ["TRY", "TRY", "TRY", "USD", "EUR"]
TYPE_TR = {
    "apartment": "Daire", "house": "Ev", "villa": "Villa",
    "land": "Arsa", "office": "Ofis", "commercial": "Dükkan",
}
FEATURES_POOL = [
    "Asansör", "Güvenlik", "Otopark", "Havuz", "Balkon", "Teras", "Bahçe",
    "Akıllı Ev Sistemi", "Deprem Yalıtımı", "Isı Yalıtımı", "Ses Yalıtımı",
    "Ebeveyn Banyosu", "Giyinme Odası", "Jakuzi", "Sauna", "Spor Salonu",
    "Çocuk Oyun Alanı", "Jeneratör", "Güneş Enerjisi", "Şömine",
    "Merkezi Uydu", "Alarm Sistemi", "Kamera Sistemi", "Açık Mutfak",
]
TITLE_TEMPLATES = [
    "{rooms} Satılık {type} - {district}",
    "{district}'de {rooms} {type}",
    "Lüks {rooms} {type} - {hood}",
    "{hood} Konumunda {rooms} {type}",
    "{city} {district} Kiralık {rooms} {type}",
    "Merkezi Konumda {rooms} {type}",
    "Deniz Manzaralı {rooms} {type} - {district}",
    "Yeni Bina {rooms} {type} - {hood}",
    "Fırsat {rooms} {type} - {district}",
    "Prestijli {rooms} {type} - {city}",
]
DESC_TEMPLATES = [
    "{hood} mahallesinde konumlanan bu {type}, geniş ve aydınlık yapısıyla ferah bir yaşam alanı sunmaktadır. Market, okul ve hastane gibi sosyal donatı alanlarına yürüme mesafesindedir.",
    "{city} {district} bölgesinde yer alan bu {type}, modern mimari anlayışıyla tasarlanmıştır. Yüksek kaliteli malzeme kullanılan yapı iç mekânının tamamı yeni yapılmış, temiz teslim edilecektir.",
    "Sakin ve yeşil bir konumda bulunan bu {type}, aile yaşamı için idealdir. Çift cephe yapısı sayesinde doğal ışık her odaya ulaşmakta, hava sirkülasyonu mükemmeldir.",
    "{district} bölgesinin en değerli noktasında yer alan bu {type} yatırım fırsatı olarak değerlendirilebilir. Kira getirisi yüksek, değer artış potansiyeli oldukça iyidir.",
    "{hood} sokağında yer alan bu {type} yeni inşaat olup hiç kullanılmamıştır. Ankastre mutfak eşyaları ve yerleşik dolaplar dahil teslim edilecektir.",
]

# ─── 6. Generate & upload ──────────────────────────────────────────────────
print("Mevcut slug'lar aliniyor...")
existing = get_existing_slugs("properties")
print(f"Mevcut {len(existing)} slug bulundu.")

created = 0
for i in range(50):
    city_d   = CITIES[i % len(CITIES)]
    dist_d   = city_d["districts"][i % len(city_d["districts"])]
    hood     = dist_d["hoods"][i % len(dist_d["hoods"])]
    ptype    = PROPERTY_TYPES[i % len(PROPERTY_TYPES)]
    ltype    = "sale" if i % 3 != 0 else "rent"
    rooms    = ROOM_OPTIONS[i % len(ROOM_OPTIONS)]
    currency = CURRENCIES[i % len(CURRENCIES)]
    featured = i % 7 == 0

    random.seed(i)

    if ltype == "rent":
        price = float(random.randint(8, 80) * 1000)
    elif ptype == "villa":
        price = float(random.randint(5, 50) * 1_000_000)
    elif ptype == "land":
        price = float(random.randint(500, 5000) * 1000)
    else:
        price = float(random.randint(1, 30) * 1_000_000)

    gross_area   = random.randint(60, 400)
    net_area     = int(gross_area * random.uniform(0.75, 0.92))
    bathrooms    = max(1, int(rooms[0]) // 2) if rooms[0].isdigit() else 1
    total_floors = random.randint(1, 20)
    floor        = random.randint(0, total_floors)
    lat          = round(city_d["lat"] + random.uniform(-0.05, 0.05), 6)
    lng          = round(city_d["lng"] + random.uniform(-0.05, 0.05), 6)
    building_age = random.randint(0, 25)
    view_count   = random.randint(0, 250)
    features     = random.sample(FEATURES_POOL, random.randint(4, 8))

    title = TITLE_TEMPLATES[i % len(TITLE_TEMPLATES)].format(
        rooms=rooms, type=TYPE_TR[ptype],
        city=city_d["city"], district=dist_d["district"], hood=hood,
    )
    if ltype == "rent":
        title = title.replace("Satılık", "Kiralık")

    desc = DESC_TEMPLATES[i % len(DESC_TEMPLATES)].format(
        type=TYPE_TR[ptype], city=city_d["city"],
        district=dist_d["district"], hood=hood,
    )

    days_ago   = (49 - i) * 3
    created_at = (
        datetime.datetime.utcnow() - datetime.timedelta(days=days_ago)
    ).isoformat() + "Z"
    updated_at = datetime.datetime.utcnow().isoformat() + "Z"

    base_slug = slugify(title)
    slug, c = base_slug, 2
    while slug in existing:
        slug = f"{base_slug}-{c}"
        c += 1
    existing.add(slug)

    images = [
        {
            "url": f"https://picsum.photos/seed/{(i + 100) * 10 + j}/800/600",
            "path": None,
            "alt": f"Fotograf {j + 1}",
            "sortOrder": j,
        }
        for j in range(4)
    ]

    doc = {
        "title": title,
        "description": desc,
        "listingType": ltype,
        "propertyType": ptype,
        "price": price,
        "currency": currency,
        "city": city_d["city"],
        "district": dist_d["district"],
        "neighborhood": hood,
        "addressText": f"{hood} Mah. {dist_d['district']} / {city_d['city']}",
        "location": {"lat": lat, "lng": lng},
        "rooms": rooms,
        "bathrooms": bathrooms,
        "grossArea": gross_area,
        "netArea": net_area,
        "buildingAge": building_age,
        "floor": floor,
        "totalFloors": total_floors,
        "heating": HEATING_OPTIONS[i % len(HEATING_OPTIONS)],
        "furnished": i % 4 == 0,
        "features": features,
        "images": images,
        "status": "active",
        "featured": featured,
        "viewCount": view_count,
        "slug": slug,
        "ownerId": OWNER_ID,
        "createdAt": created_at,
        "updatedAt": updated_at,
    }

    post_doc("properties", doc)
    created += 1
    safe_title = title.encode("ascii", "replace").decode()[:65]
    print(f"[{created:2}/50] {safe_title}")

print(f"\nToplam {created} ilan yuklendi.")
