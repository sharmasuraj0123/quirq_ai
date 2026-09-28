/**
 * MachineSpeed v2 copy. Started from
 * machinespeed-int/website/machinespeed-site.html and revised since
 * (founder-level FAQ, business-type intake, commitments folded into How it runs).
 *
 * Plain serializable data so the server page and the client islands read the
 * same records. The before-state diagrams are JSX and live in diagrams.tsx,
 * keyed by case id.
 */

export type FlowKind = "trigger" | "agent" | "guard" | "human" | "out";

export type UseCase = {
  id: "ops" | "fin" | "rev";
  sector: string;
  name: string;
  profile: string;
  tags: string[];
  title: string;
  story: string;
  captions: { before: [string, string]; after: [string, string] };
  messNotes: string[];
  flowLabel: string;
  flow: { kind: FlowKind; label: string; title: string; note: string }[];
  number: { count: number; suffix: string; note: string };
  alone: string;
  asks: string;
};

export const CASES: UseCase[] = [
  {
    id: "ops",
    sector: "Logistics · operations",
    name: "Order exceptions",
    profile: "120-person 3PL, Shopify + NetSuite",
    tags: ["Logistics", "120 people", "Shopify · Stripe · NetSuite · WMS"],
    title:
      "Orders that don't match payment, stock or shipping, fixed before the customer notices.",
    story:
      "Ops had a Zapier chain and a ChatGPT step that “reads the order and decides.” It refunded one customer twice and stopped silently when the supplier changed a CSV column.",
    captions: {
      before: ["Before:", "4 tools, 1 owner, no record of decisions"],
      after: ["With MachineSpeed:", "read-only scopes, one approval gate, every run recorded"],
    },
    messNotes: ["write access to everything", "no approval step", "no log of why", "fails silently"],
    flowLabel: "Order exception workflow with MachineSpeed",
    flow: [
      { kind: "trigger", label: "Trigger", title: "Order fails a check", note: "payment, stock or shipping" },
      { kind: "agent", label: "Agent", title: "Reconcile across 4 systems", note: "read-only scopes" },
      { kind: "guard", label: "Guardrail", title: "Refund or reorder over $2,500?", note: "threshold set by ops" },
      { kind: "human", label: "Person", title: "Ops lead approves on phone", note: "context attached · 20s" },
      { kind: "out", label: "Result", title: "Order fixed, run recorded", note: "schema change → alert, not silence" },
    ],
    number: { count: 94, suffix: "%", note: "of exceptions closed with no one touching them" },
    alone: "Address fixes, duplicate charges, stock sync, carrier re-bookings",
    asks: "Refunds and reorders above $2,500. Anything touching a named account.",
  },
  {
    id: "fin",
    sector: "Professional services · finance",
    name: "Month-end close",
    profile: "300-person firm, Xero + Ramp",
    tags: ["Professional services", "300 people", "Xero · Ramp · Google Sheets"],
    title:
      "A month-end pack that explains every variance, and never leaves the building without sign-off.",
    story:
      "Finance had three AI tools between four people. A summary generated from a pasted export went to the board with a wrong revenue number. Close took nine days, most of it copy-paste.",
    captions: {
      before: ["Before:", "3 AI tools, pasted exports, no sources"],
      after: ["With MachineSpeed:", "one agent, read-only, CFO signs every pack"],
    },
    messNotes: ["data in personal accounts", "no sources linked", "nobody signs off", "9-day close"],
    flowLabel: "Month-end close workflow with MachineSpeed",
    flow: [
      { kind: "trigger", label: "Trigger", title: "Books close, or cash moves off plan", note: "schedule + alert" },
      { kind: "agent", label: "Agent", title: "Reconcile ledger, billing, spend", note: "read-only · sources kept" },
      { kind: "guard", label: "Guardrail", title: "Variance over 5%?", note: "must be explained, with source" },
      { kind: "human", label: "Person", title: "CFO reviews and signs", note: "edits tracked" },
      { kind: "out", label: "Result", title: "Board pack sent", note: "every number links to its source" },
    ],
    number: { count: 4, suffix: " days", note: "to close, from 9" },
    alone: "Reconciliation, variance notes, first draft of the pack",
    asks: "Anything that leaves the finance team. The CFO signs every pack.",
  },
  {
    id: "rev",
    sector: "B2B SaaS · revenue",
    name: "Inbound qualification",
    profile: "60-person SaaS, HubSpot",
    tags: ["B2B SaaS", "60 people", "HubSpot · Gmail · Clearbit · Calendar"],
    title:
      "Every inbound lead researched, scored and booked, and no strategic account ever gets an unapproved email.",
    story:
      "Five SDRs each had their own prompts. An auto-sequencer emailed a target account four times in a week. The CRM had three versions of the same company and nobody trusted the pipeline number.",
    captions: {
      before: ["Before:", "5 prompt sets, 1 sequencer, no owner rules"],
      after: ["With MachineSpeed:", "one prompt set, owner approval on named accounts"],
    },
    messNotes: ["no account ownership rules", "unlimited send", "duplicate CRM writes", "pipeline nobody trusts"],
    flowLabel: "Inbound qualification workflow with MachineSpeed",
    flow: [
      { kind: "trigger", label: "Trigger", title: "Inbound lead or buying signal", note: "form, CRM, intent data" },
      { kind: "agent", label: "Agent", title: "Research and score against ICP", note: "one shared prompt set" },
      { kind: "guard", label: "Guardrail", title: "Named or strategic account?", note: "no auto-send · 1 touch / 14 days" },
      { kind: "human", label: "Person", title: "Account owner approves first message", note: "one tap" },
      { kind: "out", label: "Result", title: "Meeting booked, brief attached", note: "CRM de-duped and written once" },
    ],
    number: { count: 3, suffix: "×", note: "qualified meetings per SDR" },
    alone: "Research, scoring, CRM hygiene, scheduling for unowned accounts",
    asks: "Any first message to a named or strategic account. Owner decides, once.",
  },
];

