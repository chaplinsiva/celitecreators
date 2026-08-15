import DashboardClient from "./DashboardClient";

export const metadata = {
  title: "Dashboard & Purchased Assets | Celite Market",
  description: "View and re-download your lifetime purchased templates and digital assets on Celite Market.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}

