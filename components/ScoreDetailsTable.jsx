export default function ScoreDetailsTable({ categoryScores, issues }) {
  if (!categoryScores || Object.keys(categoryScores).length === 0) {
    return null;
  }

  return (
    <div className="mt-8 space-y-6">
      {/* Таблица по категориям */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-bold text-gray-800">Категория</th>
              <th className="px-4 py-3 text-center font-bold text-gray-800">Баллы</th>
              <th className="px-4 py-3 text-center font-bold text-gray-800">Статус</th>
              <th className="px-4 py-3 text-center font-bold text-gray-800">%</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(categoryScores).map(([category, data], index) => {
              if (!data || typeof data !== 'object') {
                return null;
              }

              const score = data.score || 0;
              const max = data.max || 1;
              const percent = Math.round((score / max) * 100);
              const statusColor = percent >= 80 ? 'text-green-600' : percent >= 60 ? 'text-yellow-600' : 'text-red-600';
              const statusText = percent >= 80 ? '✓ Хорошо' : percent >= 60 ? '⚠️ Средне' : '✗ Плохо';
              const barColor = percent >= 80 ? 'bg-green-500' : percent >= 60 ? 'bg-yellow-500' : 'bg-red-500';

              return (
                <tr key={`${category}-${index}`} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{String(category)}</td>
                  <td className="px-4 py-3 text-center text-gray-700 font-semibold">{score}/{max}</td>
                  <td className={`px-4 py-3 text-center font-bold ${statusColor}`}>{statusText}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${barColor}`}
                          style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-gray-700 w-10 text-right">{percent}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Issues */}
      {issues && Array.isArray(issues) && issues.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-800 mb-4">🔍 Выявленные проблемы</h3>
          <div className="space-y-3">
            {issues.map((issue, i) => {
              if (!issue || typeof issue !== 'object') {
                return null;
              }

              const severity = issue.severity || 'minor';
              const colorClass =
                severity === 'critical'
                  ? 'bg-red-100 text-red-800 border-l-4 border-red-500'
                  : severity === 'warning'
                  ? 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500'
                  : 'bg-blue-100 text-blue-800 border-l-4 border-blue-500';

              const icon = severity === 'critical' ? '❌' : severity === 'warning' ? '⚠️' : 'ℹ️';

              return (
                <div key={`issue-${i}`} className={`p-3 rounded flex gap-2 ${colorClass}`}>
                  <span className="text-lg flex-shrink-0">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold">{String(issue.category || 'Неизвестная категория')}</p>
                    <p className="text-sm">{String(issue.issue || 'Нет описания')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
