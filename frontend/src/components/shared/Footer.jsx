export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} Hotel Booking — Academic Project</span>
        <span>v0.1</span>
      </div>
    </footer>
  );
}
