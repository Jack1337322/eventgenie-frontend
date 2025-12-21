import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { type UserResponse, type UserCreateRequest, type UserUpdateRequest } from "../../api/client";

interface UserFormProps {
  user?: UserResponse;
  onSubmit: (data: UserCreateRequest | UserUpdateRequest) => Promise<void>;
  onCancel: () => void;
}

export function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const isEdit = !!user;
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [role, setRole] = useState(user?.role || "USER");
  const [enabled, setEnabled] = useState(user?.enabled ?? true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isEdit && !password) {
      setError("Пароль обязателен при создании пользователя");
      return;
    }

    if (!isEdit && password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов");
      return;
    }

    setLoading(true);

    try {
      if (isEdit) {
        await onSubmit({
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          role: role as "ADMIN" | "USER",
          enabled,
        } as UserUpdateRequest);
      } else {
        await onSubmit({
          email,
          password,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          role: role as "ADMIN" | "USER",
        } as UserCreateRequest);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка сохранения пользователя';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {!isEdit && (
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
      )}

      {!isEdit && (
        <div className="space-y-2">
          <Label htmlFor="password">Пароль *</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={loading}
          />
          <p className="text-xs text-slate-500">Минимум 6 символов</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Имя</Label>
          <Input
            id="firstName"
            type="text"
            placeholder="Иван"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Фамилия</Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Иванов"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Роль</Label>
        <Select value={role} onValueChange={setRole} disabled={loading}>
          <SelectTrigger id="role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USER">Пользователь</SelectItem>
            <SelectItem value="ADMIN">Администратор</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isEdit && (
        <div className="flex items-center justify-between">
          <Label htmlFor="enabled">Активен</Label>
          <Switch
            id="enabled"
            checked={enabled}
            onCheckedChange={setEnabled}
            disabled={loading}
          />
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Сохранение..." : isEdit ? "Сохранить" : "Создать"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Отмена
        </Button>
      </div>
    </form>
  );
}
