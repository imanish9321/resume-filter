import { useState, useRef, useEffect, useCallback } from "react";
import * as mammoth from "mammoth";

/* ── Design tokens ──────────────────────────────────────────────────────── */
const T = {
  purple: { solid: "#6C5CE7", light: "#F0EEFF", mid: "#BDB5F8", dark: "#4A3CC7", text: "#2D2580" },
  teal:   { solid: "#00B894", light: "#E0FAF4", mid: "#55E6C1", dark: "#007A63", text: "#004D3E" },
  coral:  { solid: "#E17055", light: "#FEF0EC", mid: "#F0A999", dark: "#B34F34", text: "#7A2E1A" },
  blue:   { solid: "#0984E3", light: "#E8F4FD", mid: "#74B9FF", dark: "#0652A0", text: "#033670" },
  amber:  { solid: "#FDCB6E", light: "#FFFBEE", mid: "#FDE69A", dark: "#C8882A", text: "#7A5200" },
  slate:  { solid: "#636E72", light: "#F5F6FA", mid: "#B2BEC3", dark: "#2D3436", text: "#1e272e" },
};

const TIERS = [
  { label: "IIT / IISc",               score: 100, color: T.purple },
  { label: "NIT / BITS",               score: 80,  color: T.teal   },
  { label: "Central University",        score: 70,  color: T.blue   },
  { label: "State University",          score: 50,  color: T.amber  },
  { label: "District / Private College",score: 30,  color: T.coral  },
];

const FEATURES = [
  { icon: "🎯", label: "Career Goal Match",    desc: "Aligns candidate objective with role requirements", color: T.purple },
  { icon: "⚡", label: "Skills Analysis",       desc: "Matches technical and soft skills against JD",     color: T.teal   },
  { icon: "🎓", label: "College Tier Scoring",  desc: "IIT → NIT → Central → State → District",          color: T.blue   },
  { icon: "📊", label: "Visual Score Report",   desc: "Colourful charts with instant hire recommendation",color: T.coral  },
];

const STEPS = [
  { num: "01", label: "Upload JD",       desc: "Drop your job description — PDF, DOCX, or TXT",   color: T.purple },
  { num: "02", label: "Upload Resume",   desc: "Add the candidate's resume in any format",          color: T.teal   },
  { num: "03", label: "AI Screening",    desc: "AI reads, compares and scores in seconds",          color: T.blue   },
  { num: "04", label: "Get Results",     desc: "Shortlist, Consider, or Reject — full breakdown",   color: T.coral  },
];

