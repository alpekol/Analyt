import requests
from bs4 import BeautifulSoup
import json
from urllib.parse import urljoin, urlparse
import ssl
import socket
import re
from datetime import datetime

class SEOAnalyzer:
    def __init__(self, url, max_timeout=10):
        self.url = url
        self.domain = urlparse(url).netloc
        self.scheme = urlparse(url).scheme
        self.timeout = max_timeout
        self.soup = None
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        self.http_code = None
        self.redirected = False
        self.redirect_chain = []
        self.redirect_codes = []

    def check_http_code_chain(self):
        try:
            response = requests.head(self.url, headers=self.headers, timeout=self.timeout, allow_redirects=True)
            if response.status_code in [405, 501]:
                response = requests.get(self.url, headers=self.headers, timeout=self.timeout, allow_redirects=True)
            self.http_code = response.status_code
            self.redirect_chain = [r.url for r in response.history] + [response.url]
            self.redirect_codes = [r.status_code for r in response.history] + [response.status_code]
            self.redirected = len(response.history) > 0
            return response
        except Exception:
            self.http_code = None
            self.redirect_chain = []
            self.redirected = False
            self.redirect_codes = []
            return None

    def fetch_page(self):
        self.check_http_code_chain()
        try:
            response = requests.get(self.url, headers=self.headers, timeout=self.timeout)
            response.raise_for_status()
            self.soup = BeautifulSoup(response.content, 'html.parser')
            print(f"[INFO] Страница загружена: {self.url}", flush=True)
            return True
        except requests.exceptions.Timeout:
            raise Exception("Timeout при загрузке страницы")
        except requests.exceptions.ConnectionError:
            raise Exception("Ошибка подключения к сайту")
        except Exception as e:
            raise Exception(f"Ошибка загрузки: {str(e)}")

    def get_meta_tags(self):
        meta_data = {
            'title': None, 'description': None, 'keywords': None,
            'og_title': None, 'og_description': None, 'og_image': None,
            'robots': None, 'viewport': None, 'canonical': None
        }
        if not self.soup:
            return meta_data
        title_tag = self.soup.find('title')
        if title_tag:
            meta_data['title'] = title_tag.get_text()
        for meta in self.soup.find_all('meta'):
            name = meta.get('name', '').lower()
            prop = meta.get('property', '').lower()
            content = meta.get('content', '')
            if name == 'description':
                meta_data['description'] = content
            elif name == 'keywords':
                meta_data['keywords'] = content
            elif name == 'robots':
                meta_data['robots'] = content
            elif name == 'viewport':
                meta_data['viewport'] = content
            elif prop == 'og:title':
                meta_data['og_title'] = content
            elif prop == 'og:description':
                meta_data['og_description'] = content
            elif prop == 'og:image':
                meta_data['og_image'] = content
        canonical = self.soup.find('link', attrs={'rel': 'canonical'})
        meta_data['canonical'] = canonical['href'] if canonical and canonical.get('href') else None
        print(f"[INFO] Meta tags: {meta_data}", flush=True)
        return meta_data

    def get_headings_structure(self):
        headings = { f'h{i}': [] for i in range(1, 7) }
        if not self.soup:
            return { 'headings': headings, 'has_h1': False, 'h1_count': 0, 'structure_score': 0 }
        for level in range(1, 7):
            h_tags = self.soup.find_all(f'h{level}')
            headings[f'h{level}'] = [tag.get_text(strip=True) for tag in h_tags]
        has_h1 = len(headings['h1']) > 0
        h1_count = len(headings['h1'])
        structure_score = 100 if (has_h1 and h1_count == 1) else 50 if has_h1 else 0
        print(f"[INFO] Headings: H1={h1_count}, score={structure_score}", flush=True)
        return { 'headings': headings, 'has_h1': has_h1, 'h1_count': h1_count, 'structure_score': structure_score }

    def is_tracking_pixel(self, src):
        TRACKING_PIXELS = [
            'mc.yandex.ru', 'google-analytics.com', 'googletagmanager.com',
            'facebook.com/tr', 'pixel.facebook.com', 'cdn.segment.com',
            'platform.twitter.com', 'tiktok.com/v', 'hotjar.com'
        ]
        if not src:
            return False
        return any(pixel in src for pixel in TRACKING_PIXELS)

    def get_images_analysis(self):
        if not self.soup:
            return {
                'total_images': 0, 'with_alt_text': 0, 'without_alt_text': 0,
                'alt_coverage_percent': 0, 'missing_alt_images': []
            }
        images = self.soup.find_all('img')
        real_images = [img for img in images if not self.is_tracking_pixel(img.get('src', ''))]
        total_images = len(real_images)
        images_with_alt = 0
        images_without_alt = []
        for img in real_images:
            alt = img.get('alt', '').strip()
            if alt:
                images_with_alt += 1
            else:
                images_without_alt.append(img.get('src', ''))
        alt_coverage = (images_with_alt / total_images * 100) if total_images > 0 else 0
        print(f"[INFO] Images: total={total_images}, with_alt={images_with_alt}, coverage={alt_coverage}%", flush=True)
        return {
            'total_images': total_images,
            'with_alt_text': images_with_alt,
            'without_alt_text': len(images_without_alt),
            'alt_coverage_percent': round(alt_coverage, 2),
            'missing_alt_images': images_without_alt[:10]
        }

    def get_internal_links(self):
        if not self.soup:
            return { 'total_links': 0, 'internal_links_count': 0, 'external_links_count': 0, 'internal_links': [] }
        links = self.soup.find_all('a', href=True)
        internal_links = []
        external_links = 0
        for link in links:
            href = link.get('href', '')
            full_url = urljoin(self.url, href)
            parsed_link = urlparse(full_url)
            if parsed_link.netloc == self.domain or href.startswith('/'):
                internal_links.append({ 'url': full_url, 'text': link.get_text(strip=True)[:50] })
            elif href.startswith('http'):
                external_links += 1
        print(f"[INFO] Links: total={len(links)}, internal={len(internal_links)}, external={external_links}", flush=True)
        return {
            'total_links': len(links),
            'internal_links_count': len(internal_links),
            'external_links_count': external_links,
            'internal_links': internal_links[:20]
        }

    def detect_schema(self):
        if not self.soup:
            return { 'has_schema': False, 'schemas_count': 0, 'schemas': [] }
        schemas = []
        for script in self.soup.find_all('script', type='application/ld+json'):
            try:
                if script.string:
                    data = json.loads(script.string)
                    if isinstance(data, dict):
                        schemas.append({ 'type': data.get('@type', 'Unknown'), 'format': 'JSON-LD' })
            except:
                pass
        for elem in self.soup.find_all(attrs={'itemtype': True}):
            schemas.append({ 'type': elem.get('itemtype', 'Unknown'), 'format': 'Microdata' })
        for elem in self.soup.find_all(attrs={'typeof': True}):
            schemas.append({ 'type': elem.get('typeof', 'Unknown'), 'format': 'RDFa' })
        print(f"[INFO] Schema: count={len(schemas)}", flush=True)
        return { 'has_schema': len(schemas) > 0, 'schemas_count': len(schemas), 'schemas': schemas }

    def get_favicon(self):
        if not self.soup:
            return None
        favicon_tag = self.soup.find('link', rel=lambda x: x and ('icon' in x or 'shortcut icon' in x))
        return favicon_tag['href'] if favicon_tag and favicon_tag.get('href') else None

    def get_favicon_status(self):
        favicon = self.get_favicon()
        return "Хорошо" if favicon else "Плохо"

    def check_ssl(self):
        if not self.scheme or self.scheme != "https":
            return {
                "valid": False,
                "expiry": None,
                "message": "Сайт не использует HTTPS-протокол"
            }
        context = ssl.create_default_context()
        try:
            with socket.create_connection((self.domain, 443), timeout=5) as sock:
                with context.wrap_socket(sock, server_hostname=self.domain) as ssock:
                    cert = ssock.getpeercert()
                    expiry_str = cert['notAfter']
                    expiry_date = datetime.strptime(expiry_str, "%b %d %H:%M:%S %Y %Z")
                    now = datetime.utcnow()
                    valid = now < expiry_date
                    message = "Сертификат действителен" if valid else "Срок сертификата истёк"
                    return {
                        "valid": valid,
                        "expiry": expiry_str,
                        "message": message
                    }
        except Exception as e:
            return {
                "valid": False,
                "expiry": None,
                "message": f"Ошибка проверки SSL: {str(e)}"
            }

    def get_robots_txt(self):
        robots_url = urljoin(self.url, '/robots.txt')
        try:
            resp = requests.get(robots_url, headers=self.headers, timeout=5)
            if resp.status_code == 200 and resp.text:
                robots_text = resp.text
                disallows = []
                for line in robots_text.splitlines():
                    line = line.strip()
                    if line and not line.startswith('#'):
                        if line.lower().startswith('disallow:'):
                            value = line.split(':', 1)[1].strip()
                            if value:
                                disallows.append(value)
                status = "Найден"
                detail = {"status": status, "disallows": disallows, "raw": robots_text}
            else:
                status = "Нет файла"
                detail = {"status": status, "disallows": [], "raw": ""}
        except Exception:
            detail = {"status": "Ошибка загрузки", "disallows": [], "raw": ""}
        return detail

    def get_sitemap_xml(self):
        sitemap_url = urljoin(self.url, '/sitemap.xml')
        try:
            resp = requests.get(sitemap_url, headers=self.headers, timeout=7)
            if resp.status_code == 200 and resp.text:
                sitemap_text = resp.text
                soup = BeautifulSoup(sitemap_text, 'xml')
                locs = soup.find_all('loc')
                count = len(locs)
                main_sections = []
                for loc in locs[:10]:
                    url = loc.get_text().strip()
                    match = re.search(r'https?://[^/]+/([^/?#]+)', url)
                    section = match.group(1) if match else url
                    main_sections.append(section)
                detail = {
                    "status": "Найден",
                    "links_count": count,
                    "main_sections": main_sections,
                    "raw": sitemap_text[:500] + ('...' if len(sitemap_text) > 500 else '')
                }
            else:
                detail = {
                    "status": "Нет файла",
                    "links_count": 0,
                    "main_sections": [],
                    "raw": ''
                }
        except Exception:
            detail = {
                "status": "Ошибка загрузки",
                "links_count": 0,
                "main_sections": [],
                "raw": ''
            }
        return detail

    def check_mobile_adaptivity(self):
        if not self.soup:
            return "Плохо"
        viewport = self.soup.find('meta', attrs={'name': 'viewport'})
        return "Хорошо" if viewport else "Плохо"

    def get_tooltips(self):
        # Статичные подсказки для UX на фронте, по каждому параметру
        tips = {
            "title": "Тег <title> задаёт заголовок страницы и отображается в поисковой выдаче.",
            "meta_description": "Meta description отображается в сниппете поиска, должен быть уникальным и информативным.",
            "meta_keywords": "Тег keywords устарел, но может быть полезен для внутреннего поиска.",
            "h1": "Заголовок H1 — основной, должен быть на каждой странице и уникальным.",
            "images_alt": "Атрибут alt помогает доступности и пониманию изображений поисковиками.",
            "external_links": "Внешние ссылки повышают авторитет сайта для поисковиков.",
            "robots": "Файл robots.txt управляет индексированием сайта поисковыми системами.",
            "sitemap": "sitemap.xml помогает поисковикам находить страницы сайта.",
            "viewport": "Meta viewport отвечает за корректную мобильную адаптивность.",
            "favicon": "Favicon отображается во вкладке браузера, делает сайт узнаваемым.",
            "ssl": "SSL сертификация обеспечивает безопасное соединение и доверие поисковых систем.",
        }
        return tips

    def analyze(self):
        print(f"[START] Анализ начат: {self.url}", flush=True)
        self.fetch_page()

        meta_tags = self.get_meta_tags()
        headings = self.get_headings_structure()
        images = self.get_images_analysis()
        links = self.get_internal_links()
        schema = self.detect_schema()
        favicon = self.get_favicon()
        favicon_status = self.get_favicon_status()
        ssl_status = self.check_ssl()
        robots_detail = self.get_robots_txt()
        sitemap_detail = self.get_sitemap_xml()
        mobile_viewport_status = self.check_mobile_adaptivity()
        tooltips = self.get_tooltips()

        score = 100
        if not meta_tags['title']:
            score -= 10
        if not meta_tags['description']:
            score -= 10
        if not headings['has_h1']:
            score -= 15
        if images['alt_coverage_percent'] < 50:
            score -= 10
        if not schema['has_schema']:
            score -= 5
        if not ssl_status.get("valid", False):
            score -= 10
        if self.redirected:
            score -= 5
        if self.http_code is not None and self.http_code >= 400:
            score -= 10
        if mobile_viewport_status != "Хорошо":
            score -= 15
        if favicon_status != "Хорошо":
            score -= 5

        result = {
            'url': self.url,
            'http_code': self.http_code,
            'redirected': self.redirected,
            'redirect_chain': self.redirect_chain,
            'redirect_codes': self.redirect_codes,
            'meta_tags': meta_tags,
            'headings': headings,
            'images': images,
            'internal_links': links,
            'schema_org': schema,
            'favicon': favicon,
            'favicon_status': favicon_status,
            'ssl_status': ssl_status,
            'robots_txt': robots_detail,
            'sitemap_xml': sitemap_detail,
            'mobile_viewport_status': mobile_viewport_status,
            'tooltips': tooltips,
            'seo_score': max(0, score),
            'recommendations': self._generate_recommendations(
                meta_tags, headings, images, schema,
                favicon, favicon_status, ssl_status, robots_detail, sitemap_detail,
                mobile_viewport_status
            ),
        }
        print(f"[END] Анализ завершен. Score: {result['seo_score']}", flush=True)
        return result

    def _generate_recommendations(self, meta, headings, images, schema, favicon, favicon_status, ssl_status, robots_detail, sitemap_detail, mobile_viewport_status):
        recs = []
        if not meta['title']: recs.append("Добавьте тег <title>")
        if not meta['description']: recs.append("Добавьте meta description. Используйте уникальный, релевантный текст (до 160 символов).")
        if not headings['has_h1']: recs.append("Добавьте H1 (основной заголовок) на страницу.")
        if images['alt_coverage_percent'] < 100: recs.append("Исправьте alt-тексты для всех изображений (кроме технических пикселей). Рекомендуется описывать изображение, если оно бывает недоступно.")
        if not schema['has_schema']: recs.append("Добавьте структурированные данные/schema.org для лучшего понимания сайта поисковыми системами.")
        if favicon_status != "Хорошо": recs.append("Добавьте favicon — <link rel=\"icon\"> или <link rel=\"shortcut icon\"> для узнаваемости вашего сайта.")
        if not meta['viewport'] or mobile_viewport_status != "Хорошо":
            recs.append("Добавьте meta viewport для мобильных устройств: <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">")
        if robots_detail['status'] != "Найден": recs.append("Разместите robots.txt для управления индексацией страниц поисковиками.")
        if not robots_detail['disallows'] and robots_detail['status'] == "Найден": recs.append("Все разделы сайта доступны для индексации.")
        if sitemap_detail['status'] != "Найден": recs.append("Добавьте sitemap.xml, чтобы поисковики быстрее находили страницы сайта.")
        if sitemap_detail['status'] == "Найден" and sitemap_detail['links_count'] < 5: recs.append("Добавьте больше ссылок в sitemap.xml для полного охвата сайта.")
        if not ssl_status.get("valid", False): recs.append(f"Проблема с SSL: {ssl_status.get('message','Ошибка SSL')}. Без безопасного протокола https сайт может быть понижен в поиске и вызвать недоверие пользователей.")
        if self.http_code is not None and self.http_code >= 400:
            recs.append(f"Ошибка HTTP-кода ответа: {self.http_code}. Проверьте корректность адреса и доступность сайта для поисковиков.")
        if self.redirected:
            chain_display = " → ".join(self.redirect_chain)
            recs.append(f"Внимание! Имеется редирект: {chain_display}. Убедитесь, что редирект не мешает индексации важных страниц.")
        if mobile_viewport_status != "Хорошо":
            recs.append("Мобильная адаптивность: Не найден <meta name=\"viewport\">. Это может негативно сказаться на отображении сайта на мобильных устройствах.")
        return recs

# --- Пример запуска ---
# analyzer = SEOAnalyzer('https://example.com')
# result = analyzer.analyze()
# print(json.dumps(result, ensure_ascii=False, indent=2))
