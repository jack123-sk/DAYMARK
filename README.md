# DAYMARK OS — The Global AI Business Automation Infrastructure

> *"Turn business opportunities into completed work."*

DAYMARK OS is a unified, production-oriented AI business automation platform. It eliminates the fragmentation between market research, proposal generation, client approvals, and customer relationship management by connecting every step of the commercial lifecycle into a deterministic, human-in-the-loop operating system.

---

## 🌟 Strategic Vision & Initial Beachhead

- **Target Segment:** Boutique B2B Digital Marketing & Technical Consultancies (5–25 staff).
- **Core Friction:** Agency principals and account leads waste 20–30 billable hours per week manually qualifying inbound leads, copying intake briefs, drafting tailored scope proposals, and chasing client approvals.
- **The DAYMARK Solution:** 
  1. Inbound inquiries are instantly parsed and domain-enriched.
  2. The Sales Assistant drafts a scope proposal and calculates deal win probability.
  3. A mandatory **Human-in-the-Loop Safety Gate** pauses execution in the operator's inbox.
  4. Once approved, the verified outreach is dispatched and the CRM Kanban pipeline automatically advances.
  5. Executive telemetry tracks MRR, ARR, and automation hours saved in real-time.

---

## 🏗️ Architecture & Technology Stack

```
daymark/
├── client/                     # High-End React 19 + TypeScript + Vite + Tailwind CSS v4
│   ├── src/
│   │   ├── api/client.ts       # Typed API client with token & tenant header injection
│   │   ├── components/         # Sidebar, Header, CommandPalette (⌘K)
│   │   ├── context/            # AuthContext (JWT session & 1-click Founder Demo)
│   │   ├── types/              # Clean TypeScript interfaces for all 8 engines
│   │   └── views/              # 26 complete public and authenticated view modules
│   └── index.html              # Custom SVG icon, Inter & Plus Jakarta Sans typography
├── server/                     # Node.js + Express 5 + TypeScript + node:sqlite
│   ├── src/
│   │   ├── db/                 # Native node:sqlite (Zero C++ dependency, ACID WAL mode)
│   │   ├── middleware/         # Auth (JWT & Tenant isolation), Audit logging, RBAC
│   │   ├── services/
│   │   │   ├── aiService.ts    # Controlled adapter (Gemini / OpenAI / Anthropic / Local Fallback)
│   │   │   ├── workflowEngine.ts # Deterministic state machine with human approval gates
│   │   │   └── billingService.ts # Configurable plan tiers, quota limits & signed webhooks
│   │   ├── routes/             # REST API microservices for all 14 backend resources
│   │   └── tests/              # Automated node:test suite (11/11 passing tests)
│   ├── data/daymark.db         # Persistent SQLite database file
│   └── .env.example            # Documented environment template
└── package.json                # Root coordination scripts (concurrent dev, builds, tests)
```

---

## 🚀 Key Modules & Capabilities

### A. Nexora Opportunity Engine (`/app/opportunities`)
- Market hypothesis management with explicit criteria scoring:
  $$\text{Composite Score} = (\text{Willingness to Pay} \times 0.40) + (\text{Feasibility} \times 0.30) + (\text{Market Confidence} \times 0.30)$$
- Structured Customer Discovery Interview Guide generator (4-question qualitative loop).
- One-click exportable analytical opportunity markdown briefs.

### B. DAYMARK AI Business Builder (`/app/builder`)
- Natural language project intake.
- Synthesizes 8 structured assets: Executive Business Plan, Customer Personas, Positioning Framework, Safe Landing Page Preview, Pricing Hypotheses, Marketing Outbound Drafts, Operational Launch Checklist, and Risk Mitigation Matrix.
- 100% safe template rendering without executing untrusted arbitrary code on the production host.

### C. Workflow Automation & Safety Gates (`/app/workflows`)
- Visual state machine supporting sequential steps: `validate_lead`, `generate_ai_summary`, `request_human_approval`, `send_email_draft`, `update_crm_stage`, and `create_task`.
- **Mandatory Human-in-the-Loop Sign-Off:** Halts automated dispatches until an authorized operator reviews and approves the payload.
- Idempotency key tracking to guarantee zero duplicate executions or double billing.

### D. Integrated CRM & Deal Pipeline (`/app/crm`)
- Deals Kanban board with stages: `New Inquiry` → `Qualified Fit` → `Proposal Sent` → `In Negotiation` → `Closed Won`.
- Contacts directory with lead scoring, tags, and one-click CSV export and CSV import modal.
- Follow-up task reminders with priority badges.

