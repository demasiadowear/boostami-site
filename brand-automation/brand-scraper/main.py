"""
Brand Scraper microservice
Estrae colori, font, logo e tono da un URL cliente.
Avvio: uvicorn main:app --port 8000 --reload
"""

import re
import io
import time
import random
import asyncio
from urllib.parse import urljoin, urlparse
from collections import Counter
from functools import partial

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
import colorthief

app = FastAPI(title="Brand Scraper", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ─── Header profiles realistici ────────────────────────────────────────────────

TIMEOUT = 10  # secondi — vale per tutte le richieste HTTP in uscita

CHROME_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/123.0.0.0 Safari/537.36"
    ),
    "Accept": (
        "text/html,application/xhtml+xml,application/xml;"
        "q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8"
    ),
    "Accept-Language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Sec-CH-UA": '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
    "Sec-CH-UA-Mobile": "?0",
    "Sec-CH-UA-Platform": '"Windows"',
    "Cache-Control": "max-age=0",
    "DNT": "1",
}

# Fallback: UA diversi per retry
FALLBACK_USER_AGENTS = [
    (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) "
        "Gecko/20100101 Firefox/124.0"
    ),
    (
        "Mozilla/5.0 (X11; Linux x86_64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/121.0.0.0 Safari/537.36"
    ),
]

# ─── Models ────────────────────────────────────────────────────────────────────

class ScrapeRequest(BaseModel):
    url: str
    max_colors: int = 6

class BrandData(BaseModel):
    company_name: str
    tagline: str
    description: str
    primary_colors: list[str]
    accent_colors: list[str]
    fonts: list[str]
    logo_url: str
    favicon_url: str
    og_image_url: str
    tone_keywords: list[str]
    industry_hint: str
    scrape_method: str  # "full" | "css_only" | "favicon_fallback"

# ─── Session factory ───────────────────────────────────────────────────────────

def make_session(user_agent: str | None = None) -> requests.Session:
    """Crea una sessione requests con retry automatico e headers browser-like."""
    session = requests.Session()
    headers = dict(CHROME_HEADERS)
    if user_agent:
        headers["User-Agent"] = user_agent
    session.headers.update(headers)

    retry = Retry(
        total=3,
        backoff_factor=1.0,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET", "HEAD"],
        raise_on_status=False,
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    return session

# ─── Helpers ───────────────────────────────────────────────────────────────────

def rgb_to_hex(r: int, g: int, b: int) -> str:
    return f"#{r:02X}{g:02X}{b:02X}"

def is_meaningful_color(hex_color: str) -> bool:
    """Filtra bianco, nero, grigi neutri."""
    h = hex_color.lstrip("#")
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    brightness = (r + g + b) / 3
    saturation = max(r, g, b) - min(r, g, b)
    return not (brightness > 238 or brightness < 15 or saturation < 18)

def extract_css_colors(css_text: str) -> list[str]:
    colors = set()
    for match in re.finditer(r'#([0-9A-Fa-f]{6})\b', css_text):
        colors.add(f"#{match.group(1).upper()}")
    for match in re.finditer(r'rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)', css_text):
        colors.add(rgb_to_hex(int(match.group(1)), int(match.group(2)), int(match.group(3))))
    return [c for c in colors if is_meaningful_color(c)]

def extract_fonts_from_css(css_text: str) -> list[str]:
    fonts: set[str] = set()
    for match in re.finditer(r"font-family\s*:\s*([^;}\n]+)", css_text, re.IGNORECASE):
        for part in match.group(1).split(","):
            font = part.strip().strip("'\"")
            if font and font.lower() not in (
                "serif", "sans-serif", "monospace", "cursive",
                "fantasy", "inherit", "initial", "unset", "var",
            ):
                fonts.add(font)
    return list(fonts)[:5]

def extract_colors_from_image_bytes(data: bytes, max_colors: int = 5) -> list[str]:
    """Estrae palette da bytes immagine con ColorThief. Fallback pixel sampling."""
    try:
        img = Image.open(io.BytesIO(data)).convert("RGB")
        # Ridimensiona per velocità
        img.thumbnail((200, 200))
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)
        ct = colorthief.ColorThief(buf)
        if max_colors == 1:
            color = ct.get_color(quality=5)
            return [rgb_to_hex(*color)]
        palette = ct.get_palette(color_count=max_colors, quality=5)
        return [rgb_to_hex(*c) for c in palette if is_meaningful_color(rgb_to_hex(*c))]
    except Exception:
        return []

