const DesktopFooter = () => {
  return (
    <footer className="border-t border-border/40 bg-background/60 mt-24">
      <div className="mx-auto max-w-7xl px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-serif text-sm text-muted-foreground">
          Fayda<span className="text-primary">book</span> — Digital Sanctuary of the Tijāniyyah
        </p>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} · All rights reserved
        </p>
      </div>
    </footer>
  );
};

export default DesktopFooter;
