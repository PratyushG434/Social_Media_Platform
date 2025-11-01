"use client"

export default function SideNavigation({ currentPage, onNavigate, onLogout }) {
  const navItems = [
    { id: "/", label: "Home", icon: "🏠" },
    { id: "explore", label: "Explore", icon: "🔍" },
    { id: "videos", label: "Videos", icon: "🎥" },
    { id: "shorts", label: "Shorts", icon: "⚡" },
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "messages", label: "Messages", icon: "💬" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
  ]

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-40 flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-primary">StreamSocial</h1>
        <p className="text-sm text-muted-foreground">Connect & Create</p>
      </div>

      <div className="flex-1 py-6">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-4 px-6 py-3 text-left transition-all duration-200 ${
              currentPage === item.id
                ? "bg-primary/10 text-primary border-r-2 border-primary"
                : "text-card-foreground hover:bg-muted hover:text-primary"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="border-t border-border p-4">
        <button
          onClick={() => onNavigate("settings")}
          className="w-full flex items-center gap-4 px-2 py-3 text-left text-card-foreground hover:bg-muted hover:text-primary transition-colors rounded-lg mb-2"
        >
          <span className="text-xl">⚙️</span>
          <span className="font-medium">Settings</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-2 py-3 text-left text-destructive hover:bg-destructive/10 transition-colors rounded-lg"
        >
          <span className="text-xl">🚪</span>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </nav>
  )
}
