import requests
from bs4 import BeautifulSoup
import json
from urllib.parse import urljoin, urlparse


class SEOAnalyzer:
    def __init__(self, url, max_timeout=10):
        self.url = url
        self.domain = urlparse(url).netloc
        self.timeout = max_timeout
        self.soup = None
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }

    # СКАЧИВАНИЕ СТРАНИЦЫ
    def fetch_page(self):
        """Загружает страницу и парсит HTML"""
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

    # META-ТЕГИ
    def get_meta_tags(self):
        """Парсит meta-теги: title, description, keywords, og:*"""
        meta_data = {
            'title': None,
            'description': None,
            'keywords': None,
            'og_title': None,
            'og_description': None,
            'og_image': None,
            'robots': None,
            'viewport': None
        }

        if not self.soup:
            return meta_data

        # Title
        title_tag = self.soup.find('title')
        if title_tag:
            meta_data['title'] = title_tag.get_text()

        # Meta tags
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

        print(f"[INFO] Meta tags: {meta_data}", flush=True)
        return meta_data

    # HEADINGS
    def get_headings_structure(self):
        """Анализирует структуру H1-H6"""
        headings = {
            'h1': [],
            'h2': [],
            'h3': [],
            'h4': [],
            'h5': [],
            'h6': []
        }

        if not self.soup:
            return {
                'headings': headings,
                'has_h1': False,
                'h1_count': 0,
                'structure_score': 0
            }

        for level in range(1, 7):
            h_tags = self.soup.find_all(f'h{level}')
            headings[f'h{level}'] = [tag.get_text(strip=True) for tag in h_tags]

        # Проверка структуры
        has_h1 = len(headings['h1']) > 0
        h1_count = len(headings['h1'])
        structure_score = 100 if (has_h1 and h1_count == 1) else 50 if has_h1 else 0

        print(f"[INFO] Headings: H1={h1_count}, score={structure_score}", flush=True)
        return {
            'headings': headings,
            'has_h1': has_h1,
            'h1_count': h1_count,
            'structure_score': structure_score
        }

    # ИЗОБРАЖЕНИЯ
    def get_images_analysis(self):
        """Анализирует изображения и alt текст"""
        if not self.soup:
            return {
                'total_images': 0,
                'with_alt_text': 0,
                'without_alt_text': 0,
                'alt_coverage_percent': 0,
                'missing_alt_images': []
            }

        images = self.soup.find_all('img')
        total_images = len(images)
        images_with_alt = 0
        images_without_alt = []

        for img in images:
            alt = img.get('alt', '').strip()
            src = img.get('src', '')
            if alt:
                images_with_alt += 1
            else:
                images_without_alt.append(src)

        alt_coverage = (images_with_alt / total_images * 100) if total_images > 0 else 0

        print(f"[INFO] Images: total={total_images}, with_alt={images_with_alt}, coverage={alt_coverage}%", flush=True)
        return {
            'total_images': total_images,
            'with_alt_text': images_with_alt,
            'without_alt_text': len(images_without_alt),
            'alt_coverage_percent': round(alt_coverage, 2),
            'missing_alt_images': images_without_alt[:10]
        }

    # ВНУТРЕННИЕ ССЫЛКИ
    def get_internal_links(self):
        """Анализирует внутренние ссылки"""
        if not self.soup:
            return {
                'total_links': 0,
                'internal_links_count': 0,
                'external_links_count': 0,
                'internal_links': []
            }

        links = self.soup.find_all('a', href=True)
        internal_links = []
        external_links = 0

        for link in links:
            href = link.get('href', '')
            if href.startswith('/') or self.domain in href:
                internal_links.append({
                    'url': href,
                    'text': link.get_text(strip=True)[:50]
                })
            elif href.startswith('http'):
                external_links += 1

        print(f"[INFO] Links: total={len(links)}, internal={len(internal_links)}, external={external_links}", flush=True)
        return {
            'total_links': len(links),
            'internal_links_count': len(internal_links),
            'external_links_count': external_links,
            'internal_links': internal_links[:20]
        }

    # SCHEMA.ORG
    def detect_schema(self):
        """Обнаруживает структурированные данные (Schema.org)"""
        if not self.soup:
            return {
                'has_schema': False,
                'schemas_count': 0,
                'schemas': []
            }

        schemas = []

        # JSON-LD
        for script in self.soup.find_all('script', type='application/ld+json'):
            try:
                data = json.loads(script.string)
                if isinstance(data, dict):
                    schemas.append({
                        'type': data.get('@type', 'Unknown'),
                        'format': 'JSON-LD'
                    })
            except:
                pass

        # Microdata
        for elem in self.soup.find_all(attrs={'itemtype': True}):
            schemas.append({
                'type': elem.get('itemtype', 'Unknown'),
                'format': 'Microdata'
            })

        # RDFa
        for elem in self.soup.find_all(attrs={'typeof': True}):
            schemas.append({
                'type': elem.get('typeof', 'Unknown'),
                'format': 'RDFa'
            })

        print(f"[INFO] Schema: count={len(schemas)}", flush=True)
        return {
            'has_schema': len(schemas) > 0,
            'schemas_count': len(schemas),
            'schemas': schemas
        }

    # PAGESPEED INSIGHTS
    def get_page_speed_insights(self):
        """Заглушка для PageSpeed (требует API ключ Google)"""
        return {
            'performance': 0,
            'accessibility': 0,
            'best_practices': 0,
            'seo': 0
        }

    # ОСНОВНОЙ АНАЛИЗ
    def analyze(self):
        """Проводит полный анализ сайта"""
        print(f"[START] Анализ начат: {self.url}", flush=True)
        
        self.fetch_page()

        meta_tags = self.get_meta_tags()
        headings = self.get_headings_structure()
        images = self.get_images_analysis()
        links = self.get_internal_links()
        schema = self.detect_schema()
        pagespeed = self.get_page_speed_insights()

        # Итоговый SEO-score (базовый)
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

        result = {
            'url': self.url,
            'meta_tags': meta_tags,
            'headings': headings,
            'images': images,
            'internal_links': links,
            'schema_org': schema,
            'page_speed': pagespeed,
            'seo_score': max(0, score),
            'recommendations': self._generate_recommendations(meta_tags, headings, images, schema)
        }

        print(f"[END] Анализ завершен. Score: {result['seo_score']}", flush=True)
        return result

    def _generate_recommendations(self, meta, headings, images, schema):
        """Генерирует рекомендации"""
        recs = []
        if not meta['title']:
            recs.append("Добавьте тег <title>")
        if not meta['description']:
            recs.append("Добавьте meta description")
        if not headings['has_h1']:
            recs.append("Добавьте H1 заголовок")
        if images['alt_coverage_percent'] < 100:
            recs.append(f"Добавьте alt текст к {images['without_alt_text']} изображениям")
        if not schema['has_schema']:
            recs.append("Добавьте структурированные данные (Schema.org)")
        return recs
