import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/audit.js';
import { AIService } from '../services/aiService.js';

const router = Router();
router.use(authMiddleware);

// List all AI agents for current organization
router.get('/', (req: Request, res: Response): void => {
  const orgId = req.organization!.id;
  const agents = db.prepare('SELECT * FROM ai_agents WHERE organization_id = ?').all(orgId);
  res.json({
    agents: agents.map((a: any) => ({
      ...a,
      permissions: JSON.parse(a.permissions || '[]')
    }))
  });
});

// Execute agent prompt
router.post('/:key/execute', async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.organization!.id;
    const key = req.params.key as string;
    const { prompt, contextData } = req.body;

    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const result = await AIService.executeAgent({
      organizationId: orgId,
      agentKey: key,
      userPrompt: prompt,
      contextData
    });

    logAuditEvent(req, 'AGENT_EXECUTED', 'ai_agent', result.executionId, `Agent [${key}] executed prompt. Cost: $${result.costUsd}`);

    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Agent execution failed' });
  }
});

// Get agent execution history
router.get('/executions', (req: Request, res: Response): void => {
  const orgId = req.organization!.id;
  const executions = db.prepare(`
    SELECT e.*, a.name as agent_name, a.key as agent_key
    FROM agent_executions e
    JOIN ai_agents a ON a.id = e.agent_id
    WHERE e.organization_id = ?
    ORDER BY e.created_at DESC
    LIMIT 50
  `).all(orgId);

  res.json({
    executions: executions.map((e: any) => ({
      ...e,
      tool_calls: JSON.parse(e.tool_calls || '[]')
    }))
  });
});

export default router;
