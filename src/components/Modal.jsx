import Icon from "./Icon";

export default function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h2 className="text-lg font-bold text-slate-950">{title}</h2>
          <button
            aria-label="Close"
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
