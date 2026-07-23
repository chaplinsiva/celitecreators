export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen justify-center items-center px-4 text-center">
      <div className="max-w-3xl glass-panel-glow p-8 md:p-12 rounded-2xl border border-sky-500/30">
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
          CeliteCreators Marketplace
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mt-6 bg-gradient-to-r from-white via-slate-100 to-sky-400 bg-clip-text text-transparent">
          Pay-Per-Product Creator Asset Marketplace
        </h1>
        <p className="text-slate-400 text-lg mt-4 max-w-xl mx-auto">
          Buy premium After Effects templates, 3D models, sound effects, and graphics on demand without recurring subscriptions.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <a
            href="/browse"
            className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl transition shadow-lg shadow-sky-600/25"
          >
            Explore Catalog
          </a>
          <a
            href="/creator/register"
            className="px-6 py-3 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold rounded-xl transition"
          >
            Become a Creator
          </a>
        </div>
      </div>
    </main>
  );
}
