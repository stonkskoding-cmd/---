export interface ApiChatMessage {
  id: number | string;
  userId?: string;
  content: string;
  isAdmin: boolean;
  isRead?: boolean;
  createdAt: string;
}

export interface AdminChatSummary {
  userId: string;
  email: string;
  name?: string;
  lastMessage?: {
    id?: number;
    content: string;
    createdAt: string;
    isAdmin: boolean;
  } | null;
  unreadCount?: number;
  messageCount?: number;
}

export declare const chatApi: {
  getMessages: () => Promise<{ data: { messages: ApiChatMessage[] } }>;
  getHistory: (userId: string) => Promise<{ data: { messages: ApiChatMessage[] } }>;
  getUnreadCount: () => Promise<{ data: { count: number } }>;
  markRead: (userId: string) => Promise<{ data: { ok: boolean } }>;
  sendMessage: (text: string) => Promise<{ data: { message: ApiChatMessage } }>;
};

export declare const adminApiClient: {
  adminChats: () => Promise<{ data: { chats: AdminChatSummary[]; totalUnread: number } }>;
  adminChatThread: (userId: string) => Promise<{ data: { messages: ApiChatMessage[] } }>;
  postAdminChatMessage: (payload: { userId: string; content: string }) => Promise<{ data: { message: ApiChatMessage } }>;
};

export declare const authApi: Record<string, unknown>;
export declare const packagesApi: Record<string, unknown>;
export declare const purchasesApi: Record<string, unknown>;

declare const api: unknown;
export default api;
