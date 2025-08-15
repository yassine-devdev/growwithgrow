# GROW YouR NEED SaaS School (All In One) - Backend

A comprehensive, production-ready backend system for a complete school management platform built with Encore.ts. This backend provides a full suite of APIs for managing schools, users, academics, communications, marketplace, gamification, AI services, and much more.

## 🏗️ Architecture Overview

The backend is built using **Encore.ts**, a TypeScript framework for building distributed systems and REST APIs. The system is organized into multiple microservices, each handling specific domain functionality.

### Core Services

- **Core** - User and school management
- **Academics** - Courses, classes, assignments, submissions
- **Dashboard** - KPIs, analytics, alerts, reporting
- **CRM** - Customer relationship management
- **Support** - Support ticket management
- **Communications** - Email, templates, announcements, calendar
- **Knowledge** - Curriculum, assessments, library, store
- **AI** - Chat, prompts, conversations, usage tracking
- **Marketplace** - Products, orders, reviews
- **Gamification** - Achievements, points, leaderboards, quests
- **Tools** - Reports, marketing campaigns, SEO, analytics
- **Storage** - File upload/download management
- **Notifications** - In-app notifications and preferences
- **Analytics** - Event tracking, page views, user sessions
- **Settings** - System and user configuration
- **Integrations** - Third-party service integrations
- **Webhooks** - Event-driven webhook system

## 🚀 Features

### 🎓 Academic Management
- **Course Management**: Create and manage courses with prerequisites, syllabi
- **Class Scheduling**: Manage class sections, schedules, enrollment
- **Assignment System**: Create, distribute, and grade assignments
- **Submission Tracking**: Student submission management with feedback

### 👥 User & School Management
- **Multi-role Support**: Admin, Teacher, Student, Parent, Provider roles
- **School Profiles**: Complete school information and settings
- **User Relationships**: Link users to schools with specific roles

### 📊 Dashboard & Analytics
- **KPI Tracking**: Monitor key performance indicators
- **Sales Analytics**: Revenue and transaction tracking
- **User Growth**: Track user acquisition and engagement
- **Alert System**: Configurable alerts and notifications

### 🤖 AI Integration
- **OpenRouter Integration**: Access to multiple AI models
- **Ollama Support**: Local AI model deployment
- **Conversation Management**: Persistent chat history
- **Prompt Templates**: Reusable AI prompts
- **Usage Tracking**: Monitor AI costs and token usage

### 💬 Communications
- **Email System**: Send, receive, and manage emails
- **Templates**: Reusable email templates
- **Announcements**: School-wide announcements
- **Calendar Integration**: Event and meeting management

### 🛒 Marketplace
- **Product Management**: Full e-commerce functionality
- **Order Processing**: Complete order lifecycle
- **Inventory Tracking**: Stock management
- **Review System**: Product ratings and reviews

### 🎮 Gamification
- **Achievement System**: Unlock achievements based on criteria
- **Points & Rewards**: Award points for activities
- **Leaderboards**: Competitive rankings
- **Quest System**: Structured challenges and goals

### 📈 Advanced Analytics
- **Event Tracking**: Custom event analytics
- **Page View Analytics**: User behavior tracking
- **Session Management**: User session analytics
- **Device & Browser Tracking**: Comprehensive user analytics

### 🔧 Tools & Integrations
- **Custom Reports**: Build and schedule reports
- **Marketing Campaigns**: Multi-channel campaign management
- **SEO Analysis**: Website optimization tracking
- **Third-party Integrations**: SSO, calendar, email, video conferencing

### 📁 File Management
- **Multi-bucket Storage**: Organized file storage
- **Signed URLs**: Secure file upload/download
- **Public/Private Files**: Flexible access control

### 🔔 Notification System
- **Multi-channel Notifications**: Email, push, SMS, in-app
- **User Preferences**: Customizable notification settings
- **Event-driven**: Automatic notifications for system events

### ⚙️ Configuration Management
- **System Settings**: Global and school-specific settings
- **User Preferences**: Individual user configurations
- **Environment Management**: Development, staging, production configs

### 🔗 Webhook System
- **Event Broadcasting**: Real-time event notifications
- **Retry Logic**: Reliable delivery with automatic retries
- **Signature Verification**: Secure webhook endpoints

## 📁 Project Structure

