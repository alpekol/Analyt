export default function RecommendationsPanel({ recommendations }) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
      <h2 className="text-2xl font-bold text-blue-900 mb-6">💡 Рекомендации для улучшения</h2>
      <div className="space-y-4">
        {recommendations.map((rec, i) => {
          // Проверяем, что rec - это объект с нужными свойствами
          if (!rec || typeof rec !== 'object') {
            return null;
          }

          const priority = rec.priority || 'INFO';
          const text = rec.text || 'Нет текста';
          const impact = rec.impact || 'Требуется выполнение';

          const priorityColors = {
            'HIGH': { bg: 'bg-red-500', bgLight: 'bg-red-50', border: 'border-red-200' },
            'MEDIUM': { bg: 'bg-yellow-500', bgLight: 'bg-yellow-50', border: 'border-yellow-200' },
            'INFO': { bg: 'bg-blue-500', bgLight: 'bg-blue-50', border: 'border-blue-200' }
          };

          const colors = priorityColors[priority] || priorityColors['INFO'];
          const priorityNumber = priority === 'HIGH' ? '1' : priority === 'MEDIUM' ? '2' : '3';
          const priorityLabel = priority === 'HIGH' ? 'КРИТИЧНО' : priority === 'MEDIUM' ? 'ВАЖНО' : 'ИНФОРМАЦИЯ';

          return (
            <div key={i} className={`flex gap-4 p-4 rounded-lg shadow-sm border ${colors.bgLight} ${colors.border}`}>
              {/* Priority Badge */}
              <div className="flex-shrink-0">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-white ${colors.bg}`}>
                  {priorityNumber}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-base mb-1">{String(text)}</p>
                <p className="text-sm text-gray-600">
                  <span className={`font-semibold ${colors.bg === 'bg-red-500' ? 'text-red-700' : colors.bg === 'bg-yellow-500' ? 'text-yellow-700' : 'text-blue-700'}`}>
                    {priorityLabel}:
                  </span>
                  {' ' + String(impact)}
                </p>
              </div>

              {/* Icon */}
              <div className="flex-shrink-0 text-2xl mt-1">
                {priority === 'HIGH' ? '❌' : priority === 'MEDIUM' ? '⚠️' : 'ℹ️'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
