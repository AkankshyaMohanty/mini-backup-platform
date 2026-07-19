import Icon from "./Icon";

const navItems = [
  ["dashboard", "Dashboard"],
  ["jobs", "Backup jobs"],
  ["archive", "Archives"],
  ["activity", "Activity"],
  ["settings", "Settings"],
];

export default function Sidebar({ currentView, onNavigate, open, onClose }) {
  return (
    <>
      {open && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-slate-950/35 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white px-4 py-5 transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-2">
          <button
            className="flex items-center gap-3 text-left"
            onClick={() => onNavigate("dashboard")}
          >
            <span className="grid size-10 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <Icon name="shield" size={22} />
            </span>
            <span>
              <span className="block text-lg font-bold tracking-tight text-slate-950">
                Vaultly
              </span>
              <span className="block text-xs text-slate-500">Cloud backup</span>
            </span>
          </button>

          <button
            aria-label="Close navigation"
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </div>

        <nav className="mt-8 space-y-1">
          {navItems.map(([id, label]) => {
            const active = currentView === id;
            return (
              <button
                key={id}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`}
                onClick={() => {
                  onNavigate(id);
                  onClose();
                }}
              >
                <Icon name={id} size={19} />
                {label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-950">
            <Icon name="database" size={18} />
            Storage usage
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-100">
            <div className="h-full w-[67%] rounded-full bg-blue-600" />
          </div>
          <div className="mt-2 flex justify-between text-xs text-blue-800">
            <span>266 GB used</span>
            <span>400 GB</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-2xl p-2">
          <div className="grid size-10 place-items-center rounded-full bg-slate-900 text-sm font-bold text-white">
            AM
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              Akankshya Mohanty
            </p>
            <p className="truncate text-xs text-slate-500">Workspace admin</p>
          </div>
        </div>
      </aside>
    </>
  );
}
