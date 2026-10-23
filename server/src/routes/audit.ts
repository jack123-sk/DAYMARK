import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// Retrieve audit logs for current organization
router.get('/', (req: Request, res: Response): void => {
  const orgId = req.organization!.id;
  const limit = Math.min(Number(req.query.limit) || 100, 200);

  const logs = db.prepare(`
    SELECT * FROM audit_logs
    WHERE organization_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `).all(orgId, limit);

  res.json({ logs });
});

export default router;
