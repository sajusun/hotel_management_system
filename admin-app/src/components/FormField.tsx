type Props = {
  label: string;
  hint?: string;
  children: React.ReactNode;
};

export default function FormField({ label, hint, children }: Props) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        {hint && <div className="text-xs text-slate-500">{hint}</div>}
      </div>
      {children}
    </div>
  );
}

