import { useState } from "react";
import { 
  LayoutDashboard, 
  Calendar, 
  Wallet
} from "lucide-react";
import { Dashboard } from "./components/Dashboard";
import { EventPlanning } from "./components/EventPlanning";
import { Finance } from "./components/Finance";
import { Button } from "./components/ui/button";
import { cn } from "./lib/utils";

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
};

const navItems: NavItem[] = [
  { id: "dashboard", label: "Дашборд", icon: <LayoutDashboard className="size-5" />, component: <Dashboard /> },
  { id: "planning", label: "Планирование событий", icon: <Calendar className="size-5" />, component: <EventPlanning /> },
  { id: "finance", label: "Финансы и сметы", icon: <Wallet className="size-5" />, component: <Finance /> },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const activeComponent = navItems.find(item => item.id === activeTab)?.component;

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-slate-900">EventGenie</h1>
          <p className="text-slate-500 text-sm mt-1">Управление событиями</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3",
                activeTab === item.id && "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
              )}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
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
        {activeComponent}
      </main>
    </div>
  );
}