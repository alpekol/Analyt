export default function Loader({ message = "Анализирую..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-12" role="status" aria-live="polite">
      {/* Анимированный спиннер */}
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
      {/* Текст */}
      <p className="text-lg text-gray-700 font-medium">{message}</p>
      {/* Прогресс-бар */}
      <div className="w-64 h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
        <div className="h-full bg-blue-500 animate-pulse" style={{ width: "70%" }}></div>
      </div>
    </div>
  );
}
