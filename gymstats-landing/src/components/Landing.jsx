import { useEffect, useRef, useState } from "react";
import {
  Dumbbell,
  Wallet,
  MessageCircle,
  CalendarDays,
  ClipboardCheck,
  BarChart3,
  Smartphone,
  UserCheck,
  AlertTriangle,
  ArrowRight,
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

function useInView() {
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
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, inView];
}

function DashboardMockup() {
  const [heroRef, heroInView] = useInView();
  const activos = useCountUp(47, heroInView);
  const cobrado = useCountUp(312400, heroInView);

  return (
    <div className="mockup-card" ref={heroRef}>
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

function Landing({ onGetStarted, onLogin }) {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="landing">
      <nav className="landing-nav">
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
      </nav>

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
        </div>
        <div className="landing-hero-visual">
          <DashboardMockup />
        </div>
      </header>

      <section className="landing-pain">
        <h2>Si esto te suena familiar...</h2>
        <div className="pain-list">
          {PAIN_POINTS.map((text) => (
            <div className="pain-item" key={text}>
              <AlertTriangle size={18} />
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-features" id="funciones">
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
      </section>

      <section className="landing-preview">
        <div className="preview-text">
          <UserCheck size={22} />
          <h2>Se ve como tu negocio, no como una planilla</h2>
          <p>
            Cada cliente, cada pago, cada vencimiento — organizado para que lo entiendas de un
            vistazo, no para que lo tengas que interpretar.
          </p>
        </div>
      </section>

      <section className="landing-faq">
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
      </section>

      <section className="landing-final-cta">
        <h2>Probalo con tus clientes reales, gratis.</h2>
        <button className="btn btn-primary" onClick={onGetStarted}>
          Empezar gratis <ArrowRight size={16} />
        </button>
      </section>

      <footer className="landing-footer">
        <div className="landing-logo">
          <span className="logo-mark">
            <Dumbbell size={16} />
          </span>
          <span className="logo-text">GYMSTATS</span>
        </div>
        <button className="landing-link" onClick={onLogin}>
          Iniciar sesión
        </button>
      </footer>
    </div>
  );
}

export default Landing;
