import { Request } from 'express';
import { db } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';

export function logAuditEvent(
  req: Request,
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: string
): void {
  try {
    const orgId = req.organization?.id;
    if (!orgId) return;

    const userId = req.user?.id || null;
    const userEmail = req.user?.email || 'system';
    const ip = req.ip || (req.headers['x-forwarded-for'] as string) || '127.0.0.1';

    db.prepare(`
      INSERT INTO audit_logs (id, organization_id, user_id, user_email, action, resource_type, resource_id, details, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      uuidv4(),
      orgId,
      userId,
      userEmail,
      action,
      resourceType,
      resourceId || null,
      details || null,
      ip
    );
  } catch (err) {
    console.error('[Audit Log Error]', err);
  }
}
