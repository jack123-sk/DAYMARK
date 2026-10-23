import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/audit.js';

const router = Router();
router.use(authMiddleware);

// List organization members
router.get('/members', (req: Request, res: Response): void => {
  const orgId = req.organization!.id;
  const members = db.prepare(`
    SELECT om.id, om.role, om.created_at as joined_at, u.id as user_id, u.name, u.email, u.avatar
    FROM organization_members om
    JOIN users u ON u.id = om.user_id
    WHERE om.organization_id = ?
    ORDER BY om.created_at ASC
  `).all(orgId);

  res.json({ members });
});

// Invite member (Requires Admin or Owner)
router.post('/invite', requireRole(['owner', 'admin']), (req: Request, res: Response): void => {
  try {
    const orgId = req.organization!.id;
    const { email, name, role = 'member' } = req.body;

    if (!email || !name) {
      res.status(400).json({ error: 'Email and name are required' });
      return;
    }

    let user = db.prepare('SELECT id, email, name FROM users WHERE email = ?').get(email.toLowerCase().trim()) as any;
    if (!user) {
      const newUserId = uuidv4();
      const tempHash = bcrypt.hashSync('DaymarkWelcome2026!', 10);
      db.prepare(`
        INSERT INTO users (id, email, password_hash, name)
        VALUES (?, ?, ?, ?)
      `).run(newUserId, email.toLowerCase().trim(), tempHash, name.trim());
      user = { id: newUserId, email: email.toLowerCase().trim(), name: name.trim() };
    }

    // Check if already member
    const existing = db.prepare('SELECT id FROM organization_members WHERE organization_id = ? AND user_id = ?').get(orgId, user.id);
    if (existing) {
      res.status(409).json({ error: 'User is already a member of this workspace.' });
      return;
    }

    const membershipId = uuidv4();
    db.prepare(`
      INSERT INTO organization_members (id, organization_id, user_id, role)
      VALUES (?, ?, ?, ?)
    `).run(membershipId, orgId, user.id, role);

    logAuditEvent(req, 'TEAM_MEMBER_INVITED', 'organization_member', membershipId, `Invited ${email} with role [${role}]`);

    res.status(201).json({
      success: true,
      message: `Invited ${name} (${email}) as ${role}. Default temporary credentials generated.`,
      member: { id: membershipId, userId: user.id, email: user.email, name: user.name, role }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Invitation failed' });
  }
});

// Update member role
router.put('/members/:id/role', requireRole(['owner', 'admin']), (req: Request, res: Response): void => {
  const orgId = req.organization!.id;
  const id = req.params.id as string;
  const { role } = req.body;

  if (!['owner', 'admin', 'member', 'viewer'].includes(role)) {
    res.status(400).json({ error: 'Invalid role' });
    return;
  }

  db.prepare('UPDATE organization_members SET role = ? WHERE id = ? AND organization_id = ?').run(role, id, orgId);
  logAuditEvent(req, 'ROLE_UPDATED', 'organization_member', id, `Updated role to ${role}`);

  res.json({ success: true, message: `Member role updated to ${role}` });
});

// Remove member
router.delete('/members/:id', requireRole(['owner', 'admin']), (req: Request, res: Response): void => {
  const orgId = req.organization!.id;
  const id = req.params.id as string;

  db.prepare('DELETE FROM organization_members WHERE id = ? AND organization_id = ?').run(id, orgId);
  logAuditEvent(req, 'TEAM_MEMBER_REMOVED', 'organization_member', id, 'Removed member from workspace');

  res.json({ success: true, message: 'Member removed from organization.' });
});

export default router;
