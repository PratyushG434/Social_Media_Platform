"use client";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import homeIcon from "../assets/icons/home.png";
import compassIcon from "../assets/icons/compass.png";
import reelIcon from "../assets/icons/reel.png";
import messengerIcon from "../assets/icons/messenger.png";
import bellIcon from "../assets/icons/bell.png";
import userIcon from "../assets/icons/user.png";
import settingsIcon from "../assets/icons/setting.png";
import logoutIcon from "../assets/icons/logout.png";
import createIcon from "../assets/icons/write.png";

export default function SideNavigation() {
  const { authUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const parts = location.pathname.split("/").filter(Boolean);
  const currentPage = parts[parts.length - 1] || "dashboard";

  const navItems = [
    { id: "dashboard", label: "Home", iconUrl: homeIcon },
    { id: "explore", label: "Explore", iconUrl: compassIcon },
    { id: "videos", label: "Videos", iconUrl: reelIcon },
    // { id: "shorts", label: "Shorts", iconUrl: reelIcon },

    {
      id: "profile",
      label: "Profile",
      iconUrl: userIcon,
      path: `/dashboard/profile/${authUser?.user_id}`,
    },
    {
      id: "Post-create",
      label: "Create Post",
      iconUrl: createIcon,
    },
    { id: "messages", label: "Messages", iconUrl: messengerIcon },
    { id: "notifications", label: "Notifications", iconUrl: bellIcon },
  ];

  const handleNav = (item) => {
    if (item.path) {
      navigate(item.path);
    } else if (item.id === "dashboard") {
      navigate("/dashboard");
    } else {
      navigate(`/dashboard/${item.id}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
      await logout();
      navigate("/login");
    }
  };

  const isItemActive = (item) => {
    if (item.id === "dashboard") {
      return location.pathname === "/dashboard" || currentPage === "dashboard";
    }
    if (item.id === "profile") {
      return (
        location.pathname === item.path ||
        currentPage === authUser?.user_id?.toString()
      );
    }
    return currentPage === item.id;
  };

  return (
    <>
      {/* 🖥️ Desktop / Large screen sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-40 flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-primary">StreamSocial</h1>
          {authUser && (
            <p className="mt-2 text-sm text-muted-foreground">
              Hi, {authUser.username}
            </p>
          )}
        </div>

        <div className="flex-1 py-6">
          {navItems.map((item) => {
            const active = isItemActive(item);
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item)}
                className={`w-full flex items-center gap-4 px-6 py-3 text-left transition-all duration-200 ${
                  active
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
            );
          })}
        </div>

        <div className="border-t border-border p-4">
          <button
            onClick={() => navigate("/dashboard/settings")}
            className="w-full flex items-center gap-4 px-2 py-3 text-left text-card-foreground hover:bg-muted hover:text-primary transition-colors rounded-lg mb-2"
          >
            <img src={settingsIcon} className="w-5 h-5 object-contain" />
            <span className="font-medium">Settings</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-2 py-3 text-left text-destructive hover:bg-destructive/10 transition-colors rounded-lg"
          >
            <img src={logoutIcon} className="w-5 h-5 object-contain" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </nav>

      {/* 📱 Mobile / Tablet bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border z-40 flex items-center justify-around">
        {navItems.map((item) => {
          const active = isItemActive(item);
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item)}
              className="relative flex flex-col items-center justify-center"
            >
              <div
                className={`flex items-center justify-center rounded-full p-2 transition-all ${
                  active ? "bg-primary/20" : "bg-transparent"
                }`}
              >
                <img
                  src={item.iconUrl}
                  alt={item.label}
                  className="w-6 h-6 object-contain"
                />
              </div>
              {/* Label optional, you can hide it if you want pure icon-only */}
              {/* <span className="text-[10px] mt-1 text-card-foreground">
                {item.label}
              </span> */}
            </button>
          );
        })}
      </nav>
    </>
  );
}