/** Hero trust strip: the credibility that used to sit two sections down. */
// TODO: confirm the certification claims and the team backgrounds before publishing.
export const TRUST = {
  runs: { k: "Where it runs", title: "Start on our Secure Cloud", body: "Port to your cloud or on-prem in one click when you're ready." },
  controls: { k: "Controls", items: ["Scoped access", "Approval gates", "Every run recorded"] },
  meets: { k: "Designed to meet", badges: ["SOC 2", "GDPR", "CCPA", "EU AI Act"] },
  trusted: { k: "Trusted by", lead: "Engineers from", names: ["OpenAI", "Google DeepMind", "Google Cloud", "AWS", "NVIDIA"] },
};

/** Slide 6 of the sales deck, "The bridge": any model, your applications, control in between. */
export const BRIDGE = {
  layers: [
    { icon: "◈", title: "Security", body: "Built to meet SOC 2, GDPR, CCPA and the EU AI Act. Encryption in transit and at rest; data retention you set." },
    { icon: "⌘", title: "Governance", body: "Fine-grained access per agent and per workflow. Human review where you decide it's needed." },
    { icon: "◎", title: "Observability", body: "A record of every action, tool call and approval. Know what your agents did, when, and why." },
    { icon: "☁", title: "Your infrastructure", body: "Deploy in your own cloud where residency, network or policy requires it." },
    { icon: "↻", title: "Reliability", body: "Retries, failover and rate-limit handling across integrations, so agents keep running when upstream APIs don't." },
    { icon: "⤢", title: "Composability", body: "Swap models, tools and providers without rebuilding. Your workflows and permissions carry over." },
  ],
  apps: ["Gmail", "Google Workspace", "Microsoft 365", "Slack", "Teams", "HubSpot", "Salesforce", "Notion", "Jira", "Linear", "GitHub", "Shopify", "Stripe", "QuickBooks", "Zendesk", "WhatsApp", "Your internal tools"],
};

export type AgentKind = "alone" | "gate" | "flag";

export type AgentArea = {
  name: string;
  desc: string;
  /** alone = handled on its own · gate = waits for a person · flag = raised an issue */
  kind: AgentKind;
  /** The role id (see ORG) it waits for, when kind is "gate". */
  who?: string;
  /** One line for the ticker. */
  short: string;
  trig: string;
  res: string;
  tools: [name: string, scope: string][];
  log: [verb: "read" | "draft" | "write" | "wait" | "flag" | "ok", text: string][];
};

export type Agent = {
  id: string;
  sector: string;
  name: string;
  role: string;
  works: [name: string, scope: string][];
  stops: string;
  areas: AgentArea[];
};

