export default function LearningLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <main className="flex-1">{children}</main>
    </div>
  );
}
