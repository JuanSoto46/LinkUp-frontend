/**
 * Call / meeting view used in "Reuniones" sidebar item.
 * Simple UI mock similar to the Figma "llamada" screen.
 */
export default function Call() {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold text-slate-50 mb-6">
        Reunión en curso
      </h1>

      <div className="rounded-2xl border border-slate-800 bg-[#050816] px-6 py-6 flex flex-col gap-6">
        {/* Video placeholder */}
        <div className="flex items-center justify-center h-64 rounded-xl bg-slate-900 border border-slate-800">
          <div className="w-20 h-20 rounded-full bg-emerald-500 grid place-items-center text-3xl font-semibold text-slate-900">
            YL
          </div>
        </div>

        {/* Chat + controls mock */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-950 p-4 h-52">
            <p className="text-xs text-slate-400">
              Chat (solo visual en Sprint 1)
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 h-52">
            <p className="text-xs text-slate-400">
              Participantes (mock)
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <button className="px-4 py-2 rounded-full bg-slate-800 text-xs text-slate-200 hover:bg-slate-700">
            Silenciar
          </button>
          <button className="px-4 py-2 rounded-full bg-slate-800 text-xs text-slate-200 hover:bg-slate-700">
            Apagar cámara
          </button>
          <button className="px-4 py-2 rounded-full bg-red-600 text-xs text-slate-50 hover:bg-red-500">
            Finalizar llamada
          </button>
        </div>
      </div>
    </div>
  );
}
