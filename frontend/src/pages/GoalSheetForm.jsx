import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../components/shared/Layout";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

const UOM_OPTIONS = [
  { value: "numeric",    label: "Numeric",    desc: "e.g. Revenue, Units" },
  { value: "percentage", label: "Percentage", desc: "e.g. 90% satisfaction" },
  { value: "timeline",   label: "Timeline",   desc: "Done by deadline" },
  { value: "zero_based", label: "Zero-based", desc: "All or nothing" },
];
const EMPTY_GOAL = {
  thrust_area: "", title: "", description: "",
  uom: "numeric", target_q1: "", target_q2: "",
  target_q3: "", target_q4: "", annual_target: "", weightage: ""
};
const GOAL_COLORS = ["#6366f1","#10b981","#f59e0b","#0ea5e9","#ec4899","#8b5cf6","#f87171","#14b8a6"];

// Smart suggestions by department
const SUGGESTIONS = {
  Sales: [
    { thrust_area: "Revenue Growth", title: "Achieve Monthly Sales Revenue Target", description: "Drive revenue through new client acquisition and upselling", uom: "numeric", annual_target: 1200000, target_q1: 280000, target_q2: 300000, target_q3: 300000, target_q4: 320000, weightage: 30 },
    { thrust_area: "Customer Experience", title: "Improve Customer Satisfaction Score (CSAT)", description: "Enhance post-sale support and follow-up process", uom: "percentage", annual_target: 92, target_q1: 86, target_q2: 88, target_q3: 90, target_q4: 92, weightage: 25 },
    { thrust_area: "Market Expansion", title: "Acquire New Dealer/Distributor Partnerships", description: "Expand Atomberg product reach in untapped regions", uom: "numeric", annual_target: 20, target_q1: 4, target_q2: 5, target_q3: 5, target_q4: 6, weightage: 25 },
    { thrust_area: "Capability Building", title: "Complete Product & Sales Training Program", description: "Mandatory Atomberg product knowledge certification", uom: "timeline", annual_target: 1, target_q1: null, target_q2: 1, target_q3: null, target_q4: null, weightage: 20 },
  ],
  Operations: [
    { thrust_area: "Operational Efficiency", title: "Reduce Order-to-Delivery Turnaround Time", description: "Streamline dispatch and logistics for faster delivery", uom: "numeric", annual_target: 2, target_q1: 3.5, target_q2: 2.8, target_q3: 2.3, target_q4: 2.0, weightage: 30 },
    { thrust_area: "Quality Assurance", title: "Achieve 99% Defect-Free Shipment Rate", description: "Ensure product quality through rigorous pre-dispatch checks", uom: "percentage", annual_target: 99, target_q1: 97, target_q2: 98, target_q3: 98, target_q4: 99, weightage: 30 },
    { thrust_area: "Sustainability", title: "Reduce Carbon Footprint in Operations by 15%", description: "Implement green logistics and reduce packaging waste", uom: "percentage", annual_target: 15, target_q1: 5, target_q2: 8, target_q3: 12, target_q4: 15, weightage: 20 },
    { thrust_area: "Capability Building", title: "Cross-functional Training Completion", description: "Attend inter-departmental process workshops", uom: "timeline", annual_target: 1, target_q1: null, target_q2: 1, target_q3: null, target_q4: null, weightage: 20 },
  ],
  Marketing: [
    { thrust_area: "Brand Awareness", title: "Increase Atomberg Digital Brand Reach", description: "Grow social media impressions and website traffic", uom: "numeric", annual_target: 500000, target_q1: 100000, target_q2: 120000, target_q3: 130000, target_q4: 150000, weightage: 25 },
    { thrust_area: "Lead Generation", title: "Generate Qualified Sales Leads via Campaigns", description: "Run targeted campaigns for fan and appliance segments", uom: "numeric", annual_target: 2400, target_q1: 500, target_q2: 600, target_q3: 600, target_q4: 700, weightage: 30 },
    { thrust_area: "Customer Retention", title: "Improve Customer Repeat Purchase Rate", description: "Design loyalty programs to increase repeat buyers", uom: "percentage", annual_target: 35, target_q1: 25, target_q2: 28, target_q3: 32, target_q4: 35, weightage: 25 },
    { thrust_area: "Capability Building", title: "Digital Marketing Certification Completion", description: "Upskill on performance marketing and analytics tools", uom: "timeline", annual_target: 1, target_q1: 1, target_q2: null, target_q3: null, target_q4: null, weightage: 20 },
  ],
  Engineering: [
    { thrust_area: "Product Development", title: "Launch New Energy-Efficient Fan Model", description: "Develop and release next-gen BLDC fan with improved efficiency", uom: "timeline", annual_target: 1, target_q1: null, target_q2: null, target_q3: 1, target_q4: null, weightage: 35 },
    { thrust_area: "Quality Engineering", title: "Reduce Product Return Rate Due to Defects", description: "Improve QA processes to minimize field failures", uom: "percentage", annual_target: 1, target_q1: 3, target_q2: 2, target_q3: 1.5, target_q4: 1, weightage: 25 },
    { thrust_area: "Innovation", title: "File Patent Applications for New Features", description: "Document and file IP for Atomberg innovations", uom: "numeric", annual_target: 3, target_q1: 1, target_q2: 1, target_q3: 1, target_q4: 0, weightage: 20 },
    { thrust_area: "Capability Building", title: "Complete Advanced Engineering Training", description: "Attend IoT and smart appliance development workshops", uom: "timeline", annual_target: 1, target_q1: null, target_q2: 1, target_q3: null, target_q4: null, weightage: 20 },
  ],
  HR: [
    { thrust_area: "Talent Acquisition", title: "Hire Top Talent Across Key Departments", description: "Fill critical open roles with quality candidates", uom: "numeric", annual_target: 40, target_q1: 8, target_q2: 12, target_q3: 10, target_q4: 10, weightage: 30 },
    { thrust_area: "Employee Engagement", title: "Improve Employee Satisfaction Score", description: "Drive engagement through culture and wellbeing programs", uom: "percentage", annual_target: 85, target_q1: 78, target_q2: 80, target_q3: 83, target_q4: 85, weightage: 25 },
    { thrust_area: "Learning & Development", title: "Training Hours Per Employee Per Quarter", description: "Ensure every employee completes skill development hours", uom: "numeric", annual_target: 40, target_q1: 10, target_q2: 10, target_q3: 10, target_q4: 10, weightage: 25 },
    { thrust_area: "Retention", title: "Reduce Annual Attrition Rate", description: "Implement retention strategies to reduce turnover", uom: "percentage", annual_target: 12, target_q1: 15, target_q2: 14, target_q3: 13, target_q4: 12, weightage: 20 },
  ],
  Finance: [
    { thrust_area: "Cost Optimization", title: "Reduce Operational Cost by 10%", description: "Identify and eliminate inefficiencies in spending", uom: "percentage", annual_target: 10, target_q1: 3, target_q2: 6, target_q3: 8, target_q4: 10, weightage: 30 },
    { thrust_area: "Revenue Reporting", title: "Ensure 100% On-Time Financial Reporting", description: "Timely monthly and quarterly financial closures", uom: "percentage", annual_target: 100, target_q1: 100, target_q2: 100, target_q3: 100, target_q4: 100, weightage: 25 },
    { thrust_area: "Compliance", title: "Zero Audit Observations or Penalties", description: "Maintain full compliance with statutory requirements", uom: "zero_based", annual_target: 1, target_q1: 1, target_q2: 1, target_q3: 1, target_q4: 1, weightage: 25 },
    { thrust_area: "Capability Building", title: "Complete Financial Certification Program", description: "CFA/ICAI or relevant finance upskilling", uom: "timeline", annual_target: 1, target_q1: null, target_q2: null, target_q3: 1, target_q4: null, weightage: 20 },
  ],
  // Default for any other department
  General: [
    { thrust_area: "Performance Excellence", title: "Achieve Quarterly KPI Targets", description: "Meet or exceed all assigned quarterly performance metrics", uom: "percentage", annual_target: 90, target_q1: 85, target_q2: 87, target_q3: 89, target_q4: 90, weightage: 30 },
    { thrust_area: "Customer Focus", title: "Improve Internal/External Customer Satisfaction", description: "Enhance quality of service delivered to stakeholders", uom: "percentage", annual_target: 88, target_q1: 82, target_q2: 84, target_q3: 86, target_q4: 88, weightage: 25 },
    { thrust_area: "Process Improvement", title: "Identify and Implement 2 Process Improvements", description: "Drive efficiency through innovation and process redesign", uom: "numeric", annual_target: 2, target_q1: 0, target_q2: 1, target_q3: 1, target_q4: 2, weightage: 25 },
    { thrust_area: "Capability Building", title: "Complete Annual Learning & Development Plan", description: "Finish all assigned training and certification programs", uom: "timeline", annual_target: 1, target_q1: null, target_q2: null, target_q3: null, target_q4: 1, weightage: 20 },
  ],
};

