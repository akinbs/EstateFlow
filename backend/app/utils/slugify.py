"""Türkçe karakter destekli slug üretimi."""
import re
import unicodedata

_TR_MAP = str.maketrans(
    "çğıİöşüÇĞÖŞÜ",
    "cgiiiosuCGOSU",
)


def slugify(text: str) -> str:
    """
    Verilen metni URL-uyumlu slug'a dönüştürür.

    Örnek:
        "Kadıköy'de 3+1 Lüks Daire!" → "kadikoy-de-3-1-luks-daire"
    """
    # Türkçe karakterleri ASCII karşılığına çevir
    text = text.translate(_TR_MAP)
    # Unicode normalizasyonu — diğer aksan karakterlerini temizle
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    # Küçük harf
    text = text.lower()
    # Harf ve rakam dışındaki karakterleri tire ile değiştir
    text = re.sub(r"[^a-z0-9]+", "-", text)
    # Baş ve sondaki tireleri temizle, çoklu tireleri teke indir
    text = text.strip("-")
    text = re.sub(r"-{2,}", "-", text)
    return text


def ensure_unique_slug(base_slug: str, existing_slugs: set[str]) -> str:
    """
    Slug zaten kullanılıyorsa sonuna -2, -3 ... ekleyerek benzersiz hale getirir.

    Örnek:
        base_slug="satilik-daire", existing={"satilik-daire", "satilik-daire-2"}
        → "satilik-daire-3"
    """
    if base_slug not in existing_slugs:
        return base_slug
    counter = 2
    while True:
        candidate = f"{base_slug}-{counter}"
        if candidate not in existing_slugs:
            return candidate
        counter += 1