/** "MachineSpeed runs on agents too." Three of the agents alongside our own team. Examples are illustrative. */
export const AGENTS: Agent[] = [
  {
    id: "eng",
    sector: "Engineering",
    name: "Sir Merge-a-Lot",
    role: "Keeps our product team shipping. It reviews code, watches production and keeps tickets and docs current.",
    works: [["GitHub", "read · comment"], ["Sentry", "read"], ["Logs", "read"], ["Linear", "write"], ["Docs", "draft"], ["Slack", "internal"]],
    stops: "Merges, deploys and rollbacks. Anything a customer will read.",
    areas: [
      {
        name: "Code review", desc: "Reviews every pull request for bugs, missing tests and risky changes.", kind: "flag", short: "Flagged a missing index in PR #418",
        trig: "PR #418 opened", res: "Left 3 comments and flagged a missing database index before merge.", tools: [["GitHub", "read · comment"]],
        log: [["read", "PR #418 · 14 files"], ["write", "3 review comments"], ["flag", "missing index · orders.user_id"]],
      },
      {
        name: "Alert triage", desc: "Groups noisy alerts, finds the change that caused them and prepares a fix.", kind: "gate", who: "oncall", short: "Traced an error spike to PR #412",
        trig: "Error spike on /orders", res: "41 alerts merged into one incident and traced to PR #412. A revert is ready; the rollback waits for the on-call engineer.", tools: [["Sentry", "read"], ["Logs", "read"], ["GitHub", "draft PR"]],
        log: [["read", "41 alerts in 30 min"], ["read", "last 6 deploys"], ["draft", "revert PR #413"], ["wait", "rollback · on-call engineer"]],
      },
      {
        name: "Bug reports", desc: "Turns customer bug reports into reproduced, ready-to-fix tickets.", kind: "alone", short: "Filed LIN-311 from a customer email",
        trig: "Customer email: “export does nothing”", res: "Reproduced in staging. LIN-311 filed with the steps, logs and affected account.", tools: [["Logs", "read"], ["Linear", "write"]],
        log: [["read", "support email"], ["read", "/exports errors"], ["write", "LIN-311 created"]],
      },
      {
        name: "Dependencies", desc: "Keeps packages current and patches security advisories.", kind: "alone", short: "Opened a PR for 6 package updates",
        trig: "Weekly schedule", res: "PR opened for 6 updates, including 1 security fix. Tests pass. Merging stays with us.", tools: [["GitHub", "draft PR"]],
        log: [["read", "212 packages, advisories"], ["draft", "PR #420 · 6 updates"]],
      },
      {
        name: "Release notes", desc: "Writes the changelog and customer release notes from merged work.", kind: "gate", who: "product", short: "Drafted v2.14 release notes",
        trig: "v2.14 tagged", res: "Changelog and customer email drafted from 23 merged PRs. Publishing waits for the product lead.", tools: [["GitHub", "read"], ["Docs", "draft"]],
        log: [["read", "23 PRs since v2.13"], ["draft", "changelog + email"], ["wait", "publish · product lead"]],
      },
      {
        name: "Docs upkeep", desc: "Keeps the API docs in step with the code.", kind: "alone", short: "Updated the docs for /exports",
        trig: "PR #409 merged", res: "API reference updated for the new /exports endpoint, ready for review.", tools: [["GitHub", "read"], ["Docs", "draft"]],
        log: [["read", "PR #409"], ["draft", "api/exports page"]],
      },
    ],
  },
  {
    id: "devrel",
    sector: "Content & DevRel",
    name: "Docs Vader",
    role: "Keeps developers and customers hearing from us: tutorials, community answers, posts and a blog that stays accurate.",
    works: [["GitHub", "read"], ["Discord", "read · draft"], ["Notion", "read"], ["Webflow", "draft"], ["LinkedIn & X", "draft"], ["Search Console", "read"]],
    stops: "Anything published under the company name. Any claim without a source.",
    areas: [
      {
        name: "Tutorials", desc: "Turns new features into step-by-step guides with code that actually runs.", kind: "gate", who: "reviewer", short: "Wrote a webhooks guide with a sample repo",
        trig: "Webhooks feature shipped", res: "Step-by-step guide and sample repo drafted. All 9 code snippets were run before review. Publishing waits for an engineer's check.", tools: [["GitHub", "read"], ["Webflow", "draft"]],
        log: [["read", "webhooks PR + API spec"], ["draft", "guide + sample repo"], ["ok", "9 of 9 snippets run"], ["wait", "publish · reviewing engineer"]],
      },
      {
        name: "Community", desc: "Answers developer questions in Discord and GitHub, and spots patterns the team should know about.", kind: "flag", short: "Spotted a recurring webhook error in #help",
        trig: "Daily sweep of #help and GitHub Discussions", res: "14 questions answered from the docs. 5 people hit the same webhook error this week, so it opened a docs issue and told engineering.", tools: [["Discord", "read · draft"], ["GitHub", "read"]],
        log: [["read", "Discord #help, GitHub Discussions"], ["draft", "14 answers from the docs"], ["flag", "same signature error × 5"], ["write", "docs issue + note to #eng"]],
      },
      {
        name: "Blog drafts", desc: "Writes long-form posts from material we already have.", kind: "gate", who: "marketing", short: "Drafted a customer story from a postmortem",
        trig: "Engineering postmortem shared", res: "1,400-word customer story drafted with every fact linked. Staged in Webflow, not live.", tools: [["Notion", "read"], ["Webflow", "draft"]],
        log: [["read", "INC-88 postmortem"], ["draft", "staged blog post"], ["wait", "publish · marketing lead"]],
      },
      {
        name: "Social posts", desc: "Turns launches, tutorials and customer wins into posts in our voice.", kind: "gate", who: "marketing", short: "Drafted posts for the webhooks launch",
        trig: "Webhooks guide approved", res: "LinkedIn post and a 5-post X thread drafted in our voice guide, linking the new tutorial. Posting waits for the marketing lead.", tools: [["Notion", "read"], ["LinkedIn & X", "draft"]],
        log: [["read", "voice guide, tutorial"], ["draft", "LinkedIn post, X thread"], ["wait", "post · marketing lead"]],
      },
      {
        name: "Fact check", desc: "Checks every claim and code sample in a draft before we publish it.", kind: "flag", short: "Sent back a claim with no source",
        trig: "New draft: “Why checkout breaks”", res: "11 of 12 claims sourced. “3× faster checkout” has no source and went back to the writer.", tools: [["Notion", "read"]],
        log: [["read", "draft + 6 sources"], ["flag", "“3× faster” · no source"]],
      },
      {
        name: "SEO refresh", desc: "Finds posts and docs losing search traffic and drafts the fixes.", kind: "alone", short: "Drafted fixes for 4 slipping pages",
        trig: "Weekly Search Console check", res: "4 pages slipping, including 2 docs pages. New titles, descriptions and internal links drafted.", tools: [["Search Console", "read"], ["Webflow", "draft"]],
        log: [["read", "90 days of rankings"], ["draft", "4 page edits"]],
      },
    ],
  },
  {
    id: "cos",
    sector: "Co-founder",
    name: "Chief of Stuff",
    role: "Carries our founders' operating load: outreach, the numbers, inbox, meetings, hiring and investors.",
    works: [["Gmail", "read · draft"], ["Calendar", "read"], ["LinkedIn", "read"], ["HubSpot", "read · tasks"], ["Stripe & Mercury", "read"], ["Ashby", "read"]],
    stops: "Anything sent in a founder's name, including every outreach email. Money, hires and investors.",
    areas: [
      {
        name: "Outreach", desc: "Researches the right prospects, drafts personal first emails and keeps follow-ups on schedule.", kind: "gate", who: "founders", short: "Drafted 12 personal first emails",
        trig: "12 new companies match our target list", res: "Researched each company and drafted a personal first email for each one, with follow-ups set for day 4 and day 9. Sending waits for a founder.", tools: [["LinkedIn", "read"], ["HubSpot", "read · tasks"], ["Gmail", "draft"]],
        log: [["read", "12 companies · site, news, LinkedIn"], ["draft", "12 first emails"], ["write", "follow-up tasks in HubSpot"], ["wait", "send · a founder"]],
      },
      {
        name: "Metrics & runway", desc: "Pulls revenue, cash, pipeline and usage into one brief every Monday.", kind: "alone", short: "Wrote the Monday brief",
        trig: "Monday 06:30", res: "Brief ready: MRR $84.2k, 17 months of runway, 38 open deals. Every number links to its source.", tools: [["Stripe & Mercury", "read"], ["HubSpot", "read"]],
        log: [["read", "subscriptions, balances"], ["read", "pipeline"], ["draft", "Monday brief"]],
      },
      {
        name: "Inbox", desc: "Sorts the inbox and drafts the routine replies.", kind: "alone", short: "Sorted 183 overnight emails",
        trig: "183 new emails overnight", res: "7 need a founder today. 41 routine replies drafted. The rest labelled and filed.", tools: [["Gmail", "read · draft"]],
        log: [["read", "183 threads"], ["draft", "41 replies"], ["ok", "7 surfaced for today"]],
      },
      {
        name: "Meeting prep", desc: "Prepares a one-page brief before every external call.", kind: "alone", short: "Prepped the Acme call",
        trig: "Acme call at 14:00", res: "Brief: usage down 12%, 2 open tickets, renewal in 45 days.", tools: [["Calendar", "read"], ["HubSpot", "read"], ["Gmail", "read"]],
        log: [["read", "Acme account, last 3 threads"], ["draft", "one-page brief"]],
      },
      {
        name: "Hiring", desc: "Screens applicants against our rubric and holds interview slots.", kind: "gate", who: "cto", short: "Shortlisted 6 of 42 applicants",
        trig: "42 applicants for Senior Backend", res: "6 shortlisted with a reason for each. Invites wait for the CTO.", tools: [["Ashby", "read"], ["Calendar", "read"]],
        log: [["read", "42 applications"], ["ok", "6 shortlisted"], ["wait", "invites · CTO"]],
      },
      {
        name: "Investors", desc: "Drafts the monthly update and answers investor questions.", kind: "gate", who: "founders", short: "Drafted the September update",
        trig: "Month end", res: "Update drafted: 3 wins, 2 lowlights, 2 asks. Sending waits for both founders.", tools: [["Stripe & Mercury", "read"], ["Gmail", "draft"]],
        log: [["read", "4 Monday briefs"], ["draft", "September update"], ["wait", "send · both founders"]],
      },
    ],
  },
];

