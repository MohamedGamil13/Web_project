import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { updateProfileSchema } from '../schemas';
import { updateProfile } from '../api';

export default function ProfilePage() {
  const { user, setUser, bootstrapping } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [savedAt, setSavedAt] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      avatarUrl: user?.avatarUrl ?? '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
        avatarUrl: user.avatarUrl ?? '',
      });
    }
  }, [user, reset]);

  async function onSubmit(values) {
    setServerError(null);
    setSavedAt(null);
    const patch = { ...values };
    if (!patch.phone) patch.phone = '';
    if (!patch.avatarUrl) patch.avatarUrl = '';
    try {
      const updated = await updateProfile(patch);
      setUser(updated);
      reset({
        name: updated.name ?? '',
        email: updated.email ?? '',
        phone: updated.phone ?? '',
        avatarUrl: updated.avatarUrl ?? '',
      });
      setIsEditing(false);
      setSavedAt(new Date());
    } catch (err) {
      if (err?.code === 'CONFLICT') {
        setError('email', { message: err.message });
        return;
      }
      if (err?.code === 'VALIDATION_ERROR' && Array.isArray(err.details)) {
        for (const d of err.details) {
          if (d.field) setError(d.field, { message: d.message });
        }
        return;
      }
      setServerError(err?.message ?? 'Could not update profile');
    }
  }

  if (bootstrapping || !user) {
    return (
      <div className="mx-auto max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Loading…</CardDescription>
          </CardHeader>
          <CardContent />
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
          <p className="text-sm text-muted-foreground">
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
        {!isEditing && (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        )}
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{user.name}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" {...register('phone')} />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="avatarUrl">Avatar URL</Label>
                <Input id="avatarUrl" type="url" placeholder="https://…" {...register('avatarUrl')} />
                {errors.avatarUrl && (
                  <p className="text-xs text-destructive">{errors.avatarUrl.message}</p>
                )}
              </div>
              {serverError && (
                <p className="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-sm text-destructive">
                  {serverError}
                </p>
              )}
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting || !isDirty}>
                  {isSubmitting ? 'Saving…' : 'Save changes'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isSubmitting}
                  onClick={() => {
                    reset();
                    setIsEditing(false);
                    setServerError(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <dl className="grid grid-cols-3 gap-y-3 text-sm">
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="col-span-2">{user.phone || <span className="text-muted-foreground">—</span>}</dd>
              <dt className="text-muted-foreground">Avatar</dt>
              <dd className="col-span-2 break-all">
                {user.avatarUrl || <span className="text-muted-foreground">—</span>}
              </dd>
              <dt className="text-muted-foreground">Role</dt>
              <dd className="col-span-2">{user.role}</dd>
            </dl>
          )}
          {savedAt && !isEditing && (
            <p className="mt-4 text-xs text-muted-foreground">
              Saved {savedAt.toLocaleTimeString()}.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Change-password ships in Phase 7.</CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  );
}
