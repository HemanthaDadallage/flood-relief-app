export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-emerald-600 dark:text-emerald-400">
          Flood Relief Sri Lanka
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto">
          Connecting volunteers with people affected by storms in Sri Lanka.
          Providing a lifeline in times of disaster.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-md">
        <a
          href="/need-help"
          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-lg text-center text-xl transition-colors duration-200 shadow-lg"
        >
          I Need Help
        </a>
        <a
          href="/want-to-help"
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg text-center text-xl transition-colors duration-200 shadow-lg"
        >
          I Want to Help
        </a>
      </div>
    </main>
  );
}

