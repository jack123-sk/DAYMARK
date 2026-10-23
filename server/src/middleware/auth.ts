import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'daymark_dev_jwt_secret_secure_and_persistent_key_2026';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthenticatedOrg {
  id: string;
  name: string;
  slug: string;
  plan_tier: string;
  subscription_status: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      organization?: AuthenticatedOrg;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed authorization token' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; organizationId?: string };
    
    // Fetch user
    const userRow = db.prepare('SELECT id, email, name FROM users WHERE id = ?').get(decoded.userId) as any;
    if (!userRow) {
      res.status(401).json({ error: 'User account not found' });
      return;
    }

    // Determine organization
    const targetOrgId = (req.headers['x-organization-id'] as string) || decoded.organizationId;
    let memberRow: any;

    if (targetOrgId) {
      memberRow = db.prepare(`
        SELECT om.role, om.organization_id, o.name, o.slug, o.plan_tier, o.subscription_status
        FROM organization_members om
        JOIN organizations o ON o.id = om.organization_id
        WHERE om.user_id = ? AND om.organization_id = ?
      `).get(userRow.id, targetOrgId);
    } else {
      memberRow = db.prepare(`
        SELECT om.role, om.organization_id, o.name, o.slug, o.plan_tier, o.subscription_status
        FROM organization_members om
        JOIN organizations o ON o.id = om.organization_id
        WHERE om.user_id = ?
        LIMIT 1
      `).get(userRow.id);
    }

    if (!memberRow) {
      res.status(403).json({ error: 'Access denied: not a member of this organization' });
      return;
    }

    req.user = {
      id: userRow.id,
      email: userRow.email,
      name: userRow.name,
      role: memberRow.role
    };

    req.organization = {
      id: memberRow.organization_id,
      name: memberRow.name,
      slug: memberRow.slug,
      plan_tier: memberRow.plan_tier,
      subscription_status: memberRow.subscription_status
    };

    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: `Forbidden: requires one of [${allowedRoles.join(', ')}] role` });
      return;
    }
    next();
  };
}

export function generateToken(payload: { userId: string; organizationId: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