/* ── Utility components ─────────────────────────────────────────────────── */
function AnimBar({ pct, color, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), delay); return () => clearTimeout(t); }, [pct, delay]);
  return (
    <div style={{ background: "#EAECEF", borderRadius: 99, height: 10, overflow: "hidden", flex: 1 }}>
      <div style={{
        height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${color}99, ${color})`,
        width: `${w}%`, transition: "width 1.4s cubic-bezier(.16,1,.3,1)"
      }} />
    </div>
  );
}

function Dial({ pct, color, size = 120, delay = 0, label }) {
  const [v, setV] = useState(0);
  useEffect(() => { const t = setTimeout(() => setV(pct), delay); return () => clearTimeout(t); }, [pct, delay]);
  const r = size * 0.37, circ = 2 * Math.PI * r;
  const grade = pct >= 75 ? "Excellent" : pct >= 55 ? "Good" : pct >= 35 ? "Fair" : "Low";
  const gradeColor = pct >= 75 ? T.teal.solid : pct >= 55 ? T.blue.solid : pct >= 35 ? T.amber.dark : T.coral.solid;
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ position: "relative", display: "inline-block" }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#EEF0F3" strokeWidth={size*0.08} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={size*0.08}
            strokeDasharray={`${circ * v / 100} ${circ}`} strokeLinecap="round"
            transform={`rotate(-90 ${size/2} ${size/2})`}
            style={{ transition: "stroke-dasharray 1.6s cubic-bezier(.16,1,.3,1)", filter: `drop-shadow(0 0 6px ${color}66)` }} />
          <text x={size/2} y={size/2 + 6} textAnchor="middle" fontSize={size*0.2} fontWeight="700" fill={color} fontFamily="Georgia, serif">{Math.round(v)}</text>
          <text x={size/2} y={size/2 + 18} textAnchor="middle" fontSize={size*0.1} fill="#8a94a6" fontFamily="system-ui">/ 100</text>
        </svg>
      </div>
      {label && <p style={{ margin: "8px 0 2px", fontSize: 12, fontWeight: 600, color: "#2D3436", letterSpacing: "0.02em" }}>{label}</p>}
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: gradeColor, textTransform: "uppercase", background: gradeColor + "18", padding: "2px 8px", borderRadius: 99 }}>{grade}</span>
    </div>
  );
}

function DropZone({ label, sub, file, onFile, accent, stepNum }) {
  const ref = useRef(); const [drag, setDrag] = useState(false);
  const onDrop = e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); };
  return (
    <div
      onClick={() => ref.current.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}
      style={{
        border: `2px dashed ${file ? accent.solid : drag ? accent.mid : "#D8DCE6"}`,
        borderRadius: 18,
        padding: "28px 20px",
        textAlign: "center",
        cursor: "pointer",
        background: file ? accent.light : drag ? accent.light : "#FAFBFC",
        transition: "all .25s ease",
        transform: drag ? "scale(1.01)" : "scale(1)",
        boxShadow: file ? `0 0 0 3px ${accent.mid}44` : drag ? `0 8px 24px ${accent.solid}22` : "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {drag && <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at center, ${accent.light}, transparent)`, pointerEvents: "none" }} />}
      <input ref={ref} type="file" accept=".pdf,.docx,.txt" style={{ display: "none" }} onChange={e => onFile(e.target.files[0])} />

      <div style={{
        width: 52, height: 52, borderRadius: 16, margin: "0 auto 14px",
        background: file ? accent.solid : `linear-gradient(135deg, ${accent.light}, ${accent.mid}44)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all .3s ease",
        boxShadow: file ? `0 6px 18px ${accent.solid}44` : "none"
      }}>
        <span style={{ fontSize: 22 }}>{file ? "✅" : stepNum === 1 ? "📋" : "📄"}</span>
      </div>

      {file ? (
        <>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: accent.dark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>{file.name}</p>
          <p style={{ margin: "5px 0 0", fontSize: 11, color: accent.solid, fontWeight: 500 }}>✓ Ready · Click to replace</p>
        </>
      ) : (
        <>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#2D3436" }}>{label}</p>
          <p style={{ margin: "5px 0 0", fontSize: 12, color: "#8a94a6" }}>{sub}</p>
          <p style={{ margin: "8px 0 0", fontSize: 11, color: accent.solid, fontWeight: 600 }}>Drop here or click to browse</p>
        </>
      )}
    </div>
  );
}

function Tag({ children, variant = "matched" }) {
  const styles = {
    matched: { bg: T.teal.solid,  text: "#fff" },
    missing: { bg: T.coral.solid, text: "#fff" },
    neutral: { bg: "#EEF0F3",     text: "#636E72" },
  };
  const s = styles[variant];
  return (
    <span style={{
      background: s.bg, color: s.text,
      borderRadius: 99, padding: "4px 12px", fontSize: 11, fontWeight: 600,
      letterSpacing: "0.02em", display: "inline-block",
    }}>{children}</span>
  );
}

function StatCard({ val, label, color }) {
  return (
    <div style={{
      background: color.light, borderRadius: 18, padding: "22px 16px", textAlign: "center",
      border: `1.5px solid ${color.mid}66`, flex: 1,
      boxShadow: `0 2px 12px ${color.solid}12`
    }}>
      <p style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 800, color: color.solid, fontFamily: "Georgia, serif" }}>{val}</p>
      <p style={{ margin: 0, fontSize: 11, color: color.dark, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</p>
    </div>
  );
}

/* ── Text extraction ─────────────────────────────────────────────────────── */
async function extractText(file) {
  if (!file) return "";
  const n = file.name.toLowerCase();
  if (n.endsWith(".txt")) return new Promise(r => { const fr = new FileReader(); fr.onload = e => r(e.target.result); fr.readAsText(file); });
  if (n.endsWith(".docx")) return new Promise(async r => { try { const ab = await file.arrayBuffer(); const res = await mammoth.extractRawText({ arrayBuffer: ab }); r(res.value); } catch { r(""); } });
  if (n.endsWith(".pdf")) {
    return new Promise(async r => {
      const ab = await file.arrayBuffer();
      if (!window.pdfjsLib) { r(""); return; }
      const pdf = await window.pdfjsLib.getDocument({ data: ab }).promise;
      let t = "";
      for (let i = 1; i <= pdf.numPages; i++) { const pg = await pdf.getPage(i); const c = await pg.getTextContent(); t += c.items.map(s => s.str).join(" ") + "\n"; }
      r(t);
    });
  }
  return "";
}

/* ── Gemini API ──────────────────────────────────────────────────────────── */
async function callGemini(prompt) {
  const res = await fetch("http://192.168.1.254:8787/v1/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

/* ── Loading spinner overlay ─────────────────────────────────────────────── */
function LoadingOverlay({ resumeName }) {
  const [step, setStep] = useState(0);
  const steps = ["Reading job description…", "Parsing resume content…", "Matching skills against JD…", "Scoring career alignment…", "Generating final report…"];
  useEffect(() => {
    const id = setInterval(() => setStep(s => (s + 1) % steps.length), 1400);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(245,246,250,0.92)", backdropFilter: "blur(12px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 24 }}>
      <div style={{ position: "relative", width: 80, height: 80 }}>
        <svg width={80} height={80} viewBox="0 0 80 80" style={{ animation: "spin 1.4s linear infinite" }}>
          <circle cx={40} cy={40} r={34} fill="none" stroke="#EEF0F3" strokeWidth={8} />
          <circle cx={40} cy={40} r={34} fill="none" stroke={T.purple.solid} strokeWidth={8}
            strokeDasharray="60 154" strokeLinecap="round" transform="rotate(-90 40 40)" />
        </svg>
        <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>✨</span>
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 18, color: "#2D3436" }}>Analysing with Gemini AI</p>
        <p style={{ margin: 0, fontSize: 13, color: "#636E72" }}>{resumeName}</p>
      </div>
      <div style={{ background: "#fff", borderRadius: 14, padding: "14px 24px", border: "1px solid #EEF0F3", minWidth: 260, textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
        <p style={{ margin: 0, fontSize: 13, color: T.purple.solid, fontWeight: 600, transition: "opacity .3s" }}>
          {steps[step]}
        </p>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {steps.map((_, i) => (
          <div key={i} style={{ width: i === step ? 20 : 6, height: 6, borderRadius: 99, background: i === step ? T.purple.solid : "#D8DCE6", transition: "all .4s ease" }} />
        ))}
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ── Recommendation badge ─────────────────────────────────────────────────── */
const REC = {
  Shortlist: { emoji: "🟢", label: "Shortlist",    bg: T.teal.light,  border: T.teal.solid,  text: T.teal.dark,  headerBg: T.teal.solid  },
  Consider:  { emoji: "🟡", label: "Consider",     bg: T.amber.light, border: T.amber.dark,  text: T.amber.text, headerBg: T.amber.solid },
  Reject:    { emoji: "🔴", label: "Reject",       bg: T.coral.light, border: T.coral.solid, text: T.coral.dark, headerBg: T.coral.solid },
};

/* ── Page: Home ──────────────────────────────────────────────────────────── */
function HomePage({ onStart }) {
  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", color: "#2D3436" }}>

      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, ${T.purple.light} 0%, #EEF4FF 60%, ${T.teal.light} 100%)`,
        borderRadius: 24, padding: "52px 36px 44px", marginBottom: 28, position: "relative", overflow: "hidden"
      }}>
        {/* decorative blobs */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: T.purple.mid, opacity: 0.18, filter: "blur(1px)" }} />
        <div style={{ position: "absolute", bottom: -40, left: "38%", width: 160, height: 160, borderRadius: "50%", background: T.teal.mid, opacity: 0.18, filter: "blur(1px)" }} />
        <div style={{ position: "absolute", top: "30%", right: "20%", width: 80, height: 80, borderRadius: "50%", background: T.blue.mid, opacity: 0.15, filter: "blur(2px)" }} />

        <div style={{ position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: T.purple.solid, borderRadius: 99, padding: "5px 14px", marginBottom: 20, boxShadow: `0 4px 14px ${T.purple.solid}44` }}>
            <span style={{ fontSize: 13 }}>✨</span>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em" }}>Powered by Gemini AI</span>
          </div>
          <h1 style={{ margin: "0 0 14px", fontSize: 34, fontWeight: 800, color: T.purple.text, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            Resume Filter <span style={{ color: T.purple.solid }}>AI</span>
          </h1>
          <p style={{ margin: "0 0 6px", fontSize: 17, color: "#4A5568", maxWidth: 460, lineHeight: 1.6 }}>
            AI-powered resume screener for modern HR teams. Upload a JD and resume — get instant, objective shortlisting decisions.
          </p>
          <p style={{ margin: "0 0 30px", fontSize: 13, color: T.purple.solid, fontWeight: 600 }}>No more manual screening. No bias. Just data.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={onStart}
              style={{ background: T.purple.solid, color: "#fff", border: "none", borderRadius: 14, padding: "14px 30px", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: `0 6px 20px ${T.purple.solid}44`, transition: "transform .15s, box-shadow .15s", letterSpacing: "0.01em" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 10px 28px ${T.purple.solid}55`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 6px 20px ${T.purple.solid}44`; }}
            >
              Start screening →
            </button>
            <button
              onClick={onStart}
              style={{ background: "rgba(255,255,255,0.85)", color: T.purple.solid, border: `1.5px solid ${T.purple.mid}`, borderRadius: 14, padding: "14px 24px", fontSize: 15, fontWeight: 600, cursor: "pointer", backdropFilter: "blur(4px)" }}
            >
              See how it works
            </button>
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 28 }}>
        {FEATURES.map(f => (
          <div key={f.label} style={{
            background: "#fff", borderRadius: 18, padding: "22px 18px",
            border: `1.5px solid ${f.color.mid}44`,
            boxShadow: `0 2px 14px ${f.color.solid}0D`,
            transition: "transform .2s, box-shadow .2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${f.color.solid}22`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 2px 14px ${f.color.solid}0D`; }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 13, background: `linear-gradient(135deg, ${f.color.light}, ${f.color.mid}55)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, fontSize: 22, boxShadow: `0 2px 10px ${f.color.solid}22` }}>
              {f.icon}
            </div>
            <p style={{ margin: "0 0 5px", fontWeight: 700, fontSize: 14, color: "#1e272e" }}>{f.label}</p>
            <p style={{ margin: 0, fontSize: 12, color: "#636E72", lineHeight: 1.5 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div style={{ background: "#F8F9FD", borderRadius: 22, padding: "26px 24px", marginBottom: 24, border: "1.5px solid #EEF0F3" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <span style={{ fontSize: 16 }}>⚙️</span>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#2D3436" }}>How it works — 4 simple steps</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {STEPS.map((s, i) => (
            <div key={s.num} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{
                width: 38, height: 38, borderRadius: 12, background: s.color.solid,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                boxShadow: `0 4px 12px ${s.color.solid}44`, fontSize: 12, fontWeight: 800, color: "#fff", letterSpacing: "0.04em"
              }}>{s.num}</div>
              <div>
                <p style={{ margin: "0 0 3px", fontWeight: 700, fontSize: 13, color: "#2D3436" }}>{s.label}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#636E72", lineHeight: 1.5 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 26 }}>
        <StatCard val="< 10s"    label="Screening time"    color={T.teal}   />
        <StatCard val="3"        label="Scored criteria"   color={T.purple} />
        <StatCard val="100%"     label="Objective"         color={T.blue}   />
      </div>

      {/* CTA */}
      <button
        onClick={onStart}
        style={{
          width: "100%", background: `linear-gradient(135deg, ${T.purple.solid}, ${T.blue.solid})`,
          color: "#fff", border: "none", borderRadius: 16, padding: "18px", fontSize: 16, fontWeight: 700,
          cursor: "pointer", boxShadow: `0 6px 24px ${T.purple.solid}55`, letterSpacing: "0.01em",
          transition: "transform .15s, box-shadow .15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 10px 32px ${T.purple.solid}66`; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 6px 24px ${T.purple.solid}55`; }}
      >
        🚀 Start screening resumes for free
      </button>
    </div>
  );
}

/* ── Page: Tool ──────────────────────────────────────────────────────────── */
function ToolPage({ onBack, onResult }) {
  const [jd, setJd] = useState(null);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const analyze = async () => {
    if (!jd || !resume) { setErr("Please upload both files before screening."); return; }
    setErr(""); setLoading(true);
    try {
      const [jdTxt, resTxt] = await Promise.all([extractText(jd), extractText(resume)]);
      const prompt = `You are an expert HR analyst. Analyze this resume vs the job description. Return ONLY valid JSON, no markdown, no explanation.

JOB DESCRIPTION:
${jdTxt.slice(0, 3000)}

RESUME:
${resTxt.slice(0, 3000)}

Return exactly:
{"career_match":<0-100>,"career_summary":"<2 sentences>","skills_match":<0-100>,"skills_summary":"<2 sentences>","matched_skills":["..."],"missing_skills":["..."],"college_name":"<name or Not mentioned>","college_tier":"<IIT/IISc|NIT/BITS|Central University|State University|District/Private College|Not mentioned>","college_score":<100|80|70|50|30|0>,"overall_recommendation":"<Shortlist|Consider|Reject>","recommendation_reason":"<2 sentences>"}`;
      const raw = await callGemini(prompt);
      const jsonStart = raw.indexOf("{"), jsonEnd = raw.lastIndexOf("}");
      if (jsonStart === -1 || jsonEnd === -1) throw new Error("No JSON found in response");
      const result = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
      onResult(result, resume.name);
    } catch (e) {
      setErr("Analysis failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const ready = jd && resume;

  return (
    <>
      {loading && <LoadingOverlay resumeName={resume?.name} />}
      <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#2D3436" }}>

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 26, paddingBottom: 18, borderBottom: "1.5px solid #EEF0F3" }}>
          <button
            onClick={onBack}
            style={{ background: T.purple.light, border: "none", borderRadius: 10, padding: "8px 14px", cursor: "pointer", color: T.purple.solid, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, transition: "background .15s" }}
            onMouseEnter={e => e.currentTarget.style.background = T.purple.mid + "55"}
            onMouseLeave={e => e.currentTarget.style.background = T.purple.light}
          >
            ← Home
          </button>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: "#1e272e" }}>Resume Filter AI</p>
            <p style={{ margin: 0, fontSize: 12, color: "#8a94a6" }}>Upload JD + Resume to begin screening</p>
          </div>
        </div>

        {/* Progress indicator */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, alignItems: "center" }}>
          {[{ label: "Upload JD", done: !!jd }, { label: "Upload Resume", done: !!resume }, { label: "Screen", done: false }].map((s, i, arr) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8, flex: i < arr.length - 1 ? "1" : "none" }}>
              <div style={{
                width: 24, height: 24, borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center",
                background: s.done ? T.teal.solid : i === arr.length - 1 && ready ? T.purple.solid : "#EEF0F3",
                fontSize: 11, fontWeight: 700,
                color: s.done || (i === arr.length - 1 && ready) ? "#fff" : "#8a94a6",
                transition: "all .3s", boxShadow: s.done ? `0 2px 8px ${T.teal.solid}44` : "none",
                flexShrink: 0,
              }}>{s.done ? "✓" : i + 1}</div>
              <span style={{ fontSize: 11, fontWeight: 600, color: s.done ? T.teal.dark : "#8a94a6", whiteSpace: "nowrap" }}>{s.label}</span>
              {i < arr.length - 1 && <div style={{ flex: 1, height: 2, borderRadius: 99, background: s.done ? T.teal.mid : "#EEF0F3", transition: "background .4s", minWidth: 20 }} />}
            </div>
          ))}
        </div>

        {/* Upload zones */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 22 }}>
          <div>
            <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: T.purple.dark, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ background: T.purple.solid, color: "#fff", borderRadius: 6, padding: "1px 7px", fontSize: 11, fontWeight: 800 }}>1</span>
              Job Description
            </p>
            <DropZone label="Upload job description" sub="PDF, DOCX, or TXT" file={jd} onFile={setJd} accent={T.purple} stepNum={1} />
          </div>
          <div>
            <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: T.teal.dark, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ background: T.teal.solid, color: "#fff", borderRadius: 6, padding: "1px 7px", fontSize: 11, fontWeight: 800 }}>2</span>
              Candidate Resume
            </p>
            <DropZone label="Upload resume" sub="PDF, DOCX, or TXT" file={resume} onFile={setResume} accent={T.teal} stepNum={2} />
          </div>
        </div>

        {/* Error */}
        {err && (
          <div style={{ background: T.coral.light, border: `1.5px solid ${T.coral.mid}`, borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: T.coral.dark, display: "flex", alignItems: "center", gap: 8, fontWeight: 500 }}>
            ⚠️ {err}
          </div>
        )}

        {/* Analyze button */}
        <button
          onClick={analyze}
          disabled={!ready || loading}
          style={{
            width: "100%", padding: "16px", borderRadius: 16, border: "none",
            background: ready ? `linear-gradient(135deg, ${T.purple.solid}, ${T.blue.solid})` : "#E8EAEE",
            color: ready ? "#fff" : "#8a94a6",
            fontSize: 15, fontWeight: 700, cursor: ready ? "pointer" : "not-allowed",
            boxShadow: ready ? `0 6px 20px ${T.purple.solid}44` : "none",
            transition: "all .25s ease",
            letterSpacing: "0.01em",
          }}
        >
          ✨ Screen this resume
        </button>

        {/* Mini feature reminder */}
        <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { icon: "🎯", label: "Career match",  color: T.purple },
            { icon: "⚡", label: "Skills match",   color: T.teal   },
            { icon: "🎓", label: "College tier",   color: T.blue   },
          ].map(f => (
            <div key={f.label} style={{ background: f.color.light, borderRadius: 12, padding: "12px 10px", textAlign: "center", border: `1px solid ${f.color.mid}55` }}>
              <span style={{ fontSize: 18, display: "block", marginBottom: 5 }}>{f.icon}</span>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: f.color.dark }}>{f.label}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ── Page: Result ────────────────────────────────────────────────────────── */
