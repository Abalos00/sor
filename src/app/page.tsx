import Link from "next/link";
import { FaqAccordion } from "@/components/landing/FaqAccordion";
import { DemoPreview } from "@/components/landing/DemoPreview";
import { PricingSection } from "@/components/landing/PricingSection";

const highlights = [
  { label: "Organizaciones activas", value: "20+" },
  { label: "Jobs orquestados al mes", value: "5k+" },
  { label: "Tiempo medio de despliegue", value: "12 min" },
];

const features = [
  {
    title: "Catalogo por categorias",
    description:
      "Agrupa instaladores y herramientas etiquetadas por categorias como Video & Media, Programacion o Uso general para encontrarlos de inmediato.",
    accent: "from-cyan-400/80 via-sky-400/60 to-transparent",
  },
  {
    title: "Perfiles inteligentes",
    description:
      "Define perfiles con apps, scripts y politicas para asegurar instalaciones consistentes en cualquier estacion.",
    accent: "from-indigo-400/80 via-indigo-300/60 to-transparent",
  },
  {
    title: "Jobs automatizados",
    description:
      "Agenda o ejecuta bajo demanda jobs de provisionamiento, updates o soporte en decenas de equipos a la vez.",
    accent: "from-emerald-400/80 via-emerald-300/60 to-transparent",
  },
  {
    title: "Visibilidad centralizada",
    description:
      "Obten el estado en tiempo real de cada agente, bitacoras descargables y reportes accionables por organizacion.",
    accent: "from-rose-400/80 via-orange-300/60 to-transparent",
  },
];

const services = [
  {
    title: "Onboarding guiado",
    category: "Primeros pasos",
    description:
      "Registra tu organizacion o perfil personal, configura categorias y valida agentes en menos de una hora.",
    badge: "01",
  },
  {
    title: "Herramientas listas",
    category: "Catalogo",
    description:
      "Biblioteca curada de instaladores, scripts y playbooks clasificados por categorias (Video & Media, Programacion, Uso general) lista para arrastrar a tus perfiles.",
    badge: "02",
  },
  {
    title: "Soporte prioritario",
    category: "Acompanamiento",
    description:
      "Canales Slack y sesiones guiadas para resolver dudas, revisar reportes o adaptar playbooks a tus procesos.",
    badge: "03",
  },
];

const toolCategories = [
  {
    name: "Suite Microsoft",
    description: "Distribuye Office 365, installers MSI y apps individuales como Excel, Word, PowerPoint, Teams y OneDrive.",
    examples: ["Excel 2024", "Word 2024", "PowerPoint 2024", "Teams", "OneDrive"],
  },
  {
    name: "Creatividad & diseño",
    description: "Plantillas para Canva, Adobe CC, Figma Desktop y herramientas para marketing de contenido.",
    examples: ["Canva Desktop", "Adobe XD", "Figma", "Photoshop Express"],
  },
  {
    name: "Desarrollo y scripting",
    description: "Desde VSCode y JetBrains hasta WSL, Git, Node, Python y utilidades de automatización.",
    examples: ["VSCode", "PyCharm", "WSL + Ubuntu", "Git", "Node LTS"],
  },
  {
    name: "Comunicación & soporte",
    description: "Instaladores para Slack, Zoom, Google Drive, AnyDesk y herramientas de ITSM.",
    examples: ["Slack", "Zoom", "Google Drive", "AnyDesk", "Freshdesk Agent"],
  },
  {
    name: "Seguridad y utilidades",
    description: "Playbooks para Defender, CrowdStrike, navegadores Hardened y herramientas de cifrado.",
    examples: ["Microsoft Defender", "CrowdStrike Sensor", "BitLocker policies", "Brave Hardened"],
  },
];


const faqs = [
  {
    q: "Necesito agentes instalados para usar SOR?",
    a: "Si. Cada dispositivo utiliza un agente ligero para recibir jobs y reportar estado. El asistente de onboarding te guia paso a paso y puedes desplegarlo desde el mismo catalogo.",
  },
  {
    q: "Puedo integrar mis propias herramientas?",
    a: "Puedes subir scripts, instaladores y plantillas propias o consumirlos desde un repositorio privado mediante credenciales seguras y tags personalizados.",
  },
  {
    q: "Como se calcula el costo final?",
    a: "Depende del plan elegido, la cantidad de dispositivos y si gestionas una organizacion o un perfil individual. No pagas por usuarios adicionales.",
  },
  {
    q: "Que pasa si no tengo una empresa?",
    a: "Puedes usar el plan Individual para freelancers o estudiantes. Obtienes el mismo catalogo y perfiles personales sin necesidad de una organizacion.",
  },
  {
    q: "Puedo mezclar categorias propias con las predefinidas?",
    a: "Si. Las categorias por defecto (Video, Programacion, Uso general) pueden convivir con etiquetas personalizadas para tus herramientas internas.",
  },
];

