import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Loader2, DollarSign, TrendingUp, Sparkles, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { apiClient, type EventResponse, type BudgetResponse } from "../api/client";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#f97316", "#84cc16"];

export function Finance() {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [budget, setBudget] = useState<BudgetResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load events on mount
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const eventsList = await apiClient.getAllEvents();
      setEvents(eventsList);
      if (eventsList.length > 0) {
        setSelectedEventId(eventsList[0].id);
        loadBudget(eventsList[0].id);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
      setError('Не удалось загрузить список событий');
    } finally {
      setLoading(false);
    }
  };

  const loadBudget = async (eventId: number) => {
    try {
      setLoading(true);
      setError(null);
      const budgetData = await apiClient.getBudgetByEventId(eventId);
      setBudget(budgetData);
    } catch (err) {
      console.error('Failed to load budget:', err);
      setBudget(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateBudget = async () => {
    if (!selectedEventId) return;
    
    try {
      setCalculating(true);
      setError(null);
      const budgetData = await apiClient.calculateBudget(selectedEventId);
      setBudget(budgetData);
    } catch (err) {
      console.error('Failed to calculate budget:', err);
      setError('Не удалось рассчитать бюджет. Проверьте, что событие создано и имеет все необходимые данные.');
    } finally {
      setCalculating(false);
    }
  };

  const handleEventChange = (eventId: string) => {
    const id = parseInt(eventId);
    setSelectedEventId(id);
    loadBudget(id);
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);
  const budgetItems = budget?.items || [];
  const totalAmount = budgetItems.reduce((sum, item) => sum + (Number(item.plannedAmount) || 0), 0);

  // Prepare chart data
  const chartData = budgetItems.map(item => ({
    name: item.category,
    amount: (Number(item.plannedAmount) || 0) / 1000 // в тысячах
  }));

  const pieData = budgetItems.map((item, idx) => ({
    name: item.category,
    value: Number(item.plannedAmount) || 0,
    color: COLORS[idx % COLORS.length]
  }));

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="size-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <DollarSign className="size-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Нет событий</h3>
        <p className="text-slate-600 mb-4">
          Создайте событие на вкладке "Планирование событий", чтобы рассчитать бюджет
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Финансы и сметы</h2>
        <p className="text-slate-600 mt-1">Управление бюджетом и расчет смет с помощью ИИ</p>
      </div>

      {/* Event Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Выберите событие</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Select value={selectedEventId?.toString()} onValueChange={handleEventChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите событие" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id.toString()}>
                      {event.name} - {event.eventDate ? (() => {
                        try {
                          return new Date(event.eventDate).toLocaleDateString('ru-RU');
                        } catch {
                          return 'Неверная дата';
                        }
                      })() : 'Дата не указана'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={calculateBudget} 
              disabled={!selectedEventId || calculating}
              className="flex items-center gap-2"
            >
              {calculating ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Расчет...
                </>
              ) : (
                <>
                  <Calculator className="size-4" />
                  Рассчитать бюджет с помощью ИИ
                </>
              )}
            </Button>
          </div>
          
          {selectedEvent && (
            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Дата:</span>
                  <span className="ml-2 font-medium">
                    {selectedEvent.eventDate ? (() => {
                      try {
                        return new Date(selectedEvent.eventDate).toLocaleDateString('ru-RU');
                      } catch {
                        return 'Неверная дата';
                      }
                    })() : 'Дата не указана'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600">Место:</span>
                  <span className="ml-2 font-medium">{selectedEvent.location}</span>
                </div>
                <div>
                  <span className="text-slate-600">Гостей:</span>
                  <span className="ml-2 font-medium">{selectedEvent.expectedGuests}</span>
                </div>
                <div>
                  <span className="text-slate-600">Лимит бюджета:</span>
                  <span className="ml-2 font-medium">
                    {selectedEvent.budgetLimit != null ? selectedEvent.budgetLimit.toLocaleString('ru-RU') : '0'} ₽
                  </span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Overview */}
      {budget ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Общий бюджет</CardTitle>
                <DollarSign className="size-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {Number(budget.totalAmount || 0).toLocaleString('ru-RU')} ₽
                </div>
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <Sparkles className="size-3" />
                    Сгенерировано с помощью GigaChat
                  </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Категорий расходов</CardTitle>
                <TrendingUp className="size-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{budgetItems.length}</div>
                <p className="text-xs text-slate-600 mt-1">Всего позиций</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Статус</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="default" className="text-sm">
                  Активен
                </Badge>
                <p className="text-xs text-slate-600 mt-2">
                  {budget.createdAt ? (() => {
                    try {
                      return new Date(budget.createdAt).toLocaleDateString('ru-RU');
                    } catch {
                      return 'Дата не указана';
                    }
                  })() : 'Дата не указана'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Budget Items Table */}
          <Card>
            <CardHeader>
              <CardTitle>Детализация бюджета</CardTitle>
              <p className="text-sm text-slate-600 mt-1">Разбивка расходов по категориям</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {budgetItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-slate-900">{item.category}</h4>
                      {item.description && (
                        <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-semibold text-slate-900">
                        {Number(item.plannedAmount || 0).toLocaleString('ru-RU')} ₽
                      </div>
                      <div className="text-xs text-slate-600">
                        {totalAmount > 0 ? ((Number(item.plannedAmount || 0) / totalAmount) * 100).toFixed(1) : 0}% от общего
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Распределение бюджета</CardTitle>
                <p className="text-sm text-slate-600">По категориям (в тыс. ₽)</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(value: number) => `${value.toFixed(0)} тыс. ₽`} />
                    <Bar dataKey="amount" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Структура расходов</CardTitle>
                <p className="text-sm text-slate-600">Доля каждой категории</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => 
                      value != null ? `${value.toLocaleString('ru-RU')} ₽` : '0 ₽'
                    } />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

        </>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Calculator className="size-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Бюджет не рассчитан</h3>
              <p className="text-slate-600 mb-4">
                Нажмите "Рассчитать бюджет с помощью ИИ", чтобы получить детальную смету
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
