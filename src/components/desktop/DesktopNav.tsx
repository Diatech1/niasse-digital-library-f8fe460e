import { Link, useLocation } from "react-router-dom";
import { BookOpen, Sun, Moon, Languages } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useTheme } from "@/hooks/use-theme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DesktopNav = () => {
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const links = [
    { to: "/", label: t("nav.home") },
    { to: "/library", label: t("nav.library") },
    { to: "/audio", label: t("nav.audio") },
    { to: "/settings", label: t("nav.settings") },
  ];

  return (
    <nav className="hidden lg:block fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/60">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="font-display text-xl font-bold text-foreground">
            Fayda<span className="text-primary">book</span>
          </span>
        </Link>

        <div className="flex items-center gap-8">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <Languages className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(["en", "fr", "ar"] as const).map((lng) => (
                <DropdownMenuItem
                  key={lng}
                  onClick={() => setLanguage(lng)}
                  className={language === lng ? "text-primary" : ""}
                >
                  {lng === "en" ? "English" : lng === "fr" ? "Français" : "العربية"}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Toggle theme"
            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default DesktopNav;
