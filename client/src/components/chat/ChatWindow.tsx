import { FormEvent, useEffect, useRef, useState } from 'react';
import ChatMessage from './ChatMessage';
import type { ChatMessageItem } from '../../hooks/useChat';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessageItem[];
  loading: boolean;
  sending: boolean;
  error: string | null;
  isConnected: boolean;
  isAuthenticated: boolean;
  onSend: (text: string) => Promise<void>;
}

export default function ChatWindow({
  isOpen,
  onClose,
  messages,
  loading,
  sending,
  error,
  isConnected,
  isAuthenticated,
  onSend,
}: ChatWindowProps) {
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const button = document.getElementById('chat-floating-button');
      if (panelRef.current?.contains(target)) return;
      if (button?.contains(target)) return;
      onClose();
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen, onClose]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    await onSend(text);
    setInput('');
  };

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="fixed z-[1001] flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-2xl
        inset-0 sm:inset-auto sm:bottom-[100px] sm:right-6 sm:h-[500px] sm:w-[380px]"
      role="dialog"
      aria-label="Чат поддержки"
    >
      <header className="flex shrink-0 items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-white">
        <div>
          <h2 className="text-base font-semibold">Поддержка</h2>
          <p className="text-xs text-blue-100">
            {isAuthenticated
              ? isConnected
                ? 'Онлайн'
                : 'Подключение…'
              : 'Войдите в аккаунт'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1.5 text-white/90 transition hover:bg-white/20 hover:text-white"
          aria-label="Закрыть чат"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
        {!isAuthenticated ? (
          <p className="rounded-xl bg-white p-4 text-center text-sm text-gray-600 shadow-sm">
            Войдите или зарегистрируйтесь, чтобы написать в поддержку.
          </p>
        ) : loading ? (
          <p className="text-center text-sm text-gray-500">Загрузка сообщений…</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            Напишите нам — администратор ответит в этом чате.
          </p>
        ) : (
          messages.map((message) => <ChatMessage key={message.id} message={message} />)
        )}
        <div ref={endRef} />
      </div>

      {error ? (
        <p className="shrink-0 px-4 pb-1 text-center text-xs text-red-600">{error}</p>
      ) : null}

      <form
        onSubmit={submit}
        className="shrink-0 border-t border-gray-200 bg-white p-3"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isAuthenticated ? 'Ваше сообщение…' : 'Сначала войдите в аккаунт'}
            disabled={!isAuthenticated || sending}
            className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={!isAuthenticated || sending || !input.trim()}
            className="shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? '…' : 'Отправить'}
          </button>
        </div>
      </form>
    </div>
  );
}
