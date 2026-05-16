import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";

const UOM_OPTIONS = ["numeric", "percentage", "timeline", "zero_based"];
const EMPTY_GOAL = {
  thrust_area: "", title: "", description: "",
  uom: "numeric", target_q1: "", target_q2: "",
  target_q3: "", target_q4: "", annual_target: "", weightage: ""
};

export default function GoalSheetForm() {
  const [cycles, setCycles] = useState([]);
  const [cycleId, setCycleId] = useState("");
  const [goals, setGoals] = useState([{ ...EMPTY_GOAL }]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/admin/cycles").then(setCycles).catch(console.error);
  }, []);

  const totalWeight = goals.reduce((s, g) => s + (parseFloat(g.weightage) || 0), 0);

  const updateGoal = (idx, field, value) => {
    setGoals(prev => prev.map((g, i) => i === idx ? { ...g, [field]: value } : g));
  };

  const addGoal = () => {
    if (goals.length >= 8) return;
    setGoals(prev => [...prev, { ...EMPTY_GOAL }]);
  };

  const removeGoal = (idx) => {
    if (goals.length === 1) return;
    setGoals(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!cycleId) return setError("Please select a cycle");
    if (Math.abs(totalWeight - 100) > 0.01) return setError(`Weightage total must be 100%. Currently ${totalWeight.toFixed(1)}%`);
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
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Goal Sheet</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cycle selector */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Goal Cycle</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={cycleId}
            onChange={e => setCycleId(e.target.value)}
            required
          >
            <option value="">Select cycle...</option>
            {cycles.filter(c => c.is_active).map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Weightage meter */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${totalWeight > 100 ? 'bg-red-500' : totalWeight === 100 ? 'bg-green-500' : 'bg-indigo-500'}`}
              style={{ width: `${Math.min(totalWeight, 100)}%` }}
            />
          </div>
          <span className={`text-sm font-semibold ${totalWeight > 100 ? 'text-red-600' : totalWeight === 100 ? 'text-green-600' : 'text-gray-600'}`}>
            {totalWeight.toFixed(1)}% / 100%
          </span>
        </div>

        {/* Goals */}
        {goals.map((goal, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-700">Goal {idx + 1}</h3>
              {goals.length > 1 && (
                <button type="button" onClick={() => removeGoal(idx)} className="text-red-400 hover:text-red-600 text-sm">Remove</button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Thrust Area *</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={goal.thrust_area} onChange={e => updateGoal(idx, "thrust_area", e.target.value)} required placeholder="e.g. Revenue Growth" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={goal.title} onChange={e => updateGoal(idx, "title", e.target.value)} required placeholder="Goal title" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Unit of Measurement *</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={goal.uom} onChange={e => updateGoal(idx, "uom", e.target.value)}>
                  {UOM_OPTIONS.map(u => <option key={u} value={u}>{u.replace("_", " ")}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Annual Target *</label>
                <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={goal.annual_target} onChange={e => updateGoal(idx, "annual_target", e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Weightage % *</label>
                <input type="number" min="10" max="100" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={goal.weightage} onChange={e => updateGoal(idx, "weightage", e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {["Q1","Q2","Q3","Q4"].map((q, qi) => (
                <div key={q}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{q} Target</label>
                  <input type="number" className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    value={goal[`target_q${qi+1}`]} onChange={e => updateGoal(idx, `target_q${qi+1}`, e.target.value)} placeholder="—" />
                </div>
              ))}
            </div>
          </div>
        ))}

        {goals.length < 8 && (
          <button type="button" onClick={addGoal}
            className="w-full border-2 border-dashed border-indigo-300 text-indigo-600 py-3 rounded-xl text-sm hover:border-indigo-500 transition">
            + Add Another Goal ({goals.length}/8)
          </button>
        )}

        {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

        <button type="submit" disabled={saving}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-60">
          {saving ? "Saving..." : "Save Goal Sheet"}
        </button>
      </form>
    </div>
  );
}
