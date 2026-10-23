import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/audit.js';

const router = Router();
router.use(authMiddleware);

// List marketplace blueprints
router.get('/items', (req: Request, res: Response): void => {
  const { category, search } = req.query;

  let sql = 'SELECT * FROM marketplace_items WHERE 1=1';
  const params: any[] = [];

  if (category && category !== 'all') {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (search) {
    sql += ' AND (title LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  sql += ' ORDER BY rating DESC';
  const items = db.prepare(sql).all(...params);

  res.json({
    items: items.map((i: any) => ({
      ...i,
      manifest: JSON.parse(i.manifest || '{}')
    }))
  });
});

// Install blueprint
router.post('/items/:id/install', (req: Request, res: Response): void => {
  const orgId = req.organization!.id;
  const id = req.params.id as string;

  const item = db.prepare('SELECT * FROM marketplace_items WHERE id = ?').get(id) as any;
  if (!item) {
    res.status(404).json({ error: 'Marketplace item not found.' });
    return;
  }

  db.prepare('UPDATE marketplace_items SET is_installed = 1, installs = installs + 1 WHERE id = ?').run(id);

  logAuditEvent(req, 'MARKETPLACE_INSTALLED', 'marketplace_item', id, `Installed "${item.title}" into workspace`);

  res.json({ success: true, message: `Successfully installed "${item.title}" into your workspace.` });
});

// Uninstall blueprint
router.post('/items/:id/uninstall', (req: Request, res: Response): void => {
  const id = req.params.id as string;
  db.prepare('UPDATE marketplace_items SET is_installed = 0 WHERE id = ?').run(id);
  res.json({ success: true, message: 'Uninstalled item from workspace.' });
});

export default router;
