import { Outlet } from "react-router-dom";

export function StudentLayout() {
  return (
    <div>
      <header>🚍 UCE Safe Ride</header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
