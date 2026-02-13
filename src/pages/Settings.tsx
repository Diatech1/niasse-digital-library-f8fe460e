import { ArrowLeft, ChevronRight, Globe, BookOpen, Info, User, LogOut, Moon, Sun, Monitor } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-6">
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-serif font-bold text-foreground">Profile & Settings</h1>
      </div>

      {/* Profile card */}
      <div className="mx-5 glass rounded-2xl p-4 flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h3 className="font-serif font-semibold text-foreground">Ahmadou Bamba</h3>
          <p className="text-xs text-muted-foreground">bamba.the.great@khadim.com</p>
        </div>
      </div>

      {/* Appearance */}
      <section className="px-5 mb-8">
        <h2 className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-semibold">
          Appearance
        </h2>
        <div className="glass rounded-2xl overflow-hidden">
          <div className="flex items-center justify-center gap-1 p-3">
            {[
              { label: "Light", icon: Sun },
              { label: "Dark", icon: Moon },
              { label: "System", icon: Monitor },
            ].map(({ label, icon: Icon }, i) => (
              <button
                key={label}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  i === 1
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Reading Preferences */}
      <section className="px-5 mb-8">
        <div className="glass rounded-2xl overflow-hidden">
          <SettingsItem icon={BookOpen} label="Reading Preferences" />
        </div>
      </section>

      {/* General */}
      <section className="px-5 mb-8">
        <h2 className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-semibold">
          General
        </h2>
        <div className="glass rounded-2xl overflow-hidden divide-y divide-border/30">
          <SettingsItem icon={Globe} label="Language" value="English" />
        </div>
      </section>

      {/* About */}
      <section className="px-5 mb-8">
        <h2 className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-semibold">
          About
        </h2>
        <div className="glass rounded-2xl overflow-hidden divide-y divide-border/30">
          <SettingsItem icon={Info} label="About Faydabook" />
          <SettingsItem icon={BookOpen} label="Shaykh Ibrahim Niass (ra)" />
        </div>
      </section>

      {/* Account */}
      <section className="px-5 mb-8">
        <h2 className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-semibold">
          Account
        </h2>
        <div className="glass rounded-2xl overflow-hidden">
          <button className="flex items-center gap-3 px-4 py-3.5 w-full text-left text-destructive">
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Log Out</span>
          </button>
        </div>
      </section>
    </div>
  );
};

const SettingsItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
}) => (
  <button className="flex items-center gap-3 px-4 py-3.5 w-full text-left">
    <Icon className="w-4 h-4 text-primary" />
    <span className="text-sm font-medium text-foreground flex-1">{label}</span>
    {value && <span className="text-xs text-muted-foreground">{value}</span>}
    <ChevronRight className="w-4 h-4 text-muted-foreground" />
  </button>
);

export default Settings;
