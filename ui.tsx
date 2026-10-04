export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Applied: "bg-slate-100 text-slate-700",
    "Under Review": "bg-blue-100 text-blue-700",
    Shortlisted: "bg-amber-100 text-amber-700",
    "Interview Scheduled": "bg-indigo-100 text-indigo-700",
    Selected: "bg-emerald-100 text-emerald-700",
    Rejected: "bg-red-100 text-red-700",
    open: "bg-emerald-100 text-emerald-700",
    closed: "bg-slate-100 text-slate-500",
    Placed: "bg-emerald-100 text-emerald-700",
    Offered: "bg-amber-100 text-amber-700",
    Joined: "bg-brand-100 text-brand-700",
    Pending: "bg-slate-100 text-slate-600",
  };
  return <span className={`badge ${map[status] ?? "bg-slate-100 text-slate-700"}`}>{status}</span>;
}

export function StatCard({
  label,
  value,
  icon,
  color = "brand",
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color?: "brand" | "emerald" | "amber" | "rose" | "violet" | "sky";
}) {
  const colors: Record<string, string> = {
    brand: "bg-brand-50 text-brand-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    violet: "bg-violet-50 text-violet-700",
    sky: "bg-sky-50 text-sky-700",
  };
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-slate-800">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="card flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 text-slate-300">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.625a2.625 2.625 0 01-2.622 2.375H7.247a2.625 2.625 0 01-2.622-2.375L4 7.5m8.25 3v6.75m0-6.75l-3 3m3-3l3 3M3.375 7.5h17.25" />
        </svg>
      </div>
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmModal({
  open,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} title="Confirm" onClose={onCancel}>
      <p className="mb-5 text-sm text-slate-600">{message}</p>
      <div className="flex justify-end gap-3">
        <button className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn-danger" onClick={onConfirm}>Delete</button>
      </div>
    </Modal>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
      <input
        className="input pl-9"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
