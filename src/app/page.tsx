export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
      <div className="w-full max-w-4xl space-y-10">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            Flood Relief Sri Lanka
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-gray-700 dark:text-gray-200">
            Connecting volunteers with people affected by storms in Sri Lanka. Providing a lifeline in
            times of disaster.
          </p>
          <div className="mt-4 inline-flex flex-col items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
            <p className="font-semibold uppercase tracking-wide text-xs text-emerald-700 dark:text-emerald-300">
              How it works
            </p>
            <ol className="space-y-1">
              <li>1. People in need submit a help request.</li>
              <li>2. Volunteers share how and where they can help.</li>
              <li>3. Admins match requests with nearby volunteers.</li>
            </ol>
          </div>
        </div>

        <div className="grid w-full max-w-3xl mx-auto gap-6 md:grid-cols-2">
          <a
            href="/need-help"
            className="group relative overflow-hidden rounded-2xl bg-red-500 text-white shadow-lg transition hover:-translate-y-1 hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-red-700/70 via-red-500/40 to-orange-400/40 opacity-0 group-hover:opacity-100 transition" />
            <div className="relative flex h-full flex-col items-start gap-3 p-6">
              <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                I Need Help
              </span>
              <p className="text-sm text-red-50">
                Tell us where you are and what you need so we can connect you with nearby volunteers.
              </p>
            </div>
          </a>

          <a
            href="/want-to-help"
            className="group relative overflow-hidden rounded-2xl bg-blue-500 text-white shadow-lg transition hover:-translate-y-1 hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-700/70 via-blue-500/40 to-cyan-400/40 opacity-0 group-hover:opacity-100 transition" />
            <div className="relative flex h-full flex-col items-start gap-3 p-6">
              <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                I Want to Help
              </span>
              <p className="text-sm text-blue-50">
                Share how you can support others with transport, shelter, food, or medical assistance.
              </p>
            </div>
          </a>
        </div>
      </div>
    </main>
  );
}

