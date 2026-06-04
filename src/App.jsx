import { useState, useRef, useCallback } from "react";
import {
  FlaskConical, Leaf, Zap, Languages, BookOpen, Calculator,
  FileText, PenTool, Clock, ChevronDown, Upload, X, CheckCircle,
  Printer, Download, ArrowLeft, Plus, AlertCircle, Loader2
} from "lucide-react";

const WORKER_URL = "https://sintesis-worker.nosoy36736812.workers.dev/generate";

const SUBJECTS = [
  { value: "matematicas", label: "Matemáticas",  Icon: Calculator,    desc: "Álgebra, cálculo, geometría" },
  { value: "quimica",     label: "Química",       Icon: FlaskConical,  desc: "Orgánica, inorgánica, estequiometría" },
  { value: "biologia",    label: "Biología",      Icon: Leaf,          desc: "Células, genética, ecosistemas" },
  { value: "fisica",      label: "Física",        Icon: Zap,           desc: "Mecánica, termodinámica, Tippens" },
  { value: "ingles",      label: "Inglés",        Icon: Languages,     desc: "Grammar, vocabulary, writing" },
  { value: "otra",        label: "Otra materia",  Icon: BookOpen,      desc: "Historia, cívica, y más" },
];

const DOC_TYPES = [
  { value: "conceptos", label: "Guía de conceptos", Icon: FileText,  desc: "Teoría, definiciones y ejemplos estructurados" },
  { value: "practica",  label: "Resolución de práctica", Icon: PenTool, desc: "Problemas resueltos paso a paso" },
];

const TIME_MODES = [
  { value: "crisis",  label: "Crisis",  sublabel: "Mismo día",  color: "#DC2626" },
  { value: "urgente", label: "Urgente", sublabel: "1 día",      color: "#EA580C" },
  { value: "corto",   label: "Corto",   sublabel: "2 días",     color: "#CA8A04" },
  { value: "normal",  label: "Normal",  sublabel: "3+ días",    color: "#16A34A" },
];

// ─── FILE UTILS ───────────────────────────────
async function extractPdfText(file) {
  try {
    const pdfjsLib = await import("https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.mjs");
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.mjs";
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(" ") + "\n";
    }
    return text.trim() || null;
  } catch { return null; }
}

async function readFileAsText(file) {
  if (file.type === "text/plain") return await file.text();
  if (file.type === "application/pdf") return await extractPdfText(file) || "No se pudo extraer texto del PDF. Por favor pega el texto manualmente.";
  if (file.type.startsWith("image/")) return `[Imagen: ${file.name}]\nDescribe el contenido de esta imagen o pega el texto relevante.`;
  return await file.text().catch(() => "Archivo no legible. Pega el texto manualmente.");
}

