import { useMemo, useState } from "react";
import Icon from "./components/Icon";
import Modal from "./components/Modal";
import PageHeader from "./components/PageHeader";
import Sidebar from "./components/Sidebar";
import StatusBadge from "./components/StatusBadge";
import { seedActivity, seedArchives, seedJobs } from "./data/seed";
import { useLocalStorage } from "./hooks/useLocalStorage";

const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100";
const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50";

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function App() {
  const [view, setView] = useState("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [jobs, setJobs] = useLocalStorage("vaultly.jobs", seedJobs);
  const [archives, setArchives] = useLocalStorage("vaultly.archives", seedArchives);
  const [activity, setActivity] = useLocalStorage("vaultly.activity", seedActivity);
  const [settings, setSettings] = useLocalStorage("vaultly.settings", {
    emailAlerts: true,
    warningAlerts: true,
    compactMode: false,
  });

  const metrics = useMemo(() => {
    const protectedItems = jobs.reduce((sum, job) => sum + job.protectedItems, 0);
    const storage = jobs.reduce((sum, job) => sum + job.storageGb, 0);
    const active = jobs.filter((job) => job.status !== "Paused").length;
    const warnings = jobs.filter((job) => job.status === "Warning").length;
    return { protectedItems, storage, active, warnings };
  }, [jobs]);

  function addActivity(type, message, tone = "info") {
    const entry = {
      id: `ACT-${Date.now()}`,
      type,
      message,
      time: "Just now",
      tone,
    };
    setActivity((current) => [entry, ...current]);
  }

  function createJob(form) {
    const id = `JOB-${Math.floor(1100 + Math.random() * 8000)}`;
    const job = {
      id,
      name: form.name,
      source: form.source,
      scope: form.scope,
      schedule: form.schedule,
      status: "Healthy",
      lastRun: "Not run yet",
      nextRun: form.schedule,
      protectedItems: 0,
      storageGb: 0,
      retentionDays: Number(form.retentionDays),
    };

    setJobs((current) => [job, ...current]);
    addActivity("Job created", `${form.name} was created and scheduled.`, "success");
    setCreateOpen(false);
  }

  function runJob(jobId) {
    const job = jobs.find((item) => item.id === jobId);
    if (!job) return;

    const changedItems = Math.floor(20 + Math.random() * 400);
    const storageAdded = Number((0.2 + Math.random() * 2.5).toFixed(1));

    setJobs((current) =>
      current.map((item) =>
        item.id === jobId
          ? {
              ...item,
              status: "Healthy",
              lastRun: "Just now",
              protectedItems: item.protectedItems + changedItems,
              storageGb: Number((item.storageGb + storageAdded).toFixed(1)),
            }
          : item,
      ),
    );

    const archive = {
      id: `ARC-${Date.now()}`,
      item: `Backup snapshot — ${new Date().toLocaleDateString("en-IN")}`,
      source: job.source,
      owner: job.scope,
      jobName: job.name,
      backedUpAt: "Just now",
      size: `${storageAdded} GB`,
      versions: 1,
    };
    setArchives((current) => [archive, ...current]);
    addActivity(
      "Backup completed",
      `${job.name} protected ${changedItems} changed items.`,
      "success",
    );
  }

  function restoreArchive(archive) {
    addActivity(
      "Restore started",
      `${archive.item} is being restored from ${archive.source}.`,
      "info",
    );
  }

  function resetDemo() {
    setJobs(seedJobs);
    setArchives(seedArchives);
    setActivity(seedActivity);
    setSettings({
      emailAlerts: true,
      warningAlerts: true,
      compactMode: false,
    });
  }

  return (
    <div className={settings.compactMode ? "text-[14px]" : ""}>
      <Sidebar
        currentView={view}
        onNavigate={setView}
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      <div className="min-h-screen bg-[#f5f7fb] lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <button
              aria-label="Open navigation"
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => setMobileNavOpen(true)}
            >
              <Icon name="menu" />
            </button>
            <div className="hidden text-sm text-slate-500 sm:block">
              Frontend demonstration · Data is stored in this browser
            </div>
            <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              Demo workspace
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {view === "dashboard" && (
            <Dashboard
              jobs={jobs}
              metrics={metrics}
              activity={activity}
              onCreate={() => setCreateOpen(true)}
              onNavigate={setView}
              onRunJob={runJob}
            />
          )}
          {view === "jobs" && (
            <Jobs
              jobs={jobs}
              onCreate={() => setCreateOpen(true)}
              onRunJob={runJob}
            />
          )}
          {view === "archive" && (
            <Archives archives={archives} onRestore={restoreArchive} />
          )}
          {view === "activity" && <Activity activity={activity} />}
          {view === "settings" && (
            <Settings
              settings={settings}
              setSettings={setSettings}
              onReset={resetDemo}
            />
          )}
        </main>
      </div>

      {createOpen && (
        <CreateJobModal
          onClose={() => setCreateOpen(false)}
          onSubmit={createJob}
        />
      )}
    </div>
  );
}

