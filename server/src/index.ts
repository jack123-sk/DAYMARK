import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db/index.js';

// Route imports
import authRoutes from './routes/auth.js';
import opportunitiesRoutes from './routes/opportunities.js';
import projectsRoutes from './routes/projects.js';
import crmRoutes from './routes/crm.js';
import workflowsRoutes from './routes/workflows.js';
import agentsRoutes from './routes/agents.js';
import connectRoutes from './routes/connect.js';
import revenueRoutes from './routes/revenue.js';
import marketplaceRoutes from './routes/marketplace.js';
import billingRoutes from './routes/billing.js';
import teamRoutes from './routes/team.js';
import integrationsRoutes from './routes/integrations.js';
import auditRoutes from './routes/audit.js';
import notificationsRoutes from './routes/notifications.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Initialize Database & Seeding
initDatabase();

// Middleware
app.use(cors({
  origin: true, // Allow frontend during development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-organization-id', 'stripe-signature', 'x-razorpay-signature']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (sanitized)
app.use((req: Request, _res: Response, next: NextFunction) => {
  const start = Date.now();
  _res.on('finish', () => {
    const duration = Date.now() - start;
    if (!req.path.startsWith('/api/health')) {
      console.log(`[HTTP] ${req.method} ${req.path} -> ${_res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    product: 'DAYMARK OS',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: 'connected (node:sqlite WAL mode)'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/workflows', workflowsRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/connect', connectRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/notifications', notificationsRoutes);

// Centralized safe error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Unhandled Server Error]', err);
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected internal error occurred. Please contact support.'
    : err.message || 'Internal Server Error';

  res.status(status).json({ error: message });
});

// Start listening
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 DAYMARK OS Server running on http://localhost:${PORT}`);
  console.log(`🛡️  Tenant Isolation & ACID SQLite WAL storage active`);
  console.log(`==================================================`);
});

export default app;
