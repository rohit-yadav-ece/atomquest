import { useAuth } from "../../context/AuthContext";
import { useNavigate, NavLink } from "react-router-dom";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = {
    employee: [
      { to: "/employee", label: "My Goals" },
      { to: "/employee/goals/new", label: "New Goal Sheet" },
    ],
    manager: [
      { to: "/manager", label: "Team Approvals" },
    ],
    admin: [
      { to: "/admin", label: "Admin Dashboard" },
    ],
  };

  const links = navLinks[user?.role] || [];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-indigo-900 text-white flex flex-col py-6 px-4 shrink-0">
        <div className="mb-8">
          <h1 className="text-xl font-bold">AtomQuest</h1>
          <p className="text-indigo-300 text-xs mt-1 capitalize">{user?.role}</p>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive ? "bg-indigo-600" : "hover:bg-indigo-800"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-indigo-700 pt-4 mt-4">
          <p className="text-xs text-indigo-300 truncate">{user?.name}</p>
          <button
            onClick={handleLogout}
            className="mt-2 text-xs text-indigo-300 hover:text-white transition"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