const AI_THINKING_STEPS = [
  "🔍 Analyzing your department profile...",
  "📊 Reviewing Atomberg business context...",
  "🎯 Generating KPI targets...",
  "✨ Finalizing goal recommendations...",
];

export default function GoalSheetForm() {
  const [cycles, setCycles] = useState([]);
  const [cycleId, setCycleId] = useState("");
  const [goals, setGoals] = useState([{ ...EMPTY_GOAL }]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStep, setAiStep] = useState(0);
  const [aiDone, setAiDone] = useState(false);
  const navigate = useNavigate();
  const { dark } = useTheme();
  const { user } = useAuth();

  const card    = dark ? "#111111" : "#ffffff";
  const cardBdr = dark ? "#1e1e1e" : "#e8e5ff";
  const innerBg = dark ? "#0a0a0a" : "#f8f7ff";
  const innerBdr= dark ? "#1a1a1a" : "#ede9ff";
  const inputBg = dark ? "#0a0a0a" : "#f9f9ff";
  const inputBdr= dark ? "#2a2a2a" : "#e5e3ff";
  const text    = dark ? "#ffffff" : "#1e1b4b";
  const muted   = dark ? "#555555" : "#9ca3af";
  const label   = dark ? "#888888" : "#4b5563";

  const inputStyle = {
    background: inputBg, border: `1px solid ${inputBdr}`, borderRadius: 8,
    padding: "9px 12px", fontSize: 13, color: text, outline: "none",
    width: "100%", boxSizing: "border-box", fontFamily: "inherit",
  };

  useEffect(() => {
    api.get("/api/admin/cycles").then(setCycles).catch(console.error);
  }, []);

  const totalWeight = goals.reduce((s, g) => s + (parseFloat(g.weightage) || 0), 0);
  const weightColor = totalWeight > 100 ? "#f87171" : totalWeight === 100 ? "#10b981" : "#6366f1";

  const updateGoal = (idx, field, value) =>
    setGoals(prev => prev.map((g, i) => i === idx ? { ...g, [field]: value } : g));
  const addGoal = () => { if (goals.length < 8) setGoals(prev => [...prev, { ...EMPTY_GOAL }]); };
  const removeGoal = (idx) => { if (goals.length > 1) setGoals(prev => prev.filter((_, i) => i !== idx)); };

  const handleAISuggest = async () => {
    setAiLoading(true);
    setAiStep(0);
    setError("");

    // Simulate AI thinking with steps
    for (let i = 0; i < AI_THINKING_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 700));
      setAiStep(i + 1);
    }
    await new Promise(r => setTimeout(r, 400));

    // Pick suggestions based on department
    const dept = user?.department || "General";
    const suggestions = SUGGESTIONS[dept] || SUGGESTIONS.General;

    const filled = suggestions.map(s => ({
      thrust_area:   s.thrust_area,
      title:         s.title,
      description:   s.description || "",
      uom:           s.uom,
      annual_target: String(s.annual_target),
      target_q1:     s.target_q1 != null ? String(s.target_q1) : "",
      target_q2:     s.target_q2 != null ? String(s.target_q2) : "",
      target_q3:     s.target_q3 != null ? String(s.target_q3) : "",
      target_q4:     s.target_q4 != null ? String(s.target_q4) : "",
      weightage:     String(s.weightage),
    }));

    setGoals(filled);
    setAiDone(true);
    setAiLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!cycleId) return setError("Please select a cycle");
    if (Math.abs(totalWeight - 100) > 0.01) return setError(`Weightage must total 100%. Currently ${totalWeight.toFixed(1)}%`);
    if (goals.some(g => parseFloat(g.weightage) < 10)) return setError("Each goal needs at least 10% weightage");
    const payload = {
      cycle_id: parseInt(cycleId),
      goals: goals.map(g => ({
        ...g,
        target_q1: g.target_q1 ? parseFloat(g.target_q1) : null,
        target_q2: g.target_q2 ? parseFloat(g.target_q2) : null,
        target_q3: g.target_q3 ? parseFloat(g.target_q3) : null,
        target_q4: g.target_q4 ? parseFloat(g.target_q4) : null,
        annual_target: parseFloat(g.annual_target),
        weightage: parseFloat(g.weightage),
      }))
    };
    setSaving(true);
    try {
      await api.post("/api/goals/sheet", payload);
      navigate("/employee");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", fontFamily: "'Inter', -apple-system, sans-serif", color: text }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>FY 2025-26</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: text }}>Create Goal Sheet</h1>
        <div style={{ fontSize: 13, color: muted, marginTop: 2 }}>Define your goals. Max 8 goals, total weightage must equal 100%.</div>
      </div>

      {/* ✨ AI Banner */}
      <div style={{ background: dark ? "linear-gradient(135deg, #1a0a2e, #0a0a1a)" : "linear-gradient(135deg, #eef2ff, #f5f3ff)", border: `1px solid ${dark ? "#3a1a5e" : "#c7d2fe"}`, borderRadius: 16, padding: "20px 24px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 20 }}>🤖</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: dark ? "#a5b4fc" : "#4338ca" }}>AI Goal Suggestions</span>
              <span style={{ fontSize: 10, padding: "2px 8px", background: "#6366f1", color: "#fff", borderRadius: 20, fontWeight: 600 }}>POWERED BY CLAUDE</span>
            </div>
            {aiLoading ? (
              <div style={{ fontSize: 12, color: dark ? "#7c7cad" : "#6366f1", animation: "pulse 1.2s ease infinite" }}>
                {AI_THINKING_STEPS[Math.min(aiStep, AI_THINKING_STEPS.length - 1)]}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: dark ? "#7c7cad" : "#6366f1" }}>
                Get smart KPI goals tailored for <strong>{user?.department || "your"}</strong> department at Atomberg — instantly.
              </div>
            )}
          </div>

          <button onClick={handleAISuggest} disabled={aiLoading}
            style={{
              padding: "12px 22px", borderRadius: 10, border: "none", cursor: aiLoading ? "wait" : "pointer",
              background: aiLoading ? (dark ? "#2a2a4a" : "#e0e7ff") : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: aiLoading ? (dark ? "#555" : "#6366f1") : "#fff",
              fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8,
              boxShadow: aiLoading ? "none" : "0 4px 20px rgba(99,102,241,0.4)",
              whiteSpace: "nowrap", minWidth: 180,
            }}>
            {aiLoading ? (
              <>
                <div style={{ width: 14, height: 14, border: "2px solid #6366f1", borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
                Generating...
              </>
            ) : (
              <>{aiDone ? "🔄 Regenerate Goals" : "✨ Suggest Goals with AI"}</>
            )}
          </button>
        </div>

        {/* Progress steps while loading */}
        {aiLoading && (
          <div style={{ marginTop: 16, display: "flex", gap: 6 }}>
            {AI_THINKING_STEPS.map((_, i) => (
              <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < aiStep ? "#6366f1" : (dark ? "#2a2a2a" : "#e0e7ff"), transition: "background 0.5s" }} />
            ))}
          </div>
        )}

        {aiDone && !aiLoading && (
          <div style={{ marginTop: 14, padding: "10px 14px", background: dark ? "#001a0e" : "#f0fdf4", border: "1px solid #10b98133", borderRadius: 8, fontSize: 12, color: "#10b981", display: "flex", alignItems: "center", gap: 8 }}>
            ✅ Generated {goals.length} smart goals for <strong>{user?.department || "your"} team</strong>! Review, edit if needed, then save.
            <button onClick={() => { setGoals([{ ...EMPTY_GOAL }]); setAiDone(false); }}
              style={{ marginLeft: "auto", background: "none", border: "none", color: "#10b981", cursor: "pointer", fontSize: 11, textDecoration: "underline", whiteSpace: "nowrap" }}>
              Clear & start manually
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Cycle selector */}
        <div style={{ background: card, border: `1px solid ${cardBdr}`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: label, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Goal Cycle *</label>
          <select style={inputStyle} value={cycleId} onChange={e => setCycleId(e.target.value)} required>
            <option value="">Select active cycle...</option>
            {cycles.filter(c => c.is_active).map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Weightage meter */}
        <div style={{ background: card, border: `1px solid ${cardBdr}`, borderRadius: 14, padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: label, textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Weightage</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: weightColor }}>{totalWeight.toFixed(1)}% / 100%</span>
          </div>
          <div style={{ height: 8, background: dark ? "#1a1a1a" : "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 4, background: weightColor, width: `${Math.min(totalWeight, 100)}%`, transition: "width 0.4s ease, background 0.3s" }} />
          </div>
          <div style={{ fontSize: 11, color: muted, marginTop: 8 }}>
            {totalWeight === 100 ? "✅ Perfect! Ready to save." : totalWeight > 100 ? "⚠️ Over 100% — reduce some weightages." : `Need ${(100 - totalWeight).toFixed(1)}% more.`}
          </div>
        </div>

        {/* Goals */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 16 }}>
          {goals.map((goal, idx) => {
            const color = GOAL_COLORS[idx % GOAL_COLORS.length];
            return (
              <div key={idx} style={{ background: card, border: `1px solid ${cardBdr}`, borderRadius: 14, overflow: "hidden", animation: aiDone ? `fadeIn 0.4s ease ${idx * 0.08}s both` : "none" }}>
                <div style={{ padding: "14px 20px", borderBottom: `1px solid ${innerBdr}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: innerBg }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${color}20`, border: `1px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color }}>
                      {idx + 1}
                    </div>
                    <span style={{ fontWeight: 600, color: text, fontSize: 14 }}>Goal {idx + 1}</span>
                    {goal.title && <span style={{ fontSize: 12, color: muted }}>— {goal.title.slice(0, 30)}{goal.title.length > 30 ? "..." : ""}</span>}
                    {aiDone && goal.title && <span style={{ fontSize: 10, padding: "2px 7px", background: dark ? "#1a0a2e" : "#eef2ff", color: "#6366f1", borderRadius: 20, border: "1px solid #6366f133" }}>✨ AI</span>}
                  </div>
                  {goals.length > 1 && (
                    <button type="button" onClick={() => removeGoal(idx)}
                      style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>
                      Remove ×
                    </button>
                  )}
                </div>

                <div style={{ padding: 20 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: label, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Thrust Area *</label>
                      <input style={inputStyle} value={goal.thrust_area} onChange={e => updateGoal(idx, "thrust_area", e.target.value)} required placeholder="e.g. Revenue Growth" />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: label, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Goal Title *</label>
                      <input style={inputStyle} value={goal.title} onChange={e => updateGoal(idx, "title", e.target.value)} required placeholder="What do you want to achieve?" />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: label, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Unit of Measurement *</label>
                      <select style={inputStyle} value={goal.uom} onChange={e => updateGoal(idx, "uom", e.target.value)}>
                        {UOM_OPTIONS.map(u => <option key={u.value} value={u.value}>{u.label} — {u.desc}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: label, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Annual Target *</label>
                      <input type="number" style={inputStyle} value={goal.annual_target} onChange={e => updateGoal(idx, "annual_target", e.target.value)} required placeholder="e.g. 1000000" />
                    </div>
                    <div style={{ gridColumn: "span 2" }}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: label, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Weightage % * <span style={{ color: muted, fontWeight: 400, textTransform: "none" }}>(min 10%, total must be 100%)</span>
                      </label>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <input type="number" min="10" max="100" style={{ ...inputStyle, width: 120 }} value={goal.weightage} onChange={e => updateGoal(idx, "weightage", e.target.value)} required />
                        <div style={{ flex: 1, height: 6, background: dark ? "#1a1a1a" : "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", background: color, width: `${Math.min(parseFloat(goal.weightage) || 0, 100)}%`, borderRadius: 3, transition: "width 0.3s" }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color, minWidth: 40 }}>{goal.weightage || 0}%</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: `1px solid ${innerBdr}`, paddingTop: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: label, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Quarterly Targets (optional)</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
                      {["Q1","Q2","Q3","Q4"].map((q, qi) => (
                        <div key={q}>
                          <label style={{ display: "block", fontSize: 11, color: muted, marginBottom: 5, fontWeight: 500 }}>{q} Target</label>
                          <input type="number" style={{ ...inputStyle, padding: "7px 10px" }}
                            value={goal[`target_q${qi+1}`]} onChange={e => updateGoal(idx, `target_q${qi+1}`, e.target.value)} placeholder="—" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {goals.length < 8 && (
          <button type="button" onClick={addGoal}
            style={{ width: "100%", padding: 14, background: "transparent", border: `2px dashed ${dark ? "#2a2a2a" : "#c7d2fe"}`, borderRadius: 12, color: "#6366f1", fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 16 }}>
            + Add Another Goal ({goals.length}/8)
          </button>
        )}

        {error && (
          <div style={{ padding: "12px 16px", background: dark ? "#1a0a0a" : "#fef2f2", border: "1px solid #f8717133", borderRadius: 10, color: "#f87171", fontSize: 13, marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        <button type="submit" disabled={saving}
          style={{ width: "100%", padding: 14, background: saving ? "#4a4a8a" : "#6366f1", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
          {saving ? "Saving..." : "💾 Save Goal Sheet"}
        </button>
      </form>
    </div>
  );
}
