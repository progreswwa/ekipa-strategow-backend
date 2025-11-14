# EKIPA STRATEGÓW - Production Deployment Guide

Complete step-by-step guide for deploying EKIPA STRATEGÓW to production environments.

## Table of Contents

1. [Backend Deployment (Express.js) - Railway](#backend-deployment)
2. [Frontend Deployment (Next.js) - Vercel](#frontend-deployment)
3. [Database Setup - PostgreSQL](#database-setup)
4. [n8n Orchestration Setup](#n8n-setup)
5. [Environment Variables](#environment-variables)
6. [Verification & Testing](#verification)
7. [Monitoring & Troubleshooting](#monitoring)

---

## Backend Deployment

### Prerequisites
- GitHub account with access to `progreswwa/ekipa-strategow-backend`
- Railway account (https://railway.app)
- PostgreSQL database URL from Railway
- OpenAI API key
- Netlify API token

### Step 1: Connect to Railway

```bash
# Login to Railway
railway login

# Navigate to backend directory
cd ekipa-strategow-backend

# Create Railway project
railway init
```

### Step 2: Deploy Backend Service

```bash
# From Railway dashboard:
# 1. Click "+ Create" button
# 2. Select "GitHub Repo"
# 3. Select "progreswwa/ekipa-strategow-backend"
# 4. Railway auto-detects Node.js project
# 5. Deployment starts automatically
```

### Step 3: Configure Environment Variables

In Railway dashboard for backend service, add these variables:

```env
NODE_ENV=production
PORT=3000

# Database
DB_HOST=${RAILWAY_POSTGRES_HOST}
DB_PORT=${RAILWAY_POSTGRES_PORT}
DB_DATABASE=ekipa_strategow
DB_USER=${RAILWAY_POSTGRES_USER}
DB_PASSWORD=${RAILWAY_POSTGRES_PASSWORD}

# APIs
OPENAI_API_KEY=sk-your-key-here
NETLIFY_API_TOKEN=your-netlify-token
N8N_WEBHOOK_URL=https://n8n.railway.app/webhook/ekipa-brief-received

# Security
API_KEY=your-random-api-key-min-32-chars
CORS_ORIGIN=https://ekipa-strategow.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 4: Run Database Migrations

```bash
# SSH into Railway service
railway shell

# Run schema initialization
psql -h $DB_HOST -U $DB_USER -d $DB_DATABASE -f db/schema.sql

# Verify tables created
\dt

# Exit
exit
```

### Step 5: Verify Backend Deployment

```bash
# Get backend URL from Railway
RAILWAY_URL=https://ekipa-strategow-backend-prod.railway.app

# Test health endpoint
curl $RAILWAY_URL/api/v1/health

# Expected response:
# {"status":"ok","version":"1.0.0","timestamp":"2025-01-XX"}
```

---

## Frontend Deployment

### Prerequisites
- GitHub account with access to `progreswwa/ekipa-strategow-frontend`
- Vercel account (https://vercel.com)
- Backend URL from Railway deployment

### Step 1: Deploy to Vercel

```bash
# Option 1: Using Vercel Dashboard
# 1. Go to https://vercel.com/new
# 2. Select "GitHub" and authenticate
# 3. Search for "ekipa-strategow-frontend"
# 4. Click "Import"
# 5. Configure project settings
# 6. Click "Deploy"

# Option 2: Using CLI
cd ekipa-strategow-frontend
vercel --prod
```

### Step 2: Configure Environment Variables

In Vercel dashboard, go to Settings > Environment Variables:

```env
NEXT_PUBLIC_BACKEND_URL=https://ekipa-strategow-backend-prod.railway.app
NEXT_PUBLIC_API_KEY=your-random-api-key
NEXT_PUBLIC_APP_NAME=EKIPA STRATEGÓW
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Step 3: Configure Domain

```
In Vercel Dashboard:
1. Settings > Domains
2. Add custom domain (e.g., ekipa-strategow.pl)
3. Add DNS records:
   - A: 76.76.19.165
   - AAAA: 2606:4700:3031::6c4c:13a5
4. Verify domain ownership
5. Deploy automatic SSL certificate
```

### Step 4: Verify Frontend Deployment

```bash
# Test frontend URL
FRONTEND_URL=https://ekipa-strategow.vercel.app

curl $FRONTEND_URL

# Should return HTML with title "EKIPA STRATEGÓW"
```

---

## Database Setup

### PostgreSQL Initialization

```bash
# Connect to Railway PostgreSQL
psql -h $DB_HOST -U $DB_USER -W

# Create database
CREATE DATABASE ekipa_strategow;

# Switch to database
\c ekipa_strategow

# Run schema
\i db/schema.sql

# Verify tables
\dt

# Create indexes for performance
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_briefs_client_id ON briefs(client_id);
CREATE INDEX idx_deployments_brief_id ON deployments(brief_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
```

### Backup Strategy

```bash
# Daily backups on Railway
# In Railway dashboard > Settings > Backups
# Enable automated backups
# Retention: 30 days

# Manual backup
pg_dump -h $DB_HOST -U $DB_USER $DB_DATABASE > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -h $DB_HOST -U $DB_USER $DB_DATABASE < backup_20250115.sql
```

---

## n8n Setup

### Deploy n8n to Railway

```bash
# In Railway Dashboard:
# 1. Click "+ Create" > "Database" > "PostgreSQL"
# 2. Create new PostgreSQL for n8n
# 3. Click "+ Create" > "Template" > "n8n"
# 4. Configure database connection
# 5. Deploy
```

### n8n Environment Variables

```env
DB_TYPE=postgres
DB_POSTGRESDB_HOST=${N8N_POSTGRES_HOST}
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=${N8N_POSTGRES_USER}
DB_POSTGRESDB_PASSWORD=${N8N_POSTGRES_PASSWORD}
ENCRYPTION_KEY=$(openssl rand -hex 32)
WEBHOOK_TUNNEL_URL=https://n8n-prod.railway.app
N8N_HOST=0.0.0.0
N8N_PORT=5678
```

### Import Workflow

```bash
# Export from development n8n
# Settings > Export Workflow
# Save as workflow.json

# In production n8n:
# Click "Import"
# Upload workflow.json
# Configure webhook endpoint
# Activate workflow
```

---

## Environment Variables

### Complete List

**Backend (.env)**
```
NODE_ENV=production
PORT=3000
DB_HOST=railway-postgres.railway.app
DB_PORT=5432
DB_DATABASE=ekipa_strategow
DB_USER=postgres
DB_PASSWORD=secure-password
OPENAI_API_KEY=sk-...
NETLIFY_API_TOKEN=nfp_...
N8N_WEBHOOK_URL=https://n8n-prod.railway.app/webhook/ekipa-brief
API_KEY=your-secret-api-key-min-32-chars
CORS_ORIGIN=https://ekipa-strategow.vercel.app
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
JWT_SECRET=your-jwt-secret
JWT_EXPIRY=7d
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_BACKEND_URL=https://ekipa-strategow-backend-prod.railway.app
NEXT_PUBLIC_API_KEY=your-api-key
NEXT_PUBLIC_APP_NAME=EKIPA STRATEGÓW
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ANALYTICS_ID=your-ga-id
```

---

## Verification & Testing

### Health Checks

```bash
# Backend health
curl https://ekipa-strategow-backend-prod.railway.app/api/v1/health

# Database connectivity
curl -X POST https://ekipa-strategow-backend-prod.railway.app/api/v1/test/db

# API authentication
curl -H "Authorization: Bearer API_KEY" https://ekipa-strategow-backend-prod.railway.app/api/v1/test/auth
```

### Smoke Tests

```bash
# Create test brief
curl -X POST https://ekipa-strategow-backend-prod.railway.app/api/v1/brief \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer API_KEY" \
  -d '{
    "clientName": "Test Client",
    "clientEmail": "test@example.com",
    "industry": "technology",
    "pageType": "landing-page",
    "description": "Test website",
    "colors": ["#FF6B6B", "#4ECDC4"]
  }'

# Get brief status
curl https://ekipa-strategow-backend-prod.railway.app/api/v1/brief/BRIEF_ID
```

---

## Monitoring & Troubleshooting

### Logs

```bash
# Railway backend logs
railway logs --service ekipa-strategow-backend

# Vercel frontend logs
vercel logs ekipa-strategow

# n8n workflow logs
# Access via n8n dashboard > Execution History
```

### Common Issues

**Backend won't start**
- Check PostgreSQL credentials
- Verify database exists
- Check API keys validity
- Review error logs

**Frontend not connecting to backend**
- Verify NEXT_PUBLIC_BACKEND_URL
- Check CORS configuration
- Verify API key in headers
- Check network requests in DevTools

**n8n workflow fails**
- Check webhook endpoint URL
- Verify database connection
- Check n8n credentials
- Review workflow execution logs

### Monitoring Dashboards

- **Railway**: https://railway.app > Project > Services
- **Vercel**: https://vercel.com > Deployments
- **n8n**: https://n8n-prod.railway.app
- **PostgreSQL**: psql admin interface

### Performance Optimization

```bash
# Enable database query optimization
# In PostgreSQL:
ANALYZE;
VACUUM;

# Configure Railway autoscaling
# In Railway Dashboard:
# Settings > Autoscaling
# Min instances: 1
# Max instances: 3
# CPU trigger: 70%
# Memory trigger: 80%
```

---

## Post-Deployment Checklist

- [ ] Backend health endpoint returns 200
- [ ] Frontend loads without console errors
- [ ] Database connection successful
- [ ] n8n webhook accessible
- [ ] SSL certificates installed
- [ ] DNS records resolving
- [ ] Email sending configured
- [ ] API rate limiting working
- [ ] CORS headers correct
- [ ] Backups scheduled
- [ ] Monitoring alerts set
- [ ] Performance baseline established

---

## Rollback Procedure

```bash
# If deployment fails:

# Railway backend
railway rollback

# Vercel frontend
vercel rollback ekipa-strategow

# Database restore
psql -h $DB_HOST -U $DB_USER $DB_DATABASE < backup_20250115.sql
```

---

## Support

For deployment issues, check:
- Error logs in Railway/Vercel dashboards
- Database connectivity
- Environment variable configuration
- API key validity
- Network connectivity
- Webhook endpoint accessibility
