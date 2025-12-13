import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Calendar, Users, DollarSign, TrendingUp, Loader2, Sparkles } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { apiClient, type EventResponse } from "../api/client";

export function Dashboard() {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const eventsList = await apiClient.getAllEvents();
      setEvents(eventsList);
    } catch (err) {
      console.error('Failed to load events:', err);
      setError('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const totalEvents = events.length;
  const upcomingEvents = events.filter(e => {
    if (!e.eventDate) return false;
    try {
      return new Date(e.eventDate) >= new Date();
    } catch {
      return false;
    }
  }).length;
  const totalGuests = events.reduce((sum, e) => sum + (e.expectedGuests || 0), 0);
  const totalBudget = events.reduce((sum, e) => sum + (Number(e.budgetLimit) || 0), 0);
  const eventsWithPlans = 0; // TODO: Add planGenerated field to EventResponse

  // Group events by month for chart
  const eventsByMonth = events.reduce((acc, event) => {
    if (!event.eventDate) return acc;
    try {
      const month = new Date(event.eventDate).toLocaleDateString('ru-RU', { month: 'short' });
    acc[month] = (acc[month] || 0) + 1;
    } catch {
      // Skip invalid dates
    }
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(eventsByMonth).map(([month, count]) => ({
    month,
    events: count
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="size-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Дашборд</h2>
        <p className="text-slate-600 mt-1">Обзор событий и ключевые метрики</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Всего событий</CardTitle>
            <Calendar className="size-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalEvents}</div>
            <p className="text-xs text-slate-600 mt-1">
              {upcomingEvents} предстоящих
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Планов создано</CardTitle>
            <Sparkles className="size-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{eventsWithPlans}</div>
            <p className="text-xs text-slate-600 mt-1">
              Сгенерировано ИИ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Ожидается гостей</CardTitle>
            <Users className="size-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalGuests.toLocaleString('ru-RU')}</div>
            <p className="text-xs text-slate-600 mt-1">
              Всего участников
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Общий бюджет</CardTitle>
            <DollarSign className="size-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {(totalBudget / 1000000).toFixed(1)}M ₽
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Лимит по всем событиям
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Events Timeline Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>События по месяцам</CardTitle>
            <p className="text-sm text-slate-600 mt-1">Распределение событий</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="events" stroke="#6366f1" strokeWidth={2} name="Событий" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Последние события</CardTitle>
              <p className="text-sm text-slate-600 mt-1">Недавно созданные события</p>
            </div>
            <Button variant="outline" size="sm" onClick={loadEvents}>
              Обновить
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {events.length > 0 ? (
            <div className="space-y-3">
              {events.slice(0, 5).map((event) => (
                <div 
                  key={event.id} 
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-slate-900">{event.name}</h4>
                      {/* TODO: Add planGenerated field to EventResponse */}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {event.eventDate ? (() => {
                          try {
                            return new Date(event.eventDate).toLocaleDateString('ru-RU');
                          } catch {
                            return 'Неверная дата';
                          }
                        })() : 'Дата не указана'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="size-3" />
                        {event.expectedGuests} гостей
                      </span>
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-semibold text-slate-900">
                      {event.budgetLimit?.toLocaleString('ru-RU')} ₽
                    </div>
                    <div className="text-xs text-slate-600">Бюджет</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="size-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Нет событий</h3>
              <p className="text-slate-600 mb-4">
                Создайте первое событие на вкладке "Планирование событий"
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Assistant Info */}
      <Card className="border-indigo-200 bg-indigo-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Sparkles className="size-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-indigo-900 mb-1">EventGenie MVP 0</h3>
              <p className="text-sm text-indigo-700">
                Платформа использует GigaChat для автоматической генерации планов событий и расчета смет. 
                Создайте событие, чтобы начать работу с ИИ-ассистентом.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
