import { useEffect, useState } from "react";
import { api } from "../utils/api";

export default function ManagerDashboard() {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState({});
  const [msg, setMsg] = useState("");

  const load = () => {
    api.get("/api/goals/sheet/team/pending")
      .then(setSheets)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const review = async (sheetId, action) => {
    try {
      await api.post(`/api/goals/sheet/${sheetId}/review`, {
        action,
        comment: comments[sheetId] || ""
      });
      setMsg(`✅ Sheet ${action}d`);
      load();
    } catch (err) {
      setMsg(`❌ ${err.message}`);
    }
  };

  if (loading) return <div className="text-gray-500">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Pending Approvals</h2>
      {msg && <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-sm">{msg}</div>}

      {sheets.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-400">
          <p>No pending approvals 🎉</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sheets.map(sheet => (
            <div key={sheet.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-800">Employee #{sheet.employee_id} — Sheet #{sheet.id}</p>
                  <p className="text-sm text-gray-500">{sheet.goals.length} goals · Submitted {new Date(sheet.submitted_at).toLocaleDateString()}</p>
                </div>
                <span className="text-xs px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">Pending</span>
              </div>

              {/* Goals list */}
              <div className="space-y-1 mb-4">
                {sheet.goals.map(goal => (
                  <div key={goal.id} className="flex items-center justify-between text-sm bg-gray-50 rounded px-3 py-2">
                    <span className="text-gray-700">{goal.title}</span>
                    <div className="flex items-center gap-3 text-gray-500 shrink-0">
                      <span>{goal.uom}</span>
                      <span>Target: {goal.annual_target}</span>
                      <span className="font-semibold text-indigo-600">{goal.weightage}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <textarea
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3"
                rows={2}
                placeholder="Add comment (optional)..."
                value={comments[sheet.id] || ""}
                onChange={e => setComments(prev => ({ ...prev, [sheet.id]: e.target.value }))}
              />

              <div className="flex gap-2">
                <button onClick={() => review(sheet.id, "approve")}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition">
                  ✓ Approve
                </button>
                <button onClick={() => review(sheet.id, "return")}
                  className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition">
                  ↩ Return
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
