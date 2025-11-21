export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center" role="status">
      {/* Иконка */}
      <div className="text-6xl mb-4">🔍</div>
      {/* Текст */}
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Начните анализ SEO</h2>
      <p className="text-lg text-gray-500 max-w-md">
        Введите URL сайта для получения детального анализа оптимизации, рекомендаций и метрик.
      </p>
    </div>
  );
}
