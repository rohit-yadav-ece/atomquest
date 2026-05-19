import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

const STATUS_CONFIG = {
  draft:     { label: "Draft",     bg: "#1a1a2e", color: "#888",     border: "#333" },
  submitted: { label: "Submitted", bg: "#1a1500", color: "#f59e0b", border: "#3a3000" },
  approved:  { label: "Approved",  bg: "#001a0e", color: "#10b981", border: "#003a1e" },
  returned:  { label: "Returned",  bg: "#1a0a0a", color: "#f87171", border: "#3a1515" },
  locked:    { label: "Locked",    bg: "#0a0a1a", color: "#6366f1", border: "#1a1a3a" },
};

const GOAL_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#0ea5e9", "#ec4899", "#8b5cf6"];

function ScoreRing({ score }) {
  const r = 28, c = 2 * Math.PI * r;
  const fill = ((score || 0) / 100) * c;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#f87171";
  return (
    <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
      <svg width="72" height="72" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="36" cy="36" r={r} fill="none" stroke="#222" strokeWidth="6" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${fill} ${c}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 15, fontWeight: 700, color }}>{score ?? "–"}</span>
        <span style={{ fontSize: 9, color: "#555", marginTop: 1 }}>score</span>
      </div>
    </div>
  );
}

function AnimatedBar({ pct, color, delay = 0 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(pct), 200 + delay); return () => clearTimeout(t); }, [pct, delay]);
  return (
    <div style={{ height: 6, background: "#1a1a1a", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ height: "100%", borderRadius: 3, background: color, width: `${width}%`, transition: "width 1s ease" }} />
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: "16px 20px", flex: 1 }}>
      <div style={{ fontSize: 26, fontWeight: 700, color: color || "#fff" }}>{value}</div>
      <div style={{ fontSize: 11, color: "#555", margin: "2px 0 4px" }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "#10b981" }}>{sub}</div>}
    </div>
  );
}

export default function EmployeeDashboard() {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animated, setAnimated] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/goals/sheet/my")
      .then(data => { setSheets(Array.isArray(data) ? data : []); })
      .catch(console.error)
      .finally(() => { setLoading(false); setTimeout(() => setAnimated(true), 100); });
  }, []);

  const totalGoals = sheets.reduce((a, s) => a + (s.goals?.length || 0), 0);
  const approvedSheets = sheets.filter(s => s.status === "approved").length;
  const allScores = sheets.flatMap(s => s.goals?.flatMap(g => g.checkins?.map(c => c.score).filter(Boolean) || []) || []);
  const avgScore = allScores.length ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : null;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #1e1e1e", borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ color: "#555", fontSize: 13 }}>Loading your goals...</div>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", color: "#fff", maxWidth: 900, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>FY 2025-26</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: "#fff" }}>My Goals</h1>
          <div style={{ fontSize: 13, color: "#555", marginTop: 2 }}>Welcome back, {user?.name?.split(" ")[0] || "there"} 👋</div>
        </div>
        <button onClick={() => navigate("/employee/goals/new")}
          style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          + New Sheet
        </button>
      </div>

      {/* Stats row */}
      {sheets.length > 0 && (
        <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
          <StatCard label="Total Goals" value={totalGoals} sub={`across ${sheets.length} sheet${sheets.length > 1 ? "s" : ""}`} />
          <StatCard label="Avg Score" value={avgScore ? `${avgScore}%` : "–"} sub={avgScore >= 80 ? "↑ Great performance" : avgScore ? "Keep pushing!" : "No check-ins yet"} color={avgScore >= 80 ? "#10b981" : avgScore ? "#f59e0b" : "#555"} />
          <StatCard label="Approved" value={approvedSheets} sub="sheets this cycle" color="#6366f1" />
        </div>
      )}

      {/* Empty state */}
      {sheets.length === 0 ? (
        <div style={{ background: "#111", border: "1px dashed #222", borderRadius: 16, padding: "60px 40px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 8 }}>No goal sheets yet</div>
          <div style={{ fontSize: 13, color: "#555", marginBottom: 24 }}>Create your first goal sheet to start tracking your performance</div>
          <button onClick={() => navigate("/employee/goals/new")}
            style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Create Goal Sheet
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {sheets.map((sheet, si) => {
            const cfg = STATUS_CONFIG[sheet.status] || STATUS_CONFIG.draft;
            const sheetScores = sheet.goals?.flatMap(g => g.checkins?.map(c => c.score).filter(s => s != null) || []) || [];
            const sheetAvg = sheetScores.length ? Math.round(sheetScores.reduce((a, b) => a + b, 0) / sheetScores.length) : null;

            return (
              <div key={sheet.id} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 16, overflow: "hidden", transition: "border-color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#333"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#1e1e1e"}>

                {/* Sheet header */}
                <div style={{ padding: "20px 24px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <ScoreRing score={sheetAvg} />
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Goal Sheet #{sheet.id}</span>
                        <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                          {cfg.label}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "#555" }}>
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
                  <div style={{ margin: "0 24px", marginTop: 16, padding: "10px 14px", background: "#1a1000", border: "1px solid #3a2800", borderRadius: 8, fontSize: 12, color: "#f59e0b" }}>
                    💬 <strong>Manager:</strong> {sheet.manager_comment}
                  </div>
                )}

                {/* Goals list */}
                <div style={{ padding: "16px 24px 20px" }}>
                  <div style={{ fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Goals & Weightage</div>
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
                              <span style={{ fontSize: 13, color: "#ccc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{goal.title}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0, marginLeft: 12 }}>
                              {latestScore != null && (
                                <span style={{ fontSize: 12, color: latestScore >= 80 ? "#10b981" : "#f59e0b", fontWeight: 600 }}>
                                  {latestScore}pts
                                </span>
                              )}
                              {completedCheckins > 0 && (
                                <span style={{ fontSize: 11, color: "#444" }}>{completedCheckins} check-in{completedCheckins > 1 ? "s" : ""}</span>
                              )}
                              <span style={{ fontSize: 13, fontWeight: 700, color }}>{goal.weightage}%</span>
                            </div>
                          </div>
                          <AnimatedBar pct={goal.weightage} color={color} delay={gi * 100} />
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
