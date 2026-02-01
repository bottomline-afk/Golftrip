import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

function AppShell() {
  return (
    <div className="scanlines min-h-dvh flex flex-col bg-void">
      <main className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

export default AppShell;
