import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/audit.js';
import { WorkflowEngine } from '../services/workflowEngine.js';

const router = Router();
router.use(authMiddleware);

// List workflows
router.get('/', (req: Request, res: Response): void => {
  const orgId = req.organization!.id;
  const workflows = db.prepare('SELECT * FROM workflows WHERE organization_id = ? ORDER BY created_at DESC').all(orgId);
  res.json({
    workflows: workflows.map((w: any) => ({
      ...w,
      steps: JSON.parse(w.steps || '[]'),
      trigger_config: w.trigger_config ? JSON.parse(w.trigger_config) : {}
    }))
  });
});

// Create workflow definition
router.post('/', (req: Request, res: Response): void => {
  try {
    const orgId = req.organization!.id;
    const { name, description, triggerType = 'manual', triggerConfig = {}, steps = [] } = req.body;

    if (!name || steps.length === 0) {
      res.status(400).json({ error: 'Workflow name and at least one step are required.' });
      return;
    }

    const id = uuidv4();
    db.prepare(`
      INSERT INTO workflows (id, organization_id, name, description, trigger_type, trigger_config, steps, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      id,
      orgId,
      name,
      description || '',
      triggerType,
      JSON.stringify(triggerConfig),
      JSON.stringify(steps)
    );

    logAuditEvent(req, 'WORKFLOW_CREATED', 'workflow', id, `Created workflow: ${name}`);

    const created = db.prepare('SELECT * FROM workflows WHERE id = ?').get(id) as any;
    res.status(201).json({
      workflow: {
        ...created,
        steps: JSON.parse(created.steps),
        trigger_config: JSON.parse(created.trigger_config || '{}')
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create workflow' });
  }
});

// Update workflow definition
router.put('/:id', (req: Request, res: Response): void => {
  const orgId = req.organization!.id;
  const id = req.params.id as string;
  const { name, description, triggerType, triggerConfig, steps, isActive } = req.body;

  db.prepare(`
    UPDATE workflows
    SET name = COALESCE(?, name),
        description = COALESCE(?, description),
        trigger_type = COALESCE(?, trigger_type),
        trigger_config = COALESCE(?, trigger_config),
        steps = COALESCE(?, steps),
        is_active = COALESCE(?, is_active),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND organization_id = ?
  `).run(
    name || null,
    description || null,
    triggerType || null,
    triggerConfig ? JSON.stringify(triggerConfig) : null,
    steps ? JSON.stringify(steps) : null,
    isActive !== undefined ? (isActive ? 1 : 0) : null,
    id,
    orgId
  );

  const updated = db.prepare('SELECT * FROM workflows WHERE id = ?').get(id) as any;
  res.json({
    workflow: {
      ...updated,
      steps: JSON.parse(updated.steps),
      trigger_config: JSON.parse(updated.trigger_config || '{}')
    }
  });
});

// Delete workflow
router.delete('/:id', (req: Request, res: Response): void => {
  const orgId = req.organization!.id;
  const id = req.params.id as string;

  db.prepare('DELETE FROM workflows WHERE id = ? AND organization_id = ?').run(id, orgId);
  logAuditEvent(req, 'WORKFLOW_DELETED', 'workflow', id, 'Deleted workflow');
  res.json({ success: true, message: 'Workflow deleted' });
});

// Execute workflow
router.post('/:id/execute', async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.organization!.id;
    const id = req.params.id as string;
    const { triggerEvent, payload = {}, idempotencyKey } = req.body;

    const result = await WorkflowEngine.triggerWorkflow(
      orgId,
      id,
      triggerEvent || 'Manual UI Trigger',
      payload,
      idempotencyKey
    );

    logAuditEvent(req, 'WORKFLOW_EXECUTED', 'workflow_execution', result.executionId, `Executed workflow ${id} with status ${result.status}`);

    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Execution error' });
  }
});

// List execution history
router.get('/executions', (req: Request, res: Response): void => {
  const orgId = req.organization!.id;
  const executions = db.prepare(`
    SELECT e.*, w.name as workflow_name
    FROM workflow_executions e
    JOIN workflows w ON w.id = e.workflow_id
    WHERE e.organization_id = ?
    ORDER BY e.started_at DESC
    LIMIT 50
  `).all(orgId);

  res.json({
    executions: executions.map((e: any) => ({
      ...e,
      step_results: JSON.parse(e.step_results || '[]'),
      pending_approval: e.pending_approval ? JSON.parse(e.pending_approval) : null
    }))
  });
});

// Human approval action
router.post('/executions/:id/approve', async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.organization!.id;
    const id = req.params.id as string;
    const { comments } = req.body;

    const result = await WorkflowEngine.resolveApproval(orgId, id, true, comments);
    logAuditEvent(req, 'WORKFLOW_APPROVAL_GRANTED', 'workflow_execution', id, `Human approved step. Comments: ${comments || 'None'}`);

    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Approval resolution failed' });
  }
});

// Human rejection action
router.post('/executions/:id/reject', async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.organization!.id;
    const id = req.params.id as string;
    const { comments } = req.body;

    const result = await WorkflowEngine.resolveApproval(orgId, id, false, comments);
    logAuditEvent(req, 'WORKFLOW_APPROVAL_REJECTED', 'workflow_execution', id, `Human rejected step. Reason: ${comments || 'None'}`);

    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Rejection resolution failed' });
  }
});

export default router;
