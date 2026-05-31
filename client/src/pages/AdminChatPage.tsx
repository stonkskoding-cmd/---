import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminChatList from '../components/admin/AdminChatList';
import AdminChatWindow from '../components/admin/AdminChatWindow';
import { useAdminChat } from '../hooks/useAdminChat';

export default function AdminChatPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const {
    threads,
    messages,
    loadingThreads,
    loadingMessages,
    sending,
    error,
    totalUnread,
    isConnected,
    isReconnecting,
    sendMessage,
  } = useAdminChat(selectedUserId);

  const selectedEmail = useMemo(() => {
    const t = threads.find((x) => x.userId === selectedUserId);
    return t?.email ?? '';
  }, [threads, selectedUserId]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-[#244E77]">Чат поддержки</h1>
          <p className="text-xs text-gray-500">
            {totalUnread > 0 ? `${totalUnread} непрочитанных` : 'Все прочитано'}
            {isConnected ? ' · онлайн' : ' · офлайн'}
          </p>
        </div>
        <Link
          to="/admin/dashboard"
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          ← Админка
        </Link>
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-0 p-0 md:flex-row md:p-4 md:gap-4">
        <aside className="w-full shrink-0 border-b border-gray-200 bg-white md:w-80 md:rounded-xl md:border md:shadow-sm">
          <div className="border-b border-gray-100 px-4 py-2 text-xs font-semibold uppercase text-gray-500">
            Диалоги
          </div>
          <div className="max-h-48 overflow-y-auto md:max-h-[calc(100vh-12rem)]">
            <AdminChatList
              threads={threads}
              selectedUserId={selectedUserId}
              loading={loadingThreads}
              onSelect={setSelectedUserId}
            />
          </div>
        </aside>

        <main className="flex min-h-[50vh] flex-1 flex-col overflow-hidden bg-white md:min-h-0 md:rounded-xl md:border md:border-gray-200 md:shadow-sm">
          {selectedUserId ? (
            <AdminChatWindow
              userEmail={selectedEmail}
              messages={messages}
              loading={loadingMessages}
              sending={sending}
              error={error}
              isConnected={isConnected}
              isReconnecting={isReconnecting}
              onSend={sendMessage}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-gray-500">
              Выберите пользователя слева, чтобы ответить в чате.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
