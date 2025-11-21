import { useState } from 'react';
import UrlInput from '../components/UrlInput.jsx';
import ResultsDisplay from '../components/ResultsDisplay.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { ErrorBoundary } from '../components/ErrorBoundary.jsx';

export default function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [url, setUrl] = useState('');

  const handleAnalyze = async (analyzedUrl) => {
    setUrl(analyzedUrl);
    setLoading(true);
    setErrorMsg('');
    setResult(null);

    // Таймаут обработки запроса
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
      setErrorMsg('Проверка занимает слишком много времени — попробуйте повторить запрос');
      setLoading(false);
    }, 15000); // 15 секунд

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ url: analyzedUrl }),
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timer);

      if (!res.ok) {
        if (res.status === 400) {
          setErrorMsg('Передан некорректный URL.');
        } else if (res.status === 404) {
          setErrorMsg('Сайт не найден.');
        } else if (res.status >= 500) {
          setErrorMsg('Сервер не отвечает. Попробуйте позже.');
        } else {
          setErrorMsg(`Ошибка: ${res.status}`);
        }
      } else {
        const data = await res.json();
        console.log('Full API Response:', data); // Для отладки
        setResult(data);
      }
    } catch (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        setErrorMsg('Проверка занимает слишком много времени (таймаут)');
      } else {
        setErrorMsg('Нет соединения с сервером или сеть недоступна');
      }
      console.error('Fetch error:', err);
    }
    setLoading(false);
  };

  const handleRetry = () => {
    setErrorMsg('');
    setResult(null);
    if (url) {
      handleAnalyze(url);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto py-8 px-4 text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-2">🔍 SEO Analyzer</h1>
            <p className="text-xl text-gray-600">Проверьте SEO-оптимизацию вашего сайта за несколько секунд</p>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto py-8 px-4">
          {/* Input Form */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <UrlInput onAnalyze={handleAnalyze} loading={loading} />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <Loader message="Анализирую сайт..." />
            </div>
          )}

          {/* Error State */}
          {errorMsg && (
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-8 shadow-sm">
              <div className="flex items-start gap-4">
                <span className="text-3xl">⚠️</span>
                <div className="flex-1">
                  <h3 className="font-bold text-red-800 text-lg mb-2">Ошибка анализа</h3>
                  <p className="text-red-700 text-lg mb-4">{errorMsg}</p>
                  <button
                    onClick={handleRetry}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition-colors"
                    aria-label="Повторить анализ"
                  >
                    🔄 Повторить
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !result && !errorMsg && <EmptyState />}

          {/* Results Display */}
          {result && !loading && (
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <ResultsDisplay result={result} />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-gray-100 py-8 mt-16">
          <div className="max-w-4xl mx-auto text-center text-gray-600">
            <p>SEO Analyzer © 2025 • Детальный анализ оптимизации сайтов</p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