export type Role = { id: string; label: string };
export type Team = { id: string; name: string; people: Role[]; agent: Agent };

const agent = (id: string) => AGENTS.find((a) => a.id === id)!;

/**
 * Our own teams: the people (by role, not name) and the agent that sits in
 * each. Every gated area's `who` is one of these role ids. Order is the tab
 * order in the agents hub.
 */
export const ORG: Team[] = [
  {
    id: "eng",
    name: "Engineering",
    people: [
      { id: "cto", label: "CTO" },
      { id: "product", label: "Product lead" },
      { id: "oncall", label: "On-call engineer" },
      { id: "reviewer", label: "Reviewing engineer" },
    ],
    agent: agent("eng"),
  },
  { id: "devrel", name: "Content & DevRel", people: [{ id: "marketing", label: "Marketing lead" }], agent: agent("devrel") },
  { id: "founders", name: "Co-founder", people: [{ id: "founders", label: "Founders" }], agent: agent("cos") },
];

export const FOUNDATION = [
  {
    icon: "scope",
    label: "Access",
    title: "It gets its own key, not the master.",
    body: "Which systems, which records, read or write. Anything outside that is blocked and logged, not quietly allowed. Your security lead reviews the scope once and can read it back any time.",
  },
  {
    icon: "gate",
    label: "Approvals",
    title: "Money and customers stop at a person.",
    body: "You decide where it acts alone and where it waits. The request lands on the right phone with enough context to decide in twenty seconds, and the decision is on record.",
  },
  {
    icon: "log",
    label: "Record",
    title: "Every run can be replayed.",
    body: "What it saw, what it decided, what it changed. When a customer, an auditor or the board asks what the AI did, you show them instead of guessing.",
  },
  {
    icon: "swap",
    label: "Composability",
    title: "Swap the model, keep the workflow.",
    body: "Built from parts. A better model ships, or you change CRM, and one part changes while the rest keeps running. You're never locked to this year's vendor.",
  },
] as const;

