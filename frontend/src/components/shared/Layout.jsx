import { useAuth } from "../../context/AuthContext";
import { useNavigate, NavLink } from "react-router-dom";
import { useState, useEffect, createContext, useContext } from "react";

export const ThemeContext = createContext({ dark: true, setDark: () => {} });
export function useTheme() { return useContext(ThemeContext); }

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
  const [dark, setDark] = useState(() => localStorage.getItem("aq_theme") !== "light");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    localStorage.setItem("aq_theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Close sidebar on route change (mobile)
  const handleNav = () => { if (isMobile) setSidebarOpen(false); };
  const handleLogout = () => { logout(); navigate("/login"); };

  const links = NAV_LINKS[user?.role] || [];
  const roleColor = ROLE_COLOR[user?.role] || "#6366f1";
  const initials = user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "U";

  const t = {
    pageBg:        dark ? "#000000" : "#f4f3ff",
    sidebarBg:     dark ? "#0a0a0a" : "#ffffff",
    sidebarBorder: dark ? "#1a1a1a" : "#e8e5ff",
    text:          dark ? "#ffffff" : "#1e1b4b",
    muted:         dark ? "#555555" : "#9ca3af",
    navActive:     dark ? `${roleColor}18` : `${roleColor}15`,
    navBorder:     dark ? `${roleColor}30` : `${roleColor}40`,
    navInactive:   dark ? "#555555" : "#888888",
    divider:       dark ? "#1a1a1a" : "#e8e5ff",
    userBg:        dark ? `${roleColor}22` : `${roleColor}15`,
    signoutBorder: dark ? "#1e1e1e" : "#e5e3ff",
    signoutText:   dark ? "#555555" : "#888888",
    toggleBg:      dark ? "#1a1a1a" : "#ede9ff",
    toggleBorder:  dark ? "#2a2a2a" : "#d4d0ff",
    toggleText:    dark ? "#888888" : "#6366f1",
    topbarBg:      dark ? "#0a0a0a" : "#ffffff",
    topbarBorder:  dark ? "#1a1a1a" : "#e8e5ff",
    hamBg:         dark ? "#1a1a1a" : "#f0eeff",
    hamColor:      dark ? "#888888" : "#6366f1",
    overlayBg:     "rgba(0,0,0,0.6)",
  };

  const SidebarContent = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "24px 16px" }}>

      {/* Logo */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <img src="https://images.seeklogo.com/logo-png/52/1/atomberg-logo-png_seeklogo-529953.png" alt="Atomberg"
            style={{ width: 28, height: 28, objectFit: "contain", borderRadius: 6, background: dark ? "#111" : "#f0eeff", padding: 2 }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: t.text, letterSpacing: "-0.5px" }}>AtomQuest</span>
        </div>
        <span style={{ fontSize: 10, color: roleColor, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginLeft: 38 }}>
          {user?.role}
        </span>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {links.map(l => (
          <NavLink key={l.to} to={l.to} end onClick={handleNav}
            style={({ isActive }) => ({
              display: "block", padding: "10px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500,
              textDecoration: "none", transition: "all 0.15s",
              background: isActive ? t.navActive : "transparent",
              color: isActive ? roleColor : t.navInactive,
              border: isActive ? `1px solid ${t.navBorder}` : "1px solid transparent",
            })}>
            {l.label}
          </NavLink>
        ))}
      </nav>

      {/* Theme toggle */}
      <button onClick={() => setDark(x => !x)}
        style={{ width: "100%", padding: "8px 12px", background: t.toggleBg, border: `1px solid ${t.toggleBorder}`, borderRadius: 8, fontSize: 12, color: t.toggleText, cursor: "pointer", fontWeight: 500, marginBottom: 12 }}>
        {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      {/* User info */}
      <div style={{ borderTop: `1px solid ${t.divider}`, paddingTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: t.userBg, border: `1px solid ${roleColor}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: roleColor, flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</div>
            <div style={{ fontSize: 10, color: t.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
          </div>
        </div>
        <button onClick={handleLogout}
          style={{ width: "100%", padding: "7px 12px", background: "transparent", border: `1px solid ${t.signoutBorder}`, borderRadius: 7, fontSize: 12, color: t.signoutText, cursor: "pointer", textAlign: "left" }}
          onMouseEnter={e => { e.target.style.color = "#f87171"; e.target.style.borderColor = "#3a1a1a"; }}
          onMouseLeave={e => { e.target.style.color = t.signoutText; e.target.style.borderColor = t.signoutBorder; }}>
          Sign out →
        </button>
      </div>
    </div>
  );

  return (
    <ThemeContext.Provider value={{ dark, setDark }}>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: t.pageBg, fontFamily: "'Inter', -apple-system, sans-serif" }}>

        {/* ── MOBILE TOPBAR ── */}
        {isMobile && (
          <div style={{ height: 56, background: t.topbarBg, borderBottom: `1px solid ${t.topbarBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", flexShrink: 0, position: "sticky", top: 0, zIndex: 100 }}>

            {/* Hamburger */}
            <button onClick={() => setSidebarOpen(x => !x)}
              style={{ width: 36, height: 36, background: t.hamBg, border: "none", borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, cursor: "pointer" }}>
              <div style={{ width: 16, height: 2, background: t.hamColor, borderRadius: 2 }} />
              <div style={{ width: 16, height: 2, background: t.hamColor, borderRadius: 2 }} />
              <div style={{ width: 16, height: 2, background: t.hamColor, borderRadius: 2 }} />
            </button>

            {/* Logo center */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <img src="https://images.seeklogo.com/logo-png/52/1/atomberg-logo-png_seeklogo-529953.png" alt="Atomberg"
                style={{ width: 22, height: 22, objectFit: "contain", borderRadius: 4 }} />
              <span style={{ fontSize: 15, fontWeight: 700, color: t.text }}>AtomQuest</span>
            </div>

            {/* Avatar right */}
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: t.userBg, border: `1px solid ${roleColor}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: roleColor }}>
              {initials}
            </div>
          </div>
        )}

        <div style={{ display: "flex", flex: 1, position: "relative" }}>

          {/* ── DESKTOP SIDEBAR ── */}
          {!isMobile && (
            <aside style={{ width: 220, background: t.sidebarBg, borderRight: `1px solid ${t.sidebarBorder}`, flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
              <SidebarContent />
            </aside>
          )}

          {/* ── MOBILE SIDEBAR OVERLAY ── */}
          {isMobile && sidebarOpen && (
            <>
              {/* Backdrop */}
              <div onClick={() => setSidebarOpen(false)}
                style={{ position: "fixed", inset: 0, background: t.overlayBg, zIndex: 200 }} />
              {/* Drawer */}
              <aside style={{ position: "fixed", top: 0, left: 0, width: 260, height: "100vh", background: t.sidebarBg, borderRight: `1px solid ${t.sidebarBorder}`, zIndex: 300, overflowY: "auto", animation: "slideIn 0.2s ease" }}>
                <style>{`@keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }`}</style>
                {/* Close button */}
                <button onClick={() => setSidebarOpen(false)}
                  style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: t.muted, cursor: "pointer", fontSize: 20, lineHeight: 1 }}>×</button>
                <SidebarContent />
              </aside>
            </>
          )}

          {/* ── MAIN CONTENT ── */}
          <main style={{ flex: 1, padding: isMobile ? "20px 16px" : "32px 36px", overflowY: "auto", background: t.pageBg, minWidth: 0 }}>
            {children}
          </main>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
