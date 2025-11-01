"use client"

export default function Navigation({ currentPage, onNavigate, onLogout }) {
  const navItems = [
    { id: "/", label: "Home", icon: "🏠" },
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "post-create", label: "Post", icon: "➕" },
    { id: "messages", label: "Messages", icon: "💬" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              currentPage === item.id
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-card-foreground"
            }`}
          >
            <span className="text-xl mb-1">{item.icon}</span>
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
        <button
          onClick={onLogout}
          className="flex flex-col items-center p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
        >
          <span className="text-xl mb-1">🚪</span>
          <span className="text-xs">Logout</span>
        </button>
      </div>
    </nav>
  )
}
