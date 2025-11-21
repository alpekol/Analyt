import { useState } from "react";
import UrlInput from "./components/UrlInput.jsx";
import ResultsDisplay from "./components/ResultsDisplay.jsx";
import Loader from "./components/Loader.jsx";
import EmptyState from "./components/EmptyState.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import "./App.css";

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [lastUrl, setLastUrl] = useState("");

  const handleAnalyze = async (url) => {
    // Сохраняем URL для возможного retry
    setLastUrl(url);
    setLoading(true);
    setErrorMsg("");
    setResult(null);

    // Таймаут обработки запроса
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
      setErrorMsg("Проверка занимает слишком много времени — попробуйте повторить запрос");
      setLoading(false);
    }, 15000); // 15 секунд

    try {
      console.log("Отправляю запрос на анализ:", url);
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: JSON.stringify({ url }),
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });
      clearTimeout(timer);

      console.log("Статус ответа:", res.status);

      if (!res.ok) {
        if (res.status === 400) setErrorMsg("Передан некорректный URL.");
        else if (res.status === 404) setErrorMsg("Сайт не найден.");
        else if (res.status >= 500) setErrorMsg("Сервер не отвечает. Попробуйте позже.");
        else setErrorMsg("Ошибка: " + res.status);
      } else {
        const data = await res.json();
        console.log("Полный ответ от backend:", data);
        
        // Проверяем, пришли ли данные
        if (data) {
          setResult(data);
          console.log("Результат успешно установлен:", data);
        } else {
          setErrorMsg("Пустой ответ от сервера");
        }
      }
    } catch (err) {
      clearTimeout(timer);
      console.error("Ошибка при отправке запроса:", err);
      if (err.name === "AbortError") {
        setErrorMsg("Проверка занимает слишком много времени (таймаут)");
      } else {
        setErrorMsg("Нет соединения с сервером или сеть недоступна");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setErrorMsg("");
    setResult(null);
    if (lastUrl) {
      handleAnalyze(lastUrl);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
        {/* Header Section */}
        <header className="bg-white shadow-md sticky top-0 z-10">
          <div className="max-w-4xl mx-auto py-6 px-4 text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-2">
              🔍 SEO Analyzer
            </h1>
            <p className="text-lg text-gray-600">
              Получите детальный анализ SEO оптимизации вашего сайта менее чем за 30 секунд
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto py-8 px-4 pb-16">
          {/* Input Form Section */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
            <UrlInput onAnalyze={handleAnalyze} loading={loading} />
          </section>

          {/* Loading State */}
          {loading && (
            <section className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
              <Loader message="Анализирую вашу страницу..." />
            </section>
          )}

          {/* Error State */}
          {errorMsg && !loading && (
            <section
              className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 p-6 rounded-xl mb-8 shadow-md"
              role="alert"
              aria-live="polite"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0" aria-hidden="true">
                  ⚠️
                </span>
                <div className="flex-1">
                  <h2 className="font-bold text-red-900 text-xl mb-2">Ошибка анализа</h2>
                  <p className="text-red-800 text-lg mb-4">{errorMsg}</p>
                  <button
                    onClick={handleRetry}
                    disabled={!lastUrl}
                    className="inline-block bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    aria-label="Повторить анализ"
                  >
                    🔄 Повторить анализ
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Empty State */}
          {!loading && !result && !errorMsg && (
            <section className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
              <EmptyState />
            </section>
          )}

          {/* Results Display Section */}
          {result && !loading && (
            <section className="space-y-8">
              <ResultsDisplay result={result} />
              
              {/* Repeat Analysis Button */}
              <div className="flex justify-center mt-12 pb-8">
                <button
                  onClick={() => {
                    setResult(null);
                    setErrorMsg("");
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg"
                  aria-label="Анализировать другой сайт"
                >
                  🔍 Анализировать другой сайт
                </button>
              </div>
            </section>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 py-12 mt-16">
          <div className="max-w-4xl mx-auto text-center px-4">
            <p className="mb-2">
              SEO Analyzer © 2025
            </p>
            <p className="text-sm text-gray-500">
              Детальный анализ SEO оптимизации сайтов • Проверка 150+ параметров
            </p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