def fetch_image_colors(url: str, session: requests.Session, max_colors: int = 5) -> list[str]:
    """Scarica immagine ed estrae palette. Silenzioso su errore."""
    try:
        r = session.get(url, timeout=TIMEOUT, stream=True)
        if r.status_code == 200:
            return extract_colors_from_image_bytes(r.content, max_colors)
    except Exception:
        pass
    return []

def detect_tone_and_industry(text: str) -> tuple[list[str], str]:
    text_lower = text.lower()
    tone_map = {
        "professional": ["solutions", "enterprise", "b2b", "consulting", "strategy"],
        "creative": ["design", "studio", "creative", "art", "agency"],
        "tech": ["software", "saas", "platform", "api", "developer", "cloud"],
        "luxury": ["premium", "exclusive", "luxury", "elegant", "bespoke"],
        "friendly": ["easy", "simple", "fun", "community", "together", "love"],
        "bold": ["powerful", "leading", "best", "revolutionary", "transform"],
    }
    industry_map = {
        "technology": ["software", "app", "tech", "digital", "cloud", "ai", "data"],
        "finance": ["bank", "invest", "fintech", "payment", "finance", "money"],
        "health": ["health", "medical", "wellness", "care", "clinic", "therapy"],
        "fashion": ["fashion", "style", "clothing", "wear", "boutique"],
        "food": ["food", "restaurant", "chef", "eat", "menu", "recipe"],
        "education": ["learn", "course", "education", "school", "training"],
        "real estate": ["property", "real estate", "home", "house", "realty"],
    }
    tones = [t for t, kws in tone_map.items() if any(k in text_lower for k in kws)]
    industries = [i for i, kws in industry_map.items() if any(k in text_lower for k in kws)]
    return tones[:3] or ["modern"], industries[0] if industries else "business"

# ─── Favicon fallback ─────────────────────────────────────────────────────────

def favicon_fallback(base_url: str, session: requests.Session, max_colors: int) -> BrandData:
    """
    Usato quando il sito blocca lo scraping HTML.
    Prova a scaricare il favicon da percorsi standard e ne estrae la palette.
    """
    domain = urlparse(base_url).netloc
    company_name = domain.replace("www.", "").split(".")[0].capitalize()

    favicon_candidates = [
        f"{base_url}/favicon.ico",
        f"{base_url}/favicon.png",
        f"{base_url}/apple-touch-icon.png",
        f"{base_url}/apple-touch-icon-precomposed.png",
        f"https://www.google.com/s2/favicons?domain={domain}&sz=128",  # Google Favicon API
    ]

    img_colors: list[str] = []
    favicon_url = ""
    for candidate in favicon_candidates:
        colors = fetch_image_colors(candidate, session, max_colors)
        if colors:
            img_colors = colors
            favicon_url = candidate
            break

    primary_colors = img_colors[:3] or ["#1A1A2E", "#16213E", "#0F3460"]
    accent_colors = img_colors[3:6] or ["#E94560"]

    return BrandData(
        company_name=company_name,
        tagline=company_name,
        description="",
        primary_colors=primary_colors,
        accent_colors=accent_colors,
        fonts=[],
        logo_url=favicon_url,
        favicon_url=favicon_url,
        og_image_url="",
        tone_keywords=["modern"],
        industry_hint="business",
        scrape_method="favicon_fallback",
    )

# ─── Core scrape (sync, gira in thread executor) ──────────────────────────────