function Dashboard({
  jobs,
  metrics,
  activity,
  onCreate,
  onNavigate,
  onRunJob,
}) {
  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Overview"
        title="Backup operations"
        description="Monitor protection health, run backups, and restore cloud data from one workspace."
        actions={
          <button className={buttonPrimary} onClick={onCreate}>
            <Icon name="plus" size={18} />
            Create backup job
          </button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Protected items"
          value={formatNumber(metrics.protectedItems)}
          note="+318 today"
          icon="files"
        />
        <MetricCard
          label="Storage used"
          value={`${metrics.storage.toFixed(1)} GB`}
          note="67% of plan"
          icon="database"
        />
        <MetricCard
          label="Active jobs"
          value={metrics.active}
          note={`${jobs.length} total jobs`}
          icon="shield"
        />
        <MetricCard
          label="Needs attention"
          value={metrics.warnings}
          note={metrics.warnings ? "Review warnings" : "All clear"}
          icon="activity"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-bold text-slate-950">Backup jobs</h2>
              <p className="mt-1 text-xs text-slate-500">
                Current protection status across connected services
              </p>
            </div>
            <button
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              onClick={() => onNavigate("jobs")}
            >
              View all
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {jobs.slice(0, 4).map((job) => (
              <div
                key={job.id}
                className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold text-slate-900">
                      {job.name}
                    </p>
                    <StatusBadge status={job.status} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {job.source} · {job.scope} · Last run {job.lastRun}
                  </p>
                </div>
                <button
                  className={buttonSecondary}
                  disabled={job.status === "Paused"}
                  onClick={() => onRunJob(job.id)}
                >
                  <Icon name="play" size={16} />
                  Run now
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-bold text-slate-950">Storage by service</h2>
          <p className="mt-1 text-xs text-slate-500">
            Browser-generated demo metrics
          </p>
          <div className="mt-6 space-y-5">
            {jobs.map((job) => {
              const max = Math.max(...jobs.map((item) => item.storageGb), 1);
              const width = Math.max((job.storageGb / max) * 100, 4);
              return (
                <div key={job.id}>
                  <div className="flex justify-between gap-3 text-xs">
                    <span className="truncate font-medium text-slate-700">
                      {job.source}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {job.storageGb} GB
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-950">Recent activity</h2>
            <p className="mt-1 text-xs text-slate-500">
              Backup, restore, and configuration events
            </p>
          </div>
          <button
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            onClick={() => onNavigate("activity")}
          >
            View log
          </button>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {activity.slice(0, 4).map((entry) => (
            <ActivityItem key={entry.id} entry={entry} />
          ))}
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value, note, icon }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
          <p className="mt-2 text-xs font-medium text-slate-500">{note}</p>
        </div>
        <span className="grid size-11 place-items-center rounded-2xl bg-blue-50 text-blue-600">
          <Icon name={icon} size={21} />
        </span>
      </div>
    </div>
  );
}

function Jobs({ jobs, onCreate, onRunJob }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");

  const filtered = jobs.filter((job) => {
    const textMatch =
      job.name.toLowerCase().includes(query.toLowerCase()) ||
      job.source.toLowerCase().includes(query.toLowerCase());
    const statusMatch = status === "All" || job.status === status;
    return textMatch && statusMatch;
  });

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Protection"
        title="Backup jobs"
        description="Create and manage scheduled backup policies for cloud applications."
        actions={
          <button className={buttonPrimary} onClick={onCreate}>
            <Icon name="plus" size={18} />
            New job
          </button>
        }
      />

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <label className="relative block w-full sm:max-w-sm">
            <Icon
              name="search"
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
              placeholder="Search jobs or services"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option>All</option>
            <option>Healthy</option>
            <option>Warning</option>
            <option>Paused</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Job</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Schedule</th>
                <th className="px-5 py-3.5 font-semibold">Last run</th>
                <th className="px-5 py-3.5 font-semibold">Items</th>
                <th className="px-5 py-3.5 font-semibold">Retention</th>
                <th className="px-5 py-3.5 font-semibold" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">{job.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {job.source} · {job.scope}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-5 py-4 text-slate-600">{job.schedule}</td>
                  <td className="px-5 py-4 text-slate-600">{job.lastRun}</td>
                  <td className="px-5 py-4 font-medium text-slate-800">
                    {formatNumber(job.protectedItems)}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {job.retentionDays} days
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      className={buttonSecondary}
                      disabled={job.status === "Paused"}
                      onClick={() => onRunJob(job.id)}
                    >
                      <Icon name="play" size={15} />
                      Run
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!filtered.length && (
            <div className="px-6 py-14 text-center">
              <p className="font-semibold text-slate-900">No jobs found</p>
              <p className="mt-1 text-sm text-slate-500">
                Try another search or status filter.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Archives({ archives, onRestore }) {
  const [query, setQuery] = useState("");
  const filtered = archives.filter((archive) =>
    `${archive.item} ${archive.source} ${archive.owner}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Recovery"
        title="Archives"
        description="Search protected content and simulate point-in-time restores."
      />

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <label className="relative block max-w-md">
            <Icon
              name="search"
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
              placeholder="Search files, folders, owners, or services"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.map((archive) => (
            <div
              key={archive.id}
              className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-600">
                  <Icon name="archive" size={20} />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">
                    {archive.item}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {archive.source} · {archive.owner} · {archive.backedUpAt}
                  </p>
                  <p className="text-xs text-slate-400">
                    {archive.size} · {archive.versions} version
                    {archive.versions === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <button
                className={buttonSecondary}
                onClick={() => onRestore(archive)}
              >
                <Icon name="restore" size={16} />
                Restore
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Activity({ activity }) {
  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Audit trail"
        title="Activity"
        description="A local event history for backup, restore, and configuration actions."
      />
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="space-y-3">
          {activity.map((entry) => (
            <ActivityItem key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ entry }) {
  const tone = {
    success: "bg-emerald-50 text-emerald-600",
    warning: "bg-amber-50 text-amber-600",
    info: "bg-blue-50 text-blue-600",
    neutral: "bg-slate-100 text-slate-500",
  }[entry.tone];

  return (
    <div className="flex gap-3 rounded-2xl border border-slate-100 p-4">
      <span className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl ${tone}`}>
        <Icon name={entry.tone === "success" ? "check" : "activity"} size={17} />
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2">
          <p className="text-sm font-semibold text-slate-900">{entry.type}</p>
          <span className="text-xs text-slate-400">{entry.time}</span>
        </div>
        <p className="mt-1 text-sm leading-5 text-slate-500">{entry.message}</p>
      </div>
    </div>
  );
}

function Settings({ settings, setSettings, onReset }) {
  function toggle(key) {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="These settings are persisted in localStorage for this browser."
      />

      <div className="max-w-3xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-bold text-slate-950">Notifications and display</h2>
        <div className="mt-5 divide-y divide-slate-100">
          <SettingRow
            title="Email alerts"
            description="Receive a simulated summary when backup jobs complete."
            enabled={settings.emailAlerts}
            onToggle={() => toggle("emailAlerts")}
          />
          <SettingRow
            title="Warning alerts"
            description="Highlight skipped files and backup-health warnings."
            enabled={settings.warningAlerts}
            onToggle={() => toggle("warningAlerts")}
          />
          <SettingRow
            title="Compact display"
            description="Use slightly smaller typography across the dashboard."
            enabled={settings.compactMode}
            onToggle={() => toggle("compactMode")}
          />
        </div>

        <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-4">
          <h3 className="font-semibold text-red-900">Reset demo workspace</h3>
          <p className="mt-1 text-sm leading-5 text-red-700">
            Restore the original mock jobs, archives, activity, and settings.
          </p>
          <button
            className="mt-4 rounded-xl border border-red-200 bg-white px-3.5 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
            onClick={onReset}
          >
            Reset local data
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ title, description, enabled, onToggle }) {
  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
      </div>
      <button
        aria-pressed={enabled}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          enabled ? "bg-blue-600" : "bg-slate-300"
        }`}
        onClick={onToggle}
      >
        <span
          className={`absolute top-1 size-5 rounded-full bg-white shadow-sm transition ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function CreateJobModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    source: "Google Drive",
    scope: "",
    schedule: "Daily at 02:00",
    retentionDays: 90,
  });

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.scope.trim()) return;
    onSubmit(form);
  }

  return (
    <Modal title="Create backup job" onClose={onClose}>
      <form className="space-y-5 p-6" onSubmit={submit}>
        <Field label="Job name">
          <input
            required
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            placeholder="Example: Finance shared drive"
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Cloud service">
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
              value={form.source}
              onChange={(event) => update("source", event.target.value)}
            >
              <option>Google Drive</option>
              <option>OneDrive</option>
              <option>Box</option>
              <option>Slack</option>
            </select>
          </Field>

          <Field label="Retention">
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
              value={form.retentionDays}
              onChange={(event) => update("retentionDays", event.target.value)}
            >
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
              <option value={180}>180 days</option>
              <option value={365}>1 year</option>
            </select>
          </Field>
        </div>

        <Field label="Backup scope">
          <input
            required
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            placeholder="Example: Finance team or selected folders"
            value={form.scope}
            onChange={(event) => update("scope", event.target.value)}
          />
        </Field>

        <Field label="Schedule">
          <select
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            value={form.schedule}
            onChange={(event) => update("schedule", event.target.value)}
          >
            <option>Daily at 02:00</option>
            <option>Daily at 03:30</option>
            <option>Every 12 hours</option>
            <option>Every 6 hours</option>
            <option>Weekly on Sunday</option>
          </select>
        </Field>

        <div className="rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-900">
          This is a UI-only simulation. Creating the job writes its configuration
          to your browser’s localStorage.
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button type="button" className={buttonSecondary} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={buttonPrimary}>
            Create job
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-800">
        {label}
      </span>
      {children}
    </label>
  );
}

export default App;
