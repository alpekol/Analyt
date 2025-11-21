class SEOScorer:
    """
    Система оценки SEO-параметров с взвешенными критериями.
    
    Веса категорий:
    - Meta Tags (25%)
    - Headings (20%)
    - Images (15%)
    - Content (15%)
    - Links (10%)
    - Schema & Technical (15%)
    """

    # Веса (общая сумма = 100)
    WEIGHTS = {
        'meta_tags': 25,
        'headings': 20,
        'images': 15,
        'content': 15,
        'links': 10,
        'schema_technical': 15
    }

    def __init__(self, analysis_data):
        self.data = analysis_data
        self.category_scores = {}
        self.issues = []

    # 1. Meta Tags (25%)
    def score_meta_tags(self):
        """Оценивает наличие и качество meta-тегов"""
        score = 0
        meta = self.data.get('meta_tags', {})

        # Title (10 баллов)
        if meta.get('title'):
            title_len = len(meta['title'])
            if 30 <= title_len <= 60:
                score += 10  # Идеальная длина
            elif title_len > 0:
                score += 7
                if title_len < 30:
                    self.issues.append({
                        'category': 'Meta Tags',
                        'severity': 'warning',
                        'issue': f'Title слишком короткий ({title_len} символов, нужно 30-60)'
                    })
                elif title_len > 60:
                    self.issues.append({
                        'category': 'Meta Tags',
                        'severity': 'warning',
                        'issue': f'Title слишком длинный ({title_len} символов, нужно 30-60)'
                    })
        else:
            self.issues.append({
                'category': 'Meta Tags',
                'severity': 'critical',
                'issue': 'Title не найден'
            })

        # Meta Description (8 баллов)
        if meta.get('description'):
            desc_len = len(meta['description'])
            if 120 <= desc_len <= 160:
                score += 8
            elif desc_len > 0:
                score += 5
                if desc_len < 120:
                    self.issues.append({
                        'category': 'Meta Tags',
                        'severity': 'warning',
                        'issue': f'Description слишком короткое ({desc_len} символов, нужно 120-160)'
                    })
                elif desc_len > 160:
                    self.issues.append({
                        'category': 'Meta Tags',
                        'severity': 'warning',
                        'issue': f'Description слишком длинное ({desc_len} символов, нужно 120-160)'
                    })
        else:
            self.issues.append({
                'category': 'Meta Tags',
                'severity': 'critical',
                'issue': 'Meta description не найдена'
            })

        # Keywords (3 балла)
        if meta.get('keywords'):
            score += 3
        else:
            self.issues.append({
                'category': 'Meta Tags',
                'severity': 'minor',
                'issue': 'Keywords не указаны'
            })

        # Open Graph (4 балла)
        og_count = sum(1 for k in meta.keys() if k.startswith('og_') and meta[k])
        if og_count >= 2:
            score += 4
        elif og_count > 0:
            score += 2

        return min(score, 25)  # Max 25

    # 2. Headings (20%)
    def score_headings(self):
        """Оценивает структуру заголовков"""
        score = 0
        headings = self.data.get('headings', {}).get('headings', {})

        # H1 (10 баллов)
        h1_count = len(headings.get('h1', []))
        if h1_count == 1:
            score += 10
        elif h1_count > 1:
            score += 5
            self.issues.append({
                'category': 'Headings',
                'severity': 'warning',
                'issue': f'Несколько H1 ({h1_count}), должна быть только одна'
            })
        else:
            self.issues.append({
                'category': 'Headings',
                'severity': 'critical',
                'issue': 'H1 не найден'
            })

        # H2-H3 (6 баллов)
        h2_count = len(headings.get('h2', []))
        h3_count = len(headings.get('h3', []))
        if h2_count > 0:
            score += 6
        if h2_count > 3:
            score += 4
        else:
            self.issues.append({
                'category': 'Headings',
                'severity': 'minor',
                'issue': 'Недостаточно H2 заголовков для структурирования'
            })

        # Структура (4 балла)
        if h1_count > 0 and h2_count > 0:
            score += 4

        return min(score, 20)

    # 3. Images (15%)
    def score_images(self):
        """Оценивает качество изображений и alt текста"""
        score = 0
        images = self.data.get('images', {})

        total = images.get('total_images', 0)
        with_alt = images.get('with_alt_text', 0)
        alt_percent = images.get('alt_coverage_percent', 0)

        if total == 0:
            return 15  # Если изображений нет — полный балл

        # Alt текст (10 баллов)
        if alt_percent >= 90:
            score += 10
        elif alt_percent >= 70:
            score += 7
            self.issues.append({
                'category': 'Images',
                'severity': 'warning',
                'issue': f'{images.get("without_alt_text", 0)} изображений без alt текста'
            })
        elif alt_percent >= 50:
            score += 4
            self.issues.append({
                'category': 'Images',
                'severity': 'warning',
                'issue': f'{images.get("without_alt_text", 0)} изображений без alt текста'
            })
        else:
            self.issues.append({
                'category': 'Images',
                'severity': 'critical',
                'issue': f'{images.get("without_alt_text", 0)} изображений без alt текста ({100-alt_percent:.0f}%)'
            })

        # Количество изображений (5 баллов)
        if total > 5:
            score += 5

        return min(score, 15)

    # 4. Content (15%)
    def score_content(self):
        """Оценивает качество контента (заглушка для расширения)"""
        score = 15  # Временно полный балл
        # В будущем можно добавить:
        # - Длину контента
        # - Уникальность текста
        # - Ключевые слова
        return score

    # 5. Links (10%)
    def score_links(self):
        """Оценивает качество ссылок"""
        score = 0
        links = self.data.get('internal_links', {})

        internal = links.get('internal_links_count', 0)
        external = links.get('external_links_count', 0)
        total = links.get('total_links', 0)

        if total == 0:
            self.issues.append({
                'category': 'Links',
                'severity': 'warning',
                'issue': 'На странице нет ссылок'
            })
            return 5

        # Внутренние ссылки (5 баллов)
        if internal > 0:
            score += 5

        # Баланс внешних (5 баллов)
        if external > 0:
            score += 5
        else:
            self.issues.append({
                'category': 'Links',
                'severity': 'minor',
                'issue': 'Рекомендуется добавить внешние ссылки на авторитетные источники'
            })

        return min(score, 10)

    # 6. Schema & Technical (15%)
    def score_schema_technical(self):
        """Оценивает структурированные данные и технические параметры"""
        score = 0
        schema = self.data.get('schema_org', {})
        meta = self.data.get('meta_tags', {})

        # Schema (8 баллов)
        if schema.get('has_schema'):
            schema_count = schema.get('schemas_count', 0)
            if schema_count >= 2:
                score += 8
            else:
                score += 5
        else:
            self.issues.append({
                'category': 'Technical SEO',
                'severity': 'warning',
                'issue': 'Структурированные данные (Schema.org) не обнаружены'
            })

        # Viewport (4 балла)
        if meta.get('viewport'):
            score += 4
        else:
            self.issues.append({
                'category': 'Technical SEO',
                'severity': 'warning',
                'issue': 'Viewport метатег не найден (требуется для мобильных)'
            })

        # Robots (3 балла)
        if meta.get('robots'):
            score += 3

        return min(score, 15)

    # Основной расчет
    def calculate_score(self):
        """Рассчитывает итоговый SEO Score"""
        meta_score = self.score_meta_tags()
        headings_score = self.score_headings()
        images_score = self.score_images()
        content_score = self.score_content()
        links_score = self.score_links()
        schema_score = self.score_schema_technical()

        self.category_scores = {
            'Meta Tags': {'score': meta_score, 'max': 25},
            'Headings': {'score': headings_score, 'max': 20},
            'Images': {'score': images_score, 'max': 15},
            'Content': {'score': content_score, 'max': 15},
            'Links': {'score': links_score, 'max': 10},
            'Technical SEO': {'score': schema_score, 'max': 15}
        }

        # Взвешенный итоговый результат
        total_score = (
            (meta_score / 25 * self.WEIGHTS['meta_tags']) +
            (headings_score / 20 * self.WEIGHTS['headings']) +
            (images_score / 15 * self.WEIGHTS['images']) +
            (content_score / 15 * self.WEIGHTS['content']) +
            (links_score / 10 * self.WEIGHTS['links']) +
            (schema_score / 15 * self.WEIGHTS['schema_technical'])
        )

        return {
            'overall_score': round(total_score),
            'category_scores': self.category_scores,
            'issues': sorted(self.issues, key=lambda x: {'critical': 0, 'warning': 1, 'minor': 2}[x['severity']])
        }

    def get_recommendations(self):
        """Генерирует рекомендации на основе выявленных проблем"""
        recommendations = []
        categories = {}

        # Группируем проблемы по категориям
        for issue in self.issues:
            cat = issue['category']
            if cat not in categories:
                categories[cat] = {'critical': 0, 'warning': 0, 'minor': 0}
            categories[cat][issue['severity']] += 1

        # Приоритизированные рекомендации
        critical_issues = [i for i in self.issues if i['severity'] == 'critical']
        for issue in critical_issues[:3]:  # Top 3 critical
            recommendations.append({
                'priority': 'HIGH',
                'text': issue['issue'],
                'impact': 'Критично влияет на SEO'
            })

        warning_issues = [i for i in self.issues if i['severity'] == 'warning']
        for issue in warning_issues[:3]:  # Top 3 warnings
            recommendations.append({
                'priority': 'MEDIUM',
                'text': issue['issue'],
                'impact': 'Улучшит рейтинг'
            })

        if not recommendations:
            recommendations.append({
                'priority': 'INFO',
                'text': 'Сайт хорошо оптимизирован!',
                'impact': 'Продолжайте в том же духе'
            })

        return recommendations
