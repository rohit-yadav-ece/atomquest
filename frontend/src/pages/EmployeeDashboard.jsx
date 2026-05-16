import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";

const STATUS_COLORS = {
  draft: "bg-gray-100 text-gray-600",
  submitted: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  returned: "bg-red-100 text-red-700",
  locked: "bg-blue-100 text-blue-700",
};

export default function EmployeeDashboard() {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/goals/sheet/my")
      .then(setSheets)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Goal Sheets</h2>
        <button
          onClick={() => navigate("/employee/goals/new")}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          + New Sheet
        </button>
      </div>

      {sheets.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-400">
          <p className="text-lg">No goal sheets yet.</p>
          <p className="text-sm mt-1">Create your first goal sheet to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sheets.map(sheet => (
            <div key={sheet.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-800">Goal Sheet #{sheet.id}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{sheet.goals.length} goals · Cycle #{sheet.cycle_id}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[sheet.status]}`}>
                  {sheet.status}
                </span>
              </div>

              {sheet.manager_comment && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  <span className="font-medium">Manager: </span>{sheet.manager_comment}
                </div>
              )}

              <div className="mt-4 flex gap-2 flex-wrap">
                {(sheet.status === "draft" || sheet.status === "returned") && (
                  <button
                    onClick={async () => {
                      await api.post(`/api/goals/sheet/${sheet.id}/submit`);
                      window.location.reload();
                    }}
                    className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition"
                  >
                    Submit for Approval
                  </button>
                )}
                {sheet.status === "approved" && (
                  <button
                    onClick={() => navigate(`/employee/checkin/${sheet.id}`)}
                    className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-700 transition"
                  >
                    Do Check-in
                  </button>
                )}
              </div>

              {/* Goals summary */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sheet.goals.map(goal => (
                  <div key={goal.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                    <span className="text-gray-700 truncate">{goal.title}</span>
                    <span className="ml-2 text-indigo-600 font-semibold shrink-0">{goal.weightage}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