```
backend/
├── core/
│   ├── encore.service.ts, db.ts, types.ts
│   ├── migrations/ (1_create_users.up.sql, 2_create_schools.up.sql, 3_create_user_schools.up.sql)
│   └── (create/list/get/update/delete)_user.ts, (create/list/get)_school.ts
├── academics/
│   ├── encore.service.ts, db.ts, types.ts
│   ├── migrations/ (5 files for courses, classes, enrollments, assignments, submissions)
│   └── (create/list)_courses.ts, (create/list)_classes.ts, (create/list)_assignments.ts, (create/list)_enrollments.ts, (create/list/grade)_submission.ts
├── dashboard/
│   ├── encore.service.ts, db.ts, types.ts
│   ├── migrations/ (4 files for kpis, sales, user_growth, alerts)
│   └── get_kpis.ts, get_sales_chart.ts, get_user_growth.ts, (get/create)_alert.ts
├── crm/
│   ├── encore.service.ts, db.ts, types.ts
│   ├── migrations/ (5 files for contacts, leads, accounts, deals, campaigns)
│   └── (create/list)_contacts.ts, (create/list)_leads.ts, (create/list)_accounts.ts, (create/list)_deals.ts, (create/list)_campaigns.ts
├── support/
│   ├── encore.service.ts, db.ts, types.ts
│   ├── migrations/ (1_create_tickets.up.sql, 2_create_ticket_replies.up.sql)
│   └── (create/list/get/reply_to)_ticket.ts
├── communications/
│   ├── encore.service.ts, db.ts, types.ts
│   ├── migrations/ (4 files for emails, templates, announcements, calendar)
│   └── (send/list)_email.ts, (create/list)_template.ts, (create/list)_announcement.ts, (create/list)_calendar_event.ts
├── knowledge/
│   ├── encore.service.ts, db.ts, types.ts
│   ├── migrations/ (5 files for curriculum, assessments, questions, library, store)
│   └── (create/list)_curriculum.ts, (create/list)_assessment.ts, (create/list)_question.ts, (create/list)_library_item.ts, (create/list)_store_item.ts
├── ai/
│   ├── encore.service.ts, db.ts, types.ts, config.ts
│   ├── migrations/ (4 files for conversations, messages, prompts, usage)
│   ├── openrouter_client.ts, ollama_client.ts
│   └── chat.ts, (list/get)_conversations.ts, (create/list)_prompts.ts, get_models.ts, get_usage.ts
├── marketplace/
│   ├── encore.service.ts, db.ts, types.ts
│   ├── migrations/ (5 files for products, categories, orders, items, reviews)
│   └── (create/list)_product.ts, (create/list)_category.ts, (create/list)_order.ts, (create/list)_review.ts
├── gamification/
│   ├── encore.service.ts, db.ts, types.ts
│   ├── migrations/ (5 files for achievements, user_achievements, leaderboards, points, quests)
│   └── list_achievements.ts, award_points.ts, get_leaderboard.ts, (create/list)_quest.ts
├── tools/
│   ├── encore.service.ts, db.ts, types.ts
│   ├── migrations/ (4 files for reports, marketing, seo, analytics)
│   └── (create/list)_report.ts, (create/list)_marketing_campaign.ts, get_seo_analysis.ts, get_analytics.ts
├── storage/
│   ├── encore.service.ts
│   └── files.ts
├── notifications/
│   ├── encore.service.ts, db.ts, types.ts
│   ├── migrations/ (1_create_notifications.up.sql, 2_create_notification_preferences.up.sql)
│   └── (create/list)_notification.ts, mark_as_read.ts, (get/update)_preferences.ts
├── analytics/
│   ├── encore.service.ts, db.ts, types.ts
│   ├── migrations/ (1_create_events.up.sql, 2_create_page_views.up.sql, 3_create_user_sessions.up.sql)
│   └── track_event.ts, track_page_view.ts, get_analytics_summary.ts
├── settings/
│   ├── encore.service.ts, db.ts, types.ts
│   ├── migrations/ (1_create_system_settings.up.sql, 2_create_user_settings.up.sql)
│   └── (get/update)_system_setting.ts, (get/update)_user_setting.ts
├── integrations/
│   ├── encore.service.ts, db.ts, types.ts
│   ├── migrations/ (1_create_integrations.up.sql, 2_create_sync_logs.up.sql)
│   └── (create/list/sync)_integration.ts
└── webhooks/
    ├── encore.service.ts, db.ts, types.ts
    ├── migrations/ (1_create_webhook_endpoints.up.sql, 2_create_webhook_deliveries.up.sql)
    └── create_endpoint.ts, trigger_webhook.ts, list_deliveries.ts
```

## 🛠️ Technology Stack

- **Framework**: Encore.ts
- **Language**: TypeScript
- **Database**: PostgreSQL (managed by Encore)
- **Storage**: Object Storage (managed by Encore)
- **AI Integration**: OpenRouter API, Ollama
- **Authentication**: Configurable (supports Clerk, Auth0, etc.)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- Encore CLI installed (`npm install -g @encore/cli`)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd grow-your-need-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment secrets**
   
   Configure the following secrets in your Encore dashboard or local development:
   
   ```bash
   # AI Services
   encore secret set OpenRouterApiKey <your-openrouter-api-key>
   
   # Authentication (if using Clerk)
   encore secret set ClerkSecretKey <your-clerk-secret-key>
   ```

