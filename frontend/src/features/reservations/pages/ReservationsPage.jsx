import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReservationsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">My reservations</h1>
        <p className="text-sm text-muted-foreground">
          Upcoming and past stays will appear here once Phase 5 ships.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>No reservations yet</CardTitle>
          <CardDescription>Browse hotels to make your first booking.</CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  );
}
