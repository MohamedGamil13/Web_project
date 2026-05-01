import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>{user?.name ?? 'You'}</CardTitle>
          <CardDescription>{user?.email ?? 'Profile details will load after auth wiring.'}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Editing your profile lands in Phase 3. Password change ships in Phase 7.
        </CardContent>
      </Card>
    </div>
  );
}
