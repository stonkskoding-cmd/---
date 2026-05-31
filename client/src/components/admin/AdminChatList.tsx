import type { AdminChatThread } from '../../hooks/useAdminChat';

interface AdminChatListProps {
  threads: AdminChatThread[];
  selectedUserId: string | null;
  loading: boolean;
  onSelect: (userId: string) => void;
}

export default function AdminChatList({ threads, selectedUserId, loading, onSelect }: AdminChatListProps) {
  if (loading && threads.length === 0) {
    return <p className="p-4 text-sm text-gray-500">Загрузка диалогов…</p>;
  }

  if (threads.length === 0) {
    return <p className="p-4 text-sm text-gray-500">Пока нет сообщений от пользователей.</p>;
  }

  return (
    <ul className="divide-y divide-gray-100 overflow-y-auto">
      {threads.map((t) => {
        const active = t.userId === selectedUserId;
        const preview = t.lastMessage?.content ?? '—';
        const name = t.name || t.email?.split('@')[0] || 'Пользователь';
        return (
          <li key={t.userId}>
            <button
              type="button"
              onClick={() => onSelect(t.userId)}
              className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-gray-50 ${
                active ? 'bg-blue-50' : ''
              }`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#244E77] text-sm font-bold text-[#D4AF37]">
                {name.charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate font-semibold text-gray-900">{name}</span>
                  {t.unreadCount > 0 ? (
                    <span className="shrink-0 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      {t.unreadCount}
                    </span>
                  ) : null}
                </span>
                <span className="mt-0.5 block truncate text-xs text-gray-500">{preview}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
