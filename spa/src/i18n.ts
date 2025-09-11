// Minimal i18next setup for the PoC.
// We inline the JSON resources to keep it simple.
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// If you prefer separate JSON files, you can import like:
// import en from "./locales/en.json";
// import es from "./locales/es.json";

const en = {
  nav: {
    about: "About Us",
    students: "Students",
    parents: "Parents/Guardians",
    counselors: "School Counselors",
    admins: "Financial Aid Administrators",
    notices: "Public Notices",
    login: "Login",
  },
  gov: {
    njHome: "NJ Home",
    services: "Services A to Z",
    depts: "Departments/Agencies",
    translate: "Translate",
    faqs: "NJ Gov FAQs",
    searchPlaceholder: "Search…"
  },
  home: {
    headline: "New Jersey financial aid, loans, and college planning — all in one place.",
    subhead: "Apply for state aid, explore scholarships, compare loan options, and register for workshops.",
    apply: "Apply for State Aid",
    explore: "Explore NJCLASS",
    spotlight: "HESAA Spotlight",
    quickLinks: "Quick Links",
    news: "Recent News",
    events: "Events",
    emergency: "Emergency Message Placeholder",
  },
  footer: {
    hesaa: "HESAA",
    grants: "Grants & Scholarships",
    njclass: "NJCLASS",
    careers: "Careers",
    privacy: "Privacy Policy",
    terms: "Website T & C",
    sitemap: "Sitemap",
    deadlines: "Application Deadlines",
    applyNow: "Apply Now",
    login: "Login",
    payment: "Make a Payment",
    contact: "Contact Us",
    copyright: "© 2025 Higher Education Student Assistance Authority",
  }
};

const es = {
  nav: {
    about: "Quiénes somos",
    students: "Estudiantes",
    parents: "Padres/Tutores",
    counselors: "Consejeros escolares",
    admins: "Administradores de ayuda financiera",
    notices: "Avisos públicos",
    login: "Iniciar sesión",
  },
  gov: {
    njHome: "Inicio NJ",
    services: "Servicios de la A a la Z",
    depts: "Departamentos/Agencias",
    translate: "Traducir",
    faqs: "Preguntas frecuentes",
    searchPlaceholder: "Buscar…"
  },
  home: {
    headline: "Ayuda financiera, préstamos y planificación universitaria de Nueva Jersey — todo en un solo lugar.",
    subhead: "Solicite ayuda estatal, explore becas, compare préstamos y regístrese en talleres.",
    apply: "Solicitar ayuda estatal",
    explore: "Explorar NJCLASS",
    spotlight: "Destacados de HESAA",
    quickLinks: "Enlaces rápidos",
    news: "Noticias",
    events: "Eventos",
    emergency: "Mensaje de emergencia",
  },
  footer: {
    hesaa: "HESAA",
    grants: "Becas y ayudas",
    njclass: "NJCLASS",
    careers: "Empleos",
    privacy: "Política de privacidad",
    terms: "Términos del sitio",
    sitemap: "Mapa del sitio",
    deadlines: "Fechas límite de solicitud",
    applyNow: "Solicitar ahora",
    login: "Iniciar sesión",
    payment: "Realizar un pago",
    contact: "Contáctenos",
    copyright: "© 2025 Autoridad de Asistencia Estudiantil de Educación Superior",
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, es: { translation: es } },
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

export default i18n;
