import Navbar from "../components/Navbar";

export default function UserSchedulePickupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="py-4">{children}</main>
    </div>
  );
}
