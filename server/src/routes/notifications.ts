import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// Get notifications
router.get('/', (req: Request, res: Response): void => {
  const orgId = req.organization!.id;
  const notifications = db.prepare(`
    SELECT * FROM notifications
    WHERE organization_id = ?
    ORDER BY created_at DESC
    LIMIT 30
  `).all(orgId);

  res.json({ notifications });
});

// Mark notification as read
router.post('/:id/read', (req: Request, res: Response): void => {
  const orgId = req.organization!.id;
  const id = req.params.id as string;

  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND organization_id = ?').run(id, orgId);
  res.json({ success: true });
});

// Mark all as read
router.post('/read-all', (req: Request, res: Response): void => {
  const orgId = req.organization!.id;
  db.prepare('UPDATE notifications SET is_read = 1 WHERE organization_id = ?').run(orgId);
  res.json({ success: true });
});

export default router;
