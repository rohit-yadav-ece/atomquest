import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../components/shared/Layout";
import { api } from "../utils/api";

const GOAL_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#0ea5e9", "#ec4899", "#8b5cf6"];

function useT(dark) {
  return {
    text:        dark ? "#ffffff" : "#1e1b4b",
    muted:       dark ? "#555"    : "#9ca3af",
    subtext:     dark ? "#888"    : "#6b7280",
    card:        dark ? "#111"    : "#ffffff",
    cardBorder:  dark ? "#1e1e1e" : "#e8e5ff",
    cardHover:   dark ? "#1a1a1a" : "#f0eeff",
    innerBg:     dark ? "#0a0a0a" : "#f8f7ff",
    innerBorder: dark ? "#1a1a1a" : "#ede9ff",
    statCard:    dark ? "#111"    : "#ffffff",
    btnGreen:    "#10b981",
    btnIndigo:   "#6366f1",
  };
}

function ScoreRing({ score, dark }) {
  const r = 28, c = 2 * Math.PI * r;
  const fill = ((score || 0) / 100) * c;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#f87171";
  const trackColor = dark ? "#222" : "#e5e7eb";
  return (
    <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
      <svg width="72" height="72" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="36" cy="36" r={r} fill="none" stroke={trackColor} strokeWidth="6" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${fill} ${c}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: score ? color : (dark ? "#444" : "#ccc") }}>{score ?? "–"}</span>
        <span style={{ fontSize: 9, color: dark ? "#555" : "#aaa", marginTop: 1 }}>score</span>
      </div>
    </div>
  );
}