function ResultPage({ result, resumeName, onNew }) {
  const rec = REC[result.overall_recommendation] || REC.Reject;
  const tierColor = TIERS.find(t => t.score === result.college_score)?.color || T.coral;
  const overall = Math.round((result.career_match + result.skills_match + result.college_score) / 3);

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#2D3436" }}>

      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 16, borderBottom: "1.5px solid #EEF0F3" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={onNew}
            style={{ background: T.purple.light, border: "none", borderRadius: 10, padding: "8px 14px", cursor: "pointer", color: T.purple.solid, fontSize: 13, fontWeight: 600 }}
          >← New</button>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#1e272e" }}>Screening Results</p>
            <p style={{ margin: 0, fontSize: 11, color: "#8a94a6", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{resumeName}</p>
          </div>
        </div>
        {/* Recommendation badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: rec.bg, border: `1.5px solid ${rec.border}`, borderRadius: 99, padding: "8px 18px", boxShadow: `0 2px 12px ${rec.border}22` }}>
          <span>{rec.emoji}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: rec.text }}>{rec.label}</span>
        </div>
      </div>

      {/* Recommendation reason */}
      <div style={{ background: rec.bg, border: `1.5px solid ${rec.border}44`, borderRadius: 16, padding: "16px 18px", marginBottom: 22, borderLeft: `4px solid ${rec.border}` }}>
        <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: rec.border, textTransform: "uppercase", letterSpacing: "0.06em" }}>AI Assessment</p>
        <p style={{ margin: 0, fontSize: 13, color: rec.text, lineHeight: 1.65 }}>{result.recommendation_reason}</p>
      </div>

      {/* Dials */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 22 }}>
        {[
          { label: "Career match",    pct: result.career_match,  color: T.purple, delay: 0   },
          { label: "Skills match",    pct: result.skills_match,  color: T.teal,   delay: 150 },
          { label: "College tier",    pct: result.college_score, color: tierColor, delay: 300 },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 18, padding: "20px 12px", textAlign: "center", border: "1.5px solid #EEF0F3", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <Dial pct={s.pct} color={s.color.solid} delay={s.delay} label={s.label} />
          </div>
        ))}
      </div>

      {/* Score breakdown */}
      <div style={{ background: "#fff", border: "1.5px solid #EEF0F3", borderRadius: 18, padding: "20px", marginBottom: 18, boxShadow: "0 2px 14px rgba(0,0,0,0.04)" }}>
        <p style={{ margin: "0 0 18px", fontWeight: 700, fontSize: 15, color: "#1e272e", display: "flex", alignItems: "center", gap: 8 }}>
          📈 Score Breakdown
        </p>
        {[
          { label: "Career / Objective match", pct: result.career_match,  color: T.purple.solid, note: result.career_summary },
          { label: "Skills match",              pct: result.skills_match,  color: T.teal.solid,   note: result.skills_summary },
          { label: `College tier — ${result.college_tier}`, pct: result.college_score, color: tierColor.solid, note: `Detected: ${result.college_name}` },
        ].map((row, i) => (
          <div key={row.label} style={{ marginBottom: i < 2 ? 20 : 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#2D3436" }}>{row.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: row.color }}>{Math.round(row.pct)}%</span>
            </div>
            <AnimBar pct={row.pct} color={row.color} delay={i * 200 + 400} />
            <p style={{ margin: "7px 0 0", fontSize: 12, color: "#636E72", lineHeight: 1.55 }}>{row.note}</p>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
        {[
          { title: "✅ Matched skills", skills: result.matched_skills, variant: "matched", color: T.teal },
          { title: "❌ Missing skills", skills: result.missing_skills, variant: "missing", color: T.coral },
        ].map(s => (
          <div key={s.title} style={{ background: s.color.light, borderRadius: 16, padding: "16px", border: `1.5px solid ${s.color.mid}55` }}>
            <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: s.color.dark }}>{s.title}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {(s.skills || []).map(sk => <Tag key={sk} variant={s.variant}>{sk}</Tag>)}
              {(!s.skills?.length) && <Tag variant="neutral">None detected</Tag>}
            </div>
          </div>
        ))}
      </div>

      {/* College tier reference */}
      <div style={{ background: "#F8F9FD", borderRadius: 18, padding: "20px", border: "1.5px solid #EEF0F3" }}>
        <p style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: "#2D3436", display: "flex", alignItems: "center", gap: 8 }}>
          🎓 College Tier Reference
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {TIERS.map(t => {
            const isCandidate = result.college_tier === t.label;
            return (
              <div key={t.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: isCandidate ? "8px 10px" : "0", background: isCandidate ? t.color.light : "transparent", borderRadius: isCandidate ? 10 : 0, transition: "all .3s", border: isCandidate ? `1.5px solid ${t.color.mid}` : "none" }}>
                <span style={{ fontSize: 12, fontWeight: isCandidate ? 700 : 400, color: isCandidate ? t.color.dark : "#8a94a6", width: 175, flexShrink: 0 }}>{t.label}</span>
                <div style={{ flex: 1, background: "#E8EAEE", borderRadius: 99, height: 8, overflow: "hidden" }}>
                  <div style={{ width: `${t.score}%`, height: "100%", background: t.color.solid, borderRadius: 99 }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: t.color.solid, width: 36, textAlign: "right" }}>{t.score}%</span>
                {isCandidate && <span style={{ background: t.color.solid, color: "#fff", fontSize: 10, borderRadius: 99, padding: "2px 8px", fontWeight: 700, flexShrink: 0, letterSpacing: "0.04em" }}>you</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button
          onClick={onNew}
          style={{ flex: 1, background: T.purple.light, color: T.purple.solid, border: `1.5px solid ${T.purple.mid}`, borderRadius: 14, padding: "14px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
        >
          + Screen another resume
        </button>
      </div>
    </div>
  );
}

/* ── Root ────────────────────────────────────────────────────────────────── */
export default function App() {
  const [page, setPage] = useState("home");
  const [result, setResult] = useState(null);
  const [resumeName, setResumeName] = useState("");

  const handleResult = (r, name) => { setResult(r); setResumeName(name); setPage("result"); };
  const handleNew = () => { setResult(null); setResumeName(""); setPage("tool"); };

  if (page === "home")   return <HomePage onStart={() => setPage("tool")} />;
  if (page === "tool")   return <ToolPage onBack={() => setPage("home")} onResult={handleResult} />;
  if (page === "result") return <ResultPage result={result} resumeName={resumeName} onNew={handleNew} />;
  return null;
}
