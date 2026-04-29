import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Globe, BookOpen, Info, Moon, Sun, Monitor, Type, Maximize2, Trash2, Mail, Heart, AlertTriangle } from "lucide-react";
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
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

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
    toast.success(t("settings.clearReading.toast"));
  };

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-12">
      <div className="container mx-auto max-w-2xl lg:px-8">
      {/* Header — matches Library/Home */}
      <div className="px-5 pt-12 lg:pt-4 pb-4 lg:pb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="hidden lg:block text-accent text-xs font-medium tracking-[0.2em] uppercase mb-2">
            Preferences
          </p>
          <h1 className="text-2xl lg:text-4xl font-display font-bold text-foreground">{t("settings.title")}</h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">{t("settings.subtitle")}</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {/* Appearance */}
        <Section title={t("settings.appearance")}>
          <div className="glass rounded-2xl p-2 mx-5">
            <div className="grid grid-cols-3 gap-1">
              {[
                { label: t("settings.theme.light"), icon: Sun, value: "light" as const },
                { label: t("settings.theme.dark"), icon: Moon, value: "dark" as const },
                { label: t("settings.theme.system"), icon: Monitor, value: "system" as const },
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
        <Section title={t("settings.reading")}>
          <div className="glass rounded-2xl divide-y divide-border/30 mx-5">
            {/* Font size */}
            <div className="px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <Type className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{t("settings.fontSize")}</span>
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
                <span className="text-sm font-medium text-foreground">{t("settings.fontFamily")}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {fonts.map((f, i) => (
                  <button
                    key={f}
                    onClick={() => setFontIdx(i)}
                    className={`px-2 py-2 rounded-xl text-xs font-medium transition-all ${
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
                  <p className="text-sm font-medium text-foreground">{t("settings.fitToPage")}</p>
                  <p className="text-xs text-muted-foreground">{t("settings.fitToPage.desc")}</p>
                </div>
              </div>
              <Switch checked={fitToPage} onCheckedChange={setFitToPage} />
            </div>
          </div>
        </Section>

        {/* Language */}
        <Section title={t("settings.language")}>
          <div className="glass rounded-2xl p-4 mx-5">
            <div className="flex items-center gap-2.5 mb-3">
              <Globe className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{t("settings.interfaceLanguage")}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {languages.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setLanguage(value)}
                  className={`px-2 py-2 rounded-xl text-xs font-medium transition-all ${
                    language === value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted"
                  }`}
                  style={value === "ar" ? { fontFamily: "'Amiri', serif" } : undefined}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Data */}
        <Section title={t("settings.data")}>
          <div className="glass rounded-2xl overflow-hidden mx-5">
            <button
              onClick={handleClearReadingData}
              className="flex items-center gap-3 px-4 py-3.5 w-full text-left text-destructive hover:bg-destructive/5 transition-colors"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">{t("settings.clearReading")}</p>
                <p className="text-xs text-destructive/70">{t("settings.clearReading.desc")}</p>
              </div>
            </button>
          </div>
        </Section>

        {/* About */}
        <Section title={t("settings.about")}>
          <div className="glass rounded-2xl divide-y divide-border/30 mx-5">
            <AboutRow icon={Info} label="Faydabook" value="v1.0.0" />
            <AboutRow icon={BookOpen} label="Shaykh Ibrahim Niass (ra)" />
            <AboutRow icon={Mail} label={t("settings.contact")} value="admin@diatech.consulting" />
          </div>

          {/* Disclaimer */}
          <div className="glass rounded-2xl mx-5 mt-3 p-4 flex gap-3">
            <AlertTriangle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground mb-1">
                {t("settings.disclaimer.title")}
              </p>
              <p
                className="text-xs text-muted-foreground leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: t("settings.disclaimer.body", {
                    email:
                      '<a href="mailto:admin@diatech.consulting" class="text-primary underline underline-offset-2">admin@diatech.consulting</a>',
                  }),
                }}
              />
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground/70 text-center mt-5 px-8 leading-relaxed flex items-center justify-center gap-1.5">
            {t("settings.madeWith", { heart: "♥" }).split("♥")[0]}
            <Heart className="w-3 h-3 text-primary fill-primary" />
            {t("settings.madeWith", { heart: "♥" }).split("♥")[1]}
          </p>
        </Section>
      </motion.div>
      </div>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-7">
    <h2 className="text-gold font-serif text-lg font-semibold px-5 mb-3">{title}</h2>
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
