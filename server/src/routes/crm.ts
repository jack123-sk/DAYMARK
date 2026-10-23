import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/audit.js';

const router = Router();
router.use(authMiddleware);

// =================== CONTACTS ===================

router.get('/contacts', (req: Request, res: Response): void => {
  const orgId = req.organization!.id;
  const contacts = db.prepare('SELECT * FROM contacts WHERE organization_id = ? ORDER BY created_at DESC').all(orgId);
  res.json({
    contacts: contacts.map((c: any) => ({
      ...c,
      tags: c.tags ? JSON.parse(c.tags) : []
    }))
  });
});

router.post('/contacts', (req: Request, res: Response): void => {
  try {
    const orgId = req.organization!.id;
    const { firstName, lastName, email, phone, company, title, stage = 'lead', leadScore = 50, tags = [], source = 'Direct entry', notes } = req.body;

    if (!firstName || !email) {
      res.status(400).json({ error: 'First name and email are required.' });
      return;
    }

    const id = uuidv4();
    db.prepare(`
      INSERT INTO contacts (id, organization_id, first_name, last_name, email, phone, company, title, stage, lead_score, tags, source, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, orgId, firstName, lastName || '', email, phone || '', company || '', title || '', stage, Number(leadScore), JSON.stringify(tags), source, notes || '');

    logAuditEvent(req, 'CONTACT_CREATED', 'contact', id, `Created contact ${firstName} ${lastName} (${email})`);

    const created = db.prepare('SELECT * FROM contacts WHERE id = ?').get(id) as any;
    res.status(201).json({ contact: { ...created, tags: JSON.parse(created.tags || '[]') } });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create contact' });
  }
});

router.put('/contacts/:id', (req: Request, res: Response): void => {
  const orgId = req.organization!.id;
  const id = req.params.id as string;
  const { firstName, lastName, email, phone, company, title, stage, leadScore, tags, notes } = req.body;

  db.prepare(`
    UPDATE contacts
    SET first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        company = COALESCE(?, company),
        title = COALESCE(?, title),
        stage = COALESCE(?, stage),
        lead_score = COALESCE(?, lead_score),
        tags = COALESCE(?, tags),
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND organization_id = ?
  `).run(firstName || null, lastName || null, email || null, phone || null, company || null, title || null, stage || null, leadScore !== undefined ? Number(leadScore) : null, tags ? JSON.stringify(tags) : null, notes || null, id, orgId);

  logAuditEvent(req, 'CONTACT_UPDATED', 'contact', id, `Updated contact ${id}`);
  const updated = db.prepare('SELECT * FROM contacts WHERE id = ?').get(id) as any;
  res.json({ contact: { ...updated, tags: JSON.parse(updated.tags || '[]') } });
});

router.delete('/contacts/:id', (req: Request, res: Response): void => {
  const orgId = req.organization!.id;
  const id = req.params.id as string;

  db.prepare('DELETE FROM contacts WHERE id = ? AND organization_id = ?').run(id, orgId);
  logAuditEvent(req, 'CONTACT_DELETED', 'contact', id, 'Deleted contact');
  res.json({ success: true, message: 'Contact deleted' });
});

// CSV Export Contacts
router.get('/contacts/export-csv', (req: Request, res: Response): void => {
  const orgId = req.organization!.id;
  const contacts = db.prepare('SELECT first_name, last_name, email, phone, company, title, stage, lead_score, source FROM contacts WHERE organization_id = ?').all(orgId) as any[];

  let csv = 'First Name,Last Name,Email,Phone,Company,Title,Stage,Lead Score,Source\n';
  for (const c of contacts) {
    csv += `"${c.first_name}","${c.last_name}","${c.email}","${c.phone}","${c.company}","${c.title}","${c.stage}",${c.lead_score},"${c.source}"\n`;
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="daymark_contacts.csv"');
  res.send(csv);
});

// CSV Import Contacts
router.post('/contacts/import-csv', (req: Request, res: Response): void => {
  try {
    const orgId = req.organization!.id;
    const { csvText } = req.body;

    if (!csvText) {
      res.status(400).json({ error: 'csvText content is required' });
      return;
    }

    const lines = csvText.split('\n').filter((l: string) => l.trim().length > 0);
    let imported = 0;

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p: string) => p.replace(/^"|"$/g, '').trim());
      if (parts[0] && parts[2]) {
        const id = uuidv4();
        db.prepare(`
          INSERT INTO contacts (id, organization_id, first_name, last_name, email, phone, company, title, stage, lead_score, tags, source)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'lead', 50, '[]', 'CSV Import')
        `).run(id, orgId, parts[0], parts[1] || '', parts[2], parts[3] || '', parts[4] || '', parts[5] || '');
        imported++;
      }
    }

    logAuditEvent(req, 'CONTACTS_IMPORTED', 'contacts', undefined, `Imported ${imported} contacts via CSV`);
    res.json({ success: true, importedCount: imported });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Import failed' });
  }
});

// =================== LEADS & DEALS ===================

router.get('/leads', (req: Request, res: Response): void => {
  const orgId = req.organization!.id;
  const leads = db.prepare('SELECT * FROM leads WHERE organization_id = ? ORDER BY value DESC').all(orgId);
  res.json({ leads });
});

router.post('/leads', (req: Request, res: Response): void => {
  try {
    const orgId = req.organization!.id;
    const { title, contactName, contactEmail, company, value = 0, stage = 'new', probability = 20, notes } = req.body;

    if (!title || !contactName || !company) {
      res.status(400).json({ error: 'Title, contact name, and company are required.' });
      return;
    }

    const id = uuidv4();
    db.prepare(`
      INSERT INTO leads (id, organization_id, title, contact_name, contact_email, company, value, stage, probability, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, orgId, title, contactName, contactEmail || '', company, Number(value), stage, Number(probability), notes || '');

    logAuditEvent(req, 'LEAD_CREATED', 'lead', id, `Created deal "${title}" ($${value}) for ${company}`);

    const created = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
    res.status(201).json({ lead: created });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create lead' });
  }
});

