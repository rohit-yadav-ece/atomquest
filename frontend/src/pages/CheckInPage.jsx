import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../utils/api";

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];

export default function CheckInPage() {
  const { sheetId } = useParams();
  const [sheet, setSheet] = useState(null);
  const [checkins, setCheckins] = useState({});
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(null);
  const [msg, setMsg] = useState("");

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
    if (!val) return;
    setSaving(key);
    try {
      await api.post("/api/checkins/", {
        goal_id: goalId,
        quarter,
        actual_value: parseFloat(val.actual),
        employee_comment: val.comment || "",
      });
      setMsg(`✅ Check-in saved for ${quarter}`);
      // Refresh
      const data = await api.get(`/api/checkins/goal/${goalId}`);
      setCheckins(prev => ({ ...prev, [goalId]: data }));
    } catch (err) {
      setMsg(`❌ ${err.message}`);
    } finally {
      setSaving(null);
    }
  };

  if (!sheet) return <div className="text-gray-500">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Quarterly Check-ins</h2>
      <p className="text-sm text-gray-500 mb-6">Sheet #{sheet.id} · {sheet.goals.length} goals</p>
      {msg && <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-sm">{msg}</div>}

      <div className="space-y-6">
        {sheet.goals.map(goal => {
          const goalCheckins = checkins[goal.id] || [];
          const doneQuarters = goalCheckins.map(c => c.quarter);

          return (
            <div key={goal.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-semibold text-gray-800">{goal.title}</p>
                  <p className="text-xs text-gray-500">{goal.thrust_area} · {goal.uom} · Target: {goal.annual_target}</p>
                </div>
                <span className="text-indigo-600 font-bold text-sm">{goal.weightage}%</span>
              </div>

              {/* Existing check-ins */}
              {goalCheckins.length > 0 && (
                <div className="mb-4 space-y-2">
                  {goalCheckins.map(ci => (
                    <div key={ci.id} className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm">
                      <span className="font-semibold text-green-700">{ci.quarter}</span>
                      <span className="text-gray-700">Actual: {ci.actual_value}</span>
                      <span className="text-green-700 font-semibold ml-auto">Score: {ci.score}%</span>
                    </div>
                  ))}
                </div>
              )}

              {/* New check-in forms for remaining quarters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {QUARTERS.filter(q => !doneQuarters.includes(q)).map(q => {
                  const key = `${goal.id}_${q}`;
                  return (
                    <div key={q} className="border border-gray-200 rounded-lg p-3 space-y-2">
                      <p className="text-xs font-semibold text-gray-600">{q} Check-in</p>
                      <input
                        type="number"
                        placeholder="Actual value"
                        className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
                        onChange={e => setForm(prev => ({
                          ...prev, [key]: { ...prev[key], actual: e.target.value }
                        }))}
                      />
                      <input
                        type="text"
                        placeholder="Comment (optional)"
                        className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
                        onChange={e => setForm(prev => ({
                          ...prev, [key]: { ...prev[key], comment: e.target.value }
                        }))}
                      />
                      <button
                        onClick={() => handleSubmit(goal.id, q)}
                        disabled={saving === key}
                        className="w-full bg-indigo-600 text-white text-xs py-1.5 rounded hover:bg-indigo-700 transition disabled:opacity-60"
                      >
                        {saving === key ? "Saving..." : `Save ${q}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
