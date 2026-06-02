import { NextRequest, NextResponse } from 'next/server';

const DEMO_RESPONSES: Record<string, string> = {
  'strategy-advisor': `👋 I'm the **Strategy Advisor** — the "BOSS" agent in this system.

In a live session, I use **Claude Opus** to give specific, actionable strategic advice tailored to your product, market, and stage.

## What I do

- Build complete business plans and go-to-market strategies
- Analyze pricing models and suggest competitive positioning
- Create product roadmaps based on user behavior and market data
- Maintain **persistent memory** across conversations — I remember your decisions, constraints, and goals
- Switch between AI models: Opus for depth, Sonnet for speed, Haiku for quick answers

## Example of what I actually produce

> *"Based on your €0 MRR and 50 beta users, the biggest risk isn't pricing — it's activation. Only 12% of your users have generated more than 5 images. Before raising prices, fix the onboarding drop-off at step 2..."*

---

**This is a demo** — the UI you're seeing (sidebar, persistent chat, memory panel, model selector, conversation log) is the real implementation. In production, I've had hundreds of conversations with the founder and have shaped the platform's roadmap since January 2026.`,

  'daily-planner': `🌅 I'm the **Daily Planner** agent.

Every morning, I run automatically via a scheduled cron job and synthesize everything the founder needs into a structured action plan.

## What I do

- Pull real platform metrics (users, generations, errors) from the live database
- Scan the inbox for urgent emails and pending action items
- Cross-reference with market context and recent strategic decisions
- Deliver a prioritized daily briefing automatically at 9am

## Example of what I actually produce

**🔴 Urgent — do today**
- Reply to jpaCricket (most active beta user — feedback pending 3 days)
- Fix image generation timeout on Flux Pro (3 users hit this yesterday)

**🟡 Important — move forward**
- Complete Google for Startups application (deadline this week)
- Publish the AI avatars blog post (drafted, needs review)

**📊 Market pulse**
- HeyGen raised prices again — 3 competitors posting about it today

---

**This is a demo** — in production, this cron runs every weekday at 9am UTC and sends a Telegram notification with the full briefing.`,

  'app-monitor': `📊 I'm the **App Monitor** agent.

I analyze real platform metrics, detect anomalies, and generate health reports — connected to the live database.

## What I do

- Query real usage data: active users, image generations, video requests, API errors
- Compare this week vs last week and flag anomalies automatically
- Detect which features are being used (and which are being ignored)
- Alert on error rate spikes, unusual credit consumption, or suspicious patterns

## Example of what I actually produce

**🟢 App Health Report — June 2, 2026**

| Metric | Today | vs Last Week |
|--------|-------|-------------|
| Active users | 12 | +3 |
| Images generated | 47 | −8% |
| Videos generated | 6 | +100% |
| API errors | 2 | −60% |

**⚠️ Alert:** Image Studio has a 12% drop — 4 users hit the Flux timeout. Investigate BFL API response time.

---

**This is a demo** — in production, this reads from the real Neon PostgreSQL database and has caught real issues, including a silent Runway API failure that was losing user credits.`,

  'user-reports': `👥 I'm the **User Reports** agent.

I generate detailed reports on user behavior, engagement, retention, and revenue — reading directly from the live database.

## What I do

- New signups by day/week/month with attribution
- Retention curves and churn risk scoring per user
- MRR tracking and plan distribution
- Top users by credits spent, features used, and engagement score
- Cohort analysis to identify who converts from free to paid

## Example of what I actually produce

**Monthly User Report — May 2026**

- 23 new signups (↑15% vs April)
- 8 users generated >50 images (power users)
- Churn risk: 4 users haven't logged in 14+ days
- MRR: €0 (beta — 0 paid conversions yet)
- **Top recommendation:** Activate the 4 inactive power users before they churn

---

**This is a demo** — in production, this pulls from real Clerk (auth) + Neon (database) + Stripe (payments) data on demand from the admin panel.`,

  'customer-support': `📧 I'm the **Customer Support** agent.

This agent requires a live Gmail connection to work. In a real session, I read your support inbox and auto-generate ready-to-send replies.

## What I do (with Gmail connected)

- Read unread support emails from the inbox
- Classify each by urgency: bug report, billing issue, feature request, or ignore
- Generate context-aware replies using the platform's knowledge base
- Flag complex cases for human review
- Track response time and resolution rate

## Example email draft I generate

**To:** user@example.com
**Subject:** Re: Image generation not working

Hi Sarah, thanks for reaching out! I can see your generation failed at 14:32 UTC — this was caused by a brief timeout on the Flux API. I've added 50 credits to your account as compensation. The issue is now resolved. Let me know if you have any other questions!

---

**This is a demo** — in production, this connects to Gmail via OAuth. It's already been used to handle real beta user support tickets.`,

  'web-researcher': `🔍 I'm the **Web Researcher** agent.

In a live session, I search the web in real time and compile structured research reports on any topic.

## What I do

- Search multiple sources for the latest information on any topic
- Identify key players, pricing models, market trends, and opportunities
- Compile a structured report: executive summary, deep dive, competitive landscape, recommendations
- Cross-reference sources for accuracy and note when data may be outdated

## Example of what I actually produce

## Executive Summary
HeyGen's March 2026 price increase has opened a window for lower-priced avatar video tools targeting European creators. The €15–25/month segment is currently unserved by quality alternatives.

## Key Findings
- HeyGen: $29/month minimum, US-focused, no Portuguese support
- Synthesia: enterprise-only, €100+/month
- D-ID: cheaper but lower quality, limited languages
- **Gap:** Quality avatar creator + Portuguese language support + creator-friendly pricing

## Competitive Landscape
No direct competitor addresses the lusophone market with a full content creation suite.

---

**This is a demo** — in production, this agent has been used to research competitor pricing, find partnership opportunities, and build market intelligence reports.`,

  'email-summary': `📨 I'm the **Email Summary** agent.

This agent requires a live email connection. In a real session, I read your inbox and prioritize what needs action.

## What I do (with email connected)

- Read the last 24 hours of email (or all unread)
- Classify each email: urgent, action needed, FYI, or ignore
- Extract key information and deadlines
- Generate a prioritized summary so you process your inbox in minutes

## Example of what I actually produce

**📬 Inbox Summary — June 2, 2026**

🔴 **Action Required (2)**
- Google for Startups: Application deadline tomorrow
- jpaCricket (beta user): Waiting for reply since May 30 — high churn risk

🟡 **FYI (3)**
- Stripe: May invoice €10.30 paid
- Neon: New pricing tier announcement
- Vercel: Deployment succeeded

✅ **Safe to ignore (8)**
- Newsletters and marketing emails

---

**This is a demo** — in production, this connects to Gmail via OAuth and runs on demand from the admin panel.`,

  'calendar-manager': `📅 I'm the **Calendar Manager** agent.

This agent requires a Google Calendar connection. In a real session, I manage your schedule and suggest optimal time blocks.

## What I do (with Calendar connected)

- View and summarize your upcoming events
- Suggest free time slots for deep work, meetings, or specific tasks
- Create events directly in your calendar
- Block focus time automatically based on your priorities

## Example of what I actually produce

**Your week — June 2–6**

**Monday:** 3 meetings (2h blocked), 4h free → recommended for deep work
**Tuesday:** Clear day → best window to ship a feature
**Wednesday:** Investor call 2pm — morning blocked for prep
**Thursday–Friday:** Free → content creation and outreach sprint

**Suggested blocks this week:**
- Monday 9–11am: Google for Startups application
- Tuesday all day: Avatar video feature development
- Friday 3pm: Weekly review

---

**This is a demo** — in production, this connects to Google Calendar via OAuth and coordinates with the Daily Planner agent.`,

  'code-reviewer': `🔍 I'm the **Code Reviewer** agent.

In a live session, I analyze your real code for bugs, security vulnerabilities, performance issues, and clean code violations.

## What I do

- Detect bugs and logic errors with specific line references
- Flag OWASP security vulnerabilities: injection, XSS, auth bypass, data exposure
- Identify performance bottlenecks in React components and API routes
- Suggest clean code improvements (naming, structure, duplication)
- Provide corrected code examples ready to paste

## Example of what I actually produce

### 🔒 Security Issue Found

\`\`\`typescript
// ❌ Vulnerable — userId comes from request body, not authenticated session
const { userId } = await req.json();
const user = await prisma.user.findUnique({ where: { id: userId } });

// ✅ Fixed — always use the authenticated session
const { userId } = auth();
if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
\`\`\`

**Severity:** High — any user could read another user's data by passing a different userId.

---

**This is a demo** — in production, this has reviewed real Code AI Studio API routes and caught actual security issues before they reached production.`,

  'test-writer': `🧪 I'm the **Test Writer** agent.

In a live session, I analyze your code and generate a complete test suite — unit tests, integration tests, edge cases, and mocks.

## What I do

- Write Jest/Vitest tests for any function or component
- Cover happy paths, edge cases, and error scenarios
- Generate mocks for external dependencies (Prisma, APIs, auth)
- Write integration tests for Next.js API routes
- Output a ready-to-copy test file

## Example of what I actually produce

\`\`\`typescript
describe('calculateCredits', () => {
  it('returns correct cost for dall-e-3 standard', () => {
    expect(calculateCredits('dall-e-3', 'standard', 1)).toBe(40);
  });

  it('applies bulk discount for 4+ images', () => {
    expect(calculateCredits('dall-e-3', 'standard', 4)).toBe(140);
  });

  it('throws for unknown model', () => {
    expect(() => calculateCredits('unknown-model', 'standard', 1))
      .toThrow('Unknown model: unknown-model');
  });

  it('handles zero images gracefully', () => {
    expect(calculateCredits('dall-e-3', 'standard', 0)).toBe(0);
  });
});
\`\`\`

---

**This is a demo** — in production, this has generated test suites for credit calculation, image generation, and several API routes in Code AI Studio.`,

  'deploy-agent': `🚀 I'm the **Deploy Agent**.

This agent requires a CI/CD integration. In a real session, I monitor your pipeline and handle deployments automatically.

## What I do (with CI/CD connected)

- Monitor GitHub Actions / Vercel deployment status in real time
- Run pre-deploy checks: TypeScript errors, failing tests, missing env vars
- Auto-deploy when all checks pass
- Roll back automatically if error rate spikes post-deploy
- Send Telegram notifications on deploy success or failure

## Example of what I actually produce

**🚀 Deploy Pipeline — June 2, 2026 14:32 UTC**

✅ TypeScript: 0 errors
✅ Build: Successful (47s)
✅ Lighthouse score: 94 (↑2 from last deploy)
⚠️ Bundle size: +12kb — investigate before next deploy

**Deploying to production...**
✅ Deployed in 23s
✅ Health check passed
✅ No error rate increase in first 5 minutes

---

**This is a demo** — Code AI Studio deploys on Vercel with automatic deployments on push to main. The Deploy Agent monitors the pipeline and alerts via Telegram when something goes wrong.`,

  'social-content': `📱 I'm the **Social Content** agent.

In a live session, I generate ready-to-publish posts for Instagram, Facebook, and LinkedIn — adapted to your brand voice and campaign goals.

## What I do

- Generate platform-optimized captions with the right tone for each network
- Instagram: short, visual, emoji-rich + 15 optimized hashtags
- Facebook: conversational, community-focused
- LinkedIn: professional, insight-driven, thought leadership
- Accept images and adapt content to what's in the photo
- Remember your brand voice and permanent instructions across sessions
- Publish directly via the Meta Graph API + LinkedIn API

## Example of what I actually produce

**## Instagram**
✨ What if your brand had a face — exactly how you imagined it? Meet our AI Avatar Creator. Upload a photo, describe your style, get a photorealistic brand avatar in seconds. No studio. No photographer. Just AI. 🎨

\#AIAvatar \#ContentCreator \#ArtificialIntelligence \#BrandIdentity \#AITools

**## LinkedIn**
Most content creators spend hours sourcing images for their brand. We built a tool that generates them in seconds — photorealistic avatars trained on your own photos, consistent across every post...

---

**This is a demo** — in production, this has generated hundreds of social posts for Code AI Studio's pages and publishes them automatically via the Meta Graph API.`,

  'blog-writer': `✍️ I'm the **Blog Writer** agent.

In a live session, I write complete SEO-optimized articles — structured headings, meta description, internal links, and a conversion CTA.

## What I do

- Write complete 900–1200 word articles optimized for a target keyword
- Structure with H1/H2/H3 hierarchy for SEO
- Include a compelling intro, practical examples, and a clear CTA
- Generate meta title and meta description ready to use
- Publish directly to the blog with one click
- Support multiple languages (EN, PT, ES)

## Example article structure I produce

**H1:** How to Create AI Avatars for Social Media — Complete Guide 2025

**Intro:** If you've spent hours searching for the perfect brand image, you're not alone. AI avatar generators have changed the game...

**H2:** What is an AI Avatar Generator?
**H2:** How to Create Your First AI Avatar (Step-by-Step)
**H2:** Best AI Avatar Tools Compared in 2025
**H2:** Using AI Avatars for Social Media: Best Practices
**H2:** Conclusion

**Meta:** "Learn how to create professional AI avatars for social media in 2025. Step-by-step guide covering the best tools, tips, and real examples."

---

**This is a demo** — in production, this has published real SEO articles to the Code AI Studio blog that drive organic traffic.`,

  'orchestrator': `👑 I'm the **Chief Orchestrator**.

I'm the meta-agent — I decompose complex tasks, delegate to the right specialist agents, then combine their results into a unified output.

## What I do

- Analyze your request and break it into 3–5 parallel sub-tasks
- Delegate each sub-task to the most appropriate specialist agent
- Combine and synthesize all results into a coherent final output
- Handle dependencies between agents (e.g., research before writing)

## Example orchestration flow

**Task:** "Prepare everything for the AI Video feature launch"

→ **Social Content agent:** Generate 3 launch posts for Instagram + LinkedIn
→ **Blog Writer agent:** Write the "Introducing AI Video Generation" announcement post
→ **Web Researcher agent:** Find the top 5 competitors to differentiate from
→ **Strategy Advisor agent:** Suggest launch pricing and positioning

**Combined output:** A complete launch package — all 4 deliverables stitched into a single briefing document, ready to execute.

---

**This is a demo** — in production, the Orchestrator has been used for product launches, weekly reviews, and complex multi-step research tasks.`,

  'parallel-workers': `⚡ I'm the **Parallel Workers** agent.

I run multiple specialist agents simultaneously and combine the results — faster than running them sequentially.

## What I do

- Launch 2–4 specialist agents at the same time
- Each worker processes its task independently, in parallel
- Combine all outputs into a single unified result
- Typically 3–4× faster than sequential execution

## Example parallel execution

**Request:** "Research AI video tools AND write social posts about them"

**Worker 1 — Web Researcher** (running simultaneously):
Researching the AI video generation landscape, key players, pricing, and opportunities...

**Worker 2 — Social Content** (running simultaneously):
Generating Instagram, Facebook, and LinkedIn posts about AI video creation trends...

**Result delivered in ~30 seconds** instead of ~2 minutes sequentially.

---

**Technical note:** All agents in this system use **streaming** — output appears in real time as it's generated, not after the full response is ready. Both workers stream simultaneously to the interface.

**This is a demo** — in production, Parallel Workers is used for content + research combos, code review + test generation, and other paired tasks.`,
};