// ─── LANDING ──────────────────────────────────
function LandingPage({ onStart }) {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#FAFAF8", minHeight: "100vh", color: "#111827" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .lnav{background:white;border-bottom:1px solid #E5E7EB;padding:16px 0;position:sticky;top:0;z-index:100;}
        .lnav-i{max-width:1200px;margin:0 auto;padding:0 24px;display:flex;justify-content:space-between;align-items:center;}
        .logo{font-family:'Crimson Pro',serif;font-size:24px;font-weight:700;color:#2563EB;letter-spacing:-0.5px;}
        .ncta{background:#2563EB;color:white;border:none;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:background 0.2s;font-family:'DM Sans',sans-serif;}
        .ncta:hover{background:#1D4ED8;}
        .hero{background:linear-gradient(160deg,#EFF6FF 0%,#FFFFFF 60%);padding:100px 24px 80px;}
        .hero-i{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;}
        .htag{display:inline-block;background:#DBEAFE;color:#1D4ED8;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;margin-bottom:20px;letter-spacing:0.5px;text-transform:uppercase;}
        .htitle{font-family:'Crimson Pro',serif;font-size:52px;font-weight:700;line-height:1.1;color:#0F172A;margin-bottom:20px;letter-spacing:-1px;}
        .htitle em{font-style:italic;color:#2563EB;}
        .hsub{font-size:17px;color:#6B7280;line-height:1.7;margin-bottom:36px;}
        .hbtn{background:#2563EB;color:white;border:none;padding:16px 36px;border-radius:10px;font-size:16px;font-weight:600;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 14px rgba(37,99,235,0.3);font-family:'DM Sans',sans-serif;}
        .hbtn:hover{background:#1D4ED8;transform:translateY(-1px);}
        .dbox{background:white;border-radius:16px;border:1px solid #E5E7EB;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.08);}
        .dhead{background:#F9FAFB;border-bottom:1px solid #E5E7EB;padding:12px 16px;display:flex;align-items:center;gap:8px;}
        .ddot{width:10px;height:10px;border-radius:50%;}
        .dlbl{font-size:11px;color:#9CA3AF;margin-left:8px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;}
        .dcont{padding:24px;}
        .dbefore{font-size:13px;color:#92400E;line-height:1.7;background:#FEF9C3;padding:16px;border-radius:8px;border-left:3px solid #FCD34D;margin-bottom:16px;}
        .darrow{text-align:center;font-size:13px;font-weight:600;margin:12px 0;color:#2563EB;letter-spacing:0.5px;text-transform:uppercase;}
        .datitle{font-family:'Crimson Pro',serif;font-size:20px;font-weight:700;color:#0F172A;margin-bottom:8px;}
        .daitem{font-size:13px;color:#374151;padding:8px 12px;background:#EFF6FF;border-radius:6px;margin-bottom:6px;border-left:3px solid #2563EB;}
        .stats{background:white;border-top:1px solid #E5E7EB;border-bottom:1px solid #E5E7EB;padding:60px 24px;}
        .stats-i{max-width:800px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:40px;text-align:center;}
        .snum{font-family:'Crimson Pro',serif;font-size:48px;font-weight:700;color:#2563EB;line-height:1;margin-bottom:8px;}
        .sdesc{font-size:14px;color:#6B7280;line-height:1.5;}
        .feats{padding:80px 24px;max-width:1100px;margin:0 auto;}
        .ftitle{font-family:'Crimson Pro',serif;font-size:38px;font-weight:700;color:#0F172A;text-align:center;margin-bottom:48px;letter-spacing:-0.5px;}
        .fgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
        .fcard{background:white;border:1px solid #E5E7EB;border-radius:12px;padding:28px;transition:all 0.2s;}
        .fcard:hover{border-color:#BFDBFE;box-shadow:0 4px 20px rgba(37,99,235,0.08);transform:translateY(-2px);}
        .ficon{width:40px;height:40px;background:#EFF6FF;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;color:#2563EB;}
        .ftname{font-size:15px;font-weight:600;color:#111827;margin-bottom:6px;}
        .fdesc{font-size:13px;color:#6B7280;line-height:1.6;}
        .ctas{background:linear-gradient(135deg,#1E40AF 0%,#2563EB 100%);padding:80px 24px;text-align:center;}
        .ctitle{font-family:'Crimson Pro',serif;font-size:44px;font-weight:700;color:white;margin-bottom:16px;letter-spacing:-0.5px;}
        .csub{font-size:17px;color:rgba(255,255,255,0.8);margin-bottom:36px;}
        .cbtn{background:white;color:#1D4ED8;border:none;padding:16px 44px;border-radius:10px;font-size:16px;font-weight:700;cursor:pointer;transition:all 0.2s;font-family:'DM Sans',sans-serif;}
        .cbtn:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(0,0,0,0.2);}
        .foot{background:#0F172A;color:#9CA3AF;padding:32px 24px;text-align:center;font-size:13px;font-family:'DM Sans',sans-serif;}
        @media(max-width:768px){.hero-i{grid-template-columns:1fr;gap:40px;}.htitle{font-size:36px;}.stats-i{grid-template-columns:1fr;gap:24px;}.fgrid{grid-template-columns:1fr;}.ctitle{font-size:30px;}}
      `}</style>

      <nav className="lnav"><div className="lnav-i">
        <span className="logo">Synthesis</span>
        <button className="ncta" onClick={onStart}>Crear guía gratis →</button>
      </div></nav>

      <section className="hero"><div className="hero-i">
        <div>
          <span className="htag">Para estudiantes de 12vo · Panamá</span>
          <h1 className="htitle">Tus apuntes caóticos,<br />convertidos en <em>guías perfectas</em></h1>
          <p className="hsub">Pega tus apuntes, elige la materia y en segundos tienes una guía estructurada con conceptos clave, ejemplos y preguntas de práctica.</p>
          <button className="hbtn" onClick={onStart}>Generar mi primera guía →</button>
        </div>
        <div>
          <div className="dbox">
            <div className="dhead">
              <div className="ddot" style={{background:"#FCD34D"}}/>
              <div className="ddot" style={{background:"#6EE7B7"}}/>
              <div className="ddot" style={{background:"#93C5FD"}}/>
              <span className="dlbl">Antes → Después</span>
            </div>
            <div className="dcont">
              <div className="dbefore">"newton dijo algo de inercia... la segunda ley es F=ma creo... accion y reaccion? hay 3 leyes... el profe dijo que era importante para el parcial..."</div>
              <div className="darrow">— Synthesis IA —</div>
              <div className="datitle">Leyes de Newton</div>
              <div className="daitem"><strong>Ley 1:</strong> Inercia — sin fuerza, sin cambio</div>
              <div className="daitem"><strong>Ley 2:</strong> F = m·a — la más importante para el examen</div>
              <div className="daitem"><strong>Ley 3:</strong> Acción = Reacción opuesta</div>
            </div>
          </div>
        </div>
      </div></section>

      <section className="stats"><div className="stats-i">
        <div><div className="snum">6</div><div className="sdesc">Materias con prompts especializados</div></div>
        <div><div className="snum">30s</div><div className="sdesc">Tiempo promedio de generación</div></div>
        <div><div className="snum">100%</div><div className="sdesc">Basado en tus propios apuntes</div></div>
      </div></section>

      <section className="feats"><h2 className="ftitle">Diseñado para el examen panameño de 12vo</h2>
        <div className="fgrid">{SUBJECTS.map(s => {
          const Icon = s.Icon;
          return (
            <div key={s.value} className="fcard">
              <div className="ficon"><Icon size={20}/></div>
              <div className="ftname">{s.label}</div>
              <div className="fdesc">{s.desc}</div>
            </div>
          );
        })}</div>
      </section>

      <section className="ctas">
        <h2 className="ctitle">¿Listo para estudiar diferente?</h2>
        <p className="csub">Empieza gratis. Sin registro. Sin complicaciones.</p>
        <button className="cbtn" onClick={onStart}>Crear mi guía ahora →</button>
      </section>
      <footer className="foot">
        <span style={{color:"#3B82F6",fontWeight:700,fontFamily:"'Crimson Pro',serif",fontSize:16}}>Synthesis</span>
        {" "}— Hecho para estudiantes de 12vo · 2026
      </footer>
    </div>
  );
}

// ─── CREATE PAGE ──────────────────────────────
function CreatePage({ onBack, onGuideReady }) {
  const [subject,    setSubject]    = useState("");
  const [docType,    setDocType]    = useState("conceptos");
  const [timeMode,   setTimeMode]   = useState("normal");
  const [notes,      setNotes]      = useState("");
  const [files,      setFiles]      = useState([]); // [{name, status: 'reading'|'done'|'error'}]
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading,  setIsLoading]  = useState(false);
  const [error,      setError]      = useState("");
  const fileRef = useRef(null);

  const timeModeIndex = TIME_MODES.findIndex(t => t.value === timeMode);

  const processFiles = useCallback(async (incoming) => {
    const entries = incoming.map(f => ({ name: f.name, status: "reading" }));
    setFiles(prev => [...prev, ...entries]);
    let combined = notes;
    for (let i = 0; i < incoming.length; i++) {
      const file = incoming[i];
      const text = await readFileAsText(file);
      combined += (combined ? "\n\n" : "") + `--- ${file.name} ---\n${text}`;
      setFiles(prev => prev.map(f => f.name === file.name ? { ...f, status: "done" } : f));
    }
    setNotes(combined);
  }, [notes]);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length) await processFiles(dropped);
  }, [processFiles]);

  const handleFileChange = async (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length) await processFiles(selected);
    e.target.value = "";
  };

  const removeFile = (name) => {
    setFiles(prev => prev.filter(f => f.name !== name));
  };

  const handleGenerate = async () => {
    if (!subject)      { setError("Selecciona una materia."); return; }
    if (!notes.trim()) { setError("Agrega tus apuntes o sube un archivo."); return; }
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notes.trim(), subject, docType, timeMode }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || `Error ${res.status}`);
      }
      const data = await res.json();
      onGuideReady(data.html, subject, docType);
    } catch (err) {
      setError(err.message === "Failed to fetch" ? "No se pudo conectar al servidor." : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedSubject = SUBJECTS.find(s => s.value === subject);

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      background: "#F8F9FB",
      minHeight: "100vh",
      color: "#111827",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        * { box-sizing: border-box; }

        /* ── HEADER ── */
        .cr-header {
          background: white;
          border-bottom: 1px solid #E5E7EB;
          padding: 0 24px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .cr-back {
          display: flex; align-items: center; gap: 8px;
          background: none; border: none; color: #6B7280;
          font-size: 14px; font-weight: 500; cursor: pointer;
          padding: 6px 10px; border-radius: 6px; transition: all .15s;
          font-family: 'DM Sans', sans-serif;
        }
        .cr-back:hover { background: #F3F4F6; color: #111827; }
        .cr-logo { font-family: 'Crimson Pro', serif; font-size: 20px; font-weight: 700; color: #2563EB; }
        .cr-step { font-size: 12px; color: #9CA3AF; font-weight: 500; }

        /* ── LAYOUT ── */
        .cr-body { max-width: 760px; margin: 0 auto; padding: 48px 24px 80px; }
        .cr-title { font-family: 'Crimson Pro', serif; font-size: 32px; font-weight: 700; color: #0F172A; margin-bottom: 6px; letter-spacing: -.5px; }
        .cr-sub { font-size: 15px; color: #6B7280; margin-bottom: 44px; }

        /* ── SECTION LABEL ── */
        .sec-label {
          font-size: 11px; font-weight: 600; text-transform: uppercase;
          letter-spacing: .8px; color: #9CA3AF; margin-bottom: 12px;
          display: flex; align-items: center; gap: 8px;
        }
        .sec-label::after { content: ''; flex: 1; height: 1px; background: #E5E7EB; }
        .sec-wrap { margin-bottom: 36px; }

        /* ── SUBJECT GRID ── */
        .subj-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .subj-card {
          background: white;
          border: 1.5px solid #E5E7EB;
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all .15s;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .subj-card:hover { border-color: #93C5FD; background: #F8FBFF; }
        .subj-card.active {
          border-color: #2563EB;
          background: #EFF6FF;
          box-shadow: 0 0 0 3px rgba(37,99,235,.08);
        }
        .subj-icon {
          width: 36px; height: 36px; border-radius: 8px;
          background: #F1F5F9; display: flex; align-items: center; justify-content: center;
          color: #64748B; transition: all .15s; flex-shrink: 0;
        }
        .subj-card.active .subj-icon { background: #DBEAFE; color: #2563EB; }
        .subj-name { font-size: 13px; font-weight: 600; color: #111827; line-height: 1.2; }
        .subj-desc { font-size: 11px; color: #9CA3AF; line-height: 1.4; }

        /* ── DOC TYPE TOGGLE ── */
        .dtype-toggle {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #F1F5F9;
          border-radius: 10px;
          padding: 4px;
          gap: 4px;
        }
        .dtype-opt {
          border: none; background: transparent; cursor: pointer;
          border-radius: 8px; padding: 12px 16px;
          display: flex; align-items: center; gap: 10px;
          transition: all .15s; font-family: 'DM Sans', sans-serif;
        }
        .dtype-opt:hover { background: rgba(255,255,255,.6); }
        .dtype-opt.active {
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,.1), 0 0 0 1px rgba(0,0,0,.04);
        }
        .dtype-icon { color: #94A3B8; transition: color .15s; }
        .dtype-opt.active .dtype-icon { color: #2563EB; }
        .dtype-text { text-align: left; }
        .dtype-name { font-size: 13px; font-weight: 600; color: #374151; display: block; }
        .dtype-desc-text { font-size: 11px; color: #9CA3AF; display: block; margin-top: 1px; }

        /* ── TIME TRACK ── */
        .time-track-wrap { padding: 4px 0; }
        .time-track {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0;
          background: #F1F5F9;
          border-radius: 10px;
          padding: 4px;
        }
        .time-opt {
          flex: 1; border: none; background: transparent; cursor: pointer;
          padding: 10px 8px; border-radius: 8px; transition: all .15s;
          font-family: 'DM Sans', sans-serif; position: relative;
          display: flex; flex-direction: column; align-items: center; gap: 3px;
        }
        .time-opt.active {
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,.1), 0 0 0 1px rgba(0,0,0,.04);
        }
        .time-dot {
          width: 8px; height: 8px; border-radius: 50%;
          border: 2px solid #D1D5DB; background: transparent;
          transition: all .15s;
        }
        .time-opt.active .time-dot { border-color: var(--tc); background: var(--tc); }
        .time-main { font-size: 13px; font-weight: 600; color: #374151; }
        .time-sub { font-size: 11px; color: #9CA3AF; }
        .time-opt.active .time-main { color: #111827; }

        /* ── URGENCY BAR ── */
        .urgency-bar {
          margin-top: 10px;
          height: 3px;
          background: #E5E7EB;
          border-radius: 2px;
          overflow: hidden;
        }
        .urgency-fill {
          height: 100%;
          border-radius: 2px;
          transition: width .3s ease, background .3s ease;
        }

        /* ── DROP ZONE ── */
        .dropzone {
          border: 1.5px dashed #CBD5E1;
          border-radius: 12px;
          padding: 28px 24px;
          text-align: center;
          cursor: pointer;
          transition: all .15s;
          background: white;
          margin-bottom: 10px;
        }
        .dropzone:hover, .dropzone.dragging {
          border-color: #2563EB;
          background: #F0F7FF;
        }
        .dz-icon-wrap {
          width: 44px; height: 44px; border-radius: 10px;
          background: #F1F5F9; display: flex; align-items: center;
          justify-content: center; margin: 0 auto 12px; color: #64748B;
          transition: all .15s;
        }
        .dropzone:hover .dz-icon-wrap, .dropzone.dragging .dz-icon-wrap {
          background: #DBEAFE; color: #2563EB;
        }
        .dz-title { font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 4px; }
        .dz-sub { font-size: 12px; color: #9CA3AF; }
        .dz-types { font-size: 11px; color: #CBD5E1; margin-top: 8px; letter-spacing: .3px; }

        /* ── FILE CHIPS ── */
        .file-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
        .file-item {
          display: flex; align-items: center; gap: 10px;
          background: white; border: 1px solid #E5E7EB;
          border-radius: 8px; padding: 10px 12px;
        }
        .file-item-icon { color: #2563EB; flex-shrink: 0; }
        .file-item-name { font-size: 13px; color: #374151; font-weight: 500; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .file-item-status { font-size: 11px; color: #9CA3AF; flex-shrink: 0; }
        .file-item-remove { background: none; border: none; cursor: pointer; color: #CBD5E1; padding: 2px; border-radius: 4px; transition: color .15s; flex-shrink: 0; }
        .file-item-remove:hover { color: #EF4444; }

        /* ── NOTES ── */
        .notes-area {
          width: 100%; padding: 14px 16px;
          border: 1.5px solid #E2E8F0;
          border-radius: 10px; font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          background: white; resize: vertical;
          min-height: 160px; line-height: 1.7;
          color: #111827; transition: border-color .15s;
        }
        .notes-area::placeholder { color: #CBD5E1; }
        .notes-area:focus { outline: none; border-color: #2563EB; box-shadow: 0 0 0 3px rgba(37,99,235,.08); }
        .notes-footer { display: flex; justify-content: space-between; margin-top: 6px; }
        .ncount { font-size: 11px; color: #CBD5E1; }
        .nwarn  { font-size: 11px; color: #F59E0B; }

        /* ── ERROR ── */
        .err-box {
          display: flex; align-items: flex-start; gap: 10px;
          background: #FEF2F2; border: 1px solid #FECACA;
          border-radius: 8px; padding: 12px 14px;
          font-size: 13px; color: #B91C1C; margin-bottom: 16px;
        }

        /* ── GENERATE BUTTON ── */
        .gen-btn {
          width: 100%; padding: 16px;
          background: #2563EB; color: white; border: none;
          border-radius: 10px; font-size: 15px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all .15s; display: flex; align-items: center;
          justify-content: center; gap: 10px; letter-spacing: .1px;
        }
        .gen-btn:hover:not(:disabled) { background: #1D4ED8; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(37,99,235,.3); }
        .gen-btn:disabled { opacity: .55; cursor: not-allowed; transform: none; }

        /* ── LOADING OVERLAY ── */
        .loading-overlay {
          position: fixed; inset: 0; background: rgba(248,249,251,.97);
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; z-index: 200; gap: 16px;
        }
        .loading-ring {
          width: 52px; height: 52px;
          border: 3px solid #DBEAFE;
          border-top-color: #2563EB;
          border-radius: 50%;
          animation: spin .75s linear infinite;
        }
        .loading-title { font-family: 'Crimson Pro', serif; font-size: 24px; font-weight: 700; color: #0F172A; }
        .loading-sub { font-size: 13px; color: #6B7280; max-width: 280px; text-align: center; line-height: 1.6; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media(max-width: 600px) {
          .subj-grid { grid-template-columns: repeat(2,1fr); }
          .dtype-toggle { grid-template-columns: 1fr; }
          .time-main { font-size: 12px; }
          .time-sub { display: none; }
        }
      `}</style>

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-ring"/>
          <div className="loading-title">Generando tu guía…</div>
          <div className="loading-sub">
            {selectedSubject ? `Aplicando el prompt especializado de ${selectedSubject.label}.` : "La IA está estructurando tus apuntes."}
            {" "}Esto puede tomar hasta 40 segundos.
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="cr-header">
        <button className="cr-back" onClick={onBack}>
          <ArrowLeft size={15}/> Inicio
        </button>
        <span className="cr-logo">Synthesis</span>
        <span className="cr-step">Nueva guía</span>
      </header>

      <div className="cr-body">
        <h1 className="cr-title">Crear guía de estudio</h1>
        <p className="cr-sub">Configura las opciones y pega tus apuntes.</p>

        {/* ── 1. MATERIA ── */}
        <div className="sec-wrap">
          <div className="sec-label">Materia</div>
          <div className="subj-grid">
            {SUBJECTS.map(s => {
              const Icon = s.Icon;
              const active = subject === s.value;
              return (
                <div
                  key={s.value}
                  className={`subj-card${active ? " active" : ""}`}
                  onClick={() => setSubject(s.value)}
                >
                  <div className="subj-icon"><Icon size={18}/></div>
                  <div>
                    <div className="subj-name">{s.label}</div>
                    <div className="subj-desc">{s.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 2. TIPO ── */}
        <div className="sec-wrap">
          <div className="sec-label">Tipo de documento</div>
          <div className="dtype-toggle">
            {DOC_TYPES.map(d => {
              const Icon = d.Icon;
              const active = docType === d.value;
              return (
                <button
                  key={d.value}
                  className={`dtype-opt${active ? " active" : ""}`}
                  onClick={() => setDocType(d.value)}
                >
                  <span className="dtype-icon"><Icon size={18}/></span>
                  <span className="dtype-text">
                    <span className="dtype-name">{d.label}</span>
                    <span className="dtype-desc-text">{d.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 3. TIEMPO ── */}
        <div className="sec-wrap">
          <div className="sec-label">Tiempo disponible</div>
          <div className="time-track-wrap">
            <div className="time-track">
              {TIME_MODES.map(t => {
                const active = timeMode === t.value;
                return (
                  <button
                    key={t.value}
                    className={`time-opt${active ? " active" : ""}`}
                    style={{ "--tc": t.color }}
                    onClick={() => setTimeMode(t.value)}
                  >
                    <div className="time-dot"/>
                    <span className="time-main">{t.label}</span>
                    <span className="time-sub">{t.sublabel}</span>
                  </button>
                );
              })}
            </div>
            <div className="urgency-bar">
              <div className="urgency-fill" style={{
                width: `${(timeModeIndex + 1) * 25}%`,
                background: TIME_MODES[timeModeIndex]?.color || "#16A34A",
              }}/>
            </div>
          </div>
        </div>

        {/* ── 4. ARCHIVOS ── */}
        <div className="sec-wrap">
          <div className="sec-label">Subir apuntes</div>

          {files.length > 0 && (
            <div className="file-list">
              {files.map(f => (
                <div key={f.name} className="file-item">
                  <span className="file-item-icon">
                    {f.status === "reading"
                      ? <Loader2 size={15} style={{animation:"spin .7s linear infinite"}}/>
                      : <CheckCircle size={15}/>
                    }
                  </span>
                  <span className="file-item-name">{f.name}</span>
                  <span className="file-item-status">{f.status === "reading" ? "Procesando…" : "Listo"}</span>
                  <button className="file-item-remove" onClick={() => removeFile(f.name)}>
                    <X size={14}/>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div
            className={`dropzone${isDragging ? " dragging" : ""}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <div className="dz-icon-wrap"><Upload size={20}/></div>
            <div className="dz-title">Arrastra archivos aquí o haz clic</div>
            <div className="dz-sub">PDF, imagen de apuntes o archivo de texto</div>
            <div className="dz-types">PDF · JPG · PNG · WEBP · TXT</div>
          </div>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".pdf,.txt,.jpg,.jpeg,.png,.webp"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>

        {/* ── 5. TEXTO ── */}
        <div className="sec-wrap">
          <div className="sec-label">
            {files.length > 0 ? "Texto extraído (puedes editar)" : "O pega el texto directamente"}
          </div>
          <textarea
            className="notes-area"
            placeholder="Pega aquí tus apuntes, el contenido del libro, o el enunciado de los problemas que quieres resolver…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
          <div className="notes-footer">
            <span className="ncount">{notes.length.toLocaleString()} caracteres</span>
            {notes.length > 0 && notes.length < 80 && (
              <span className="nwarn">Agrega más contenido para mejores resultados</span>
            )}
          </div>
        </div>

        {error && (
          <div className="err-box">
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }}/>
            {error}
          </div>
        )}

        <button className="gen-btn" onClick={handleGenerate} disabled={isLoading}>
          {isLoading
            ? <><Loader2 size={17} style={{ animation: "spin .7s linear infinite" }}/> Generando…</>
            : <>Generar guía de estudio</>
          }
        </button>
      </div>
    </div>
  );
}

// ─── GUIDE VIEWER ─────────────────────────────
function GuideViewer({ html, subject, docType, onBack, onNew }) {
  const iframeRef = useRef(null);
  const subjectLabel = SUBJECTS.find(s => s.value === subject)?.label || subject;
  const docLabel     = DOC_TYPES.find(d => d.value === docType)?.label  || docType;

  const handlePrint = () => iframeRef.current?.contentWindow?.print();
  const handleDownload = () => {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `synthesis-${subject}-${docType}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: "#F8F9FB", height: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        *{box-sizing:border-box;}
        .vh{background:white;border-bottom:1px solid #E5E7EB;height:56px;display:flex;align-items:center;padding:0 20px;justify-content:space-between;flex-shrink:0;}
        .vhl{display:flex;align-items:center;gap:14px;}
        .vback{display:flex;align-items:center;gap:6px;background:none;border:1px solid #E5E7EB;color:#6B7280;font-size:13px;font-weight:500;cursor:pointer;padding:6px 12px;border-radius:7px;transition:all .15s;font-family:'DM Sans',sans-serif;}
        .vback:hover{border-color:#2563EB;color:#2563EB;}
        .vlogo{font-family:'Crimson Pro',serif;font-size:20px;font-weight:700;color:#2563EB;}
        .vmeta{display:flex;flex-direction:column;gap:1px;}
        .vmeta-s{font-size:11px;color:#9CA3AF;}
        .vmeta-t{font-size:13px;font-weight:600;color:#111827;}
        .vact{display:flex;gap:8px;}
        .va-btn{display:flex;align-items:center;gap:6px;background:none;border:1px solid #E5E7EB;color:#374151;font-size:13px;font-weight:500;cursor:pointer;padding:7px 14px;border-radius:7px;transition:all .15s;font-family:'DM Sans',sans-serif;}
        .va-btn:hover{border-color:#2563EB;color:#2563EB;background:#EFF6FF;}
        .va-primary{display:flex;align-items:center;gap:6px;background:#2563EB;color:white;border:none;font-size:13px;font-weight:600;cursor:pointer;padding:7px 16px;border-radius:7px;transition:background .15s;font-family:'DM Sans',sans-serif;}
        .va-primary:hover{background:#1D4ED8;}
        iframe{flex:1;border:none;width:100%;}
        @media(max-width:600px){.vmeta{display:none;}.vact{gap:6px;}.va-btn,.va-primary{padding:7px 10px;font-size:12px;}}
        @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>

      <header className="vh">
        <div className="vhl">
          <button className="vback" onClick={onBack}><ArrowLeft size={14}/> Inicio</button>
          <span className="vlogo">Synthesis</span>
          <div className="vmeta">
            <span className="vmeta-s">{subjectLabel} · {docLabel}</span>
            <span className="vmeta-t">Guía generada</span>
          </div>
        </div>
        <div className="vact">
          <button className="va-btn" onClick={handlePrint}><Printer size={14}/> Imprimir</button>
          <button className="va-btn" onClick={handleDownload}><Download size={14}/> Descargar</button>
          <button className="va-primary" onClick={onNew}><Plus size={14}/> Nueva guía</button>
        </div>
      </header>

      <iframe
        ref={iframeRef}
        srcDoc={html}
        title="Guía de estudio"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────
export default function App() {
  const [view,    setView]    = useState("landing");
  const [html,    setHtml]    = useState("");
  const [subject, setSubject] = useState("");
  const [docType, setDocType] = useState("conceptos");

  const handleGuideReady = (h, s, d) => { setHtml(h); setSubject(s); setDocType(d); setView("viewer"); };

  if (view === "landing") return <LandingPage onStart={() => setView("create")} />;
  if (view === "create")  return <CreatePage  onBack={() => setView("landing")} onGuideReady={handleGuideReady} />;
  if (view === "viewer")  return <GuideViewer html={html} subject={subject} docType={docType} onBack={() => setView("landing")} onNew={() => setView("create")} />;
}
