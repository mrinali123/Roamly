"use client";

interface Collab {
  id: string;
  invited_email: string;
  accepted_at: string | null;
  role: string;
}

interface CollaboratorAvatarsProps {
  collaborators: Collab[];
  ownerEmail?: string;
  onManage?: () => void;
}

function initials(email: string): string {
  const name = email.split("@")[0];
  return name.slice(0, 2).toUpperCase();
}

export default function CollaboratorAvatars({
  collaborators,
  ownerEmail,
  onManage,
}: CollaboratorAvatarsProps) {
  const accepted = collaborators.filter((c) => c.accepted_at);
  const pending = collaborators.filter((c) => !c.accepted_at);

  if (!ownerEmail && collaborators.length === 0) return null;

  return (
    <button
      onClick={onManage}
      className="flex items-center gap-1 group"
      title="Manage collaborators"
    >
      {/* Owner avatar */}
      {ownerEmail && (
        <div
          className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-sky/50 bg-sky/20 text-xs font-bold text-sky"
          title={`${ownerEmail} (Owner)`}
        >
          {initials(ownerEmail)}
          <span className="absolute -right-0.5 -top-0.5 text-[10px]">👑</span>
        </div>
      )}

      {/* Accepted collaborators */}
      {accepted.slice(0, 3).map((c) => (
        <div
          key={c.id}
          className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-navy bg-slate-600 text-xs font-bold text-white"
          title={`${c.invited_email} · ${c.role}`}
        >
          {initials(c.invited_email)}
        </div>
      ))}

      {/* Pending */}
      {pending.length > 0 && (
        <div
          className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-slate-600 bg-slate-800 text-xs text-slate-400"
          title={`${pending.length} pending invite${pending.length > 1 ? "s" : ""}`}
        >
          {pending.length}
        </div>
      )}

      <span className="ml-1.5 text-xs text-slate-500 opacity-0 transition group-hover:opacity-100">
        Manage
      </span>
    </button>
  );
}