export const TIMELINE = [
  {
    when: "Day 0 · 45 minutes",
    title: "The call",
    body: "You bring one workflow that hurts. We open a live workspace and show you how a similar blueprint runs with the controls on. You leave knowing whether it's worth doing, and if it is, what the first agent will do.",
    get: "A clear yes or no, and if yes, a fixed price for the first agent.",
  },
  {
    when: "Within 24 hours",
    title: "A live agent in production",
    body: "Our engineers set it up on your own systems: scopes set, approvals where you want them, every run recorded. It starts doing the work the next day, not next quarter.",
    get: "A working agent on your systems, with the controls on.",
  },
  {
    when: "The first weeks",
    title: "Feedback",
    body: "You run it. We watch it with you, tune what it does alone and where it stops for a person, and fix what it gets wrong. Nothing changes without you seeing it.",
    get: "An agent shaped by how your team actually works.",
  },
  {
    when: "Then",
    title: "Expand",
    body: "Once it has proven itself, we widen it on your terms: more team members using it, more flows, more systems, under the same rules your security lead already signed off.",
    get: "Expansion options scoped to your requirements and how clear they are.",
  },
];

export const PEOPLE = [
  { title: "One owner", body: "A named lead from the first call to every monthly report." },
  { title: "Forward-deployed", body: "Engineers work in your tools and your team's channels." },
  { title: "Operated for you", body: "We handle upkeep, model changes and failures." },
];

