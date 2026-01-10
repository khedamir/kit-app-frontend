import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { BottomNav } from "./Navigation";

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 pb-20 md:pb-6">
        <Outlet />
      </main>
      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
