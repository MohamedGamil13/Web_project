import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HotelDetailsPage() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <Link to="/hotels" className="text-sm text-muted-foreground underline">
        ← Back to hotels
      </Link>
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Hotel #{id}</h1>
        <p className="text-sm text-muted-foreground">★★★★ · City · 4.5 average rating</p>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Single room</CardTitle>
            <CardDescription>Capacity 1 · $90 / night</CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="sm">Reserve</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Double room</CardTitle>
            <CardDescription>Capacity 2 · $140 / night</CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="sm">Reserve</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Suite</CardTitle>
            <CardDescription>Capacity 4 · $260 / night</CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="sm">Reserve</Button>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Reviews</h2>
        <p className="text-sm text-muted-foreground">Reviews list lands in Phase 6.</p>
      </section>
    </div>
  );
}
