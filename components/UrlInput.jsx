import { useState } from 'react';

function normalizeUrl(input) {
  if (!/^https?:\/\//i.test(input)) {
    return 'https://' + input;
  }
  return input;
}

function isValidUrl(input) {
  try {
    const url = /^https?:\/\//i.test(input) ? input : `https://${input}`;
    const parsed = new URL(url);
    const host = parsed.hostname;
    const port = parsed.port;
    const hostRegex = /^[\wа-яё\-\.]+(\.[\wа-яё\-]{2,})+$/i;
    if (!hostRegex.test(host)) return false;
    if (port && !/^\d{1,5}$/.test(port)) return false;
    return true;
  } catch {
    return false;
  }
}

export default function UrlInput({ onAnalyze, loading }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setUrl(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    const normalizedUrl = normalizeUrl(url.trim());
    if (!isValidUrl(normalizedUrl)) {
      setError("Некорректный формат. Пример: ribalim.com, домен.рф, my-site.net:8080");
      return;
    }
    setUrl(normalizedUrl);
    onAnalyze(normalizedUrl);
  };

  const handleClear = () => {
    setUrl('');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full px-2 py-4 md:px-4 md:py-8 space-y-3">
      <label htmlFor="site-url" className="sr-only">Сайт для анализа SEO</label>
      <div className="relative">
        <input
          id="site-url"
          type="text"
          value={url}
          onChange={handleInputChange}
          placeholder="Введите URL: пример.рф, site.com:8080"
          className={`w-full px-4 py-3 rounded-lg border-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            error ? 'border-red-500 bg-red-50' : 'border-blue-300'
          }`}
          disabled={loading}
          aria-label="URL сайта для анализа"
          aria-describedby={error ? 'url-error' : 'url-help'}
          aria-invalid={!!error}
        />
        {url && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Очистить поле ввода"
            tabIndex={0}
          >
            ✕
          </button>
        )}
        {error && (
          <span className="absolute right-10 top-3 text-red-500 text-xl" aria-hidden="true">⚠️</span>
        )}
      </div>
      {error && (
        <div
          id="url-error"
          role="alert"
          className="text-base text-red-600 bg-red-50 px-3 py-2 rounded-md flex items-start gap-2"
        >
          <span className="text-xl leading-none mt-0.5" aria-hidden="true">⚠️</span>
          <span>{error}</span>
        </div>
      )}
      <button
        type="submit"
        disabled={loading || !url.trim()}
        className={`w-full py-3 px-4 md:py-4 md:px-6 rounded-lg font-bold text-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 ${
          loading || !url.trim()
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
        }`}
        aria-busy={loading}
        aria-label="Начать анализ сайта"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block animate-spin" aria-hidden="true">⟳</span>
            Анализирую...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <span aria-hidden="true">🔍</span>
            Анализировать
          </span>
        )}
      </button>
      <p id="url-help" className="text-base text-gray-500 text-center">
        Введите URL сайта и получите детальный SEO-анализ
      </p>
    </form>
  );
}