router.put('/leads/:id', (req: Request, res: Response): void => {
  const orgId = req.organization!.id;
  const id = req.params.id as string;
  const { title, contactName, contactEmail, company, value, stage, probability, notes } = req.body;

  db.prepare(`
    UPDATE leads
    SET title = COALESCE(?, title),
        contact_name = COALESCE(?, contact_name),
        contact_email = COALESCE(?, contact_email),
        company = COALESCE(?, company),
        value = COALESCE(?, value),
        stage = COALESCE(?, stage),
        probability = COALESCE(?, probability),
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND organization_id = ?
  `).run(title || null, contactName || null, contactEmail || null, company || null, value !== undefined ? Number(value) : null, stage || null, probability !== undefined ? Number(probability) : null, notes || null, id, orgId);

  logAuditEvent(req, 'LEAD_UPDATED', 'lead', id, `Updated stage/details for lead ${id}`);
  const updated = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
  res.json({ lead: updated });
});

router.delete('/leads/:id', (req: Request, res: Response): void => {
  const orgId = req.organization!.id;
  const id = req.params.id as string;

  db.prepare('DELETE FROM leads WHERE id = ? AND organization_id = ?').run(id, orgId);
  logAuditEvent(req, 'LEAD_DELETED', 'lead', id, 'Deleted lead');
  res.json({ success: true, message: 'Lead deleted' });
});

// =================== TASKS ===================

router.get('/tasks', (req: Request, res: Response): void => {
  const orgId = req.organization!.id;
  const tasks = db.prepare('SELECT * FROM crm_tasks WHERE organization_id = ? ORDER BY due_date ASC, created_at DESC').all(orgId);
  res.json({ tasks });
});

router.post('/tasks', (req: Request, res: Response): void => {
  const orgId = req.organization!.id;
  const { title, description, assignedTo, dueDate, priority = 'medium', relatedTo } = req.body;

  if (!title) {
    res.status(400).json({ error: 'Task title is required' });
    return;
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO crm_tasks (id, organization_id, title, description, assigned_to, due_date, status, priority, related_to)
    VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)
  `).run(id, orgId, title, description || '', assignedTo || req.user!.name, dueDate || null, priority, relatedTo || null);

  logAuditEvent(req, 'TASK_CREATED', 'task', id, `Created CRM task: ${title}`);
  const created = db.prepare('SELECT * FROM crm_tasks WHERE id = ?').get(id);
  res.status(201).json({ task: created });
});

router.put('/tasks/:id', (req: Request, res: Response): void => {
  const orgId = req.organization!.id;
  const id = req.params.id as string;
  const { status, title, priority, dueDate } = req.body;

  db.prepare(`
    UPDATE crm_tasks
    SET status = COALESCE(?, status),
        title = COALESCE(?, title),
        priority = COALESCE(?, priority),
        due_date = COALESCE(?, due_date),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND organization_id = ?
  `).run(status || null, title || null, priority || null, dueDate || null, id, orgId);

  const updated = db.prepare('SELECT * FROM crm_tasks WHERE id = ?').get(id);
  res.json({ task: updated });
});

router.delete('/tasks/:id', (req: Request, res: Response): void => {
  const orgId = req.organization!.id;
  const id = req.params.id as string;

  db.prepare('DELETE FROM crm_tasks WHERE id = ? AND organization_id = ?').run(id, orgId);
  res.json({ success: true, message: 'Task deleted' });
});

// =================== CRM SUMMARY / STATS ===================

router.get('/stats', (req: Request, res: Response): void => {
  const orgId = req.organization!.id;
  const leads = db.prepare('SELECT value, stage, probability FROM leads WHERE organization_id = ?').all(orgId) as any[];

  let totalPipelineValue = 0;
  let weightedPipelineValue = 0;
  let wonDealsValue = 0;
  let wonCount = 0;

  for (const l of leads) {
    totalPipelineValue += Number(l.value);
    weightedPipelineValue += Number(l.value) * (Number(l.probability) / 100);
    if (l.stage === 'won') {
      wonDealsValue += Number(l.value);
      wonCount++;
    }
  }

  const contactsCount = (db.prepare('SELECT COUNT(*) as c FROM contacts WHERE organization_id = ?').get(orgId) as any).c;
  const tasksPending = (db.prepare("SELECT COUNT(*) as c FROM crm_tasks WHERE organization_id = ? AND status != 'completed'").get(orgId) as any).c;

  res.json({
    totalPipelineValue,
    weightedPipelineValue: Math.round(weightedPipelineValue),
    wonDealsValue,
    totalLeadsCount: leads.length,
    wonDealsCount: wonCount,
    contactsCount,
    tasksPending
  });
});

export default router;
