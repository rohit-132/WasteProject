export default function AdminSchedulePickupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="py-4">{children}</main>
    </div>
  );
}
