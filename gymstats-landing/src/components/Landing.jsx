import { useEffect, useRef, useState } from "react";
import {
  Dumbbell,
  Wallet,
  MessageCircle,
  CalendarDays,
  ClipboardCheck,
  BarChart3,
  Smartphone,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import "./Landing.css";

const FEATURES = [
  {
    icon: Wallet,
    title: "Pagos, sin perseguir a nadie",
    text: "Cobrá con Mercado Pago. Cuando tu socio paga, se marca solo — vos no tenés que hacer nada.",
  },
  {
    icon: MessageCircle,
    title: "Recordatorios por WhatsApp",
    text: "Un clic y le mandás el aviso de que debe, con el link de pago adentro del mensaje.",
  },
  {
    icon: CalendarDays,
    title: "Vencimientos a la vista",
    text: "Un calendario que te muestra quién vence cada día, no una planilla que hay que revisar a mano.",
  },
  {
    icon: ClipboardCheck,
    title: "Control de asistencia",
    text: "Marcá quién vino hoy con un click, sin planilla pegada en la entrada.",
  },
  {
    icon: BarChart3,
    title: "Números reales",
    text: "Cuánto cobraste, cuánto falta, cuántos socios activos tenés — sin abrir Excel.",
  },
  {
    icon: Smartphone,
    title: "Anda en el celu",
    text: "Se instala como una app. La usás desde el mostrador o desde tu casa, con o sin señal.",
  },
];

const PAIN_POINTS = [
  "Tenés los datos de tus socios en una planilla que hace tres meses que nadie actualiza.",
  "Te acordás de mandar el recordatorio de pago cuando ya pasaron dos semanas del vencimiento.",
  "No sabés cuánta plata tenés que cobrar este mes hasta que hacés la cuenta a mano.",
];

const FAQS = [
  {
    q: "¿Necesito saber de tecnología?",
    a: "No. Si sabés usar WhatsApp, sabés usar GymStats.",
  },
  {
    q: "¿Mis clientes tienen que instalar algo?",
    a: "No, nada. Ellos solo reciben un mensaje de WhatsApp con el link para pagar, como cualquier otro mensaje.",
  },
  {
    q: "¿Puedo cobrar con Mercado Pago?",
    a: "Sí. Conectás tu propia cuenta de Mercado Pago desde Ajustes, y el dinero va directo a vos — GymStats nunca lo toca.",
  },
  {
    q: "¿Funciona si tengo más de un gimnasio?",
    a: "Sí, y también si en algún momento sumás un socio al negocio: cada cuenta ve solo sus propios datos.",
  },
];

function useCountUp(target, active) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      const timeout = setTimeout(() => setValue(target), 0);
      return () => clearTimeout(timeout);
    }
    const duration = 900;
    const start = performance.now();
    let frame;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target]);

  return value;
}

function useInView(threshold = 0.25) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}

/** Envuelve una sección y la hace aparecer con un fade-up suave al entrar en pantalla. */
function Reveal({ children, className = "" }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={`reveal ${inView ? "reveal-in" : ""} ${className}`}>
      {children}
    </div>
  );
}

function useScrolled(offset = 12) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > offset);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [offset]);
  return scrolled;
}

function DashboardMockup() {
  const [heroRef, heroInView] = useInView(0.3);
  const activos = useCountUp(47, heroInView);
  const cobrado = useCountUp(312400, heroInView);

  return (
    <div className="mockup-card mockup-hero" ref={heroRef}>
      <div className="mockup-header">
        <span className="mockup-dot" />
        <span className="mockup-dot" />
        <span className="mockup-dot" />
        <span className="mockup-title">Dashboard</span>
      </div>

      <div className="mockup-kpis">
        <div className="mockup-kpi">
          <span className="mockup-kpi-label">Activos</span>
          <strong className="mockup-kpi-value">{activos}</strong>
        </div>
        <div className="mockup-kpi">
          <span className="mockup-kpi-label">Cobrado este mes</span>
          <strong className="mockup-kpi-value">${cobrado.toLocaleString("es-AR")}</strong>
        </div>
      </div>

      <div className="mockup-panel">
        <span className="mockup-panel-title">Vencen hoy</span>
        <div className="mockup-row">
          <span>Martín Gómez</span>
          <span className="mockup-badge warning">Por vencer</span>
        </div>
        <div className="mockup-row">
          <span>Laura Pérez</span>
          <span className="mockup-badge danger">Vencido</span>
        </div>
        <div className="mockup-row muted">
          <span>Sofía Álvarez</span>
          <span className="mockup-badge success">Al día</span>
        </div>
      </div>
    </div>
  );
}

