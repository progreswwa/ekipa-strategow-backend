# n8n Orchestration Workflow for EKIPA STRATEGÓW

This document outlines the n8n workflow automation that connects all components of the EKIPA STRATEGÓW system:
- Frontend briefing form submission → Backend API → HTML generation → Netlify deployment → Invoice generation

## Architecture Overview

### System Flow
```
┌─────────────────┐
│  Frontend Form  │  (Next.js briefing form at /app/brief)
└────────┬────────┘
         │ POST /api/brief
         ▼
┌──────────────────────┐
│  Backend Express API │  (Port 3000)
│  POST /api/brief     │
└────────┬─────────────┘
         │ Stores to PostgreSQL
         │ Triggers webhook
         ▼
┌──────────────────────┐
│  n8n Workflow        │  (Orchestration engine)
│  - HTML Generation   │
│  - CSS Styling       │
│  - JS Functionality  │
└────────┬─────────────┘
         │ Uses LangGraph + Claude API
         ▼
┌──────────────────────┐
│  Generated Website   │  (HTML/CSS/JS bundle)
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  Netlify Deploy      │  (Automatic deployment)
│  /api/deploy         │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  Invoice & Email     │  (Send client invoice + link)
│  PDF + Access link   │
└──────────────────────┘
```

## n8n Workflow Configuration

### Trigger: Webhook (HTTP POST)
**Endpoint**: `https://n8n.railway.app/webhook/ekipa-brief-received`

**Trigger Payload Structure**:
```json
{
  "briefId": "uuid",
  "clientEmail": "client@example.com",
  "clientName": "Client Name",
  "industry": "technology",
  "pageType": "landing-page",
  "description": "Brief description",
  "colors": ["#FF6B6B", "#4ECDC4"],
  "products": ["Product 1", "Product 2"],
  "customInstructions": "Any special requests"
}
```

### Nodes Workflow

#### 1. **Webhook Receiver**
- Receives POST request from backend
- Stores briefId in n8n context
- Sends acknowledgment (200 OK) to backend

#### 2. **Get PostgreSQL Data**
- Connects to Railway PostgreSQL
- Query briefs table for full brief details
- Enriches webhook payload with stored data

#### 3. **AI Generation (LangGraph + Claude)**
- Calls LangGraph agent with brief data
- Generates HTML structure
- Generates CSS styling
- Generates JS interactivity
- Returns complete website code

Prompt structure:
```
Generate a professional website for:
Client: {clientName}
Industry: {industry}
Type: {pageType}
Description: {description}
Brand Colors: {colors}
Products/Services: {products}
Special Instructions: {customInstructions}

Return valid HTML/CSS/JS in this format:
{
  "html": "...",
  "css": "...",
  "js": "..."
}
```

#### 4. **Store Generated Files**
- Save HTML to temporary storage
- Save CSS to temporary storage
- Save JS to temporary storage
- Create .zip bundle

#### 5. **Deploy to Netlify**
- Call POST /api/deploy endpoint
- Send generated files
- Wait for deployment to complete
- Receive deployment URL

#### 6. **Update PostgreSQL**
- Update deployments table with:
  - deployment_url
  - status: "deployed"
  - deployed_at: timestamp
  - html_size, css_size, js_size

#### 7. **Generate Invoice**
- Create invoice with:
  - Client name & email
  - Website type & complexity
  - Price based on tier
  - Deployment URL
  - Access credentials
  - Due date (Net 30)

#### 8. **Send Email with Invoice**
- To: {clientEmail}
- Subject: "Your Website is Ready - EKIPA STRATEGÓW"
- Body: Invoice details + deployment link
- Attachment: PDF invoice

#### 9. **Error Handling**
- If generation fails: Send error email to client & admin
- If deployment fails: Rollback & retry (max 3 attempts)
- If email fails: Log to Slack channel
- Update deployments table with error status

## Setup Instructions

### 1. n8n Setup
```bash
# Deploy n8n to Railway
# Environment variables:
DB_TYPE=postgres
DB_POSTGRESDB_HOST=${RAILWAY_POSTGRES_HOST}
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=${RAILWAY_POSTGRES_USER}
DB_POSTGRESDB_PASSWORD=${RAILWAY_POSTGRES_PASSWORD}
ENCRYPTION_KEY=your-random-encryption-key
WEBHOOK_TUNNEL_URL=https://n8n.railway.app/
```

### 2. LangGraph Agent Configuration
```typescript
// Backend n8n node calls this endpoint
POST /api/generate-website
{
  "brief": briefObject,
  "apiKey": LANGRAPH_API_KEY
}

// Returns:
{
  "html": "<html>...",
  "css": "body { ... }",
  "js": "console.log(...)"
}
```

### 3. Webhooks Integration
In backend `src/services/n8nWebhook.js`:
```javascript
const triggerN8NWorkflow = async (briefData) => {
  const webhook = process.env.N8N_WEBHOOK_URL;
  const response = await axios.post(webhook, briefData);
  return response.data;
};
```

### 4. Email Configuration (n8n)
- Gmail/SendGrid credentials in n8n secrets
- Email template with HTML invoice
- Attachments: PDF invoice file

## Monitoring & Logging

### n8n Dashboard
- Monitor workflow executions
- View success/failure rates
- Debug individual nodes
- Check logs for errors

### Slack Integration (Optional)
- Success: "New website deployed: {clientName} → {url}"
- Errors: "Website generation failed for {briefId}"
- Daily summary: "X websites generated today"

## Performance Targets

- Brief submission to deployment: **15-25 minutes**
- HTML generation: **2-5 minutes**
- Netlify deployment: **3-5 minutes**
- Email delivery: **< 1 minute**
- Webhook processing: **< 10 seconds**

## Cost Optimization

- n8n on Railway: Shared instance ($5-10/month)
- Claude API calls: ~$0.001-0.01 per website
- PostgreSQL: Included in Railway plan
- Netlify: Free tier or $20/month for Pro

## Security Considerations

- API key validation on webhook endpoint
- Encrypted client data in PostgreSQL
- HTTPS-only webhook communication
- Rate limiting: 10 requests per minute per client
- Input validation & sanitization
- HTML/CSS/JS safety checks before deployment

## Future Enhancements

- [ ] Template selection before generation
- [ ] Style customization UI
- [ ] CMS integration (Strapi/Sanity)
- [ ] Analytics dashboard
- [ ] A/B testing capabilities
- [ ] SEO optimization
- [ ] Performance metrics
- [ ] Multi-language support
