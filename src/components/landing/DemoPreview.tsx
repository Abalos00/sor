import Link from "next/link";

const navItems = ["Dashboard", "Perfiles", "Jobs", "Dispositivos", "Reportes"];

const stats = [
  { label: "Perfiles activos", value: "4" },
  { label: "Jobs creados (7 dias)", value: "12" },
];

const modules = [
  {
    title: "Perfiles",
    description: "Define que software debe instalarse y configura las bases de cada rubro.",
    action: "Crear perfil",
  },
  {
    title: "Jobs",
    description: "Encola despliegues para tus dispositivos usando un perfil existente.",
    action: "Crear job",
  },
];

export function DemoPreview() {
  return (
    <div className="demo-float w-full rounded-[28px] border border-slate-200 bg-white px-4 py-6 shadow-2xl shadow-slate-900/20 sm:px-6 sm:py-7">
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-3 text-xs font-semibold text-slate-500">
          <span className="text-sm font-semibold text-slate-900 whitespace-nowrap">SOR</span>
          <div className="flex min-w-0 flex-1 justify-center gap-2 overflow-x-auto whitespace-nowrap rounded-full bg-white/70 px-2 py-1">
            {navItems.map((item, idx) => (
              <span
                key={item}
                className={`rounded-full px-3 py-1 ${
                  idx === 0 ? "bg-slate-900 text-white shadow" : "bg-white text-slate-600"
                }`}
              >
                {item}
              </span>
            ))}
          </div>
          <button className="whitespace-nowrap rounded-full border border-slate-200 px-3 py-1 text-slate-700">
            Mi cuenta
          </button>
        </div>

        <div className="space-y-5 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.5em] text-slate-400">Dashboard</p>
            <h3 className="mt-1 text-2xl font-semibold text-slate-900">SystemOnReady</h3>
            <p className="text-sm text-slate-500">
              Administra perfiles, herramientas y jobs de instalacion desde un solo lugar.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{stat.label}</p>
                <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {modules.map((module) => (
              <div key={module.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{module.title}</p>
                <p className="mt-2 text-sm text-slate-600">{module.description}</p>
                <Link
                  href="/login"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                >
                  {module.action}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
