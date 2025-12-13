import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Calendar, FileText, Loader2, Sparkles, Check, Plus, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { apiClient, type EventCreateRequest, type EventResponse, type EventPlanResponse } from "../api/client";

export function EventPlanning() {
  const [loading, setLoading] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<EventResponse | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<EventPlanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering
  useEffect(() => {
    try {
      setMounted(true);
    } catch (e) {
      console.error('Error mounting EventPlanning:', e);
      setRenderError('Ошибка инициализации компонента');
    }
    return () => setMounted(false);
  }, []);

  // Valid values for Select components
  const validEventTypes = ["conference", "wedding", "corporate", "exhibition", "concert"];
  const validFormats = ["offline", "online", "hybrid"];

  // Form state - пустые поля для нового события
  const [formData, setFormData] = useState({
    name: "" as string,
    description: "" as string,
    eventType: "conference" as string,
    eventDate: "" as string,
    eventTime: "09:00" as string,
    location: "" as string,
    expectedGuests: "" as string,
    budgetLimit: "" as string,
    targetAudience: "" as string,
    format: "hybrid" as string,
    clientCompany: "" as string,
    clientContact: "" as string,
    clientEmail: "" as string,
    clientPhone: "" as string,
  });

  // Ensure Select values are always valid on mount
  useEffect(() => {
    if (!validEventTypes.includes(formData.eventType)) {
      setFormData(prev => ({ ...prev, eventType: "conference" }));
    }
    if (!validFormats.includes(formData.format)) {
      setFormData(prev => ({ ...prev, format: "hybrid" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateEvent = async () => {
    try {
      setLoading(true);
      setError(null);

      // Валидация обязательных полей
      if (!formData.name.trim()) {
        alert('Пожалуйста, введите название события');
        setLoading(false);
        return;
      }
      if (!formData.eventDate) {
        alert('Пожалуйста, выберите дату события');
        setLoading(false);
        return;
      }
      if (!formData.location.trim()) {
        alert('Пожалуйста, укажите место проведения');
        setLoading(false);
        return;
      }

      const expectedGuests = parseInt(formData.expectedGuests) || 0;
      const budgetLimit = parseFloat(formData.budgetLimit) || 0;

      if (expectedGuests <= 0) {
        alert('Пожалуйста, укажите количество гостей');
        setLoading(false);
        return;
      }
      if (budgetLimit <= 0) {
        alert('Пожалуйста, укажите бюджет');
        setLoading(false);
        return;
      }

      const eventData: EventCreateRequest = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        eventType: formData.eventType,
        eventDate: `${formData.eventDate}T${formData.eventTime}:00`,
        location: formData.location.trim(),
        expectedGuests,
        budgetLimit,
        targetAudience: formData.targetAudience.trim() || undefined,
        format: formData.format,
        clientCompany: formData.clientCompany.trim() || undefined,
        clientContact: formData.clientContact.trim() || undefined,
        clientEmail: formData.clientEmail.trim() || undefined,
        clientPhone: formData.clientPhone.trim() || undefined,
      };

      const event = await apiClient.createEvent(eventData);
      setCreatedEvent(event);
      alert(`Событие "${event.name}" успешно создано!`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      alert('Ошибка создания события: ' + errorMessage);
      console.error('Error creating event:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!createdEvent) {
      alert('Сначала создайте событие');
      return;
    }

    if (!createdEvent.id) {
      alert('Ошибка: ID события не найден');
      return;
    }

    try {
      setPlanLoading(true);
      setError(null);

      const plan = await apiClient.generateEventPlan(createdEvent.id);
      if (plan) {
      setGeneratedPlan(plan);
      alert('План события успешно сгенерирован!');
      } else {
        throw new Error('План не был получен от сервера');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      alert('Ошибка генерации плана: ' + errorMessage);
      console.error('Error generating plan:', err);
    } finally {
      setPlanLoading(false);
    }
  };

  // Parse timeline from generated plan with safe access
  const timelinePhases = (() => {
    try {
      if (!generatedPlan?.timeline) return [];
      const phases = generatedPlan.timeline.timeline_phases;
      return Array.isArray(phases) ? phases : [];
    } catch (e) {
      console.error('Error parsing timeline phases:', e);
      return [];
    }
  })();

  const tasks = (() => {
    try {
      if (!generatedPlan?.tasks) return [];
      const taskList = generatedPlan.tasks.tasks;
      return Array.isArray(taskList) ? taskList : [];
    } catch (e) {
      console.error('Error parsing tasks:', e);
      return [];
    }
  })();

  // Error boundary for rendering
  if (renderError) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-900 font-semibold mb-2">Ошибка отображения</h2>
          <p className="text-red-700 text-sm mb-4">{renderError}</p>
          <button
            onClick={() => {
              setRenderError(null);
              setCreatedEvent(null);
              setGeneratedPlan(null);
              setError(null);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Сбросить
          </button>
        </div>
      </div>
    );
  }

  // Don't render until mounted
  if (!mounted) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="size-8 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-slate-900">Планирование событий</h1>
        <p className="text-slate-600 mt-1">Создание и управление событиями с помощью ИИ</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column - Event Details Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Основные параметры события</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event-name">Название события</Label>
                <Input 
                  id="event-name" 
                  placeholder="Например: Конференция TechSummit 2025" 
                  value={formData.name || ""}
                  onChange={(e) => setFormData({...formData, name: e.target.value || ""})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-date">Дата события</Label>
                  <Input 
                    id="event-date" 
                    type="date" 
                  value={formData.eventDate || ""}
                  onChange={(e) => setFormData({...formData, eventDate: e.target.value || ""})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-time">Время</Label>
                  <Input 
                    id="event-time" 
                    type="time" 
                  value={formData.eventTime || "09:00"}
                  onChange={(e) => setFormData({...formData, eventTime: e.target.value || "09:00"})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-type">Тип события</Label>
                <Select 
                  value={validEventTypes.includes(formData.eventType) ? formData.eventType : "conference"}
                  onValueChange={(value) => {
                    if (value && validEventTypes.includes(value)) {
                      setFormData({...formData, eventType: value});
                    }
                  }}
                >
                  <SelectTrigger id="event-type">
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conference">Конференция</SelectItem>
                    <SelectItem value="wedding">Свадьба</SelectItem>
                    <SelectItem value="corporate">Корпоратив</SelectItem>
                    <SelectItem value="exhibition">Выставка</SelectItem>
                    <SelectItem value="concert">Концерт</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-format">Формат</Label>
                <Select 
                  value={validFormats.includes(formData.format) ? formData.format : "hybrid"}
                  onValueChange={(value) => {
                    if (value && validFormats.includes(value)) {
                      setFormData({...formData, format: value});
                    }
                  }}
                >
                  <SelectTrigger id="event-format">
                    <SelectValue placeholder="Выберите формат" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="offline">Оффлайн</SelectItem>
                    <SelectItem value="online">Онлайн</SelectItem>
                    <SelectItem value="hybrid">Гибридный</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-location">Место проведения</Label>
                <Input 
                  id="event-location" 
                  placeholder="Адрес площадки" 
                  value={formData.location || ""}
                  onChange={(e) => setFormData({...formData, location: e.target.value || ""})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-guests">Количество гостей</Label>
                  <Input 
                    id="event-guests" 
                    type="number" 
                    placeholder="500" 
                  value={formData.expectedGuests || ""}
                  onChange={(e) => setFormData({...formData, expectedGuests: e.target.value || ""})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-budget">Бюджет (₽)</Label>
                  <Input 
                    id="event-budget" 
                    type="number" 
                    placeholder="1000000" 
                  value={formData.budgetLimit || ""}
                  onChange={(e) => setFormData({...formData, budgetLimit: e.target.value || ""})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-audience">Целевая аудитория</Label>
                <Textarea 
                  id="event-audience" 
                  placeholder="Опишите целевую аудиторию..." 
                  value={formData.targetAudience || ""}
                  onChange={(e) => setFormData({...formData, targetAudience: e.target.value || ""})}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-description">Описание события</Label>
                <Textarea 
                  id="event-description" 
                  placeholder="Краткое описание мероприятия..." 
                  value={formData.description || ""}
                  onChange={(e) => setFormData({...formData, description: e.target.value || ""})}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Файлы и материалы</Label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors cursor-pointer">
                  <FileText className="size-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">Перетащите файлы или нажмите для загрузки</p>
                  <p className="text-xs text-slate-500 mt-1">Презентации, брифы, контракты</p>
                </div>
              </div>

              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  onClick={handleCreateEvent}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Создание события...
                    </>
                  ) : (
                    <>
                      <Check className="size-4 mr-2" />
                      Создать событие
                    </>
                  )}
                </Button>
                {createdEvent && (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={handleGeneratePlan}
                    disabled={planLoading}
                  >
                    {planLoading ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        Генерация плана...
                      </>
                    ) : (
                      <>
                        <Plus className="size-4 mr-2" />
                        Сгенерировать план с помощью ИИ
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-5" />
                Информация о клиенте
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client-name">Название компании</Label>
                <Input 
                  id="client-name" 
                  placeholder="ООО Компания"
                  value={formData.clientCompany || ""}
                  onChange={(e) => setFormData({...formData, clientCompany: e.target.value || ""})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-contact">Контактное лицо</Label>
                <Input 
                  id="client-contact" 
                  placeholder="Иванов Иван Иванович"
                  value={formData.clientContact || ""}
                  onChange={(e) => setFormData({...formData, clientContact: e.target.value || ""})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client-email">Email</Label>
                  <Input 
                    id="client-email" 
                    type="email" 
                    placeholder="email@company.ru"
                  value={formData.clientEmail || ""}
                  onChange={(e) => setFormData({...formData, clientEmail: e.target.value || ""})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-phone">Телефон</Label>
                  <Input 
                    id="client-phone" 
                    type="tel" 
                    placeholder="+7 (XXX) XXX-XX-XX"
                  value={formData.clientPhone || ""}
                  onChange={(e) => setFormData({...formData, clientPhone: e.target.value || ""})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Generated Plan and Tasks */}
        <div className="lg:col-span-3 space-y-6">
          {/* Event Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="size-5" />
                Автоматически сгенерированный план
              </CardTitle>
              <p className="text-sm text-slate-600">Программа мероприятия на основе параметров и ИИ-анализа</p>
            </CardHeader>
            <CardContent>
              {generatedPlan && Array.isArray(timelinePhases) && timelinePhases.length > 0 ? (
                <>
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 flex items-center gap-2">
                      <Sparkles className="size-4" />
                      План успешно сгенерирован с помощью GigaChat
                    </p>
                  </div>
                  <div className="space-y-3">
                    {timelinePhases.map((item: any, idx: number) => {
                      if (!item || typeof item !== 'object') return null;
                      return (
                      <div key={idx} className="flex gap-4 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                          <div className="text-sm text-slate-600 min-w-[140px]">{item?.time || '—'}</div>
                          <div className="flex-1 text-sm text-slate-900">{item?.activity || item?.description || '—'}</div>
                      </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="size-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-2">План события не создан</p>
                  <p className="text-sm text-slate-500">
                    Создайте событие и нажмите "Сгенерировать план с помощью ИИ"
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* To-Do List - Generated from AI */}
          <Card>
            <CardHeader>
              <CardTitle>Задачи и дедлайны</CardTitle>
              <p className="text-sm text-slate-600 mt-1">Список задач, сгенерированный ИИ</p>
            </CardHeader>
            <CardContent>
              {Array.isArray(tasks) && tasks.length > 0 ? (
                <div className="space-y-3">
                  {tasks.map((task: any, idx: number) => {
                    if (!task || typeof task !== 'object') return null;
                    return (
                    <div key={idx} className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                      <div className="flex-1">
                          <h4 className="text-sm font-medium text-slate-900">{task?.title || 'Без названия'}</h4>
                          {task?.description && (
                          <p className="text-xs text-slate-600 mt-1">{task.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                            {task?.deadline_days && (
                            <span className="text-xs text-slate-600">
                              Срок: {task.deadline_days} дней
                            </span>
                          )}
                            {task?.priority && (
                            <Badge variant={task.priority === "HIGH" ? "destructive" : "secondary"} className="text-xs">
                              {task.priority}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="size-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-2">Задачи не созданы</p>
                  <p className="text-sm text-slate-500">
                    Сгенерируйте план события, чтобы получить список задач
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Messages */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          {createdEvent && !generatedPlan && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                ✅ Событие "{createdEvent.name}" создано. Теперь сгенерируйте план с помощью ИИ!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