// TODO: confirm each certification / framework claim before publishing.
export const COMPLIANCE = [
  { name: "SOC 2", body: "Controls your security team can map straight onto their own checklist." },
  { name: "GDPR", body: "Data stays where you say. Retention and deletion are yours to set." },
  { name: "CCPA", body: "Customer data handled to California's rules, with a record to prove it." },
  { name: "EU AI Act", body: "Every automated decision recorded, explainable and reviewable by a person." },
];

export const MODELS = ["OpenAI", "Anthropic", "Google", "Meta", "Mistral", "xAI", "DeepSeek", "Qwen", "Open-weight models"];

export const FAQ: [string, string][][] = [
  [
    ["We're just getting started with AI. Is this for us?", "Yes. You don't need an AI strategy, a data team or anything already built. Bring one workflow that eats time every week and we'll tell you on the call whether an agent is the right fix. If a spreadsheet or a simple automation would do the job, we'll say that instead."],
    ["Is MachineSpeed a software product?", "No. MachineSpeed is an engineering service. quirq is the software underneath, and your team gets its controls and reporting as part of the engagement."],
    ["We already have automations. Do you rip them out?", "No. We move one workflow at a time onto quirq and run the old version alongside until the new one has proven itself. Nothing stops while we work."],
  ],
  [
    ["What do we need to prepare for the call?", "One workflow that hurts and someone who knows how it works today. No budgets, diagrams or data access."],
    ["How is it priced?", "A fixed price for the first agent, agreed on the call before work starts. Expansion is scoped from there, based on what you want next and how clearly it's defined. We only propose the first agent when we can show it will be worth it."],
    ["Which AI models do you use?", "Whichever you prefer. If your team already has a model provider or approved tools, we build on those. If you don't have a preference, our engineers recommend what fits each task, based on their experience and what is working for other businesses like yours. Changing your mind later doesn't mean rebuilding the workflow."],
  ],
];

export const AGENDA = [
  { when: "0–15 min", lead: "You show us.", body: "The workflow, the tools it touches, where it hurts." },
  { when: "15–35 min", lead: "We show you.", body: "A live workspace running the closest blueprint, controls on." },
  { when: "35–45 min", lead: "Straight answer.", body: "Worth building or not. If yes: price, scope, and a live agent in production within 24 hours." },
];

/** The intake asks what kind of business this is; the placeholder follows the pick. */
export const PICKS = [
  { label: "SaaS founder", example: "e.g. I spend every Monday pulling pipeline, usage and churn numbers into one update for the team" },
  { label: "E-commerce / D2C", example: "e.g. Order exceptions and refunds eat two people's mornings, and our Shopify-to-NetSuite fix keeps breaking" },
  { label: "Support & tickets", example: "e.g. 300 tickets a day, half of them the same five questions, and triage is still done by hand" },
  { label: "IT & internal tools", example: "e.g. Access requests, onboarding checklists and on-call alerts all go through one overloaded engineer" },
  { label: "Finance & back office", example: "e.g. Month-end close takes nine days and the board pack is mostly copy-paste" },
  { label: "Agency & services", example: "e.g. Every client report is assembled by hand from five dashboards" },
  { label: "Logistics & ops", example: "e.g. Shipments that miss a carrier cutoff get noticed a day late" },
  { label: "Something else", example: "" },
];

export const SECTIONS = [
  { id: "agents", label: "Our agents" },
  { id: "how", label: "Underneath" },
  { id: "faq", label: "FAQ" },
];
