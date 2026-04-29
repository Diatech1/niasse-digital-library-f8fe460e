import { Link, useLocation } from "react-router-dom";
import { Search } from "lucide-react";

const links = [
  { to: "/desktop", label: "Home" },
  { to: "/desktop/library", label: "Library" },
  { to: "/desktop/listen", label: "Listen" },
  { to: "/desktop/about", label: "About" },
];

const DesktopNavbar = () => {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-8">
        <Link to="/desktop" className="font-serif text-xl font-bold tracking-tight">
          Fayda<span className="text-primary">book</span>
        </Link>
        <nav className="flex items-center gap-8">
          {links.map((l) => {
            const active = pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <button
            aria-label="Search"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Search className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </header>
  );
};

export default DesktopNavbar;
