import { Link, NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/hotels', label: 'Hotels' },
];

const authedLinks = [
  { to: '/reservations', label: 'My Reservations' },
  { to: '/profile', label: 'Profile' },
];

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="text-base font-semibold">
          Hotel Booking
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                cn(
                  'text-muted-foreground hover:text-foreground transition-colors',
                  isActive && 'text-foreground font-medium'
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
          {isAuthenticated &&
            authedLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cn(
                    'text-muted-foreground hover:text-foreground transition-colors',
                    isActive && 'text-foreground font-medium'
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
        </nav>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground">{user?.name ?? 'Account'}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
