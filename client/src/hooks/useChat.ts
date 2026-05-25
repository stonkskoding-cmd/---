import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { chatAPI } from '@/services/api';

export interface ChatMessageItem {
  id: string;
  text: string;
  isFromAdmin: boolean;
  createdAt: string;
}

function normalizeMessage(raw: Record<string, unknown> | { id?: unknown; _id?: unknown; content?: unknown; text?: unknown; isAdmin?: unknown; isFromAdmin?: unknown; createdAt?: unknown }): ChatMessageItem {
  const m = raw as Record<string, unknown>;
  return {
    id: String(m.id ?? m._id ?? `${Date.now()}`),
    text: String(m.content ?? m.text ?? ''),
    isFromAdmin: Boolean(m.isAdmin ?? m.isFromAdmin),
    createdAt: String(m.createdAt ?? new Date().toISOString()),
  };
}

const SOCKET_BASE =
  import.meta.env.VITE_SOCKET_URL || 'https://online-school-backend-mqn9.onrender.com';

export function useChat(isOpen: boolean) {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const isAuthenticated = Boolean(token);

  const loadMessages = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await chatAPI.getMessages();
      const list = (data.messages ?? []).map((m) =>
        normalizeMessage(m as unknown as Record<string, unknown>),
      );
      setMessages(list);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(msg || 'Не удалось загрузить сообщения');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isOpen || !token) return;

    loadMessages();

    const socket = io(`${SOCKET_BASE}/support`, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('message', (raw: Record<string, unknown>) => {
      const item = normalizeMessage(raw);
      setMessages((prev) => {
        if (prev.some((m) => m.id === item.id)) return prev;
        return [...prev, item];
      });
      if (item.isFromAdmin && !isOpenRef.current) {
        setUnreadCount((c) => c + 1);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [isOpen, token, loadMessages]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !token) return;

      setSending(true);
      setError(null);

      const socket = socketRef.current;

      try {
        if (socket?.connected) {
          await new Promise<void>((resolve, reject) => {
            socket.emit('message', { text: trimmed }, (response: {
              success: boolean;
              message?: Record<string, unknown>;
              error?: string;
            }) => {
              if (response?.success && response.message) {
                const item = normalizeMessage(response.message);
                setMessages((prev) =>
                  prev.some((m) => m.id === item.id) ? prev : [...prev, item],
                );
                resolve();
              } else {
                reject(new Error(response?.error || 'Ошибка отправки'));
              }
            });
          });
        } else {
          const { data } = await chatAPI.sendMessage(trimmed);
          const item = normalizeMessage(data.message ?? {});
          setMessages((prev) =>
            prev.some((m) => m.id === item.id) ? prev : [...prev, item],
          );
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Не удалось отправить сообщение';
        setError(msg);
      } finally {
        setSending(false);
      }
    },
    [token],
  );

  return {
    messages,
    loading,
    sending,
    error,
    unreadCount,
    isConnected,
    isAuthenticated,
    sendMessage,
    loadMessages,
  };
}