function AnimatedBar({ pct, color, delay = 0, dark }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(pct), 200 + delay); return () => clearTimeout(t); }, [pct, delay]);
  return (
    <div style={{ height: 6, background: dark ? "#1a1a1a" : "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ height: "100%", borderRadius: 3, background: color, width: `${width}%`, transition: "width 1s ease" }} />
    </div>
  );
}

export default function EmployeeDashboard() {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { dark } = useTheme();
  const navigate = useNavigate();
  const t = useT(dark);

  useEffect(() => {
    api.get("/api/goals/sheet/my")
      .then(data => setSheets(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalGoals = sheets.reduce((a, s) => a + (s.goals?.length || 0), 0);
  const approvedSheets = sheets.filter(s => s.status === "approved").length;
  const allScores = sheets.flatMap(s => s.goals?.flatMap(g => g.checkins?.map(c => c.score).filter(Boolean) || []) || []);
  const avgScore = allScores.length ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : null;

  const STATUS_CONFIG = {
    draft:     { label: "Draft",     bg: dark ? "#1a1a2e" : "#f3f4f6", color: dark ? "#888" : "#6b7280",    border: dark ? "#333" : "#d1d5db" },
    submitted: { label: "Submitted", bg: dark ? "#1a1500" : "#fffbeb", color: "#f59e0b",                    border: dark ? "#3a3000" : "#fde68a" },
    approved:  { label: "Approved",  bg: dark ? "#001a0e" : "#f0fdf4", color: "#10b981",                    border: dark ? "#003a1e" : "#bbf7d0" },
    returned:  { label: "Returned",  bg: dark ? "#1a0a0a" : "#fef2f2", color: "#f87171",                    border: dark ? "#3a1515" : "#fecaca" },
    locked:    { label: "Locked",    bg: dark ? "#0a0a1a" : "#eef2ff", color: "#6366f1",                    border: dark ? "#1a1a3a" : "#c7d2fe" },
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: `3px solid ${dark ? "#1e1e1e" : "#e5e7eb"}`, borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ color: t.muted, fontSize: 13 }}>Loading your goals...</div>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", color: t.text, maxWidth: 900, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 11, color: t.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>FY 2025-26</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: t.text }}>My Goals</h1>
          <div style={{ fontSize: 13, color: t.muted, marginTop: 2 }}>Welcome back, {user?.name?.split(" ")[0] || "there"} 👋</div>
        </div>
        <button onClick={() => navigate("/employee/goals/new")}
          style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          + New Sheet
        </button>
      </div>

      {/* Stats */}
      {sheets.length > 0 && (
        <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Total Goals", value: totalGoals, sub: `across ${sheets.length} sheet${sheets.length > 1 ? "s" : ""}`, color: t.text },
            { label: "Avg Score", value: avgScore ? `${avgScore}%` : "–", sub: avgScore >= 80 ? "↑ Great performance" : avgScore ? "Keep pushing!" : "No check-ins yet", color: avgScore >= 80 ? "#10b981" : avgScore ? "#f59e0b" : t.muted },
            { label: "Approved", value: approvedSheets, sub: "sheets this cycle", color: "#6366f1" },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: t.statCard, border: `1px solid ${t.cardBorder}`, borderRadius: 12, padding: "16px 20px", boxShadow: dark ? "none" : "0 1px 4px rgba(99,102,241,0.06)" }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: t.muted, margin: "2px 0 4px" }}>{s.label}</div>
              <div style={{ fontSize: 11, color: "#10b981" }}>{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {sheets.length === 0 ? (
        <div style={{ background: t.card, border: `1px dashed ${t.cardBorder}`, borderRadius: 16, padding: "60px 40px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: t.text, marginBottom: 8 }}>No goal sheets yet</div>
          <div style={{ fontSize: 13, color: t.muted, marginBottom: 24 }}>Create your first goal sheet to start tracking your performance</div>
          <button onClick={() => navigate("/employee/goals/new")}
            style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Create Goal Sheet
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {sheets.map(sheet => {
            const cfg = STATUS_CONFIG[sheet.status] || STATUS_CONFIG.draft;
            const sheetScores = sheet.goals?.flatMap(g => g.checkins?.map(c => c.score).filter(s => s != null) || []) || [];
            const sheetAvg = sheetScores.length ? Math.round(sheetScores.reduce((a, b) => a + b, 0) / sheetScores.length) : null;
            return (
              <div key={sheet.id} style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16, overflow: "hidden", boxShadow: dark ? "none" : "0 2px 12px rgba(99,102,241,0.06)" }}>

                {/* Header */}
                <div style={{ padding: "20px 24px", borderBottom: `1px solid ${t.innerBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <ScoreRing score={sheetAvg} dark={dark} />
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: t.text }}>Goal Sheet #{sheet.id}</span>
                        <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                          {cfg.label}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: t.muted }}>
                        {sheet.goals?.length || 0} goals · FY 2025-26 · {sheetScores.length} check-ins completed
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {(sheet.status === "draft" || sheet.status === "returned") && (
                      <button onClick={async () => { await api.post(`/api/goals/sheet/${sheet.id}/submit`); window.location.reload(); }}
                        style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        Submit →
                      </button>
                    )}
                    {sheet.status === "approved" && (
                      <button onClick={() => navigate(`/employee/checkin/${sheet.id}`)}
                        style={{ background: "#10b981", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        Do Check-in →
                      </button>
                    )}
                  </div>
                </div>

                {/* Manager comment */}
                {sheet.manager_comment && (
                  <div style={{ margin: "16px 24px 0", padding: "10px 14px", background: dark ? "#1a1000" : "#fffbeb", border: `1px solid ${dark ? "#3a2800" : "#fde68a"}`, borderRadius: 8, fontSize: 12, color: "#f59e0b" }}>
                    💬 <strong>Manager:</strong> {sheet.manager_comment}
                  </div>
                )}

                {/* Goals */}
                <div style={{ padding: "16px 24px 20px" }}>
                  <div style={{ fontSize: 11, color: t.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Goals & Weightage</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {sheet.goals?.map((goal, gi) => {
                      const color = GOAL_COLORS[gi % GOAL_COLORS.length];
                      const latestScore = goal.checkins?.filter(c => c.score != null).slice(-1)[0]?.score;
                      const completedCheckins = goal.checkins?.filter(c => c.is_completed).length || 0;
                      return (
                        <div key={goal.id}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                              <span style={{ fontSize: 13, color: t.subtext, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{goal.title}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0, marginLeft: 12 }}>
                              {latestScore != null && (
                                <span style={{ fontSize: 12, color: latestScore >= 80 ? "#10b981" : "#f59e0b", fontWeight: 600 }}>{latestScore}pts</span>
                              )}
                              {completedCheckins > 0 && (
                                <span style={{ fontSize: 11, color: t.muted }}>{completedCheckins} check-in{completedCheckins > 1 ? "s" : ""}</span>
                              )}
                              <span style={{ fontSize: 13, fontWeight: 700, color }}>{goal.weightage}%</span>
                            </div>
                          </div>
                          <AnimatedBar pct={goal.weightage} color={color} delay={gi * 100} dark={dark} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
