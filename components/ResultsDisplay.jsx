import ScoreDetailsTable from './ScoreDetailsTable';
import RecommendationsPanel from './RecommendationsPanel';

export default function ResultsDisplay({ result }) {
  if (!result) return null;

  const {
    url,
    meta_tags = {},
    headings = { headings: {}, has_h1: false, h1_count: 0 },
    images = { total_images: 0, with_alt_text: 0, alt_coverage_percent: 0 },
    internal_links = { total_links: 0, internal_links_count: 0, external_links_count: 0 },
    schema_org = { has_schema: false, schemas_count: 0, schemas: [] },
    page_speed = {},
    seo_analysis = { overall_score: 0, category_scores: {}, issues: [] },
    recommendations = []
  } = result;

  const overallScore = seo_analysis?.overall_score || 0;
  const categoryScores = seo_analysis?.category_scores || {};
  const issues = seo_analysis?.issues || [];

  return (
    <div className="mt-8 space-y-8 mb-16">
      {/* ===== ГЛАВНЫЙ SCORE ===== */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 rounded-lg shadow-lg text-white">
        <h2 className="text-4xl font-bold mb-4">SEO Score: {overallScore}/100</h2>
        <div className="w-full bg-white/30 rounded-full h-4 overflow-hidden">
          <div
            className="bg-white h-full transition-all duration-500 rounded-full"
            style={{ width: `${overallScore}%` }}
          ></div>
        </div>
        <p className="mt-4 text-lg">
          {overallScore >= 80
            ? '✓ Отлично! Сайт хорошо оптимизирован'
            : overallScore >= 60
            ? '⚠️ Хорошо, но есть место для улучшения'
            : '✗ Требуется оптимизация'}
        </p>
      </div>

      {/* ===== ТАБЛИЦА КАТЕГОРИЙ ===== */}
      {Object.keys(categoryScores).length > 0 && (
        <ScoreDetailsTable categoryScores={categoryScores} issues={issues} />
      )}

      {/* ===== META-ТЕГИ ===== */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">📝 Meta-теги</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <p className="text-sm text-gray-600 uppercase font-bold">Title</p>
            <p className={`text-lg font-semibold ${meta_tags.title ? 'text-gray-800' : 'text-red-600'}`}>
              {meta_tags.title ? meta_tags.title : '❌ Не указан'}
            </p>
            {meta_tags.title && (
              <p className="text-xs text-gray-500 mt-1">
                Длина: {meta_tags.title.length} символов
                {meta_tags.title.length >= 30 && meta_tags.title.length <= 60 ? ' ✓' : ' ⚠️'}
              </p>
            )}
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <p className="text-sm text-gray-600 uppercase font-bold">Meta Description</p>
            <p className={`text-lg font-semibold ${meta_tags.description ? 'text-gray-800' : 'text-red-600'}`}>
              {meta_tags.description
                ? meta_tags.description.substring(0, 50) + (meta_tags.description.length > 50 ? '...' : '')
                : '❌ Не указана'}
            </p>
            {meta_tags.description && (
              <p className="text-xs text-gray-500 mt-1">
                Длина: {meta_tags.description.length} символов
                {meta_tags.description.length >= 120 && meta_tags.description.length <= 160 ? ' ✓' : ' ⚠️'}
              </p>
            )}
          </div>

          <div className="border-l-4 border-purple-500 pl-4">
            <p className="text-sm text-gray-600 uppercase font-bold">Keywords</p>
            <p className={`text-lg font-semibold ${meta_tags.keywords ? 'text-gray-800' : 'text-gray-500'}`}>
              {meta_tags.keywords ? meta_tags.keywords.substring(0, 50) + '...' : 'Не указаны'}
            </p>
          </div>

          <div className="border-l-4 border-orange-500 pl-4">
            <p className="text-sm text-gray-600 uppercase font-bold">Robots</p>
            <p className={`text-lg font-semibold ${meta_tags.robots ? 'text-gray-800' : 'text-gray-500'}`}>
              {meta_tags.robots || 'Не указан'}
            </p>
          </div>

          <div className="border-l-4 border-pink-500 pl-4">
            <p className="text-sm text-gray-600 uppercase font-bold">Viewport</p>
            <p className={`text-lg font-semibold ${meta_tags.viewport ? 'text-green-600' : 'text-red-600'}`}>
              {meta_tags.viewport ? '✓ Установлен' : '❌ Не установлен'}
            </p>
          </div>

          <div className="border-l-4 border-yellow-500 pl-4">
            <p className="text-sm text-gray-600 uppercase font-bold">Open Graph</p>
            <p className="text-lg font-semibold text-gray-800">
              {meta_tags.og_title ? '✓' : '✗'} og:title
              <br />
              {meta_tags.og_description ? '✓' : '✗'} og:description
              <br />
              {meta_tags.og_image ? '✓' : '✗'} og:image
            </p>
          </div>
        </div>
      </div>

      {/* ===== СТРУКТУРА ЗАГОЛОВКОВ ===== */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">📊 Структура Headings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className={`p-4 rounded ${headings.has_h1 ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'}`}>
            <p className="text-lg font-bold">H1</p>
            <p className={`text-3xl font-bold ${headings.has_h1 ? 'text-green-600' : 'text-red-600'}`}>
              {headings.h1_count}
            </p>
            <p className="text-sm text-gray-600">
              {headings.h1_count === 1 ? '✓ Правильно' : headings.h1_count === 0 ? '✗ Отсутствует' : '⚠️ Слишком много'}
            </p>
          </div>
          <div className="p-4 rounded bg-blue-50 border-2 border-blue-500">
            <p className="text-lg font-bold">H2</p>
            <p className="text-3xl font-bold text-blue-600">{headings.headings?.h2?.length || 0}</p>
          </div>
          <div className="p-4 rounded bg-purple-50 border-2 border-purple-500">
            <p className="text-lg font-bold">H3+</p>
            <p className="text-3xl font-bold text-purple-600">
              {(headings.headings?.h3?.length || 0) + (headings.headings?.h4?.length || 0) + (headings.headings?.h5?.length || 0) + (headings.headings?.h6?.length || 0)}
            </p>
          </div>
        </div>

        {/* Список H1 */}
        {headings.headings?.h1?.length > 0 && (
          <div className="mb-4 p-4 bg-gray-50 rounded">
            <p className="font-bold text-gray-800 mb-2">H1 Заголовки:</p>
            <ul className="space-y-1">
              {headings.headings.h1.map((h, i) => (
                <li key={i} className="text-gray-700">
                  • {h}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Список H2 */}
        {headings.headings?.h2?.length > 0 && (
          <div className="p-4 bg-gray-50 rounded">
            <p className="font-bold text-gray-800 mb-2">H2 Заголовки:</p>
            <ul className="space-y-1">
              {headings.headings.h2.slice(0, 10).map((h, i) => (
                <li key={i} className="text-gray-700">
                  • {h}
                </li>
              ))}
              {headings.headings.h2.length > 10 && (
                <li className="text-gray-500 italic">... и ещё {headings.headings.h2.length - 10}</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* ===== ИЗОБРАЖЕНИЯ ===== */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">🖼️ Анализ Изображений</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded bg-blue-50 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600 font-bold">Всего</p>
            <p className="text-3xl font-bold text-blue-600">{images.total_images}</p>
          </div>
          <div className="p-4 rounded bg-green-50 border-l-4 border-green-500">
            <p className="text-sm text-gray-600 font-bold">С Alt</p>
            <p className="text-3xl font-bold text-green-600">{images.with_alt_text}</p>
          </div>
          <div className="p-4 rounded bg-red-50 border-l-4 border-red-500">
            <p className="text-sm text-gray-600 font-bold">Без Alt</p>
            <p className="text-3xl font-bold text-red-600">{images.without_alt_text}</p>
          </div>
          <div className={`p-4 rounded border-l-4 ${images.alt_coverage_percent >= 90 ? 'bg-green-50 border-green-500' : 'bg-yellow-50 border-yellow-500'}`}>
            <p className="text-sm text-gray-600 font-bold">Покрытие</p>
            <p className={`text-3xl font-bold ${images.alt_coverage_percent >= 90 ? 'text-green-600' : 'text-yellow-600'}`}>
              {images.alt_coverage_percent}%
            </p>
          </div>
        </div>

        {images.missing_alt_images?.length > 0 && (
          <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
            <p className="font-bold text-yellow-900 mb-2">⚠️ Изображения без Alt текста:</p>
            <ul className="space-y-1 text-sm text-yellow-800">
              {images.missing_alt_images.slice(0, 5).map((img, i) => (
                <li key={i}>• {img.substring(0, 50)}...</li>
              ))}
              {images.missing_alt_images.length > 5 && (
                <li className="text-yellow-600 italic">... и ещё {images.missing_alt_images.length - 5}</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* ===== ССЫЛКИ ===== */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">🔗 Анализ Ссылок</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded bg-blue-50 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600 font-bold">Всего ссылок</p>
            <p className="text-3xl font-bold text-blue-600">{internal_links.total_links}</p>
          </div>
          <div className="p-4 rounded bg-green-50 border-l-4 border-green-500">
            <p className="text-sm text-gray-600 font-bold">Внутренних</p>
            <p className="text-3xl font-bold text-green-600">{internal_links.internal_links_count}</p>
          </div>
          <div className="p-4 rounded bg-purple-50 border-l-4 border-purple-500">
            <p className="text-sm text-gray-600 font-bold">Внешних</p>
            <p className="text-3xl font-bold text-purple-600">{internal_links.external_links_count}</p>
          </div>
        </div>

        {internal_links.internal_links?.length > 0 && (
          <div className="p-4 bg-gray-50 rounded">
            <p className="font-bold text-gray-800 mb-3">Внутренние ссылки (первые 10):</p>
            <ul className="space-y-2 text-sm">
              {internal_links.internal_links.slice(0, 10).map((link, i) => (
                <li key={i} className="text-gray-700">
                  <span className="font-mono text-blue-600">{link.url}</span>
                  <br />
                  <span className="text-gray-500 text-xs">"{link.text}"</span>
                </li>
              ))}
              {internal_links.internal_links.length > 10 && (
                <li className="text-gray-500 italic">... и ещё {internal_links.internal_links.length - 10}</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* ===== СТРУКТУРИРОВАННЫЕ ДАННЫЕ ===== */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">🏷️ Структурированные данные (Schema.org)</h3>
        <div className={`p-4 rounded mb-4 ${schema_org.has_schema ? 'bg-green-50 border border-green-500' : 'bg-yellow-50 border border-yellow-500'}`}>
          <p className={`text-lg font-bold ${schema_org.has_schema ? 'text-green-600' : 'text-yellow-600'}`}>
            {schema_org.has_schema ? `✓ Обнаружено: ${schema_org.schemas_count} схем(ы)` : '⚠️ Структурированные данные не найдены'}
          </p>
        </div>

        {schema_org.schemas?.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schema_org.schemas.map((schema, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded border border-gray-200">
                <p className="font-bold text-gray-800">{schema.type}</p>
                <p className="text-xs text-gray-500">{schema.format}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== PAGE SPEED ===== */}
      {page_speed && Object.keys(page_speed).length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">⚡ PageSpeed Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(page_speed).map(([key, value]) => {
              const displayKey = {
                performance: 'Performance',
                accessibility: 'Accessibility',
                best_practices: 'Best Practices',
                seo: 'SEO'
              }[key];

              const color = value >= 80 ? 'green' : value >= 50 ? 'yellow' : 'red';
              const colorClass = `bg-${color}-50 border-${color}-500`;
              const textColor = `text-${color}-600`;

              return (
                <div key={key} className={`p-4 rounded border-l-4 ${colorClass}`}>
                  <p className="text-sm text-gray-600 font-bold">{displayKey}</p>
                  <p className={`text-4xl font-bold ${textColor}`}>{Math.round(value)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== РЕКОМЕНДАЦИИ ===== */}
      {recommendations && recommendations.length > 0 && (
        <RecommendationsPanel recommendations={recommendations} />
      )}

      {/* ===== ПОЛНАЯ ССЫЛКА НА САЙТ ===== */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <p className="text-sm text-gray-600 font-bold">Проанализирован:</p>
        <p className="text-lg font-mono text-blue-600 break-all">{url}</p>
      </div>
    </div>
  );
}
