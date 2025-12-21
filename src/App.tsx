import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Calendar, 
  Wallet,
  Settings,
  LogOut,
  User
} from "lucide-react";
import { Dashboard } from "./components/Dashboard";
import { EventPlanning } from "./components/EventPlanning";
import { Finance } from "./components/Finance";
import { Login } from "./components/Auth/Login";
import { Register } from "./components/Auth/Register";
import { UserManagement } from "./components/Admin/UserManagement";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { cn } from "./lib/utils";
import { useAuth } from "./contexts/AuthContext";
import { AuthProvider } from "./contexts/AuthContext";

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
};

const navItems: NavItem[] = [
  { id: "dashboard", label: "Дашборд", icon: <LayoutDashboard className="size-5" /> },
  { id: "planning", label: "Планирование событий", icon: <Calendar className="size-5" /> },
  { id: "finance", label: "Финансы и сметы", icon: <Wallet className="size-5" /> },
  { id: "admin", label: "Админ панель", icon: <Settings className="size-5" />, adminOnly: true },
];

function AppContent() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentRoute, setCurrentRoute] = useState<string>(() => window.location.pathname);
  const { isAuthenticated, isAdmin, user, logout, loading } = useAuth();

  // Handle browser navigation
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      setCurrentRoute(path);
      
      if (path === "/login" || path === "/register") {
        return;
      }
      
      // Map routes to tabs
      if (path === "/admin" || path.startsWith("/admin/")) {
        setActiveTab("admin");
      } else if (path === "/planning" || path.startsWith("/planning")) {
        setActiveTab("planning");
      } else if (path === "/finance" || path.startsWith("/finance")) {
        setActiveTab("finance");
      } else {
        setActiveTab("dashboard");
      }
    };

    handleRouteChange();
    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, []);

  // Redirect to login if not authenticated (except login/register pages)
  useEffect(() => {
    if (!loading && !isAuthenticated && currentRoute !== "/login" && currentRoute !== "/register") {
      window.history.pushState({}, "", "/login");
      setCurrentRoute("/login");
    }
  }, [loading, isAuthenticated, currentRoute]);

  // Redirect to dashboard if authenticated and on login/register pages
  useEffect(() => {
    if (!loading && isAuthenticated && (currentRoute === "/login" || currentRoute === "/register")) {
      window.history.pushState({}, "", "/");
      setCurrentRoute("/");
      setActiveTab("dashboard");
    }
  }, [loading, isAuthenticated, currentRoute]);

  // Render component only when tab is active
  const renderActiveComponent = () => {
    if (currentRoute === "/login") {
      return <Login />;
    }
    if (currentRoute === "/register") {
      return <Register />;
    }
    
    if (!isAuthenticated) {
      return null;
    }

    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "planning":
        return <EventPlanning />;
      case "finance":
        return <Finance />;
      case "admin":
        return <UserManagement />;
      default:
        return <Dashboard />;
    }
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === "admin") {
      window.history.pushState({}, "", "/admin");
      setCurrentRoute("/admin");
    } else if (tabId === "planning") {
      window.history.pushState({}, "", "/planning");
      setCurrentRoute("/planning");
    } else if (tabId === "finance") {
      window.history.pushState({}, "", "/finance");
      setCurrentRoute("/finance");
    } else {
      window.history.pushState({}, "", "/");
      setCurrentRoute("/");
    }
  };

  const handleLogout = () => {
    logout();
    window.history.pushState({}, "", "/login");
    setCurrentRoute("/login");
  };

  // Show login/register pages
  if (currentRoute === "/login" || currentRoute === "/register") {
    return currentRoute === "/login" ? <Login /> : <Register />;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-slate-900">EventGenie</h1>
          <p className="text-slate-500 text-sm mt-1">Управление событиями</p>
        </div>
        
        {/* User Info */}
        {user && (
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-full">
                <User className="size-4 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.email}
                </p>
                <Badge variant={isAdmin ? "default" : "secondary"} className="text-xs mt-1">
                  {isAdmin ? "Администратор" : "Пользователь"}
                </Badge>
              </div>
            </div>
          </div>
        )}
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems
            .filter(item => !item.adminOnly || isAdmin)
            .map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  activeTab === item.id && "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                )}
                onClick={() => handleTabClick(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Button>
            ))}
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="size-5" />
            <span>Выход</span>
          </Button>
          
          <div className="bg-indigo-50 rounded-lg p-4">
            <p className="text-indigo-900 text-sm font-semibold">EventGenie MVP 0</p>
            <p className="text-indigo-700 text-xs mt-1">
              Создание событий и расчет смет с помощью ИИ
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {renderActiveComponent()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
