import { Router } from 'express';
import { auth, admin, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { emitNewMessage } from '../socket';

const router = Router();

async function fetchMessagesForUser(targetUserId: string, take = 50) {
  const rows = await prisma.message.findMany({
    where: { userId: targetUserId },
    orderBy: { createdAt: 'desc' },
    take,
  });
  return rows.reverse();
}

async function createUserMessage(userId: string, text: string) {
  return prisma.message.create({
    data: {
      userId,
      content: text,
      isAdmin: false,
      isRead: false,
    },
  });
}

/** История диалога (последние 50 сообщений) */
router.get('/history/:userId', auth, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;
    if (req.user!.role !== 'admin' && req.user!.id !== userId) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }
    console.log('[chat] GET /history/:userId', userId);
    const messages = await fetchMessagesForUser(userId, 50);
    res.json({ messages });
  } catch (error) {
    console.error('[chat] GET /history/:userId failed', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ message });
  }
});

/** Непрочитанные сообщения от пользователей (для админа) */
router.get('/unread-count', auth, admin, async (_req, res) => {
  try {
    const count = await prisma.message.count({
      where: { isAdmin: false, isRead: false },
    });
    res.json({ count });
  } catch (error) {
    console.error('[chat] GET /unread-count failed', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ message });
  }
});

router.get('/messages', auth, async (req: AuthRequest, res) => {
  try {
    const userId = req.query.userId as string | undefined;
    console.log('[chat] GET /messages', { userId, role: req.user?.role });

    if (userId && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const targetUserId = userId || req.user!.id;
    const messages = await fetchMessagesForUser(targetUserId, 100);
    console.log('[chat] GET /messages ok, count:', messages.length);
    res.json({ messages });
  } catch (error) {
    console.error('[chat] GET /messages failed', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ message });
  }
});

router.get('/conversations', auth, admin, async (_req, res) => {
  try {
    console.log('[chat] GET /conversations');
    const grouped = await prisma.message.groupBy({
      by: ['userId'],
      _count: { _all: true },
    });

    const conversations = await Promise.all(
      grouped.map(async (row) => {
        const [user, lastMessage, unreadCount] = await Promise.all([
          prisma.user.findUnique({
            where: { id: row.userId },
            select: { email: true },
          }),
          prisma.message.findFirst({
            where: { userId: row.userId },
            orderBy: { createdAt: 'desc' },
          }),
          prisma.message.count({
            where: { userId: row.userId, isAdmin: false, isRead: false },
          }),
        ]);

        return {
          userId: row.userId,
          email: user?.email ?? '',
          lastMessage,
          unreadCount,
          messageCount: row._count._all,
        };
      }),
    );

    res.json({ conversations });
  } catch (error) {
    console.error('[chat] GET /conversations failed', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ message });
  }
});

router.post('/mark-read/:userId', auth, admin, async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await prisma.message.updateMany({
      where: { userId, isAdmin: false, isRead: false },
      data: { isRead: true },
    });
    res.json({ ok: true, updated: result.count });
  } catch (error) {
    console.error('[chat] POST /mark-read failed', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ message });
  }
});

router.post('/messages', auth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const text = String(req.body.text ?? req.body.content ?? '').trim();
    console.log('[chat] POST /messages', { userId, textLen: text.length });

    if (!text) {
      res.status(400).json({ message: 'Message text is required' });
      return;
    }

    const message = await createUserMessage(userId, text);
    emitNewMessage(userId, {
      id: message.id,
      userId: message.userId,
      content: message.content,
      isAdmin: message.isAdmin,
      isRead: message.isRead,
      createdAt: message.createdAt,
    });
    console.log('[chat] POST /messages ok, id:', message.id);
    res.status(201).json({ message });
  } catch (error) {
    console.error('[chat] POST /messages failed', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ message });
  }
});

router.post('/', auth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const text = String(req.body.text ?? req.body.content ?? '').trim();
    if (!text) {
      res.status(400).json({ message: 'Message text is required' });
      return;
    }
    const message = await createUserMessage(userId, text);
    res.status(201).json({ message });
  } catch (error) {
    console.error('[chat] POST / failed', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ message });
  }
});

router.get('/:userId', auth, admin, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;
    if (userId === 'history' || userId === 'unread-count' || userId === 'messages') {
      res.status(404).json({ message: 'Not found' });
      return;
    }
    console.log('[chat] GET /:userId', userId);
    const messages = await fetchMessagesForUser(userId, 100);
    res.json({ messages });
  } catch (error) {
    console.error('[chat] GET /:userId failed', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ message });
  }
});

export default router;
