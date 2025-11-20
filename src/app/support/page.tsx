const tutorials = [
  {
    title: "1. Crear tu espacio y primer acceso",
    steps: [
      "Completa el registro con tu correo de trabajo y una contraseña segura.",
      "Confirma desde tu bandeja y vuelve a iniciar sesión.",
      "El asistente te guiará para crear el primer perfil antes de usar el resto del sistema.",
    ],
  },
  {
    title: "2. Preparar perfiles",
    steps: [
      "En el menú principal abre la opción Perfiles y presiona “Nuevo perfil”.",
      "Escribe un nombre descriptivo (por ejemplo, “Ventas – laptops”) y selecciona el rubro.",
      "Activa las herramientas que necesites y guarda los cambios.",
    ],
  },
  {
    title: "3. Registrar dispositivos",
    steps: [
      "En la sección Dispositivos agrega equipos manualmente o déjalos en blanco para que se creen al lanzar un job.",
      "Cada dispositivo muestra un token; cópialo para instalar el agente permanente si lo deseas.",
    ],
  },
  {
    title: "4. Crear y ejecutar jobs",
    steps: [
      "Entra en Jobs y elige “Nuevo job”. Selecciona el perfil y asigna un dispositivo existente o escribe un nombre para crear uno al vuelo.",
      "Dentro del job podrás descargar el manifest, el script y un paquete ZIP para trabajar offline.",
      "En la máquina destino ejecuta `agent.ps1` junto con la clave que aparece en el job para completar la instalación.",
    ],
  },
];

const faqs = [
  {
    q: "¿Para qué sirve el script?",
    a: "Automatiza toda la instalación definida en el perfil. Si encuentra una app ya instalada, la salta automáticamente para ahorrar tiempo.",
  },
  {
    q: "¿Qué incluye el paquete offline?",
    a: "Un ZIP listo para llevar en un pendrive con el script y una guía rápida. Ideal cuando no tienes conexión estable.",
  },
  {
    q: "¿Dónde veo mi clave de acceso?",
    a: "Abre cualquier job desde el dashboard: en la parte superior verás la Access Key con un botón para copiarla. Úsala al ejecutar el agente o el script.",
  },
  {
    q: "¿Cómo cambio de perfil?",
    a: "Haz clic en “Mi cuenta” en la parte superior derecha, elige el perfil que deseas y presiona “Cambiar perfil”.",
  },
  {
    q: "¿Necesito conocimientos técnicos?",
    a: "No. Todas las pantallas explican qué hacer en cada paso y siempre puedes volver a esta sección para refrescar los conceptos.",
  },
];

export default function SupportPage() {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900" />
      <div className="relative z-10 mx-auto max-w-5xl space-y-12 px-4 py-12 text-white">
        <section className="space-y-3 text-center md:text-left">
          <p className="text-xs uppercase tracking-[0.5em] text-slate-400">Centro de ayuda</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white">Tutoriales y preguntas frecuentes</h1>
          <p className="text-base text-slate-300 md:max-w-3xl">
            Usa esta guía para comprender en qué consiste SystemOnReady y cómo utilizarlo paso a paso, incluso si no tienes experiencia técnica.
          </p>
        </section>

        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Tutoriales guiados</h2>
            <span className="text-sm text-slate-400">4 capítulos cortos</span>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {tutorials.map((tutorial) => (
              <article
                key={tutorial.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition hover:border-white/30"
              >
                <h3 className="text-lg font-semibold text-white">{tutorial.title}</h3>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-200">
                  {tutorial.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <h2 className="text-2xl font-semibold text-white">Preguntas frecuentes</h2>
          <div className="mt-4 grid gap-3">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-100 transition hover:border-white/30"
              >
                <summary className="cursor-pointer font-semibold text-white transition group-open:text-slate-200">
                  {faq.q}
                </summary>
                <p className="mt-2 text-slate-300">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
