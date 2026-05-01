import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function HotelsListPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Hotels</h1>
        <p className="text-sm text-muted-foreground">Search by city or hotel name. Filters land in Phase 4.</p>
      </header>

      <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
        <Input placeholder="City or hotel name…" />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((id) => (
          <Card key={id}>
            <CardHeader>
              <CardTitle>Sample hotel #{id}</CardTitle>
              <CardDescription>City · ★★★★ · from $120/night</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="sm">
                <Link to={`/hotels/${id}`}>View details</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
