import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          {isAuthenticated ? `Welcome back, ${user?.name?.split(' ')[0] ?? ''}` : 'Find your next stay'}
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Browse hotels, check availability, and book a room. This is the academic project shell — pages
          are wired but the data layer is mocked until each backend module ships.
        </p>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/hotels">Browse hotels</Link>
          </Button>
          {isAuthenticated ? (
            <Button asChild variant="outline">
              <Link to="/reservations">My reservations</Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link to="/register">Create an account</Link>
            </Button>
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Search</CardTitle>
            <CardDescription>Filter by city, price, stars, amenities.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Phase 4 deliverable.</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reserve</CardTitle>
            <CardDescription>Pick a room and dates, get a confirmation.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Phase 5 deliverable.</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Review</CardTitle>
            <CardDescription>Rate hotels you've stayed at.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Phase 6 deliverable.</CardContent>
        </Card>
      </section>
    </div>
  );
}