function PaymentsMockup() {
  return (
    <div className="mockup-card">
      <div className="mockup-header">
        <span className="mockup-dot" />
        <span className="mockup-dot" />
        <span className="mockup-dot" />
        <span className="mockup-title">Pagos</span>
      </div>
      <div className="mockup-panel">
        <div className="mockup-row">
          <span>Nicolás Torres</span>
          <span className="mockup-mini-btn">
            <MessageCircle size={12} /> Recordar
          </span>
        </div>
        <div className="mockup-row">
          <span>Valentina Díaz</span>
          <span className="mockup-mini-btn primary">Marcar pagado</span>
        </div>
        <div className="mockup-row muted">
          <span>Camila Ruiz</span>
          <span className="mockup-badge success">Al día</span>
        </div>
      </div>
    </div>
  );
}

function CalendarMockup() {
  const days = [
    { n: 3 }, { n: 4 }, { n: 5, dot: "warning" }, { n: 6 },
    { n: 7 }, { n: 8, dot: "danger" }, { n: 9 },
    { n: 10, dot: "success" }, { n: 11 }, { n: 12 }, { n: 13 }, { n: 14 },
  ];
  return (
    <div className="mockup-card">
      <div className="mockup-header">
        <span className="mockup-dot" />
        <span className="mockup-dot" />
        <span className="mockup-dot" />
        <span className="mockup-title">Calendario</span>
      </div>
      <div className="mockup-calendar">
        {days.map((d, i) => (
          <div className={`mockup-cal-day ${d.dot ? "has-dot" : ""}`} key={i}>
            {d.n}
            {d.dot && <span className={`mockup-cal-dot ${d.dot}`} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function Landing({ onGetStarted, onLogin }) {
  const [openFaq, setOpenFaq] = useState(null);
  const scrolled = useScrolled();

  return (
    <div className="landing">
      <nav className={`landing-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <span className="logo-mark">
              <Dumbbell size={18} />
            </span>
            <span className="logo-text">GYMSTATS</span>
          </div>
          <div className="landing-nav-actions">
            <button className="landing-link" onClick={onLogin}>
              Iniciar sesión
            </button>
            <button className="btn btn-primary btn-sm" onClick={onGetStarted}>
              Empezar gratis
            </button>
          </div>
        </div>
      </nav>

      <div className="landing-inner">
        <header className="landing-hero">
          <div className="landing-hero-text">
            <span className="landing-eyebrow">Para dueños de gimnasio, no para programadores</span>
            <h1>Dejá de perseguir cuotas por WhatsApp a mano.</h1>
            <p className="landing-subtitle">
              GymStats te dice quién debe, cuándo vence, y le manda el recordatorio — o el link para
              pagar — sin que muevas un dedo.
            </p>
            <div className="landing-cta-row">
              <button className="btn btn-primary" onClick={onGetStarted}>
                Empezar gratis <ArrowRight size={16} />
              </button>
              <a className="btn btn-ghost" href="#funciones">
                Ver cómo funciona
              </a>
            </div>
            <p className="landing-trust">
              <CheckCircle2 size={14} /> Gratis para empezar · sin tarjeta de crédito
            </p>
          </div>
          <div className="landing-hero-visual">
            <DashboardMockup />
          </div>
        </header>

        <Reveal className="landing-pain">
          <h2>Si esto te suena familiar...</h2>
          <div className="pain-list">
            {PAIN_POINTS.map((text) => (
              <div className="pain-item" key={text}>
                <AlertTriangle size={18} />
                <p>{text}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="landing-features" id="funciones">
          <h2>Todo lo que hoy hacés a mano, en un solo lugar</h2>
          <div className="features-grid">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div className="feature-card" key={title}>
                <div className="feature-icon">
                  <Icon size={20} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="landing-preview">
          <h2>Se ve como tu negocio, no como una planilla</h2>
          <p>
            Cada cliente, cada pago, cada vencimiento — organizado para que lo entiendas de un
            vistazo, no para que lo tengas que interpretar.
          </p>
          <div className="preview-gallery">
            <PaymentsMockup />
            <CalendarMockup />
          </div>
        </Reveal>

        <Reveal className="landing-faq">
          <h2>Preguntas frecuentes</h2>
          <div className="faq-list">
            {FAQS.map((item, i) => (
              <div className={`faq-item ${openFaq === i ? "open" : ""}`} key={item.q}>
                <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {item.q}
                  <span className="faq-toggle">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && <p className="faq-answer">{item.a}</p>}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="landing-final-cta">
          <h2>Probalo con tus clientes reales, gratis.</h2>
          <button className="btn btn-primary" onClick={onGetStarted}>
            Empezar gratis <ArrowRight size={16} />
          </button>
        </Reveal>

        <footer className="landing-footer">
          <div className="landing-logo">
            <span className="logo-mark">
              <Dumbbell size={16} />
            </span>
            <span className="logo-text">GYMSTATS</span>
          </div>
          <div className="landing-footer-right">
            <button className="landing-link" onClick={onLogin}>
              Iniciar sesión
            </button>
            <span className="landing-copyright">© {new Date().getFullYear()} GymStats</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Landing;
