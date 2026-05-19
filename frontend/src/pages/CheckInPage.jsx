import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../components/shared/Layout";
import { api } from "../utils/api";

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
const GOAL_COLORS = ["#6366f1","#10b981","#f59e0b","#0ea5e9","#ec4899","#8b5cf6","#f87171","#14b8a6"];

function ScoreBar({ score, dark }) {
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#f87171";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: dark ? "#1a1a1a" : "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", background: color, width: `${Math.min(score, 100)}%`, borderRadius: 3, transition: "width 1s ease" }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 36 }}>{score}%</span>
    </div>
  );
}

export default function CheckInPage() {
  const { sheetId } = useParams();
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [sheet, setSheet] = useState(null);
  const [checkins, setCheckins] = useState({});
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(null);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success");

  const card      = dark ? "#111111" : "#ffffff";
  const cardBdr   = dark ? "#1e1e1e" : "#e8e5ff";
  const innerBg   = dark ? "#0a0a0a" : "#f8f7ff";
  const innerBdr  = dark ? "#1a1a1a" : "#ede9ff";
  const inputBg   = dark ? "#0a0a0a" : "#f9f9ff";
  const inputBdr  = dark ? "#2a2a2a" : "#e5e3ff";
  const text      = dark ? "#ffffff" : "#1e1b4b";
  const muted     = dark ? "#555555" : "#9ca3af";
  const label     = dark ? "#888888" : "#4b5563";

  const inputStyle = {
    background: inputBg, border: `1px solid ${inputBdr}`, borderRadius: 8,
    padding: "8px 12px", fontSize: 13, color: text, outline: "none",
    width: "100%", boxSizing: "border-box", fontFamily: "inherit",
  };

  useEffect(() => {
    api.get(`/api/goals/sheet/${sheetId}`).then(async (s) => {
      setSheet(s);
      const allCheckins = {};
      for (const goal of s.goals) {
        const data = await api.get(`/api/checkins/goal/${goal.id}`);
        allCheckins[goal.id] = data;
      }
      setCheckins(allCheckins);
    });
  }, [sheetId]);

  const handleSubmit = async (goalId, quarter) => {
    const key = `${goalId}_${quarter}`;
    const val = form[key];
    if (!val?.actual) return;
    setSaving(key);
    try {
      await api.post("/api/checkins/", {
        goal_id: goalId, quarter,
        actual_value: parseFloat(val.actual),
        employee_comment: val.comment || "",
      });
      setMsg(`✅ Check-in saved for ${quarter}!`);
      setMsgType("success");
      const data = await api.get(`/api/checkins/goal/${goalId}`);
      setCheckins(prev => ({ ...prev, [goalId]: data }));
      setForm(prev => { const next = { ...prev }; delete next[key]; return next; });
    } catch (err) {
      setMsg(`❌ ${err.message}`);
      setMsgType("error");
    } finally {
      setSaving(null);
    }
  };

  if (!sheet) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: `3px solid ${dark ? "#1e1e1e" : "#e5e7eb"}`, borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ color: muted, fontSize: 13 }}>Loading check-in form...</div>
      </div>
    </div>
  );

  const totalCheckins = Object.values(checkins).reduce((a, c) => a + c.length, 0);
  const totalPossible = sheet.goals.length * 4;
  const allScores = Object.values(checkins).flatMap(c => c.map(ci => ci.score).filter(Boolean));
  const avgScore = allScores.length ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : null;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", fontFamily: "'Inter', -apple-system, sans-serif", color: text }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 11, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Goal Sheet #{sheet.id}</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: text }}>Quarterly Check-ins</h1>
          <div style={{ fontSize: 13, color: muted, marginTop: 2 }}>{sheet.goals.length} goals · {totalCheckins}/{totalPossible} check-ins completed</div>
        </div>
        <button onClick={() => navigate("/employee")}
          style={{ background: "none", border: `1px solid ${cardBdr}`, borderRadius: 8, padding: "8px 14px", fontSize: 12, color: muted, cursor: "pointer" }}>
          ← Back
        </button>
      </div>

      {/* Progress overview */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Check-ins Done", value: totalCheckins, color: "#6366f1" },
          { label: "Remaining", value: totalPossible - totalCheckins, color: "#f59e0b" },
          { label: "Avg Score", value: avgScore ? `${avgScore}%` : "–", color: avgScore >= 80 ? "#10b981" : avgScore ? "#f59e0b" : muted },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: card, border: `1px solid ${cardBdr}`, borderRadius: 12, padding: "14px 18px" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toast */}
      {msg && (
        <div style={{
          marginBottom: 20, padding: "12px 16px", borderRadius: 10, fontSize: 13, fontWeight: 500,
          background: msgType === "success" ? (dark ? "#001a0e" : "#f0fdf4") : (dark ? "#1a0a0a" : "#fef2f2"),
          border: `1px solid ${msgType === "success" ? "#10b98133" : "#f8717133"}`,
          color: msgType === "success" ? "#10b981" : "#f87171",
          display: "flex", justifyContent: "space-between"
        }}>
          {msg}
          <button onClick={() => setMsg("")} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}>×</button>
        </div>
      )}

      {/* Goals */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {sheet.goals.map((goal, gi) => {
          const goalCheckins = checkins[goal.id] || [];
          const doneQuarters = goalCheckins.map(c => c.quarter);
          const pendingQuarters = QUARTERS.filter(q => !doneQuarters.includes(q));
          const color = GOAL_COLORS[gi % GOAL_COLORS.length];
          const goalAvg = goalCheckins.length ? Math.round(goalCheckins.reduce((a, c) => a + (c.score || 0), 0) / goalCheckins.length) : null;

          return (
            <div key={goal.id} style={{ background: card, border: `1px solid ${cardBdr}`, borderRadius: 16, overflow: "hidden" }}>

              {/* Goal header */}
              <div style={{ padding: "16px 24px", borderBottom: `1px solid ${innerBdr}`, background: innerBg, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{goal.title}</div>
                    <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>{goal.thrust_area} · {goal.uom} · Annual target: {goal.annual_target}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0, marginLeft: 16 }}>
                  {goalAvg !== null && (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 11, color: muted }}>Avg Score</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: goalAvg >= 80 ? "#10b981" : "#f59e0b" }}>{goalAvg}%</div>
                    </div>
                  )}
                  <div style={{ background: `${color}20`, border: `1px solid ${color}40`, borderRadius: 8, padding: "4px 10px", fontSize: 13, fontWeight: 700, color }}>
                    {goal.weightage}%
                  </div>
                </div>
              </div>

              <div style={{ padding: "16px 24px" }}>

                {/* Completed check-ins */}
                {goalCheckins.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: label, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Completed</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {goalCheckins.map(ci => (
                        <div key={ci.id} style={{ display: "flex", alignItems: "center", gap: 12, background: dark ? "#001a0e" : "#f0fdf4", border: "1px solid #10b98133", borderRadius: 10, padding: "10px 14px" }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#10b981", minWidth: 24 }}>{ci.quarter}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, color: text, marginBottom: 4 }}>
                              Actual: <strong>{ci.actual_value}</strong>
                              {ci.employee_comment && <span style={{ color: muted, marginLeft: 8 }}>· {ci.employee_comment}</span>}
                            </div>
                            <ScoreBar score={ci.score} dark={dark} />
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#10b981", minWidth: 40, textAlign: "right" }}>{ci.score}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pending check-ins */}
                {pendingQuarters.length > 0 && (
                  <div>
                    {goalCheckins.length > 0 && <div style={{ fontSize: 11, fontWeight: 600, color: label, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Pending</div>}
                    <div style={{ display: "grid", gridTemplateColumns: pendingQuarters.length === 1 ? "1fr" : "1fr 1fr", gap: 10 }}>
                      {pendingQuarters.map(q => {
                        const key = `${goal.id}_${q}`;
                        const isSaving = saving === key;
                        return (
                          <div key={q} style={{ background: innerBg, border: `1px solid ${innerBdr}`, borderRadius: 10, padding: 14 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color, marginBottom: 10 }}>{q} Check-in</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              <div>
                                <label style={{ display: "block", fontSize: 11, color: label, marginBottom: 4 }}>Actual Value *</label>
                                <input type="number" style={inputStyle} placeholder={`Target: ${goal[`target_q${QUARTERS.indexOf(q)+1}`] || goal.annual_target}`}
                                  value={form[key]?.actual || ""}
                                  onChange={e => setForm(prev => ({ ...prev, [key]: { ...prev[key], actual: e.target.value } }))} />
                              </div>
                              <div>
                                <label style={{ display: "block", fontSize: 11, color: label, marginBottom: 4 }}>Comment (optional)</label>
                                <input type="text" style={inputStyle} placeholder="How did it go?"
                                  value={form[key]?.comment || ""}
                                  onChange={e => setForm(prev => ({ ...prev, [key]: { ...prev[key], comment: e.target.value } }))} />
                              </div>
                              <button onClick={() => handleSubmit(goal.id, q)} disabled={isSaving || !form[key]?.actual}
                                style={{ padding: "9px", background: form[key]?.actual ? color : (dark ? "#1a1a1a" : "#e5e7eb"), color: form[key]?.actual ? "#fff" : muted, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: form[key]?.actual ? "pointer" : "not-allowed", transition: "all 0.2s" }}>
                                {isSaving ? "Saving..." : `Save ${q} →`}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {pendingQuarters.length === 0 && (
                  <div style={{ textAlign: "center", padding: "12px 0", fontSize: 13, color: "#10b981", fontWeight: 600 }}>
                    ✅ All quarters completed!
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
