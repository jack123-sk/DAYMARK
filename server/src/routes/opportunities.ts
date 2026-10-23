import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/audit.js';

const router = Router();
router.use(authMiddleware);

// List opportunities for current organization
router.get('/', (req: Request, res: Response): void => {
  const orgId = req.organization!.id;
  const opps = db.prepare(`
    SELECT * FROM opportunities
    WHERE organization_id = ?
    ORDER BY composite_score DESC, created_at DESC
  `).all(orgId);
  res.json({ opportunities: opps });
});

// Create new opportunity with scoring matrix
router.post('/', (req: Request, res: Response): void => {
  try {
    const orgId = req.organization!.id;
    const {
      title,
      industry,
      targetSegment,
      problemStatement,
      solutionHypothesis,
      marketSizeArr,
      confidenceScore = 70,
      feasibilityScore = 75,
      willingnessToPayScore = 80,
      validationNotes,
      risks
    } = req.body;

    if (!title || !industry || !targetSegment || !problemStatement || !solutionHypothesis) {
      res.status(400).json({ error: 'Title, industry, target segment, problem statement, and solution hypothesis are required.' });
      return;
    }

    // Weighted composite scoring formula: Willingness to Pay (40%) + Feasibility (30%) + Confidence (30%)
    const compositeScore = Number(
      ((willingnessToPayScore * 0.4) + (feasibilityScore * 0.3) + (confidenceScore * 0.3)).toFixed(1)
    );

    const interviewGuide = JSON.stringify([
      `1. How does your team currently handle ${problemStatement.slice(0, 50)}...?`,
      `2. What is the most painful bottleneck when attempting to solve this manually?`,
      `3. How many billable or administrative hours does your team lose to this each week?`,
      `4. If an automated software system handled this with human sign-off, what monthly budget would be justified?`
    ]);

    const id = uuidv4();
    db.prepare(`
      INSERT INTO opportunities (
        id, organization_id, title, industry, target_segment, problem_statement, solution_hypothesis,
        market_size_arr, confidence_score, feasibility_score, willingness_to_pay_score, composite_score,
        status, validation_notes, risks, interview_guide
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'hypothesized', ?, ?, ?)
    `).run(
      id, orgId, title, industry, targetSegment, problemStatement, solutionHypothesis,
      Number(marketSizeArr) || 1000000, Number(confidenceScore), Number(feasibilityScore),
      Number(willingnessToPayScore), compositeScore, validationNotes || '', risks || '', interviewGuide
    );

    logAuditEvent(req, 'OPPORTUNITY_CREATED', 'opportunity', id, `Created opportunity: ${title}`);

    const created = db.prepare('SELECT * FROM opportunities WHERE id = ?').get(id);
    res.status(201).json({ opportunity: created });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create opportunity' });
  }
});

// Update opportunity status or validation notes
router.put('/:id', (req: Request, res: Response): void => {
  const orgId = req.organization!.id;
  const id = req.params.id as string;
  const { status, validationNotes, risks, compositeScore } = req.body;

  const existing = db.prepare('SELECT id FROM opportunities WHERE id = ? AND organization_id = ?').get(id, orgId);
  if (!existing) {
    res.status(404).json({ error: 'Opportunity not found in this organization.' });
    return;
  }

  db.prepare(`
    UPDATE opportunities
    SET status = COALESCE(?, status),
        validation_notes = COALESCE(?, validation_notes),
        risks = COALESCE(?, risks),
        composite_score = COALESCE(?, composite_score),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND organization_id = ?
  `).run(status || null, validationNotes || null, risks || null, compositeScore || null, id, orgId);

  logAuditEvent(req, 'OPPORTUNITY_UPDATED', 'opportunity', id, `Updated status to ${status}`);
  const updated = db.prepare('SELECT * FROM opportunities WHERE id = ?').get(id);
  res.json({ opportunity: updated });
});

// Delete opportunity
router.delete('/:id', (req: Request, res: Response): void => {
  const orgId = req.organization!.id;
  const id = req.params.id as string;

  db.prepare('DELETE FROM opportunities WHERE id = ? AND organization_id = ?').run(id, orgId);
  logAuditEvent(req, 'OPPORTUNITY_DELETED', 'opportunity', id, 'Deleted opportunity');
  res.json({ success: true, message: 'Opportunity deleted.' });
});

// Export comprehensive opportunity analysis report (Markdown)
router.get('/:id/export', (req: Request, res: Response): void => {
  const orgId = req.organization!.id;
  const id = req.params.id as string;

  const opp = db.prepare('SELECT * FROM opportunities WHERE id = ? AND organization_id = ?').get(id, orgId) as any;
  if (!opp) {
    res.status(404).json({ error: 'Opportunity not found' });
    return;
  }

  const report = `
# NEXORA OPPORTUNITY REPORT: ${opp.title.toUpperCase()}
*Generated by DAYMARK OS Opportunity Engine*
*Date: ${new Date().toISOString()}*

---

## 1. Executive Summary
- **Target Industry**: ${opp.industry}
- **Target Customer Segment**: ${opp.target_segment}
- **Validation Status**: ${opp.status.toUpperCase()}
- **Composite Score**: ${opp.composite_score} / 100

## 2. Problem & Hypothesis
### Core Problem Statement
> ${opp.problem_statement}

### Proposed Solution Hypothesis
${opp.solution_hypothesis}

## 3. Market Size & Scoring Breakdown
- **Estimated Serviceable Market**: $${Number(opp.market_size_arr).toLocaleString()} ARR
- **Willingness to Pay Score (40% weight)**: ${opp.willingness_to_pay_score}/100
- **Feasibility Score (30% weight)**: ${opp.feasibility_score}/100
- **Confidence Score (30% weight)**: ${opp.confidence_score}/100
- **Formula**: (Willingness × 0.40) + (Feasibility × 0.30) + (Confidence × 0.30) = ${opp.composite_score}

## 4. Risks & Feasibility Analysis
${opp.risks || 'No immediate critical blockers noted.'}

## 5. Customer Discovery Guide
${opp.interview_guide ? JSON.parse(opp.interview_guide).join('\n') : 'Standard 4-question discovery loop.'}

---
*Notice: Market sizing estimates are analytical approximations. Always validate assumptions via primary customer interviews.*
  `.trim();

  res.setHeader('Content-Type', 'text/markdown');
  res.setHeader('Content-Disposition', `attachment; filename="opportunity_${id}.md"`);
  res.send(report);
});

export default router;
