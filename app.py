import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from services.seo_analyzer import SEOAnalyzer
from services.seo_scorer import SEOScorer
import logging
from urllib.parse import urlparse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

def is_valid_url(url):
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except:
        return False

@app.route('/api/ping', methods=['GET'])
def ping():
    return jsonify({'status': 'ok'}), 200

@app.route('/api/analyze', methods=['POST', 'OPTIONS'])
def analyze_url():
    if request.method == 'OPTIONS':
        return '', 200
    try:
        data = request.get_json()
        url = data.get('url', '').strip() if data else None
        logger.info(f"Получен запрос на анализ: {url}")

        if not url:
            return jsonify({'error': 'URL is required'}), 400
        if not is_valid_url(url):
            return jsonify({'error': 'Invalid URL format'}), 400

        analyzer = SEOAnalyzer(url)
        analysis = analyzer.analyze()

        # Важно! calculate_score возвращает dict с overall_score.
        scorer = SEOScorer(analysis)
        scorer_result = scorer.calculate_score()

        # Главное: возьми только overall_score!
        score_value = scorer_result.get('overall_score', 0)

        result = {
            **analysis,
            'seo_score': score_value,
            'seo_breakdown': scorer_result,  # если нужен breakdown
            'recommendations': scorer.get_recommendations(),
            'status': 'success'
        }

        logger.info(f"Анализ завершён для: {url}")
        return jsonify(result)
    except Exception as e:
        logger.exception("Ошибка при анализе страницы!")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
