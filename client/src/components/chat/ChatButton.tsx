import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useChat } from '../../hooks/useChat';
import ChatWindow from './ChatWindow';

export default function ChatButton() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const {
    messages,
    loading,
    sending,
    error,
    unreadCount,
    isConnected,
    isAuthenticated,
    sendMessage,
  } = useChat(isOpen);

  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return null;
  }

  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <>
      <button
        id="chat-floating-button"
        type="button"
        onClick={toggle}
        aria-label={isOpen ? 'Закрыть чат' : 'Открыть чат поддержки'}
        aria-expanded={isOpen}
        className="group fixed bottom-6 right-6 z-[1000] flex h-[60px] w-[60px] items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition duration-300 hover:scale-110 hover:shadow-[0_8px_24px_rgba(37,99,235,0.45)] focus:outline-none focus:ring-4 focus:ring-blue-500/40 animate-pulse hover:animate-none"
      >
        {!isOpen && unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}

        {isOpen ? (
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>

      <ChatWindow
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        messages={messages}
        loading={loading}
        sending={sending}
        error={error}
        isConnected={isConnected}
        isAuthenticated={isAuthenticated}
        onSend={sendMessage}
      />
    </>
  );
}