4. **Run the development server**
   ```bash
   encore run
   ```

5. **Run database migrations**
   ```bash
   encore db migrate
   ```

### Development

- **Start development server**: `encore run`
- **Run tests**: `encore test`
- **Generate API documentation**: `encore gen client`
- **Deploy to cloud**: `encore deploy`

## 📊 Database Schema

The system uses PostgreSQL with the following main entities:

### Core Entities
- **Users**: System users with roles (admin, teacher, student, parent, provider)
- **Schools**: Educational institutions
- **UserSchools**: Many-to-many relationship between users and schools

### Academic Entities
- **Courses**: Academic courses with prerequisites and syllabi
- **Classes**: Course instances with schedules and enrollment
- **Assignments**: Course assignments and projects
- **Submissions**: Student assignment submissions
- **Enrollments**: Student class enrollments

### Communication Entities
- **Emails**: Email messages and threads
- **EmailTemplates**: Reusable email templates
- **Announcements**: School announcements
- **CalendarEvents**: Events and meetings

### AI Entities
- **Conversations**: AI chat conversations
- **Messages**: Individual chat messages
- **Prompts**: AI prompt templates
- **AIUsage**: AI service usage tracking

### Marketplace Entities
- **Products**: E-commerce products
- **Orders**: Purchase orders
- **OrderItems**: Order line items
- **Reviews**: Product reviews

### Gamification Entities
- **Achievements**: Unlockable achievements
- **UserAchievements**: User achievement progress
- **UserPoints**: Point awards and history
- **Quests**: Structured challenges

## 🔧 Configuration

### Environment Variables

The system uses Encore's secret management for sensitive configuration:

- `OpenRouterApiKey`: API key for OpenRouter AI services
- `ClerkSecretKey`: Secret key for Clerk authentication (if used)

### System Settings

System-wide settings can be configured through the settings API:

- **General**: Application name, timezone, language
- **Security**: Password policies, session timeouts
- **Integrations**: Third-party service configurations
- **Branding**: Logo, colors, themes

## 🔐 Security Features

- **Role-based Access Control**: Granular permissions by user role
- **API Authentication**: Secure API endpoints with JWT tokens
- **Data Encryption**: Sensitive data encrypted at rest
- **Audit Logging**: Comprehensive activity logging
- **Rate Limiting**: API rate limiting and abuse prevention
- **Input Validation**: Strict input validation and sanitization

## 📈 Performance & Scalability

- **Database Indexing**: Optimized database queries with proper indexing
- **Connection Pooling**: Efficient database connection management
- **Caching**: Strategic caching for frequently accessed data
- **Horizontal Scaling**: Microservice architecture supports scaling
- **Background Jobs**: Async processing for heavy operations

## 🧪 Testing

The system includes comprehensive testing:

```bash
# Run all tests
encore test

# Run specific service tests
encore test ./core

# Run with coverage
encore test --coverage
```

## 📚 API Documentation

API documentation is automatically generated from the TypeScript types:

```bash
# Generate API client
encore gen client

# View API documentation
encore daemon
# Then visit http://localhost:4000
```

## 🚀 Deployment

### Development
```bash
encore run
```

### Staging
```bash
encore deploy --env staging
```

### Production
```bash
encore deploy --env production
```

## 🔄 Data Migration

Database migrations are handled automatically by Encore:

```bash
# Apply pending migrations
encore db migrate

# Reset database (development only)
encore db reset
```

## 📊 Monitoring & Observability

- **Built-in Metrics**: Encore provides automatic metrics collection
- **Distributed Tracing**: Request tracing across services
- **Error Tracking**: Comprehensive error logging and alerting
- **Performance Monitoring**: API response time and throughput tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the [Encore.ts documentation](https://encore.dev/docs)
- Join the [Encore community](https://encore.dev/discord)

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core user and school management
- ✅ Academic course and assignment system
- ✅ Communication and messaging
- ✅ AI integration with OpenRouter and Ollama
- ✅ Basic marketplace functionality

### Phase 2 (Next)
- 🔄 Advanced reporting and analytics
- 🔄 Mobile app API support
- 🔄 Real-time collaboration features
- 🔄 Advanced gamification mechanics
- 🔄 Integration marketplace

### Phase 3 (Future)
- 📋 Machine learning recommendations
- 📋 Advanced AI tutoring system
- 📋 Blockchain certificates
- 📋 VR/AR integration support
- 📋 Global multi-tenant architecture

---

Built with ❤️ using [Encore.ts](https://encore.dev)
