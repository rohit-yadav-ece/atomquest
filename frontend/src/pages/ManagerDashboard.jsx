import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../components/shared/Layout";
import { api } from "../utils/api";

const UOM_LABELS = { numeric: "Numeric", percentage: "%", timeline: "Timeline", zero_based: "0-Based" };
const GOAL_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#0ea5e9", "#ec4899"];

export default function ManagerDashboard() {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState({});
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success");
  const [processing, setProcessing] = useState({});
  const { user } = useAuth();
  const { dark } = useTheme();

  const card      = dark ? "#111111" : "#ffffff";
  const cardBdr   = dark ? "#1e1e1e" : "#e8e5ff";
  const innerBg   = dark ? "#0a0a0a" : "#f8f7ff";
  const innerBdr  = dark ? "#1a1a1a" : "#ede9ff";
  const inputBg   = dark ? "#0a0a0a" : "#f9f9ff";
  const inputBdr  = dark ? "#2a2a2a" : "#e5e3ff";
  const text      = dark ? "#ffffff" : "#1e1b4b";
  const muted     = dark ? "#555555" : "#9ca3af";
  const subtext   = dark ? "#888888" : "#6b7280";
  const divider   = dark ? "#1a1a1a" : "#ede9ff";

  const load = () => {
    setLoading(true);
    api.get("/api/goals/sheet/team/pending")
      .then(data => setSheets(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const review = async (sheetId, action) => {
    setProcessing(p => ({ ...p, [sheetId]: action }));
    try {
      await api.post(`/api/goals/sheet/${sheetId}/review`, { action, comment: comments[sheetId] || "" });
      setMsg(`Sheet ${action === "approve" ? "approved ✅" : "returned ↩"} successfully`);
      setMsgType(action === "approve" ? "success" : "warning");
      load();
    } catch (err) {
      setMsg(`Error: ${err.message}`);
      setMsgType("error");
    } finally {
      setProcessing(p => ({ ...p, [sheetId]: null }));
    }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: `3px solid ${dark ? "#1e1e1e" : "#e5e7eb"}`, borderTop: "3px solid #0ea5e9", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ color: muted, fontSize: 13 }}>Loading approvals...</div>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", color: text, maxWidth: 900, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Manager View</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: text }}>Team Approvals</h1>
        <div style={{ fontSize: 13, color: muted, marginTop: 2 }}>
          Welcome, {user?.name?.split(" ")[0]} · {sheets.length} pending review{sheets.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Stats */}
      {sheets.length > 0 && (
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Pending Reviews", value: sheets.length, color: "#f59e0b" },
            { label: "Total Goals to Review", value: sheets.reduce((a, s) => a + (s.goals?.length || 0), 0), color: "#0ea5e9" },
            { label: "Employees Waiting", value: new Set(sheets.map(s => s.employee_id)).size, color: "#10b981" },
          ].map(stat => (
            <div key={stat.label} style={{ flex: 1, background: card, border: `1px solid ${cardBdr}`, borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      {msg && (
        <div style={{
          marginBottom: 20, padding: "12px 16px", borderRadius: 10, fontSize: 13, fontWeight: 500,
          background: msgType === "success" ? (dark ? "#001a0e" : "#f0fdf4") : msgType === "warning" ? (dark ? "#1a1000" : "#fffbeb") : (dark ? "#1a0a0a" : "#fef2f2"),
          border: `1px solid ${msgType === "success" ? "#10b98133" : msgType === "warning" ? "#f59e0b33" : "#f8717133"}`,
          color: msgType === "success" ? "#10b981" : msgType === "warning" ? "#f59e0b" : "#f87171",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          {msg}
          <button onClick={() => setMsg("")} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: 18 }}>×</button>
        </div>
      )}

      {/* Empty */}
      {sheets.length === 0 ? (
        <div style={{ background: card, border: `1px dashed ${cardBdr}`, borderRadius: 16, padding: "60px 40px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: text, marginBottom: 8 }}>All caught up!</div>
          <div style={{ fontSize: 13, color: muted }}>No pending approvals right now.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {sheets.map(sheet => (
            <div key={sheet.id} style={{ background: card, border: `1px solid ${cardBdr}`, borderRadius: 16, overflow: "hidden" }}>

              {/* Sheet header */}
              <div style={{ padding: "20px 24px", borderBottom: `1px solid ${divider}`, background: card, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: dark ? "#0ea5e922" : "#e0f2fe", border: "1px solid #0ea5e944", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#0ea5e9", flexShrink: 0 }}>
                    {sheet.employee_name ? sheet.employee_name.split(" ").map(w => w[0]).join("").slice(0, 2) : "E" + sheet.employee_id}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: text }}>
                      {sheet.employee_name || `Employee #${sheet.employee_id}`}
                    </div>
                    <div style={{ fontSize: 12, color: muted }}>
                      {sheet.goals?.length || 0} goals · Submitted {new Date(sheet.submitted_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 20, fontWeight: 600, background: dark ? "#1a1500" : "#fffbeb", color: "#f59e0b", border: "1px solid #f59e0b33" }}>
                  ⏳ Pending
                </span>
              </div>

              {/* Goals */}
              <div style={{ padding: "16px 24px", background: card }}>
                <div style={{ fontSize: 11, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Goals to Review</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                  {sheet.goals?.map((goal, gi) => {
                    const color = GOAL_COLORS[gi % GOAL_COLORS.length];
                    return (
                      <div key={goal.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: innerBg, border: `1px solid ${innerBdr}`, borderRadius: 10, padding: "10px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13, color: text, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{goal.title}</div>
                            <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>{goal.thrust_area}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0, marginLeft: 12 }}>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 11, color: muted }}>Target</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: subtext }}>{goal.annual_target} {UOM_LABELS[goal.uom] || goal.uom}</div>
                          </div>
                          <div style={{ background: dark ? `${color}18` : `${color}15`, border: `1px solid ${color}33`, borderRadius: 8, padding: "4px 10px", fontSize: 13, fontWeight: 700, color }}>
                            {goal.weightage}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Weightage total */}
                {(() => {
                  const total = sheet.goals?.reduce((a, g) => a + g.weightage, 0) || 0;
                  return (
                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
                      <span style={{ fontSize: 12, color: total === 100 ? "#10b981" : "#f87171", fontWeight: 600 }}>
                        Total: {total}% {total === 100 ? "✓" : "⚠ should be 100%"}
                      </span>
                    </div>
                  );
                })()}

                {/* Comment */}
                <textarea rows={2} placeholder="Add a comment for the employee (optional)..."
                  value={comments[sheet.id] || ""}
                  onChange={e => setComments(p => ({ ...p, [sheet.id]: e.target.value }))}
                  style={{ width: "100%", background: inputBg, border: `1px solid ${inputBdr}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: text, resize: "vertical", outline: "none", marginBottom: 14, boxSizing: "border-box", fontFamily: "inherit" }} />

                {/* Actions */}
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => review(sheet.id, "approve")} disabled={!!processing[sheet.id]}
                    style={{ flex: 1, padding: "11px", background: "#10b981", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: processing[sheet.id] ? 0.6 : 1 }}>
                    {processing[sheet.id] === "approve" ? "Approving..." : "✓ Approve"}
                  </button>
                  <button onClick={() => review(sheet.id, "return")} disabled={!!processing[sheet.id]}
                    style={{ flex: 1, padding: "11px", background: dark ? "#1a0a0a" : "#fef2f2", color: "#f87171", border: "1px solid #f8717133", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: processing[sheet.id] ? 0.6 : 1 }}>
                    {processing[sheet.id] === "return" ? "Returning..." : "↩ Return for Revision"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
