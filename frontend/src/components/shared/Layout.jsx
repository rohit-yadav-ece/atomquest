import { useAuth } from "../../context/AuthContext";
import { useNavigate, NavLink } from "react-router-dom";

const NAV_LINKS = {
  employee: [
    { to: "/employee", label: "🎯 My Goals" },
    { to: "/employee/goals/new", label: "➕ New Goal Sheet" },
  ],
  manager: [
    { to: "/manager", label: "✅ Team Approvals" },
  ],
  admin: [
    { to: "/admin", label: "⚡ Admin Dashboard" },
  ],
};

const ROLE_COLOR = {
  employee: "#6366f1",
  manager:  "#0ea5e9",
  admin:    "#f59e0b",
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };
  const links = NAV_LINKS[user?.role] || [];
  const roleColor = ROLE_COLOR[user?.role] || "#6366f1";
  const initials = user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "U";

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#000", fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* Sidebar */}
      <aside style={{ width: 220, background: "#0a0a0a", borderRight: "1px solid #1a1a1a", display: "flex", flexDirection: "column", padding: "24px 16px", flexShrink: 0 }}>

        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <img
              src="https://images.seeklogo.com/logo-png/52/1/atomberg-logo-png_seeklogo-529953.png"
              alt="Atomberg"
              style={{ width: 28, height: 28, objectFit: "contain", borderRadius: 6, background: "#111", padding: 2 }}
            />
            <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>AtomQuest</span>
          </div>
          <span style={{ fontSize: 10, color: roleColor, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginLeft: 38 }}>
            {user?.role}
          </span>
        </div>

        {/* Nav links */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end
              style={({ isActive }) => ({
                display: "block",
                padding: "9px 12px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                textDecoration: "none",
                transition: "all 0.15s",
                background: isActive ? `${roleColor}18` : "transparent",
                color: isActive ? roleColor : "#555",
                border: isActive ? `1px solid ${roleColor}30` : "1px solid transparent",
              })}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${roleColor}22`, border: `1px solid ${roleColor}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: roleColor, flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#ccc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</div>
              <div style={{ fontSize: 10, color: "#444", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout}
            style={{ width: "100%", padding: "7px 12px", background: "transparent", border: "1px solid #1e1e1e", borderRadius: 7, fontSize: 12, color: "#555", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
            onMouseEnter={e => { e.target.style.color = "#f87171"; e.target.style.borderColor = "#3a1a1a"; }}
            onMouseLeave={e => { e.target.style.color = "#555"; e.target.style.borderColor = "#1e1e1e"; }}>
            Sign out →
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: "32px 36px", overflowY: "auto", background: "#000" }}>
        {children}
      </main>
    </div>
  );
}
