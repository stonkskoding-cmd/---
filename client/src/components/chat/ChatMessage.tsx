import type { ChatMessageItem } from '../../hooks/useChat';

interface ChatMessageProps {
  message: ChatMessageItem;
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isAdmin = message.isFromAdmin;

  return (
    <div className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
          isAdmin
            ? 'rounded-bl-md bg-white text-gray-800 ring-1 ring-gray-200'
            : 'rounded-br-md bg-gradient-to-br from-blue-600 to-blue-700 text-white'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
        <p className={`mt-1 text-[10px] ${isAdmin ? 'text-gray-400' : 'text-blue-100'}`}>
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
