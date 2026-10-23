import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/audit.js';

const router = Router();
router.use(authMiddleware);

// Search and filter global companies directory
router.get('/companies', (req: Request, res: Response): void => {
  const { search, region, industry } = req.query;

  let query = 'SELECT * FROM global_companies WHERE 1=1';
  const params: any[] = [];

  if (search) {
    query += ' AND (name LIKE ? OR country LIKE ? OR partnership_type LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }
  if (region && region !== 'all') {
    query += ' AND region = ?';
    params.push(region);
  }
  if (industry && industry !== 'all') {
    query += ' AND industry = ?';
    params.push(industry);
  }

  query += ' ORDER BY relevance_score DESC LIMIT 50';
  const companies = db.prepare(query).all(...params);
  res.json({ companies });
});

// Draft personalized B2B outreach with mandatory human sign-off
router.post('/outreach', (req: Request, res: Response): void => {
  const { companyId, companyName, contactEmail, partnershipType } = req.body;

  if (!companyName || !contactEmail) {
    res.status(400).json({ error: 'Company name and contact email are required' });
    return;
  }

  const subject = `Partnership Collaboration: DAYMARK OS x ${companyName}`;
  const body = `Hi Team,\n\nI came across ${companyName}'s work in ${partnershipType || 'the industry'}. Our enterprise clients frequently require integrated workflow automation and high-speed execution.\n\nWe would love to explore a joint pilot or integration partnership to streamline onboarding for mutual clients.\n\nWould you be open to a brief 10-minute discovery call next Tuesday?\n\nBest regards,\n${req.user!.name}\nDAYMARK OS`;

  logAuditEvent(req, 'OUTREACH_DRAFTED', 'global_company', companyId, `Generated outreach draft for ${companyName}`);

  res.json({
    draft: {
      recipient: contactEmail,
      companyName,
      subject,
      body,
      status: 'pending_operator_approval',
      requiresApproval: true,
      notice: 'Outreach draft prepared. Review before dispatching to external contacts.'
    }
  });
});

// Update company outreach status
router.put('/companies/:id/status', (req: Request, res: Response): void => {
  const id = req.params.id as string;
  const { status } = req.body;

  db.prepare('UPDATE global_companies SET outreach_status = ? WHERE id = ?').run(status || 'contacted', id);
  res.json({ success: true, message: `Status updated to ${status}` });
});

export default router;
