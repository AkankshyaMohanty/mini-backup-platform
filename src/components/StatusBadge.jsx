const styles = {
  Healthy: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  Warning: "bg-amber-50 text-amber-700 ring-amber-600/10",
  Paused: "bg-slate-100 text-slate-600 ring-slate-500/10",
  Running: "bg-blue-50 text-blue-700 ring-blue-600/10",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles[status] ?? styles.Paused}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
