# 🤖 A1Framework

## The AI Framework for Conversational Agents That Work With You

**A1Framework** is a professional, production-ready framework for building AI-powered chat agents using [A1Base](https://a1base.com) and [Next.js](https://nextjs.org). It enables seamless multi-channel communication through WhatsApp, Email, Slack, Teams, and SMS, with a special focus on WhatsApp integration. Powered by OpenAI's GPT-4, A1Framework provides a robust foundation for creating intelligent, responsive, and customizable conversational agents.

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![OpenAI](https://img.shields.io/badge/OpenAI-Powered-blue)](https://openai.com)
[![A1Base](https://img.shields.io/badge/A1Base-Integration-green)](https://a1base.com)
[![Discord](https://img.shields.io/badge/Discord-Community-blueviolet)](https://discord.gg/your-community-link)

</div>

---

## 🌟 Why Choose A1Framework?

A1Framework empowers developers with:

- **Effortless Multi-Channel Integration**: Connect with users across WhatsApp, Email, Slack, Teams, and SMS from one platform.
- **Advanced AI Capabilities**: Leverage OpenAI's GPT-4 for smart, context-aware conversations.
- **Persistent Conversations**: Maintain chat history for seamless user experiences.
- **Developer-Friendly Design**: Built with Next.js 14 and TypeScript for modern, scalable development.
- **Secure & Customizable**: Protect sensitive data and tailor your agent to your needs.

Whether you're creating customer support bots, virtual assistants, or interactive tools, A1Framework is your go-to solution.

---

## ✨ Features

### Core Capabilities
- **🧠 Advanced AI Integration**: Powered by OpenAI's GPT-4 for natural, intelligent responses.
- **📱 Multi-Channel Support**: Engage users on WhatsApp, Email, Slack, Teams, and SMS.
- **📧 Email Webhook Integration**: Receive and automatically respond to emails via A1Mail.
- **💾 Persistent Chat History**: Store messages for continuity across sessions.

### Technical Features
- **⚡ Modern Architecture**: Built on Next.js 14 with TypeScript for scalability.
- **🔐 Secure Configuration**: Environment-based setup to safeguard credentials.
- **📦 Quick Deployment**: Easy installation with npm.
- **🛡️ Safety First**: Configurable safety settings and content filtering.
- **🎯 Customizable Workflows**: Flexible message handling and routing.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: Version 18.x or later
- **[A1Base Account](https://dashboard.a1base.com)**: With API credentials
- **[OpenAI API Key](https://platform.openai.com)**: For AI capabilities
- **WhatsApp Business Number**: Configured via A1Base

> **New User?** Sign up for [A1Base](https://dashboard.a1base.com) and [OpenAI](https://platform.openai.com) to get your credentials.

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/a1framework-nextjs-template
   cd a1framework-nextjs-template

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and provide the values from your dashboards:

   - `A1BASE_API_KEY` – your A1Base API key (**required**)
   - `A1BASE_API_SECRET` – your A1Base API secret (**required**)
   - `A1BASE_ACCOUNT_ID` – your A1Base account ID (**required**)
   - `A1BASE_AGENT_NUMBER` – WhatsApp number connected to your agent (**required**)
   - `A1BASE_AGENT_NAME` – display name for the agent (**optional**)
   - `A1BASE_AGENT_EMAIL` – email address used when the agent sends emails (**required**)
   - `OPENAI_API_KEY` – API key for OpenAI (**required**)
   - `PERPLEXITY_API_KEY` – API key for Perplexity (**optional**)
   - `CRON_SECRET` – secret token to secure the cron route (**optional**)
   - `SUPABASE_URL` / `SUPABASE_KEY` – Supabase project credentials (**optional**)

   If you enable Supabase, open the SQL editor in your Supabase project and run
   the commands from `supabase.sql` to create the required tables.

4. **Set up A1Base credentials**
   - Register at [A1Base Dashboard](https://dashboard.a1base.com)
   - Access Settings > API Keys for credentials
   - Locate Account ID in Dashboard overview
   - Configure WhatsApp business number

5. **Launch development server**
   ```bash
   npm run dev
   ```

Your agent will be available at `http://localhost:3000`

## 🔧 Webhook Configuration

### Setting up Message Reception

1. **Expose Local Server**
   ```bash
   ngrok http 3000
   ```

2. **Configure A1Base Webhook**
   - Navigate to Settings > Webhooks in A1Base Dashboard
   - Set Webhook URL: `https://your-ngrok-url/api/whatsapp/incoming`
   - Save configuration

3. **Verify Setup**
   - Send test message to WhatsApp business number
   - Confirm AI response
   - Review console logs for debugging

## 🛠️ Customization

- **Agent Personality**: Modify `lib/agent-profile/agent-profile-settings.json`
- **Safety Settings**: Update `lib/safety-config/safety-settings.json`
- **AI Response Logic**: Customize `lib/services/openai.ts`
- **Message Handling**: Adjust `lib/ai-triage/triage-logic.ts`
- **Workflows**: Enhance `lib/workflows/basic_workflow.ts`
- **Interface**: Modify `app/page.tsx`

### 📸 Multimedia Messaging

The framework now supports sending and receiving multimedia content through WhatsApp:

#### Supported Media Types
- **Images** (JPG, PNG, GIF, WEBP) - up to 5MB
- **Videos** (MP4, 3GP) - up to 16MB  
- **Audio** (MP3, OGG, AMR, AAC) - up to 16MB
- **Documents** (PDF, DOC, DOCX, etc.) - up to 100MB
- **Location** sharing

#### Sending Media Messages
```typescript
// Using the API endpoint
POST /api/messaging/send-media
{
  "threadType": "individual",
  "recipientId": "+1234567890",
  "mediaUrl": "https://example.com/image.jpg",
  "mediaType": "image",
  "caption": "Check out this product!"
}

// Using workflow functions
import { SendProductImage } from "@/lib/workflows/multimedia-workflow";
await SendProductImage(threadMessages, imageUrl, productName, description, ...);
```

#### Receiving Media Messages
Incoming media is automatically processed and converted to text representations for the AI:
- Images: `[Image received: caption]`
- Videos: `[Video received: caption]`
- Documents: `[Document received: filename]`
- Location: `[Location shared: name at coordinates]`

For detailed multimedia documentation, see [docs/MULTIMEDIA_GUIDE.md](docs/MULTIMEDIA_GUIDE.md).

### 📧 Email Integration

The framework now supports automated email reception and response through A1Mail webhooks:

#### Features
- **Automatic Email Reception**: Receive emails via webhook integration
- **Professional Email Formatting**: AI generates properly formatted business emails with appropriate greetings, structure, and closings
- **Smart Thread Management**: Groups related emails into conversations
- **Conversation Threading**: Maintains context across email exchanges
- **Database Storage**: Stores email history for context (if Supabase is configured)

#### File Structure
- `lib/workflows/email_workflow.ts` - Core email functions
- `lib/workflows/email_workflow_prompt.js` - Professional email templates
- `lib/ai-triage/handle-email-incoming.ts` - Email processing logic
- `app/api/webhook/a1mail/route.ts` - Webhook endpoint

For detailed documentation, see:
- [Email Webhook Guide](docs/EMAIL_WEBHOOK_GUIDE.md)
- [Email Workflow Architecture](docs/EMAIL_WORKFLOW_ARCHITECTURE.md)

### 📬 Message Flow

When a message arrives through the webhook, here's the complete flow through the codebase:

1. **Webhook Entry Point** (`app/api/whatsapp/incoming/route.ts`)
   - Receives incoming webhook POST request
   - Validates and parses webhook payload
   - Extracts message details (sender, content, thread info)
   ```typescript:app/api/whatsapp/incoming/route.ts
   ```

2. **Message Handler** (`lib/ai-triage/handle-whatsapp-incoming.ts`)
   - Manages message storage and user data
   - Updates conversation history
   - Triggers message triage
   ```typescript:lib/ai-triage/handle-whatsapp-incoming.ts
   ```

3. **Message Triage** (`lib/ai-triage/triage-logic.ts`)
   - Analyzes message intent using OpenAI
   - Routes to appropriate workflow:
     - Simple responses
     - Identity verification
     - Email handling
     - [Add your own custom triage logic here]
   ```typescript:lib/ai-triage/triage-logic.ts
   ```

4. **Workflow Execution** (`lib/workflows/basic_workflow.ts`)
   - Handles different types of responses:
     - Default replies
     - Identity verification
     - Email composition and sending
     - [Add your own custom workflows here]
   ```typescript:lib/workflows/basic_workflow.ts
   ```

5. **OpenAI Integration** (`lib/services/openai.ts`)
   - Generates AI responses
   - Analyzes message intent
   - Creates email drafts
   ```typescript:lib/services/openai.ts
   ```

Each component can be customized to modify the bot's behavior:
- Adjust webhook handling in the entry point
- Modify message storage and history management
- Update triage logic and workflow routing
- Customize individual workflow implementations
- Fine-tune AI response generation

The system uses environment variables for configuration and can be integrated with Supabase for persistent storage. Safety settings and agent profile configurations can be adjusted through their respective configuration files.

## 🔄 Scheduled Tasks

The template includes a cron job system for automated tasks:
- Configure in `app/api/cron/route.ts`
- Set up scheduled tasks in `lib/cron-job/cron-job.ts`
- Secure with CRON_SECRET environment variable

## 👥 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support

- **A1Base Integration**: [Documentation](https://docs.a1base.com)
- **Template Issues**: [GitHub Issues](https://github.com/yourusername/a1framework-nextjs-template/issues)
- **General Inquiries**: [A1Base Support](https://a1base.com/support)

---

<div align="center">
Made with ❤️ by the A1Base Community
</div>
