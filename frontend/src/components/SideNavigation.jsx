"use client";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import API from "../service/api"; // Ensure API is imported for logout
import homeIcon from "../assets/icons/home.png";
import compassIcon from "../assets/icons/compass.png";
import reelIcon from "../assets/icons/reel.png";
import messengerIcon from "../assets/icons/messenger.png";
import bellIcon from "../assets/icons/bell.png";
import userIcon from "../assets/icons/user.png";
import settingsIcon from "../assets/icons/setting.png"
import logoutIcon from "../assets/icons/logout.png";


export default function SideNavigation() {
  const { authUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const parts = location.pathname.split("/").filter(Boolean);
  const currentPage = parts[parts.length - 1] || "dashboard";

  const navItems = [
    { id: "dashboard", label: "Home", iconUrl: homeIcon },
    { id: "explore", label: "Explore", iconUrl: compassIcon},
    { id: "videos", label: "Videos", iconUrl: reelIcon },
    // { id: "shorts", label: "Shorts", iconUrl: reelIcon },

    {
      id: "profile",
      label: "Profile",
      iconUrl: userIcon,
      path: `/dashboard/profile/${authUser?.user_id}`
    },
     {
      id: "Post-create",
      label: "Post Create",
      iconUrl: userIcon,
     
    },
    { id: "messages", label: "Messages", iconUrl: messengerIcon },
    { id: "notifications", label: "Notifications", iconUrl: bellIcon },
  ];

  const handleNav = (item) => {
    if (item.path) {
      // Direct route for Profile
      navigate(item.path);
    } else if (item.id === "dashboard") {
      navigate("/dashboard");
    } else {
      // Relative route for other dashboard tabs
      navigate(`/dashboard/${item.id}`);
    }
  };

  const handleLogout = async () => {
    try {
      
      await logout(); // Update Zustand state
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
      // Even if API fails, clear local state and redirect
      await logout();
      navigate("/login");
    }
  };

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-40 flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-primary">StreamSocial</h1>
        {authUser && (
          <p className="mt-2 text-sm text-muted-foreground">Hi, {authUser.username}</p>
        )}
      </div>

      <div className="flex-1 py-6">
        {navItems.map((item) => (
          <button
            key={item.id}
            // Use item.id for highlighting, use handleNav for navigation logic
            onClick={() => handleNav(item)}
            className={`w-full flex items-center gap-4 px-6 py-3 text-left transition-all duration-200 ${currentPage === item.id || (item.id === 'profile' && (location.pathname === item.path || currentPage === authUser?.user_id?.toString()))
                ? "bg-primary/10 text-primary border-r-2 border-primary"
                : "text-card-foreground hover:bg-muted hover:text-primary"
              }`}
          >
            <img
              src={item.iconUrl}
              alt={item.label}
              className="w-5 h-5 object-contain"
            />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="border-t border-border p-4">
        <button
          onClick={() => navigate("/dashboard/settings")}
          className="w-full flex items-center gap-4 px-2 py-3 text-left text-card-foreground hover:bg-muted hover:text-primary transition-colors rounded-lg mb-2"
        >
          <img
              src={settingsIcon}
       
              className="w-5 h-5 object-contain"
            />
          <span className="font-medium">Settings</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-2 py-3 text-left text-destructive hover:bg-destructive/10 transition-colors rounded-lg"
        >
          <img
              src={logoutIcon}
              
              className="w-5 h-5 object-contain"
            />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
}