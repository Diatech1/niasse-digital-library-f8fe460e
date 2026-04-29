import { Outlet } from "react-router-dom";
import DesktopNavbar from "@/components/desktop/DesktopNavbar";
import DesktopFooter from "@/components/desktop/DesktopFooter";

const DesktopLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <DesktopNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <DesktopFooter />
    </div>
  );
};

export default DesktopLayout;