const DEFAULT_RESPONSE = `👋 I'm an AI agent built into this system.

This is a **demo interface** showing the agent architecture implemented in Code AI Studio.

Each agent has a specific role — strategy, content creation, code review, research, deployment monitoring — and runs with real AI (Claude by Anthropic) in production.

**What's implemented:**
- 15 specialized agents with different capabilities
- Persistent memory across sessions (Strategy Advisor)
- Real API integrations (Meta, LinkedIn, Gmail, Google Calendar, Vercel)
- Automated cron scheduling — agents run on schedule, not just on demand
- Streaming responses in real time
- Full admin dashboard with usage tracking and conversation history

Click any agent in the sidebar to learn what it does.`;

export async function POST(req: NextRequest) {
  let body: { agentId: string; prompt: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { agentId } = body;
  if (!agentId) {
    return NextResponse.json({ error: 'agentId is required.' }, { status: 400 });
  }

  const text = DEMO_RESPONSES[agentId] ?? DEFAULT_RESPONSE;

  const stream = new ReadableStream({
    async start(controller) {
      const chunkSize = 8;
      for (let i = 0; i < text.length; i += chunkSize) {
        controller.enqueue(new TextEncoder().encode(text.slice(i, i + chunkSize)));
        await new Promise(r => setTimeout(r, 12));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}
