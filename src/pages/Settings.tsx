import { useEffect, useState } from "react";
import { ArrowLeft, Globe, BookOpen, Info, Moon, Sun, Monitor, Type, Maximize2, Trash2, Github, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/use-theme";
import { useLanguage, type Language } from "@/hooks/use-language";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const fonts = ["Sans", "Crimson Pro", "Amiri"] as const;
const languages: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "ar", label: "العربية" },
];

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const [fontSize, setFontSize] = useState<number>(() => {
    const saved = localStorage.getItem("faydabook-reader-fontsize");
    return saved ? Number(saved) : 16;
  });
  const [fontIdx, setFontIdx] = useState<number>(() => {
    const saved = localStorage.getItem("faydabook-reader-fontidx");
    return saved ? Number(saved) : 1;
  });
  const [fitToPage, setFitToPage] = useState<boolean>(
    () => localStorage.getItem("faydabook-reader-fit") === "true"
  );

  useEffect(() => {
    localStorage.setItem("faydabook-reader-fontsize", String(fontSize));
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem("faydabook-reader-fontidx", String(fontIdx));
  }, [fontIdx]);

  useEffect(() => {
    localStorage.setItem("faydabook-reader-fit", String(fitToPage));
  }, [fitToPage]);



  const handleClearReadingData = () => {
    const keys = Object.keys(localStorage).filter(
      (k) => k.startsWith("reading-progress-") || k.startsWith("faydabook-bookmarks-")
    );
    keys.forEach((k) => localStorage.removeItem(k));
    toast.success("Reading history & bookmarks cleared");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-serif font-bold text-foreground">Settings</h1>
      </div>

      {/* Appearance */}
      <Section title="Appearance">
        <div className="glass rounded-2xl p-3">
          <div className="grid grid-cols-3 gap-1">
            {[
              { label: "Light", icon: Sun, value: "light" as const },
              { label: "Dark", icon: Moon, value: "dark" as const },
              { label: "System", icon: Monitor, value: "system" as const },
            ].map(({ label, icon: Icon, value }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  theme === value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Reading Preferences */}
      <Section title="Reading">
        <div className="glass rounded-2xl divide-y divide-border/30">
          {/* Font size */}
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <Type className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Font size</span>
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">{fontSize}px</span>
            </div>
            <Slider
              value={[fontSize]}
              min={12}
              max={28}
              step={1}
              onValueChange={([v]) => setFontSize(v)}
            />
          </div>

          {/* Font family */}
          <div className="px-4 py-4">
            <div className="flex items-center gap-2.5 mb-3">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Font family</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {fonts.map((f, i) => (
                <button
                  key={f}
                  onClick={() => setFontIdx(i)}
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                    fontIdx === i
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted"
                  }`}
                  style={{
                    fontFamily:
                      f === "Crimson Pro"
                        ? "'Crimson Pro', serif"
                        : f === "Amiri"
                          ? "'Amiri', serif"
                          : "'Inter', sans-serif",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Fit to page */}
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Maximize2 className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Fit to page</p>
                <p className="text-xs text-muted-foreground">Auto-resize text per page</p>
              </div>
            </div>
            <Switch checked={fitToPage} onCheckedChange={setFitToPage} />
          </div>
        </div>
      </Section>

      {/* General */}
      <Section title="General">
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2.5 mb-3">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Language</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {languages.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setLanguage(value)}
                className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                  language === value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Data */}
      <Section title="Data">
        <div className="glass rounded-2xl overflow-hidden">
          <button
            onClick={handleClearReadingData}
            className="flex items-center gap-3 px-4 py-3.5 w-full text-left text-destructive hover:bg-destructive/5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <div className="flex-1">
              <p className="text-sm font-medium">Clear reading data</p>
              <p className="text-xs text-destructive/70">Remove progress & bookmarks</p>
            </div>
          </button>
        </div>
      </Section>

      {/* About */}
      <Section title="About">
        <div className="glass rounded-2xl divide-y divide-border/30">
          <AboutRow icon={Info} label="Faydabook" value="v1.0.0" />
          <AboutRow icon={BookOpen} label="Shaykh Ibrahim Niass (ra)" />
          <AboutRow icon={Mail} label="Contact" value="hello@faydabook.com" />
          <AboutRow icon={Github} label="Source" value="GitHub" />
        </div>
        <p className="text-[11px] text-muted-foreground/70 text-center mt-4 px-4 leading-relaxed">
          Made with love for the Tijānī community.
          <br />
          May Allah grant benefit to all who read.
        </p>
      </Section>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="px-5 mb-6">
    <h2 className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2.5 font-semibold px-1">
      {title}
    </h2>
    {children}
  </section>
);

const AboutRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
}) => (
  <div className="flex items-center gap-3 px-4 py-3.5">
    <Icon className="w-4 h-4 text-primary shrink-0" />
    <span className="text-sm font-medium text-foreground flex-1">{label}</span>
    {value && <span className="text-xs text-muted-foreground">{value}</span>}
  </div>
);

export default Settings;
