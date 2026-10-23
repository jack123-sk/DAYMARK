import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import { authMiddleware, generateToken } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/audit.js';

const router = Router();

// Register new user & workspace
router.post('/register', (req: Request, res: Response): void => {
  try {
    const { email, password, name, organizationName } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required.' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters long.' });
      return;
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existingUser) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const userId = uuidv4();
    const orgId = uuidv4();
    const orgName = (organizationName || `${name.split(' ')[0]}'s Workspace`).trim();
    const slug = `${orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substring(2, 6)}`;
    const passwordHash = bcrypt.hashSync(password, 10);

    // Create User
    db.prepare(`
      INSERT INTO users (id, email, password_hash, name)
      VALUES (?, ?, ?, ?)
    `).run(userId, email.toLowerCase().trim(), passwordHash, name.trim());

    // Create Organization (Free/Starter tier)
    db.prepare(`
      INSERT INTO organizations (id, name, slug, plan_tier, subscription_status)
      VALUES (?, ?, ?, 'starter', 'active')
    `).run(orgId, orgName, slug);

    // Membership: Owner
    db.prepare(`
      INSERT INTO organization_members (id, organization_id, user_id, role)
      VALUES (?, ?, ?, 'owner')
    `).run(uuidv4(), orgId, userId);

    // Create Subscription
    db.prepare(`
      INSERT INTO subscriptions (id, organization_id, plan_tier, status, billing_cycle, current_period_end)
      VALUES (?, ?, 'starter', 'active', 'monthly', datetime('now', '+30 days'))
    `).run(uuidv4(), orgId);

    // Seed initial agents for new organization
    const defaultAgents = [
      { key: 'research_agent', name: 'Business Research Agent', role: 'Market analysis & competitive sizing' },
      { key: 'marketing_assistant', name: 'Marketing Assistant', role: 'Copywriting & positioning frameworks' },
      { key: 'sales_assistant', name: 'Sales Assistant', role: 'Lead qualification & proposal drafting' },
      { key: 'support_assistant', name: 'Customer Support Assistant', role: 'Ticket triage & SLA responses' },
      { key: 'operations_assistant', name: 'Operations Assistant', role: 'Workflow monitoring & bottleneck reduction' },
      { key: 'analytics_assistant', name: 'Business Analytics Assistant', role: 'Revenue forecasting & financial modeling' }
    ];

    for (const ag of defaultAgents) {
      db.prepare(`
        INSERT INTO ai_agents (id, organization_id, key, name, role, permissions)
        VALUES (?, ?, ?, ?, ?, '["standard_access"]')
      `).run(uuidv4(), orgId, ag.key, ag.name, ag.role);
    }

    // Default welcome notification
    db.prepare(`
      INSERT INTO notifications (id, organization_id, user_id, title, message, type, action_url)
      VALUES (?, ?, ?, 'Welcome to DAYMARK OS', 'Your unified AI automation workspace has been successfully created.', 'success', '/app/dashboard')
    `).run(uuidv4(), orgId, userId);

    const token = generateToken({ userId, organizationId: orgId });

    logAuditEvent({
      ...req,
      organization: { id: orgId } as any,
      user: { id: userId, email } as any
    } as any, 'USER_REGISTERED', 'user', userId, `User ${email} registered and created org ${orgName}`);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: userId, email, name, role: 'owner' },
      organization: { id: orgId, name: orgName, slug, planTier: 'starter' }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// Login
router.post('/login', (req: Request, res: Response): void => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = db.prepare('SELECT id, email, password_hash, name, avatar FROM users WHERE email = ?').get(email.toLowerCase().trim()) as any;
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Find primary organization membership
    const membership = db.prepare(`
      SELECT om.role, om.organization_id, o.name as org_name, o.slug as org_slug, o.plan_tier, o.subscription_status
      FROM organization_members om
      JOIN organizations o ON o.id = om.organization_id
      WHERE om.user_id = ?
      LIMIT 1
    `).get(user.id) as any;

    if (!membership) {
      res.status(403).json({ error: 'User does not belong to any active organization.' });
      return;
    }

    const token = generateToken({ userId: user.id, organizationId: membership.organization_id });

    logAuditEvent({
      ...req,
      organization: { id: membership.organization_id } as any,
      user: { id: user.id, email: user.email } as any
    } as any, 'USER_LOGIN', 'user', user.id, 'User successfully authenticated');

    res.json({
      message: 'Authentication successful',
      token,
      user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar, role: membership.role },
      organization: {
        id: membership.organization_id,
        name: membership.org_name,
        slug: membership.org_slug,
        planTier: membership.plan_tier,
        status: membership.subscription_status
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// Current User & Workspace info
router.get('/me', authMiddleware, (req: Request, res: Response): void => {
  res.json({
    user: req.user,
    organization: req.organization
  });
});

// Password recovery
router.post('/recover-password', (req: Request, res: Response): void => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }
  // Safe response regardless of email existence to prevent user enumeration
  res.json({
    success: true,
    message: 'If an account exists with this email, password recovery instructions have been sent.'
  });
});

// Onboarding completion
router.post('/onboarding', authMiddleware, (req: Request, res: Response): void => {
  const { industry, teamSize, primaryGoal } = req.body;
  const orgId = req.organization!.id;

  logAuditEvent(req, 'ONBOARDING_COMPLETED', 'organization', orgId, `Industry: ${industry}, Goal: ${primaryGoal}`);

  res.json({
    success: true,
    message: 'Onboarding completed successfully',
    preferences: { industry, teamSize, primaryGoal }
  });
});

export default router;