def _scrape_sync(url: str, max_colors: int) -> BrandData:
    parsed = urlparse(url)
    base_url = f"{parsed.scheme}://{parsed.netloc}"

    html_text: str | None = None
    scrape_method = "full"

    # Tentativo 1: headers Chrome completi
    session = make_session()
    resp = None
    try:
        resp = session.get(url, timeout=TIMEOUT, allow_redirects=True)
    except requests.exceptions.Timeout:
        # Timeout secco → salta subito al favicon, non perdere altro tempo
        return favicon_fallback(base_url, make_session(), max_colors)
    except requests.RequestException:
        pass

    # Tentativo 2-4: UA diversi + piccolo delay (solo se errore non-timeout)
    if resp is None or resp.status_code >= 400:
        for ua in FALLBACK_USER_AGENTS:
            time.sleep(random.uniform(0.5, 1.2))
            try:
                session2 = make_session(ua)
                resp = session2.get(url, timeout=TIMEOUT, allow_redirects=True)
                if resp.status_code < 400:
                    session = session2
                    break
            except requests.exceptions.Timeout:
                return favicon_fallback(base_url, make_session(), max_colors)
            except requests.RequestException:
                continue

    # Se ancora bloccato → favicon fallback
    if resp is None or resp.status_code >= 400:
        return favicon_fallback(base_url, make_session(), max_colors)

    # Controlla content-type: potrebbe rispondere con redirect JS o Cloudflare
    content_type = resp.headers.get("Content-Type", "")
    if "text/html" not in content_type:
        scrape_method = "favicon_fallback"
        return favicon_fallback(base_url, session, max_colors)

    html_text = resp.text

    # ── Parse HTML ──────────────────────────────────────────────────────────────
    soup = BeautifulSoup(html_text, "html.parser")

    def meta(name_or_prop: str) -> str:
        tag = (soup.find("meta", {"property": name_or_prop}) or
               soup.find("meta", {"name": name_or_prop}))
        return tag["content"].strip() if tag and tag.get("content") else ""

    company_name = (
        meta("og:site_name") or
        (soup.find("title").text.strip() if soup.find("title") else "") or
        parsed.netloc
    )
    tagline = meta("og:title") or company_name
    description = meta("og:description") or meta("description") or ""

    og_image = meta("og:image")
    if og_image and not og_image.startswith("http"):
        og_image = urljoin(base_url, og_image)

    # Favicon: cerca tag <link>, fallback /favicon.ico
    favicon = ""
    icon_tag = (
        soup.find("link", rel="apple-touch-icon") or
        soup.find("link", rel=lambda r: isinstance(r, list) and "icon" in r) or
        soup.find("link", rel="shortcut icon") or
        soup.find("link", rel="icon")
    )
    if icon_tag and icon_tag.get("href"):
        favicon = urljoin(base_url, icon_tag["href"])
    else:
        favicon = f"{base_url}/favicon.ico"

    # ── CSS inline + esterno ─────────────────────────────────────────────────────
    all_css = "\n".join(st.get_text() for st in soup.find_all("style"))

    css_links = [
        urljoin(base_url, link["href"])
        for link in soup.find_all("link", rel="stylesheet")
        if link.get("href")
    ][:3]

    for css_url in css_links:
        try:
            cr = session.get(css_url, timeout=TIMEOUT)
            if cr.status_code == 200:
                all_css += "\n" + cr.text
        except Exception:
            pass

    css_colors = extract_css_colors(all_css)
    fonts = extract_fonts_from_css(all_css)

    if not css_colors:
        scrape_method = "css_only"

    # ── Palette immagini ─────────────────────────────────────────────────────────
    img_colors: list[str] = []

    if og_image:
        img_colors = fetch_image_colors(og_image, session, max_colors)

    # Fallback favicon se og_image non ha colori
    if not img_colors:
        img_colors = fetch_image_colors(favicon, session, max_colors)

    # Ultimo resort: Google Favicon API
    if not img_colors:
        domain = parsed.netloc
        google_fav = f"https://www.google.com/s2/favicons?domain={domain}&sz=128"
        img_colors = fetch_image_colors(google_fav, session, max_colors)
        if img_colors and not favicon:
            favicon = google_fav

    # ── Merge colori ─────────────────────────────────────────────────────────────
    combined = img_colors + css_colors
    sorted_colors = [c for c, _ in Counter(combined).most_common()]
    primary_colors = sorted_colors[:3] or ["#1A1A2E", "#16213E", "#0F3460"]
    accent_colors = sorted_colors[3:6] or ["#E94560"]

    page_text = soup.get_text(separator=" ", strip=True)[:3000]
    tones, industry = detect_tone_and_industry(page_text)

    return BrandData(
        company_name=company_name[:80],
        tagline=tagline[:120],
        description=description[:300],
        primary_colors=primary_colors,
        accent_colors=accent_colors,
        fonts=fonts,
        logo_url=favicon,
        favicon_url=favicon,
        og_image_url=og_image or "",
        tone_keywords=tones,
        industry_hint=industry,
        scrape_method=scrape_method,
    )

# ─── Endpoint ─────────────────────────────────────────────────────────────────

@app.post("/scrape", response_model=BrandData)
async def scrape_brand(req: ScrapeRequest):
    url = req.url.strip()
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    loop = asyncio.get_event_loop()
    try:
        result = await loop.run_in_executor(
            None, partial(_scrape_sync, url, req.max_colors)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return result


@app.get("/health")
def health():
    return {"status": "ok", "service": "brand-scraper", "version": "2.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
