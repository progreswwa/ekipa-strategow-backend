# ekipa-strategow-backend

AI-powered website generation backend for EKIPA STRATEGÓW. Orchestrates briefs, generates HTML/CSS/JS, and deploys to Netlify.

## 🚀 Features

- **AI-Powered Website Generation**: Generate complete websites from text briefs using AI
- **Netlify Integration**: Automatic deployment to Netlify
- **RESTful API**: Clean and documented API endpoints
- **Modular Architecture**: Well-organized folder structure with separation of concerns
- **Security**: Built-in security with Helmet.js
- **Logging**: Request logging with Morgan
- **Error Handling**: Centralized error handling middleware

## 📁 Project Structure

```
ekipa-strategow-backend/
├── src/
│   ├── config/          # Configuration files (environment, API settings)
│   │   └── index.js
│   ├── middleware/      # Custom middleware
│   │   ├── errorHandler.js
│   │   ├── logger.js
│   │   ├── validateRequest.js
│   │   └── index.js
│   ├── routes/          # API route definitions
│   │   ├── health.js
│   │   ├── website.js
│   │   └── index.js
│   ├── services/        # Business logic services
│   │   ├── aiService.js
│   │   ├── netlifyService.js
│   │   └── index.js
│   ├── app.js          # Express app configuration
│   └── index.js        # Server entry point
├── .env.example        # Environment variables template
├── .gitignore
├── eslint.config.js    # ESLint configuration
├── package.json
└── README.md
```

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/progreswwa/ekipa-strategow-backend.git
cd ekipa-strategow-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from template:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=3000
NODE_ENV=development
NETLIFY_API_TOKEN=your_netlify_token
OPENAI_API_KEY=your_openai_key
```

## 🚀 Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Linting
```bash
npm run lint
```

## 📡 API Endpoints

### Health Check
```http
GET /api/v1/health
```

Response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-11-14T18:00:00.000Z",
  "uptime": 123.456
}
```

### Generate Website
```http
POST /api/v1/website/generate
Content-Type: application/json

{
  "title": "My Website",
  "description": "A modern portfolio website",
  "requirements": ["responsive", "dark mode"],
  "style": "modern"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "brief": { ... },
    "website": {
      "html": "...",
      "css": "...",
      "js": "...",
      "metadata": { ... }
    }
  }
}
```

### Deploy Website
```http
POST /api/v1/website/deploy
Content-Type: application/json

{
  "html": "<html>...</html>",
  "css": "body { ... }",
  "js": "console.log('...');"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "url": "https://example.netlify.app",
    "deployId": "deploy_123456",
    "deployedAt": "2025-11-14T18:00:00.000Z"
  }
}
```

### Check Deployment Status
```http
GET /api/v1/website/deployment/:deployId
```

Response:
```json
{
  "success": true,
  "data": {
    "deployId": "deploy_123456",
    "status": "ready",
    "checkedAt": "2025-11-14T18:00:00.000Z"
  }
}
```

## 🔧 Configuration

Configuration is managed through environment variables and the `src/config/index.js` file.

### Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)
- `API_VERSION`: API version (default: v1)
- `NETLIFY_API_TOKEN`: Netlify API token
- `NETLIFY_SITE_ID`: Netlify site ID
- `OPENAI_API_KEY`: OpenAI API key
- `OPENAI_MODEL`: OpenAI model (default: gpt-4)
- `CORS_ORIGIN`: CORS origin (default: *)

## 🏗️ Architecture

### Config Layer (`src/config/`)
Manages all configuration including environment variables, API keys, and application settings.

### Middleware Layer (`src/middleware/`)
- **errorHandler.js**: Global error handling
- **logger.js**: Request/response logging
- **validateRequest.js**: Request validation

### Routes Layer (`src/routes/`)
Defines API endpoints and handles HTTP request/response logic.

### Services Layer (`src/services/`)
- **aiService.js**: AI website generation logic
- **netlifyService.js**: Netlify deployment integration

## 🧪 Testing

Run tests:
```bash
npm test
```

## 📝 License

ISC

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
