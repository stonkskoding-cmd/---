import { FormEvent, useEffect, useRef, useState } from 'react';
import ChatMessage from '../chat/ChatMessage';
import type { ChatMessageItem } from '../../hooks/useChat';

interface AdminChatWindowProps {
  userEmail: string;
  messages: ChatMessageItem[];
  loading: boolean;
  sending: boolean;
  error: string | null;
  isConnected: boolean;
  isReconnecting: boolean;
  onSend: (text: string) => Promise<void>;
}

export default function AdminChatWindow({
  userEmail,
  messages,
  loading,
  sending,
  error,
  isConnected,
  isReconnecting,
  onSend,
}: AdminChatWindowProps) {
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    await onSend(text);
    setInput('');
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-gray-200 bg-gradient-to-r from-[#244E77] to-[#163754] px-4 py-3 text-white">
        <h2 className="font-semibold">{userEmail || 'Выберите диалог'}</h2>
        <p className="text-xs text-white/80">
          {isReconnecting ? 'Переподключение…' : isConnected ? 'Онлайн' : 'Подключение…'}
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
        {loading ? <p className="text-sm text-gray-500">Загрузка…</p> : null}
        {!loading && messages.length === 0 ? (
          <p className="text-center text-sm text-gray-500">Нет сообщений в этом диалоге.</p>
        ) : (
          messages.map((m) => <ChatMessage key={m.id} message={m} />)
        )}
        <div ref={endRef} />
      </div>

      {error ? <p className="px-4 py-1 text-xs text-red-600">{error}</p> : null}

      <form onSubmit={submit} className="flex gap-2 border-t border-gray-200 bg-white p-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ответ пользователю…"
          disabled={sending || !userEmail}
          className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#244E77]"
        />
        <button
          type="submit"
          disabled={sending || !input.trim() || !userEmail}
          className="rounded-xl bg-[#244E77] px-4 py-2 text-sm font-semibold text-[#D4AF37] disabled:opacity-50"
        >
          {sending ? '…' : 'Отправить'}
        </button>
      </form>
    </div>
  );
}
