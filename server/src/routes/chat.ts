import { Router } from 'express';
import { auth, admin, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

async function fetchMessagesForUser(targetUserId: string) {
  return prisma.message.findMany({
    where: { userId: targetUserId },
    orderBy: { createdAt: 'asc' },
    take: 100,
  });
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

router.get('/messages', auth, async (req: AuthRequest, res) => {
  try {
    const userId = req.query.userId as string | undefined;
    console.log('[chat] GET /messages', { userId, role: req.user?.role });

    if (userId && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const targetUserId = userId || req.user!.id;
    const messages = await fetchMessagesForUser(targetUserId);
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
        const [user, lastMessage] = await Promise.all([
          prisma.user.findUnique({
            where: { id: row.userId },
            select: { email: true },
          }),
          prisma.message.findFirst({
            where: { userId: row.userId },
            orderBy: { createdAt: 'desc' },
          }),
        ]);

        return {
          userId: row.userId,
          email: user?.email ?? '',
          lastMessage,
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
    console.log('[chat] POST /messages ok, id:', message.id);
    res.status(201).json({ message });
  } catch (error) {
    console.error('[chat] POST /messages failed', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ message });
  }
});

/** Алиас: POST /api/chat — отправка сообщения */
router.post('/', auth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const text = String(req.body.text ?? req.body.content ?? '').trim();
    console.log('[chat] POST /', { userId, textLen: text.length });

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

/** Алиас: GET /api/chat/:userId — история (только admin) */
router.get('/:userId', auth, admin, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;
    console.log('[chat] GET /:userId', userId);
    const messages = await fetchMessagesForUser(userId);
    res.json({ messages });
  } catch (error) {
    console.error('[chat] GET /:userId failed', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ message });
  }
});

export default router;
