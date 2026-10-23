import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/audit.js';
import { AIService } from '../services/aiService.js';
import { BillingService } from '../services/billingService.js';

const router = Router();
router.use(authMiddleware);

// List projects
router.get('/', (req: Request, res: Response): void => {
  const orgId = req.organization!.id;
  const projects = db.prepare(`
    SELECT * FROM business_projects
    WHERE organization_id = ?
    ORDER BY created_at DESC
  `).all(orgId);

  res.json({
    projects: projects.map((p: any) => ({
      ...p,
      generated_assets: JSON.parse(p.generated_assets)
    }))
  });
});

// Generate new project from natural language prompt
router.post('/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.organization!.id;
    const { name, prompt, industry, targetAudience } = req.body;

    if (!prompt || !name) {
      res.status(400).json({ error: 'Project name and descriptive prompt are required.' });
      return;
    }

    // Quota check
    const currentCount = (db.prepare('SELECT COUNT(*) as c FROM business_projects WHERE organization_id = ?').get(orgId) as any).c;
    const plan = BillingService.getPlan(req.organization!.plan_tier);
    if (currentCount >= plan.limits.maxProjects) {
      res.status(403).json({
        error: `Project limit reached for your plan (${currentCount}/${plan.limits.maxProjects}). Upgrade to create more projects.`
      });
      return;
    }

    const assets = AIService.generateBusinessPlan(prompt, industry || 'B2B Services', targetAudience || 'Founders & Agencies');
    const id = uuidv4();

    db.prepare(`
      INSERT INTO business_projects (id, organization_id, name, description, industry, target_audience, generated_assets, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')
    `).run(
      id,
      orgId,
      name,
      prompt,
      industry || 'B2B Professional Services',
      targetAudience || 'Founders & Operations Leaders',
      JSON.stringify(assets)
    );

    logAuditEvent(req, 'PROJECT_GENERATED', 'business_project', id, `Generated project "${name}" via AI Business Builder`);

    const created = db.prepare('SELECT * FROM business_projects WHERE id = ?').get(id) as any;
    res.status(201).json({
      project: {
        ...created,
        generated_assets: assets
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate business project' });
  }
});

// Update project assets
router.put('/:id', (req: Request, res: Response): void => {
  const orgId = req.organization!.id;
  const id = req.params.id as string;
  const { name, description, status, generatedAssets } = req.body;

  const existing = db.prepare('SELECT id FROM business_projects WHERE id = ? AND organization_id = ?').get(id, orgId);
  if (!existing) {
    res.status(404).json({ error: 'Project not found.' });
    return;
  }

  db.prepare(`
    UPDATE business_projects
    SET name = COALESCE(?, name),
        description = COALESCE(?, description),
        status = COALESCE(?, status),
        generated_assets = COALESCE(?, generated_assets),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND organization_id = ?
  `).run(name || null, description || null, status || null, generatedAssets ? JSON.stringify(generatedAssets) : null, id, orgId);

  logAuditEvent(req, 'PROJECT_UPDATED', 'business_project', id, `Updated project ${name || id}`);
  const updated = db.prepare('SELECT * FROM business_projects WHERE id = ?').get(id) as any;

  res.json({
    project: {
      ...updated,
      generated_assets: JSON.parse(updated.generated_assets)
    }
  });
});

// Delete project
router.delete('/:id', (req: Request, res: Response): void => {
  const orgId = req.organization!.id;
  const id = req.params.id as string;

  db.prepare('DELETE FROM business_projects WHERE id = ? AND organization_id = ?').run(id, orgId);
  logAuditEvent(req, 'PROJECT_DELETED', 'business_project', id, 'Deleted project');
  res.json({ success: true, message: 'Project deleted' });
});

export default router;