const heroVideoUrl = "/loop.mp4";

export default function Home() {
  return (
    <>
      <main className="bg-slate-50">
        <section className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-20 pt-14 sm:px-6 lg:gap-16">
          <div
            className="relative overflow-hidden rounded-[40px] border border-white/30 bg-white/80 px-6 py-10 shadow-[0_30px_80px_rgba(15,23,42,0.18)] ring-1 ring-slate-100/60 sm:px-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at top left, rgba(14,165,233,0.2), transparent 45%), radial-gradient(circle at 80% 20%, rgba(236,72,153,0.18), transparent 55%)",
            }}
          >
            <div className="absolute -left-12 top-10 h-32 w-32 rounded-full bg-emerald-300/30 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-indigo-300/30 blur-3xl" />
            <div className="relative flex flex-col items-center gap-10 lg:flex-row lg:items-center">
              <div className="flex w-full flex-1 flex-col items-center text-center lg:items-start lg:text-left">
                <span className="animate-fade-up rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
                  SystemOnReady
                </span>
                <h1
                  className="animate-fade-up mt-4 max-w-3xl text-4xl font-semibold text-slate-900 md:text-5xl"
                  style={{ animationDelay: "0.1s" }}
                >
                  Controla tus{" "}
                  <span className="bg-gradient-to-r from-slate-900 via-sky-600 to-emerald-500 bg-clip-text text-transparent">
                    despliegues Windows
                  </span>{" "}
                  en minutos
                </h1>
                <p
                  className="animate-fade-up mt-4 max-w-2xl text-base text-slate-600 sm:text-lg"
                  style={{ animationDelay: "0.2s" }}
                >
                  SOR centraliza herramientas e instaladores para que prepares equipos en minutos sin perseguir descargas
                  dispersas: elige la categoria correcta y lanza todo desde un solo lugar.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/register"
                    className="animate-fade-up rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800"
                    style={{ animationDelay: "0.3s" }}
                  >
                    Crear cuenta gratuita
                  </Link>
                  <Link
                    href="#servicios"
                    className="animate-fade-up rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-white"
                    style={{ animationDelay: "0.35s" }}
                  >
                    Ver demo interactiva
                  </Link>
                </div>
                <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs font-semibold text-slate-500 lg:justify-start">
                  {["Catalogo unificado", "Jobs en vivo", "Reportes descargables"].map((chip) => (
                    <span key={chip} className="rounded-full border border-slate-200/80 px-3 py-1">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex w-full flex-1 flex-col">
                <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-slate-200 bg-black shadow-2xl shadow-slate-900/30">
                  <video
                    key={heroVideoUrl}
                    className="h-full w-full object-cover"
                    src={heroVideoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                  />
                  <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                    Loop SOR
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid w-full gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 text-center sm:grid-cols-3 sm:text-left md:p-6">
            {highlights.map((item) => (
              <div key={item.label} className="space-y-1">
                <p className="text-2xl font-semibold text-slate-900">{item.value}</p>
                <p className="text-sm text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="caracteristicas" className="border-t border-slate-200 bg-white py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-10 max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Caracteristicas</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">Todo lo que necesitas para operar SOR</h2>
              <p className="mt-3 text-slate-600">
                Disenado para equipos de TI que requieren visibilidad total y despliegues confiables, sin agregar mas
                herramientas a la mezcla.
              </p>
            </div>
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-slate-900/30 hover:bg-white hover:shadow-2xl sm:p-6"
                >
                  <div className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${feature.accent}`} />
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-10 group-hover:blur-2xl group-hover:brightness-125" />
                  <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-900 py-16 text-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-10 max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">Catálogo</p>
              <h2 className="mt-2 text-3xl font-semibold">Herramientas listas para instalar</h2>
              <p className="mt-3 text-sm text-slate-300">
                Organizamos las aplicaciones más usadas en categorías buscables. Solo selecciona la categoría y agrega las herramientas a
                tus perfiles.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {toolCategories.map((category) => (
                <div key={category.name} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{category.name}</h3>
                    <span className="text-xs text-emerald-200">{category.examples.length} apps</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-200">{category.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
                    {category.examples.map((app) => (
                      <span key={app} className="rounded-full bg-white/10 px-3 py-1">
                        {app}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="servicios" className="py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[32px] border border-slate-200 bg-white/95 p-4 shadow-lg shadow-slate-900/10 sm:p-8">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">Servicios</p>
                  <h2 className="text-2xl font-semibold text-slate-900">Demo interactiva de SOR</h2>
                </div>
                <div className="mt-4">
                  <DemoPreview />
                </div>
              </div>
              <div className="space-y-4">
                {services.map((service, index) => (
                  <div
                    key={service.title}
                    className="animate-fade-up group relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
                    style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                        {service.category}
                      </span>
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                        {service.badge}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-slate-900">{service.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{service.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="tickets" className="bg-white py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-8 shadow-sm">
              <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Mesa de ayuda</p>
                  <h2 className="mt-2 text-3xl font-semibold text-slate-900">
                    Gestiona tickets en un espacio dedicado
                  </h2>
                  <p className="mt-3 text-slate-600">
                    Mantuvimos la landing enfocada en el producto y movimos toda la experiencia de soporte al centro de
                    tickets. Alli puedes abrir casos con prioridad, adjuntar contexto y seguir la conversacion sin
                    saturar la pagina principal.
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/support/tickets"
                      className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Ir a la mesa de ayuda
                    </Link>
                    <Link
                      href="/support"
                      className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white"
                    >
                      Ver tutoriales
                    </Link>
                  </div>
                </div>
                <div className="space-y-4 rounded-2xl border border-white bg-white p-5 text-sm text-slate-600 shadow">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    Que encontraras alli
                  </p>
                  <ul className="space-y-3">
                    <li>- Formulario completo para tickets con prioridad, dispositivos y adjuntos.</li>
                    <li>- Guardado en localStorage para continuar sin conexion y copiar la informacion.</li>
                    <li>- Timeline con eventos y notas mientras finalizamos el subdominio administrativo.</li>
                  </ul>
                  <p className="text-xs text-slate-500">
                    Ingresa cuando lo necesites: la mesa de ayuda permanece disponible 24/7 para registrar incidentes y
                    mantener el historial unificado.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <PricingSection />

        <section id="faq" className="py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">FAQ</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">Preguntas frecuentes</h2>
              <p className="mt-3 text-slate-600">
                Todo lo que necesitas saber para comenzar, desde agentes hasta planes individuales.
              </p>
            </div>
            <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="flex flex-col gap-4 rounded-3xl border border-slate-900/10 bg-slate-900 px-6 py-10 text-white shadow-2xl shadow-slate-900/30">
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">Comienza</p>
                <h3 className="text-3xl font-semibold">Lista tu equipo para el siguiente despliegue</h3>
                <p className="text-sm text-white/70">
                  Crea tu cuenta, agrega agentes y en menos de 15 minutos estaras ejecutando tu primer job con SOR. Todo
                  centralizado, listo para lanzar perfiles por categoria.
                </p>
                <div className="rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white/80">
                  <p className="font-semibold text-white">Tiempo estimado</p>
                  <p>15 min para el primer job</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <Link
                    href="/register"
                    className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                  >
                    Crear cuenta ahora
                  </Link>
                  <Link
                    href="/support"
                    className="rounded-full border border-white/50 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    Ver tutoriales
                  </Link>
                </div>
              </div>
              <FaqAccordion items={faqs} />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-4">
          <div className="space-y-2">
            <p className="text-lg font-semibold text-slate-900">SOR</p>
            <p className="text-sm text-slate-500">
              SystemOnReady automatiza la preparacion de dispositivos reuniendo aplicaciones, scripts y herramientas categorizadas en un solo hub.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Producto</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/#caracteristicas" className="hover:text-slate-900">
                  Caracteristicas
                </Link>
              </li>
              <li>
                <Link href="/#planes" className="hover:text-slate-900">
                  Planes
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-slate-900">
                  Tutoriales
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Compania</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <a href="mailto:g.abalos.v@gmail.com" className="hover:text-slate-900">
                  g.abalos.v@gmail.com
                </a>
              </li>
              <li>+56 9 44935412</li>
              <li>Disponibles 9-18 GMT-3</li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Legal</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/support/terminos" className="hover:text-slate-900">
                  Terminos de servicio
                </Link>
              </li>
              <li>
                <Link href="/support/privacidad" className="hover:text-slate-900">
                  Politica de privacidad
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
          <p>Copyright {new Date().getFullYear()} SystemOnReady. Todos los derechos reservados.</p>
          <p>
            Desarrollado por{" "}
            <a href="https://www.willydev.cl/" target="_blank" rel="noreferrer" className="font-semibold text-slate-700 underline">
              WillyDev
            </a>
            .
          </p>
        </div>
      </footer>
    </>
  );
}