### E. 6 Controlled AI Assistants (`/app/agents`)
1. **Business Research Agent:** Analyzes target market sizing (TAM/SAM) and pain point benchmarks.
2. **Marketing Assistant:** Formulates high-converting copy hooks and positioning frameworks.
3. **Sales Assistant:** Enriches inbound leads, scores win probability, and drafts custom proposals.
4. **Customer Support Assistant:** Triages incoming inquiries and drafts SLA-compliant responses.
5. **Operations Assistant:** Audits workflow execution times and identifies process bottlenecks.
6. **Business Analytics Assistant:** Models unit economics, CAC payback, and customer retention.
- Zero browser secret exposure; all tokens and USD costs are tracked in database audit records.

### F. Global Connect Partner Directory (`/app/connect`)
- Directory of verified B2B partners, suppliers, and enterprise buyers across North America, Europe, and Asia Pacific.
- 1-click personalized outreach draft modal gated by operator review before external dispatch.

### G. Revenue Intelligence & Financial Modeling (`/app/revenue`)
- Live pipeline weighted value, MRR run rate, and automation hours saved tracker ($45/hr agency benchmark).
- **Interactive 3-Scenario Financial Projection Model:**
  - Sliders for Paying Customers, Monthly ARPU, Churn Rate, New Customer Velocity, and CAC.
  - Automatically calculates Gross Margin, Operating Expenses, Operating Profit (EBITDA), Customer LTV, LTV:CAC Ratio, Break-Even Customer Count, and Cash Runway.
  - Sensitivity matrix evaluating MRR variance at $\pm 20\%$ customer volume and ARPU.

### H. Blueprint Marketplace (`/app/marketplace`)
- Audited first-party automation blueprints (Agency FastPack, Churn Sentinel, Competitor Tracker) with one-click install/uninstall into the active workspace.

---

## 🔒 Security Architecture

1. **Multi-Tenant Data Isolation:** Every database query enforces an `organization_id` filter. Cross-tenant access is rejected at both the middleware and database statement layers.
2. **Cryptographic Webhook Signatures:** Uses HMAC-SHA256 signature verification (`BillingService.verifyWebhookSignature`) to prevent payment spoofing or forged webhook events.
3. **RBAC Permissions:** Supports `owner`, `admin`, `member`, and `viewer` roles with permission check middleware (`requireRole`).
4. **Audit Logging:** Every state-changing mutation records user ID, email, action, resource type, details, client IP, and UTC timestamp into the `audit_logs` table.
5. **Production Error Masking:** Stack traces are sanitized in production environments.

---

## ⚡ Quickstart & Local Development

### 1. Prerequisites
- Node.js v20+ or v24+ (Node.js v24 is pre-installed)
- npm v10+

### 2. Installation
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Run Automated Tests
```bash
cd server
npm test
```
*Executes all 11 unit & integration tests (Tenant Isolation, AI Budgeting, Workflow Engine, and Signed Webhook Verification).*

### 4. Start Development Servers
```bash
# From root directory:
npm run dev

# Or in separate terminals:
# Terminal 1: Backend API (Port 5050)
cd server && npm run dev

# Terminal 2: Vite Client (Port 3000)
cd client && npm run dev
```

### 5. Instant Access (1-Click Founder Demo)
Open `http://localhost:3000` in your browser and click **1-Click Founder Demo** on the navigation bar to immediately explore the active executive workspace pre-loaded with sample CRM deals, workflows, and AI assistants.

---

## 📁 Safe Manual Project Folder Rename Steps

If you wish to rename the project folder from `own company` to `DAYMARK`:

1. Stop any running terminal processes (`Ctrl+C` on both client and server tasks).
2. Close the folder in your IDE/editor so Windows releases file handles.
3. Open PowerShell or Command Prompt in `C:\Users\Arun\OneDrive\Desktop`:
   ```powershell
   Rename-Item -Path "own company" -NewName "DAYMARK"
   ```
4. Re-open `C:\Users\Arun\OneDrive\Desktop\DAYMARK` in your editor.
5. Run `npm test` and `npm run dev` to resume operations.

---

## 📊 Commercial Validation Plan (First 20 Customers)

1. **Target Persona:** Managing Directors of boutique digital marketing and web agencies (5–20 staff) billing $20k–$80k monthly.
2. **Channel Strategy:**
   - Public directory discovery (Clutch.co, LinkedIn, Google Maps).
   - Personalized LinkedIn outreach utilizing the DAYMARK outreach template.
   - 10-minute discovery interviews asking the 4 Nexora validation questions.
3. **Paid Pilot Offer:** $149/mo pilot with 14-day free trial.
4. **Success Metric:** 15+ hours/week saved on client intake and scope approvals within 30 days.

---

## 📜 License
Proprietary software. Developed for DAYMARK Inc. All rights reserved.
