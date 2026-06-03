import { useState, useEffect, useRef } from "react";

const WORKER_URL = "https://sintesis-worker.nosoy36736812.workers.dev/generate";

// ─────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────
function estimateReadTime(guide) {
  if (!guide) return "—";
  const text = JSON.stringify(guide);
  const words = text.split(/\s+/).length;
  return `${Math.max(3, Math.round(words / 200))} min`;
}

function buildTOC(guide) {
  if (!guide) return [];
  const sections = [];
  if (guide.summary) sections.push({ id: "section-summary", label: "📌 Lee esto primero" });
  if (guide.key_concepts?.length) sections.push({ id: "section-concepts", label: "🎯 Conceptos clave" });
  if (guide.structure?.length) sections.push({ id: "section-structure", label: "📚 Contenido estructurado" });
  if (guide.qa_pairs?.length) sections.push({ id: "section-qa", label: "📝 Preguntas de práctica" });
  if (guide.study_tips?.length) sections.push({ id: "section-tips", label: "🎓 Consejos de estudio" });
  return sections;
}

// ─────────────────────────────────────────────
// LANDING PAGE
// ─────────────────────────────────────────────
function LandingPage({ onStart }) {
  return (
    <div style={{ fontFamily: "'Crimson Pro', 'Georgia', serif", background: "#FAFAF8", minHeight: "100vh", color: "#111827" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; }
        .landing-nav { background: white; border-bottom: 1px solid #E5E7EB; padding: 16px 0; position: sticky; top: 0; z-index: 100; }
        .nav-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; }
        .logo-text { font-family: 'Crimson Pro', serif; font-size: 24px; font-weight: 700; color: #2563EB; letter-spacing: -0.5px; }
        .nav-cta { background: #2563EB; color: white; border: none; padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.2s; }
        .nav-cta:hover { background: #1D4ED8; }
        .hero { background: linear-gradient(160deg, #EFF6FF 0%, #FFFFFF 60%); padding: 100px 24px 80px; }
        .hero-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .hero-tag { display: inline-block; background: #DBEAFE; color: #1D4ED8; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; margin-bottom: 20px; font-family: 'DM Sans', sans-serif; letter-spacing: 0.5px; text-transform: uppercase; }
        .hero-title { font-family: 'Crimson Pro', serif; font-size: 52px; font-weight: 700; line-height: 1.1; color: #0F172A; margin-bottom: 20px; letter-spacing: -1px; }
        .hero-title em { font-style: italic; color: #2563EB; }
        .hero-sub { font-family: 'DM Sans', sans-serif; font-size: 17px; color: #6B7280; line-height: 1.7; margin-bottom: 36px; }
        .hero-btn { background: #2563EB; color: white; border: none; padding: 16px 36px; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; box-shadow: 0 4px 14px rgba(37,99,235,0.3); }
        .hero-btn:hover { background: #1D4ED8; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.4); }
        .demo-box { background: white; border-radius: 16px; border: 1px solid #E5E7EB; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.08); }
        .demo-header { background: #F9FAFB; border-bottom: 1px solid #E5E7EB; padding: 12px 16px; display: flex; align-items: center; gap: 8px; }
        .demo-dot { width: 10px; height: 10px; border-radius: 50%; }
        .demo-label { font-family: 'DM Sans', sans-serif; font-size: 11px; color: #9CA3AF; margin-left: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .demo-content { padding: 24px; }
        .demo-before { font-family: 'DM Sans', sans-serif; font-size: 13px; color: #9CA3AF; line-height: 1.7; background: #FEF9C3; padding: 16px; border-radius: 8px; border-left: 3px solid #FCD34D; margin-bottom: 16px; }
        .demo-arrow { text-align: center; font-size: 20px; margin: 12px 0; color: #2563EB; }
        .demo-after-title { font-family: 'Crimson Pro', serif; font-size: 20px; font-weight: 700; color: #0F172A; margin-bottom: 8px; }
        .demo-after-item { font-family: 'DM Sans', sans-serif; font-size: 13px; color: #374151; padding: 8px 12px; background: #EFF6FF; border-radius: 6px; margin-bottom: 6px; border-left: 3px solid #2563EB; }
        .stats { background: white; border-top: 1px solid #E5E7EB; border-bottom: 1px solid #E5E7EB; padding: 60px 24px; }
        .stats-inner { max-width: 800px; margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; text-align: center; }
        .stat-num { font-family: 'Crimson Pro', serif; font-size: 48px; font-weight: 700; color: #2563EB; line-height: 1; margin-bottom: 8px; }
        .stat-desc { font-family: 'DM Sans', sans-serif; font-size: 14px; color: #6B7280; line-height: 1.5; }
        .features { padding: 80px 24px; max-width: 1100px; margin: 0 auto; }
        .section-title { font-family: 'Crimson Pro', serif; font-size: 38px; font-weight: 700; color: #0F172A; text-align: center; margin-bottom: 48px; letter-spacing: -0.5px; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .feature-card { background: white; border: 1px solid #E5E7EB; border-radius: 12px; padding: 28px; transition: all 0.2s; }
        .feature-card:hover { border-color: #BFDBFE; box-shadow: 0 4px 20px rgba(37,99,235,0.08); transform: translateY(-2px); }
        .feature-icon { font-size: 28px; margin-bottom: 16px; }
        .feature-title { font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 8px; }
        .feature-desc { font-family: 'DM Sans', sans-serif; font-size: 14px; color: #6B7280; line-height: 1.6; }
        .cta-section { background: linear-gradient(135deg, #1E40AF 0%, #2563EB 100%); padding: 80px 24px; text-align: center; }
        .cta-title { font-family: 'Crimson Pro', serif; font-size: 44px; font-weight: 700; color: white; margin-bottom: 16px; letter-spacing: -0.5px; }
        .cta-sub { font-family: 'DM Sans', sans-serif; font-size: 17px; color: rgba(255,255,255,0.8); margin-bottom: 36px; }
        .cta-btn-white { background: white; color: #1D4ED8; border: none; padding: 16px 44px; border-radius: 10px; font-size: 16px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .cta-btn-white:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
        .footer { background: #0F172A; color: #9CA3AF; padding: 32px 24px; text-align: center; font-family: 'DM Sans', sans-serif; font-size: 13px; }
        @media (max-width: 768px) {
          .hero-inner { grid-template-columns: 1fr; gap: 40px; }
          .hero-title { font-size: 36px; }
          .stats-inner { grid-template-columns: 1fr; gap: 24px; }
          .features-grid { grid-template-columns: 1fr; }
          .cta-title { font-size: 30px; }
        }
      `}</style>
      <nav className="landing-nav">
        <div className="nav-inner">
          <span className="logo-text">Synthesis</span>
          <button className="nav-cta" onClick={onStart}>Crear guía gratis →</button>
        </div>
      </nav>
      <section className="hero">
        <div className="hero-inner">
          <div>
            <span className="hero-tag">✦ Para estudiantes de 12vo</span>
            <h1 className="hero-title">Tus apuntes caóticos,<br />convertidos en <em>guías perfectas</em></h1>
            <p className="hero-sub">Pega tus apuntes, elige la materia y en segundos tienes una guía estructurada con conceptos clave, ejemplos y preguntas de práctica.</p>
            <button className="hero-btn" onClick={onStart}>Generar mi primera guía →</button>
          </div>
          <div>
            <div className="demo-box">
              <div className="demo-header">
                <div className="demo-dot" style={{ background: "#FCD34D" }} />
                <div className="demo-dot" style={{ background: "#6EE7B7" }} />
                <div className="demo-dot" style={{ background: "#93C5FD" }} />
                <span className="demo-label">Antes → Después</span>
              </div>
              <div className="demo-content">
                <div className="demo-before">"newton dijo algo de inercia... la segunda ley es F=ma creo... accion y reaccion? hay 3 leyes... el profe dijo que era importante para el parcial..."</div>
                <div className="demo-arrow">⬇ Synthesis IA ⬇</div>
                <div className="demo-after-title">Leyes de Newton</div>
                <div className="demo-after-item">🎯 <strong>Ley 1:</strong> Inercia — sin fuerza, sin cambio</div>
                <div className="demo-after-item">📐 <strong>Ley 2:</strong> F = m·a (la más importante para el examen)</div>
                <div className="demo-after-item">↔️ <strong>Ley 3:</strong> Acción = Reacción opuesta</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="stats">
        <div className="stats-inner">
          <div><div className="stat-num">5x</div><div className="stat-desc">Más rápido que hacer una guía manualmente</div></div>
          <div><div className="stat-num">30s</div><div className="stat-desc">Tiempo promedio de generación</div></div>
          <div><div className="stat-num">100%</div><div className="stat-desc">Basado en tus propios apuntes</div></div>
        </div>
      </section>
      <section className="features">
        <h2 className="section-title">Todo lo que necesitas para estudiar mejor</h2>
        <div className="features-grid">
          {[
            { icon: "📌", title: "Resumen ejecutivo", desc: "Lo más importante en las primeras líneas. Sin rodeos." },
            { icon: "🎯", title: "Conceptos clave", desc: "Los términos y definiciones que sí o sí van a caer en el examen." },
            { icon: "📚", title: "Estructura clara", desc: "Tu tema organizado en secciones lógicas fáciles de seguir." },
            { icon: "📝", title: "Preguntas de práctica", desc: "Ejercicios generados a partir de tu propio material." },
            { icon: "💡", title: "Consejos de estudio", desc: "Estrategias específicas para memorizar este tema." },
            { icon: "⚡", title: "Instantáneo", desc: "Sin esperas. Tu guía en menos de 30 segundos." },
          ].map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="cta-section">
        <h2 className="cta-title">¿Listo para estudiar diferente?</h2>
        <p className="cta-sub">Empieza gratis. Sin registro. Sin complicaciones.</p>
        <button className="cta-btn-white" onClick={onStart}>Crear mi guía ahora →</button>
      </section>
      <footer className="footer">
        <span style={{ color: "#3B82F6", fontWeight: 700, fontFamily: "'Crimson Pro', serif", fontSize: 16 }}>Synthesis</span>
        &nbsp;— Hecho para estudiantes de 12vo · 2026
      </footer>
    </div>
  );
}

function CreatePage({ onBack, onGuideReady }) {
  const [notes, setNotes] = useState("");
  const [subject, setSubject] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [charCount, setCharCount] = useState(0);

  const handleNotesChange = (e) => { setNotes(e.target.value); setCharCount(e.target.value.length); };

  const handleGenerate = async () => {
    if (!notes.trim()) { setError("Por favor ingresa tus apuntes antes de continuar."); return; }
    if (!subject.trim()) { setError("Por favor indica la materia."); return; }
    setError(""); setIsLoading(true);
    try {
      const res = await fetch(WORKER_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notes: notes.trim(), subject: subject.trim() }) });
      if (!res.ok) { const errData = await res.json().catch(() => ({})); throw new Error(errData.error || `Error del servidor (${res.status})`); }
      const data = await res.json();
      onGuideReady(data, subject.trim());
    } catch (err) {
      setError(err.message === "Failed to fetch" ? "No se pudo conectar al servidor. Verifica tu conexión." : err.message);
    } finally { setIsLoading(false); }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#F9FAFB", minHeight: "100vh", color: "#1F2937" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        .create-header { background: white; border-bottom: 1px solid #E5E7EB; padding: 14px 0; position: sticky; top: 0; z-index: 100; }
        .create-header-inner { max-width: 900px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; }
        .back-btn { background: none; border: none; color: #6B7280; font-size: 14px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 6px; transition: all 0.2s; }
        .back-btn:hover { background: #F3F4F6; color: #111827; }
        .logo-sm { font-family: 'Crimson Pro', serif; font-size: 20px; font-weight: 700; color: #2563EB; }
        .create-body { max-width: 720px; margin: 0 auto; padding: 48px 24px; }
        .create-title { font-family: 'Crimson Pro', serif; font-size: 36px; font-weight: 700; color: #0F172A; margin-bottom: 8px; letter-spacing: -0.5px; }
        .create-sub { font-size: 15px; color: #6B7280; margin-bottom: 40px; }
        .form-group { margin-bottom: 28px; }
        label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .subject-input { width: 100%; padding: 14px 16px; border: 1.5px solid #D1D5DB; border-radius: 10px; font-size: 15px; font-family: 'DM Sans', sans-serif; transition: all 0.2s; background: white; }
        .subject-input:focus { outline: none; border-color: #2563EB; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
        .notes-area { width: 100%; padding: 16px; border: 1.5px solid #D1D5DB; border-radius: 10px; font-size: 14px; font-family: 'DM Sans', sans-serif; transition: all 0.2s; background: white; resize: vertical; min-height: 220px; line-height: 1.7; }
        .notes-area:focus { outline: none; border-color: #2563EB; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
        .notes-footer { display: flex; justify-content: space-between; margin-top: 8px; }
        .char-count { font-size: 12px; color: #9CA3AF; }
        .tip-box { background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 10px; padding: 16px; font-size: 13px; color: #1D4ED8; line-height: 1.6; margin-bottom: 28px; }
        .tip-box strong { display: block; margin-bottom: 4px; }
        .error-box { background: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 10px; padding: 14px 16px; font-size: 14px; color: #B91C1C; margin-bottom: 20px; }
        .generate-btn { width: 100%; padding: 18px; background: #2563EB; color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .generate-btn:hover:not(:disabled) { background: #1D4ED8; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(37,99,235,0.3); }
        .generate-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
        .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-screen { position: fixed; inset: 0; background: rgba(255,255,255,0.95); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 200; gap: 20px; }
        .loading-ring { width: 56px; height: 56px; border: 3px solid #DBEAFE; border-top-color: #2563EB; border-radius: 50%; animation: spin 0.8s linear infinite; }
        .loading-title { font-family: 'Crimson Pro', serif; font-size: 26px; font-weight: 700; color: #0F172A; }
        .loading-sub { font-size: 14px; color: #6B7280; }
      `}</style>
      {isLoading && (
        <div className="loading-screen">
          <div className="loading-ring" />
          <div className="loading-title">Generando tu guía…</div>
          <div className="loading-sub">La IA está estructurando tus apuntes. Esto toma ~30 segundos.</div>
        </div>
      )}
      <header className="create-header">
        <div className="create-header-inner">
          <button className="back-btn" onClick={onBack}>← Inicio</button>
          <span className="logo-sm">Synthesis</span>
          <div style={{ width: 80 }} />
        </div>
      </header>
      <div className="create-body">
        <h1 className="create-title">Crear nueva guía</h1>
        <p className="create-sub">Pega tus apuntes y la IA se encarga del resto.</p>
        <div className="tip-box">
          <strong>💡 Tip para mejores resultados</strong>
          Mientras más detallados sean tus apuntes, mejor será la guía. Puedes pegar texto de fotos, copiar del libro o escribir lo que recuerdas de clase.
        </div>
        <div className="form-group">
          <label>Materia</label>
          <input className="subject-input" type="text" placeholder="Ej: Física, Biología, Historia Universal…" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Tus apuntes</label>
          <textarea className="notes-area" placeholder="Pega aquí tus apuntes, notas de clase, texto del libro… Cualquier cosa que quieras convertir en una guía de estudio." value={notes} onChange={handleNotesChange} />
          <div className="notes-footer">
            <span className="char-count">{charCount} caracteres</span>
            {charCount > 0 && charCount < 100 && (<span className="char-count" style={{ color: "#F59E0B" }}>Agrega más contenido para mejores resultados</span>)}
          </div>
        </div>
        {error && <div className="error-box">⚠️ {error}</div>}
        <button className="generate-btn" onClick={handleGenerate} disabled={isLoading}>
          {isLoading ? (<><div className="spinner" /> Generando guía…</>) : <>✦ Generar guía de estudio</>}
        </button>
      </div>
    </div>
  );
}

function QAItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: "1px solid #E5E7EB", borderRadius: 10, marginBottom: 12, overflow: "hidden" }}>
      <div onClick={() => setOpen(!open)} style={{ background: "#F9FAFB", padding: "14px 18px", fontSize: 14, fontWeight: 600, color: "#111827", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>{question}</span>
        <span style={{ color: "#2563EB", fontSize: 18 }}>{open ? "−" : "+"}</span>
      </div>
      {open && (<div style={{ padding: "14px 18px", fontSize: 14, color: "#374151", lineHeight: 1.7, borderTop: "1px solid #E5E7EB", background: "white" }}>{answer}</div>)}
    </div>
  );
}

function GuideViewer({ guide, subject, onBack, onNew }) {
  const [activeSection, setActiveSection] = useState("");
  const contentRef = useRef(null);
  const toc = buildTOC(guide);
  const readTime = estimateReadTime(guide);
  const now = new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
  const scrollTo = (id) => { const el = document.getElementById(id); if (el) { el.scrollIntoView({ behavior: "smooth", block: "start" }); setActiveSection(id); } };
  useEffect(() => { if (toc.length > 0) setActiveSection(toc[0].id); }, [guide]);
  const handlePrint = () => window.print();
  const handleCopyText = () => { navigator.clipboard.writeText(JSON.stringify(guide, null, 2)).then(() => alert("Contenido copiado al portapapeles.")); };

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#F9FAFB", color: "#1F2937", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        .viewer-header { background: white; border-bottom: 1px solid #E5E7EB; padding: 14px 0; position: sticky; top: 0; z-index: 100; }
        .viewer-header-inner { max-width: 1600px; margin: 0 auto; padding: 0 20px; display: flex; justify-content: space-between; align-items: center; }
        .vh-left { display: flex; align-items: center; gap: 16px; }
        .back-btn { background: none; border: 1px solid #E5E7EB; color: #6B7280; font-size: 13px; font-weight: 500; cursor: pointer; padding: 7px 14px; border-radius: 7px; transition: all 0.2s; }
        .back-btn:hover { border-color: #2563EB; color: #2563EB; }
        .logo-sm { font-family: 'Crimson Pro', serif; font-size: 20px; font-weight: 700; color: #2563EB; }
        .guide-header-title { font-size: 14px; color: #6B7280; font-weight: 400; }
        .vh-actions { display: flex; gap: 10px; }
        .icon-btn { width: 38px; height: 38px; border-radius: 8px; border: 1px solid #E5E7EB; background: white; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .icon-btn:hover { border-color: #2563EB; background: #EFF6FF; }
        .new-guide-btn { background: #2563EB; color: white; border: none; padding: 8px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.2s; }
        .new-guide-btn:hover { background: #1D4ED8; }
        .viewer-layout { display: grid; grid-template-columns: 260px 1fr 280px; max-width: 1600px; margin: 0 auto; min-height: calc(100vh - 61px); }
        .toc-sidebar { background: white; border-right: 1px solid #E5E7EB; padding: 24px 0; overflow-y: auto; max-height: calc(100vh - 61px); position: sticky; top: 61px; }
        .toc-heading { padding: 0 20px 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #9CA3AF; letter-spacing: 0.8px; }
        .toc-link { padding: 9px 20px; font-size: 13px; color: #6B7280; cursor: pointer; transition: all 0.15s; border-left: 3px solid transparent; display: block; }
        .toc-link:hover { background: #F9FAFB; color: #2563EB; }
        .toc-link.active { background: #EFF6FF; color: #2563EB; border-left-color: #2563EB; font-weight: 500; }
        .guide-content { background: white; padding: 60px 72px; overflow-y: auto; max-height: calc(100vh - 61px); }
        .guide-meta-row { font-size: 13px; color: #9CA3AF; margin-bottom: 12px; }
        .guide-meta-row span { margin-right: 16px; }
        .guide-main-title { font-family: 'Crimson Pro', serif; font-size: 40px; font-weight: 700; color: #0F172A; line-height: 1.1; margin-bottom: 16px; letter-spacing: -0.5px; }
        .guide-subtitle { font-size: 16px; color: #6B7280; line-height: 1.7; margin-bottom: 40px; padding-bottom: 32px; border-bottom: 2px solid #E5E7EB; }
        .section-anchor { font-family: 'Crimson Pro', serif; font-size: 26px; font-weight: 700; color: #0F172A; margin-top: 48px; margin-bottom: 20px; padding-top: 8px; }
        .content-p { font-size: 15px; line-height: 1.8; color: #374151; margin-bottom: 16px; }
        .essential-box { background: #FFFBEB; border-left: 4px solid #F59E0B; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 20px 0; font-size: 14px; color: #78350F; line-height: 1.7; }
        .concept-card { background: #F8FAFF; border: 1px solid #DBEAFE; border-radius: 10px; padding: 20px; margin-bottom: 16px; }
        .concept-name { font-size: 15px; font-weight: 600; color: #1D4ED8; margin-bottom: 8px; }
        .concept-def { font-size: 14px; color: #374151; line-height: 1.7; }
        .tip-item { display: flex; gap: 12px; padding: 14px 0; border-bottom: 1px solid #F3F4F6; }
        .tip-item:last-child { border-bottom: none; }
        .tip-bullet { width: 8px; height: 8px; border-radius: 50%; background: #2563EB; flex-shrink: 0; margin-top: 6px; }
        .tip-text { font-size: 14px; color: #374151; line-height: 1.7; }
        .struct-section { margin-bottom: 28px; }
        .struct-title { font-size: 17px; font-weight: 600; color: #111827; margin-bottom: 10px; }
        .struct-content { font-size: 14px; color: #374151; line-height: 1.8; }
        .actions-sidebar { background: white; border-left: 1px solid #E5E7EB; padding: 24px; overflow-y: auto; max-height: calc(100vh - 61px); position: sticky; top: 61px; display: flex; flex-direction: column; gap: 20px; }
        .side-card { border: 1px solid #E5E7EB; border-radius: 10px; padding: 18px; }
        .side-card-title { font-size: 11px; font-weight: 600; text-transform: uppercase; color: #9CA3AF; letter-spacing: 0.8px; margin-bottom: 14px; }
        .action-btn { width: 100%; padding: 11px; background: #2563EB; color: white; border: none; border-radius: 7px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s; margin-bottom: 8px; font-family: 'DM Sans', sans-serif; }
        .action-btn:hover { background: #1D4ED8; }
        .action-btn-ghost { width: 100%; padding: 11px; background: white; color: #2563EB; border: 1px solid #BFDBFE; border-radius: 7px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s; margin-bottom: 8px; font-family: 'DM Sans', sans-serif; }
        .action-btn-ghost:hover { background: #EFF6FF; }
        .info-row { padding: 10px 0; border-bottom: 1px solid #F3F4F6; }
        .info-row:last-child { border-bottom: none; padding-bottom: 0; }
        .info-lbl { font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
        .info-val { font-size: 14px; font-weight: 500; color: #111827; }
        @media (max-width: 1200px) { .viewer-layout { grid-template-columns: 1fr 260px; } .toc-sidebar { display: none; } .guide-content { padding: 40px; } }
        @media (max-width: 768px) { .viewer-layout { grid-template-columns: 1fr; } .actions-sidebar { display: none; } .guide-content { padding: 24px 20px; } .guide-main-title { font-size: 28px; } }
        @media print { .viewer-header, .toc-sidebar, .actions-sidebar { display: none !important; } .guide-content { padding: 20px; max-height: none; overflow: visible; } }
      `}</style>
      <header className="viewer-header">
        <div className="viewer-header-inner">
          <div className="vh-left">
            <button className="back-btn" onClick={onBack}>← Inicio</button>
            <span className="logo-sm">Synthesis</span>
            <span className="guide-header-title">{subject}</span>
          </div>
          <div className="vh-actions">
            <button className="icon-btn" title="Imprimir" onClick={handlePrint}>🖨</button>
            <button className="icon-btn" title="Copiar contenido" onClick={handleCopyText}>📋</button>
            <button className="new-guide-btn" onClick={onNew}>+ Nueva guía</button>
          </div>
        </div>
      </header>
      <div className="viewer-layout">
        <aside className="toc-sidebar">
          <div className="toc-heading">Contenido</div>
          {toc.map((item) => (<div key={item.id} className={`toc-link ${activeSection === item.id ? "active" : ""}`} onClick={() => scrollTo(item.id)}>{item.label}</div>))}
        </aside>
        <main className="guide-content" ref={contentRef}>
          <div className="guide-meta-row"><span>{subject}</span><span>Generado hoy a las {now}</span></div>
          <h1 className="guide-main-title">{guide.meta?.title || guide._meta?.title || `Guía de ${subject}`}</h1>
          <p className="guide-subtitle">{guide.meta?.description || `Guía de estudio estructurada generada a partir de tus apuntes de ${subject}.`}</p>
          {guide.summary && (<section id="section-summary"><h2 className="section-anchor">📌 Lee esto primero</h2><p className="content-p">{guide.summary}</p>{guide.meta?.exam_focus && (<div className="essential-box"><strong>Lo que más pregunta el examen:</strong> {guide.meta.exam_focus}</div>)}</section>)}
          {guide.key_concepts?.length > 0 && (<section id="section-concepts"><h2 className="section-anchor">🎯 Conceptos clave</h2>{guide.key_concepts.map((kc, i) => (<div key={i} className="concept-card"><div className="concept-name">{kc.term || kc.name || kc.concept || `Concepto ${i + 1}`}</div><div className="concept-def">{kc.definition || kc.explanation || kc.desc || JSON.stringify(kc)}</div></div>))}</section>)}
          {guide.structure?.length > 0 && (<section id="section-structure"><h2 className="section-anchor">📚 Contenido estructurado</h2>{guide.structure.map((sec, i) => (<div key={i} className="struct-section"><div className="struct-title">{sec.title || sec.heading || `Sección ${i + 1}`}</div><div className="struct-content">{typeof sec.content === "string" ? sec.content : Array.isArray(sec.content) ? sec.content.join(" · ") : JSON.stringify(sec.content)}</div></div>))}</section>)}
          {guide.qa_pairs?.length > 0 && (<section id="section-qa"><h2 className="section-anchor">📝 Preguntas de práctica</h2>{guide.qa_pairs.map((qa, i) => (<QAItem key={i} question={qa.question || qa.q || `Pregunta ${i + 1}`} answer={qa.answer || qa.a || "—"} />))}</section>)}
          {guide.study_tips?.length > 0 && (<section id="section-tips"><h2 className="section-anchor">🎓 Consejos de estudio</h2><div>{guide.study_tips.map((tip, i) => (<div key={i} className="tip-item"><div className="tip-bullet" /><div className="tip-text">{typeof tip === "string" ? tip : tip.tip || tip.text || JSON.stringify(tip)}</div></div>))}</div></section>)}
        </main>
        <aside className="actions-sidebar">
          <div className="side-card">
            <div className="side-card-title">Acciones</div>
            <button className="action-btn" onClick={handlePrint}>🖨 Imprimir / PDF</button>
            <button className="action-btn-ghost" onClick={handleCopyText}>📋 Copiar texto</button>
            <button className="action-btn-ghost" onClick={onNew}>+ Nueva guía</button>
          </div>
          <div className="side-card">
            <div className="side-card-title">Información</div>
            <div className="info-row"><div className="info-lbl">Materia</div><div className="info-val">{subject}</div></div>
            <div className="info-row"><div className="info-lbl">Tiempo de lectura</div><div className="info-val">{readTime}</div></div>
            <div className="info-row"><div className="info-lbl">Secciones</div><div className="info-val">{toc.length}</div></div>
            <div className="info-row"><div className="info-lbl">Generado</div><div className="info-val">Hoy {now}</div></div>
          </div>
          <div className="side-card" style={{ borderColor: "#FDE68A", background: "#FFFBEB" }}>
            <p style={{ fontSize: 13, color: "#92400E", lineHeight: 1.6 }}>¿La guía no capturó algo importante? Agrega más detalles a tus apuntes y regénera.</p>
            <button className="action-btn-ghost" style={{ color: "#92400E", borderColor: "#FCD34D", marginTop: 12 }} onClick={onNew}>🔄 Regenerar</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("landing");
  const [guide, setGuide] = useState(null);
  const [subject, setSubject] = useState("");
  const handleGuideReady = (guideData, subjectName) => { setGuide(guideData); setSubject(subjectName); setView("viewer"); };
  if (view === "landing") return <LandingPage onStart={() => setView("create")} />;
  if (view === "create") return <CreatePage onBack={() => setView("landing")} onGuideReady={handleGuideReady} />;
  if (view === "viewer") return <GuideViewer guide={guide} subject={subject} onBack={() => setView("landing")} onNew={() => setView("create")} />;
}
