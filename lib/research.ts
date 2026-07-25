/**
 * Research posts as data. The /research index and /research/[slug] routes
 * render entirely from this module; adding a post here is the whole job.
 *
 * Content is adapted from the XO research program at
 * https://docs.xo.builders/research; each post keeps a `source` link back to
 * its canonical page.
 */

export type Block =
  | { kind: "h2" | "h3" | "p" | "quote" | "code"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "table"; header: string[]; rows: string[][] };

export type Post = {
  slug: string;
  title: string;
  /** One to two sentences under the title, on the card and the article. */
  dek: string;
  /** Publication date, when the canonical page carries one. */
  date?: string;
  readingMinutes: number;
  /** Mono chip on the index row, e.g. "unit of work". */
  tag: string;
  /** Canonical page on docs.xo.builders. */
  source: string;
  body: Block[];
};

export const POSTS: Post[] = [
  {
    slug: "the-quirq",
    title: "The quirq",
    dek: "The unit of measurement for AI's business impact: budgeted by a human, minted by verification, dual to the token.",
    tag: "unit of account",
    readingMinutes: 2,
    source: "https://docs.xo.builders/research/phase-1-agentic-workforce/quirq",
    body: [
      { kind: "quote", text: "The unit of work defines and verifies the job. The quirq is what that verification mints: the output meter, dual to the token's input meter." },
      { kind: "p", text: "Every consequential technology gets two meters: one for what it consumes, one for what it produces. The token is a genuinely good input meter (it counts compute and scales with energy and carbon), but it structurally cannot price work: it rises when work goes badly, changes size when models are swapped, and cannot tell a $4 ticket from a $25,000 contract. The measurement crisis of enterprise AI is a units problem, and the quirq is the missing output meter." },
      { kind: "h2", text: "The definition" },
      { kind: "p", text: "A quirq is one unit of budget currency of verified, owner-valued, delivered work. It is minted, never self-reported:" },
      { kind: "list", items: [
        "A human owner defines an outcome with a machine-checkable definition of done and budgets it at value B. The task now carries B potential quirqs.",
        "The environment snapshots the world before execution (S₀) and after (S₁) and scores completion V ∈ [0, 1] against the definition of done.",
        "Verification mints V · B quirqs, recorded in a tamper-evident ledger with everything production consumed.",
      ] },
      { kind: "code", text: "potential quirqs   = B          set by the human owner, before execution\nminted quirqs   Q  = V · B      released by verification against captured state" },
      { kind: "p", text: "Three properties make it a unit of account: human-denominated (the budget is demonstrated willingness to pay, set by the party paying), machine-minted (verification is a state comparison the worker never produces evidence for), and cost-complete (metered against inference, compute, API calls, storage, and the human minutes spent intervening)." },
      { kind: "p", text: "Divide the two meters and the missing numbers appear: cost per quirq, quirqs per dollar (QER), quirqs per kWh. Track them over time and \"is AI working here\" becomes a trend line instead of an anecdote. The full treatment (the token's exact physics, the contract-theory case for the budget denominator, the calculus, the dashboard, gaming, and validation) is the canonical quirq section." },
      { kind: "p", text: "The mint needs machinery it can trust: something has to capture the snapshots, run the checks, and meter the spend without ever asking the worker." },
    ],
  },
  {
    slug: "unit-of-work",
    title: "Unit of work",
    dek: "The contract that replaces the prompt: a job with a definition of done, a budget, and a single owner, living in a workspace.",
    tag: "unit of work",
    readingMinutes: 3,
    source: "https://docs.xo.builders/research/phase-1-agentic-workforce/unit-of-work",
    body: [
      { kind: "quote", text: "Phase 1 said businesses hire agents and pay for outcomes. This page defines the thing they actually hand over: not a prompt, a job." },
      { kind: "p", text: "A prompt is a single instruction with no memory, no files, no tools, no budget, and no record once the reply scrolls away. Whatever an agent does in response is unowned and unverifiable, and every serious deficiency of prompt-driven work traces back to that statelessness. A unit of work is the opposite: a job that is owned from start to finish, executed, checked, and paid for. None of that fits in an instruction; it fits in a workspace." },
      { kind: "list", items: [
        "A prompt: one instruction, no memory or state, no tools or files, nothing to verify or bill.",
        "A workspace: owns the whole outcome, memory and files persist, tools to reach your systems, budget, state, and record built in.",
      ] },
      { kind: "h2", text: "What the job needs to live" },
      { kind: "list", items: [
        "Runtime: a place to actually act, not just answer.",
        "Memory: context that carries across the whole job.",
        "Files: the artifacts the work produces and edits.",
        "Tools: access to the systems where the work lives.",
        "Budget: a bound on what reaching the outcome is worth.",
        "Record: a trail to verify what was done and what it cost.",
      ] },
      { kind: "h2", text: "The lifecycle" },
      { kind: "list", items: [
        "Define: name the outcome and the end state you want.",
        "Budget: set what that outcome is worth.",
        "Execute: the agent works inside the workspace.",
        "Verify: compare the state, before against after.",
        "Settle: budget against the AI spend on your model.",
      ] },
      { kind: "h2", text: "What the contract buys you" },
      { kind: "list", items: [
        "Definable: the end state is written down before work starts.",
        "Verifiable: done is a state comparison, not a self-report.",
        "Priceable: budget vs. spend, per outcome, not per token.",
        "Accountable: exactly one owner per unit.",
      ] },
      { kind: "p", text: "A definition of done forces the requester to say what correct looks like before execution, which is where most delegation failures are created. Verification by state comparison is robust in a way that reading the agent's self-report is not. A budget makes the gap between value and spend a clean per-outcome signal. And one owner per unit means that when something ships broken there is exactly one place to look, the property that lets a business extend trust to a non-human worker at all." },
      { kind: "p", text: "There is a subtler reason the unit is built this way, borrowed from optimization theory: any proxy placed under pressure gets gamed (Goodhart's law), and activity metrics (messages sent, tokens generated, hours logged) are proxies an agent optimizes effortlessly. A verified state change is the hardest-to-game measure available, because it is the outcome itself." },
      { kind: "h2", text: "The loop a business already runs" },
      { kind: "list", items: [
        "Intent: what the business wants: a definition of done plus a budget.",
        "Action: execution inside the workspace, by a person or an agent.",
        "Impact: the verified state change, settled against the budget.",
      ] },
      { kind: "p", text: "Businesses do not think in models, agents, or tokens, and should not have to: nobody prices an accountant by spreadsheet keystrokes. The loop they run is intent, action, impact, and the unit of work maps onto it one-to-one. The model, the agent, and the tokens disappear inside the action step as swappable implementation details, which is what lets an agent's unit of work sit in the same queue, carry the same kind of budget, and be judged by the same check as work done by people." },
      { kind: "p", text: "The contract defines and verifies the job. What it does not do, by itself, is give the delivered work a unit of account." },
    ],
  },
  {
    slug: "the-quirq-calculus",
    title: "The quirq calculus",
    dek: "Every calculation in quirq accounting: scoring, the mint, the all-in cost model, unit and portfolio metrics, the time axis, and the energy bridge.",
    tag: "the calculus",
    readingMinutes: 5,
    source: "https://docs.xo.builders/research/phase-1-agentic-workforce/unit-of-work-research/calculation",
    body: [
      { kind: "quote", text: "Snapshot before, snapshot after, score against weighted checks, mint against the budget, meter everything. Every number an operator needs falls out of one ledger." },
      { kind: "h2", text: "Scoring: how completion is computed" },
      { kind: "p", text: "A unit of work is a triple:" },
      { kind: "code", text: "u = (S₀, G, B)\n\nS₀  the snapshot of world state when the unit is created\nG   the definition of done: weighted checks {(g₁,w₁), …, (gₙ,wₙ)}\nB   the budget: what reaching the end state is worth, set by the owner" },
      { kind: "p", text: "When the agent reports done, the environment captures the after-snapshot S₁ and computes:" },
      { kind: "code", text: "         Σᵢ wᵢ · gᵢ(S₁)\nV(u) = ─────────────────  ∈ [0, 1]      completion score\n            Σᵢ wᵢ\n\ndone(u) = V(u) ≥ τ                      acceptance, typically τ = 1" },
      { kind: "p", text: "Every check runs against S₁, the state the environment captured, never the agent's account of what it did. The score is a property of the world, not of a report." },
      { kind: "p", text: "Worked: a support ticket carries three checks: status closed (w = 0.5), reply sent (w = 0.3), KB article linked (w = 0.2). The after-snapshot passes the first two: V = 0.8." },
      { kind: "h2", text: "The mint" },
      { kind: "code", text: "Q(u) = V(u) · B(u)              divisible settlement (pay per delivered share)\nQ(u) = B(u) · [V(u) ≥ τ]        atomic settlement (all or nothing)" },
      { kind: "p", text: "The owner declares the regime at creation: atomic when partial completion is worthless (a half-merged change), divisible when it is not (four of five report sections). Quirqs inherit the budget's currency, so quirq totals compare directly to payroll, vendor spend, and revenue." },
      { kind: "h2", text: "The all-in cost of an outcome" },
      { kind: "p", text: "The token bill is one line of the true cost. The environment meters all of them:" },
      { kind: "code", text: "C_total(u) =  Σ tokensₘ · priceₘ           inference, per model\n           +  t_cpu·r_cpu + t_gpu·r_gpu    metered compute\n           +  Σ calls_j · price_j          external API calls\n           +  storage · r_store            storage\n           +  F / N_units                  environment amortization\n           +  h · r_human                  human intervention time" },
      { kind: "p", text: "The last term matters most and is most often omitted: a program whose outputs each require twenty minutes of senior review pays its largest cost in a currency the token bill never sees. Under quirq accounting it cannot hide, because interventions are exactly the V < τ events the scoring rule already counts." },
      { kind: "p", text: "Worked: the ticket above, resolved with 38k tokens at $2/M plus 4k at $0.25/M (inference $0.077), 90 CPU-seconds ($0.001), two CRM calls ($0.02), amortization ($0.03), no intervention: C_total = $0.128." },
      { kind: "h2", text: "Unit metrics" },
      { kind: "code", text: "cost per quirq   c_q = C_total / Q         price of a dollar of verified work\nquirq margin     μ   = Q − C_total         surplus on the unit\nmultiple         x   = Q / C_total         the reciprocal view" },
      { kind: "p", text: "Worked: at B = $4.00 and V = 1.0: Q = 4.00, c_q = 0.032, margin $3.87, multiple 31x. Had it settled divisibly at V = 0.8: Q = 3.2 and c_q = 0.040. Incomplete work is automatically more expensive per quirq: the incentive points the right way." },
      { kind: "h2", text: "Portfolio metrics" },
      { kind: "p", text: "Over the units in an accounting window T:" },
      { kind: "code", text: "QER(T)  =  Σ Q(u) / Σ C_total(u)          quirq efficiency ratio (the headline)\nQV(T)   =  Σ Q(u) / |T|                   quirq velocity (throughput in value)\nIR(T)   =  |{u : V(u) < τ}| / N           intervention rate (the trust signal)" },
      { kind: "p", text: "QER is dimensionless and currency-independent: comparable across teams, vendors, and models. It is what \"AI ROI\" should have meant. IR is measured for free by the same machinery, and because failures localize to named checks, it arrives with its diagnosis attached." },
      { kind: "h2", text: "The time axis" },
      { kind: "p", text: "Two dynamics move the trajectory in opposite directions, and both must be read." },
      { kind: "p", text: "Tenure pushes cost per quirq down. Every unit's token bill hides two costs: doing the work, and figuring out what the work is (reading the codebase, rediscovering conventions, inferring what this owner means by done):" },
      { kind: "code", text: "C(uₜ) = c_exec + k · H(intent | Mₜ)\n\nc_exec   the execution floor (irreducible)\nH(·|Mₜ)  residual intent uncertainty, given environment memory Mₜ\nk        tokens burned per unit of uncertainty resolved" },
      { kind: "p", text: "A persistent environment deposits every completed unit into memory (files touched, accepted definitions of done, corrections that survived review), so residual uncertainty and cost fall monotonically toward the floor; a fresh context pays cold start every time. It is what every manager knows about contractors: the tenth job is cheaper than the first because they stop asking questions they know the answers to. The environment is what gives an agent tenure." },
      { kind: "p", text: "Extending the worked micro-benchmark to 50 sequential similar units (cold-start intent cost 2,600 tokens over a 3,000-token floor, decaying as memory accumulates):" },
      { kind: "table", header: ["Tokens per unit", "Unit 1", "Unit 10", "Unit 25", "Unit 50", "Total"], rows: [
        ["Fresh context", "5,600", "5,600", "5,600", "5,600", "308,000"],
        ["Persistent environment", "5,600", "3,653", "3,377", "3,250", "181,260"],
        ["Savings", "0%", "35%", "40%", "42%", "41%"],
      ] },
      { kind: "p", text: "Unit 1 costs the same either way, so the benefit is invisible in a demo and decisive in production, and it is durable because it comes from eliminated uncertainty, not a better model. This inverts procurement logic: the asset is not the agent you rent but the environment you own, because the environment is where the cost curve lives." },
      { kind: "p", text: "Goodhart drift pushes measured value up, falsely. Agents find the shortest path to green. The observable is the audit gap A(T): re-verify a random sample against gold checks held outside the production environment. The honest headline is audit-corrected:" },
      { kind: "code", text: "QER*(T) = QER(T) · (1 − A(T))       report the trend, not the level" },
      { kind: "p", text: "When QER* rises while IR falls, AI is genuinely compounding in the company. When QER rises but QER* stalls, the checks are being farmed. When both stall while token volume grows, the company has bought an electricity bill." },
      { kind: "h2", text: "The bridge to energy" },
      { kind: "p", text: "Because the cost model retains token counts, physical accounting composes with value accounting:" },
      { kind: "code", text: "quirqs / kWh        with E ≈ Σ tokens · e_tok\nquirqs / tonne CO₂  via grid carbon intensity" },
      { kind: "p", text: "Illustrative: a month at 2.1B tokens with e_tok = 1.5 J/token is ~875 kWh; if the month minted 148,000 quirqs, the plant runs at ~169 quirqs/kWh. Not \"we used less AI\" but \"we delivered more verified value per unit of energy.\"" },
    ],
  },
  {
    slug: "the-company-dashboard",
    title: "The company dashboard",
    dek: "The quirq ledger a company reads monthly, and the reading discipline that goes with it. A worked quarter where token spend rose 83% while verified value per all-in dollar rose 81%.",
    tag: "accounting",
    readingMinutes: 2,
    source: "https://docs.xo.builders/research/phase-1-agentic-workforce/unit-of-work-research/dashboard",
    body: [
      { kind: "quote", text: "The calculus exists to produce one artifact: a ledger a company reads monthly the way it reads its P&L." },
      { kind: "h2", text: "A worked quarter" },
      { kind: "p", text: "Three unit types (support tickets, contract reviews, weekly reports) in a mid-size support-and-engineering operation. Every number computes from how to calculate it; parameters come from the micro-benchmark ranges of this research note. The table is arithmetic, not measurement: its role is to exhibit the full calculation chain, and the validation program's job is to replace it with production ledgers (experiment E5)." },
      { kind: "table", header: ["Month", "Units", "Potential ($B)", "Minted Q", "Inference", "Compute+API", "Intervention", "C_total", "QER"], rows: [
        ["April", "2,100", "18,400", "15,770", "$1,490", "$410", "$3,120", "$5,020", "3.1x"],
        ["May", "3,400", "29,900", "26,310", "$2,210", "$630", "$3,640", "$6,480", "4.1x"],
        ["June", "4,800", "41,300", "38,000", "$2,730", "$820", "$3,280", "$6,830", "5.6x"],
      ] },
      { kind: "p", text: "Trend read: QER 3.1 → 5.6 (+81%). Intervention rate 18.1% → 11.4%. Cost per quirq 0.32 → 0.18. quirq velocity +141%." },
      { kind: "p", text: "The same quarter in tokens alone: spend rose from $1,490 to $2,730, +83%, a number indistinguishable from waste. That contrast is the whole argument: the token bill says costs nearly doubled; the quirq ledger says verified value per all-in dollar rose 81% while human rescue fell a third. One is an expense line, the other is an investment case." },
      { kind: "h2", text: "The reading discipline" },
      { kind: "list", items: [
        "QER answers: is the program paying.",
        "QER* trend (audit-corrected) answers: is it improving honestly.",
        "Intervention rate answers: can it be trusted with more, and its per-check decomposition names the next environment investment. In the worked quarter one support-ticket check (KB linking) drives most interventions; hardening that single check moves the whole company trajectory.",
        "Cost per quirq, by unit type, prices each category against its human baseline: a contract review at c_q = 0.13 against a paralegal-hour baseline is a decision, not a vibe.",
      ] },
      { kind: "p", text: "The buyer's read of the ledger. The seller's read is next: pricing agents as a builder." },
    ],
  },
  {
    slug: "validation",
    title: "Validation",
    dek: "Hypothesis-first validation: every empirical claim stated with its falsifier and bound to numbered experiments E1 through E7, completed or scheduled.",
    tag: "validation",
    readingMinutes: 3,
    source: "https://docs.xo.builders/research/phase-1-agentic-workforce/unit-of-work-research/validation",
    body: [
      { kind: "quote", text: "The validation program is organized hypothesis-first: each load-bearing claim is stated at full strength with its falsifier, and bound to numbered experiments, completed or scheduled." },
      { kind: "p", text: "Results below follow the two evidence modes and pre-registration discipline of methods: mock mode validates machinery, real mode measures agents, never conflated." },
      { kind: "h2", text: "The hypotheses" },
      { kind: "p", text: "H1: Mint integrity. Completion read from environment-captured state mints no fiction: false claims settle at rate zero, while any self-report channel settles them at approximately the false-claim rate. Falsifier: the environment arm settling any incomplete unit. Experiments: E1, E2 (mock: complete, held) · E4 (real: in progress)." },
      { kind: "p", text: "H2: Ledger identification. On real agents, cost per quirq falls with unit index toward a stable floor in persistent environments and stays at cold-start in fresh contexts, holding model, prompt, and task family fixed. Falsifier: flat or rising persistent-arm trajectories, or equal decay in fresh contexts. Experiments: E3 (mock consistency: complete, held) · E4 (real: in progress)." },
      { kind: "p", text: "H3: Predictive validity. Audit-corrected QER trend predicts real business outcomes (renewal, expansion, P&L attribution) better than token spend, task counts, or benchmark scores. Falsifier: QER* trend failing to outperform those baselines in instrumented deployments. Experiments: E5, E6 (scheduled)." },
      { kind: "p", text: "H4: Budget governance. Under payer-set budgets, benchmark anchoring, and sampled value audits, budget inflation stays within audit tolerance under sustained optimization pressure. Falsifier: systematic budget drift in long-running ledgers despite the mitigations. Experiments: E7 (scheduled)." },
      { kind: "h2", text: "Completed experiments (E1 to E3, mock mode)" },
      { kind: "p", text: "E1: verification source (H1). 200 identical units, an agent that falsely claims done with probability 0.05." },
      { kind: "table", header: ["Arm", "False claims", "Silently settled", "Rate"], rows: [
        ["Self-report", "7", "7", "3.5%"],
        ["Environment snapshot", "7", "0", "0.0%"],
      ] },
      { kind: "p", text: "E2: hardening (H1). 50 units, an agent that guts the test instead of fixing the code." },
      { kind: "table", header: ["Arm", "Checks green", "Intent actually met"], rows: [
        ["Gameable definition of done", "100%", "0%"],
        ["Plus one verification-surface check", "0% (all caught)", "0%"],
      ] },
      { kind: "p", text: "One hash-equality check on the test file converts total silent failure into total detection." },
      { kind: "p", text: "E3: tenure (H2). Twelve similar units, persistent vs fresh environment: cost decays 85.6% to the execution floor (~800 tokens) by unit six in the persistent arm; the fresh arm stays flat at ~5,540. Mock-mode caveat in full: the scripted agent implements the cost model, so this arm demonstrates harness consistency, not agent behavior." },
      { kind: "h2", text: "The roadmap (E4 to E7)" },
      { kind: "list", items: [
        "E4 (H1, H2): real-mode replication of E1 to E3 with a production coding agent and measured tokens. The false-claim rate becomes a measurement, and the tenure curve becomes evidence. In progress.",
        "E5 (H3): pilot ledgers: the dashboard instrumented on real work across at least three unit types.",
        "E6 (H3): predictive study: QER* trend vs token spend, task counts, and benchmark scores as predictors of renewal, expansion, and P&L attribution.",
        "E7 (H4): longitudinal budget-drift audit under the gaming mitigations.",
      ] },
      { kind: "p", text: "Results and per-run data are published here as they land." },
      { kind: "p", text: "The claims are on the record, and every one is tiered against its evidence in claims and limitations." },
    ],
  },
  {
    slug: "the-incurious-agent",
    title: "The Incurious Agent",
    dek: "84 controlled runs on environmental curiosity across two coding agents and seven progressively richer environments. Agents read the surface and skip the substance: the curated memory built for the task was opened in 1 of 12 runs.",
    tag: "experiment",
    date: "June 2026",
    readingMinutes: 12,
    source: "https://docs.xo.builders/research/experiments/the-incurious-agent",
    body: [
      { kind: "quote", text: "We spend enormous effort building agents a better home: contracts, project briefs, a structured memory of how a codebase works. So we ran a blunt test: hand a coding agent more and more of that context and watch what it actually reads. Across 84 controlled runs and two different agents, the answer is uncomfortable. They skim what sits on the surface and almost never open the deeper, hand-curated knowledge we prepared for them. The environment we carefully designed performs about the same as an empty folder, not because the design is wrong, but because nothing reads it." },
      { kind: "p", text: "Krish Bhimani, Ankit Dwivedi, Rohini Pedamkar, Suraj Sharma · XO Labs Inc." },
      { kind: "p", text: "TL;DR: We ran two coding agents (OpenAI Codex and Claude Sonnet) against the same two tasks on a real FastAPI codebase, under seven environments that add progressively more project context, from an empty workspace up to a full scaffold with a seeded memory/ of how the project works. Three findings. First, more context did not buy better outcomes: every one of the 84 runs passed, so the only thing context moved was cost, and for Codex it moved cost up, by as much as 150%. Second, the two agents have opposite reading habits: Codex opens more files the more you give it; Claude reads the same four or five files no matter what's in the workspace. Third, and most telling, both agents fall off a depth cliff: they open top-level docs sometimes, but the curated memory/ we seeded specifically to help was read in 1 of 12 runs of the condition built around it. We call the missing capability environmental curiosity, and we think it, not raw model strength, is the binding constraint on structured agent workspaces." },
      { kind: "h2", text: "1. A ladder of context" },
      { kind: "p", text: "The test is deliberately boring, because boring is what makes it clean. We took a small, real FastAPI service (notes-api), pinned it to a single commit, and wrote two engineering tasks against it: an easy one (add a GET /notes/{id}/history endpoint) and a medium one (replace naive search with SQLite FTS5). Each task is gated: a test that is red before the work and green after, and the harness re-runs the gate itself rather than trusting the agent. A do-nothing submission scores 0.33; a real solution scores 1.0." },
      { kind: "p", text: "Then we built a ladder of seven environments, each adding one more layer of standing context to the same workspace:" },
      { kind: "list", items: [
        "E0: empty repo, code only.",
        "E1: + README.",
        "E2: + AGENTS.md (a contract telling the agent how the project works).",
        "E3: + PROJECT.md (a project brief).",
        "E4: the full old scaffold (contract, brief, objectives, plan, progress, an empty memory/ tree).",
        "E5: the full scaffold plus a seeded memory/: hand-written episodic and procedural notes about exactly this codebase and these kinds of tasks.",
        "E6: a leaner \"DOX\" scaffold (a small AGENTS.md rail, a child src/AGENTS.md, a split .xo/, on-demand memory).",
      ] },
      { kind: "p", text: "We ran every environment with both agents, on both tasks, three times each: 2 agents × 2 tasks × 7 environments × 3 replications = 84 runs. The model, the prompt, the task, and the codebase are held fixed within each agent. The only thing that changes across a task's runs is how much project context is sitting in the folder when the agent wakes up." },
      { kind: "h2", text: "2. More context, more spending, same result" },
      { kind: "p", text: "Start with cost. Here is the average input-token bill per run, by environment, for each agent. Every bar below also passed its gate: success was pinned at 100% across all 84 runs, so nothing here is bought with a worse outcome." },
      { kind: "p", text: "Chart: The price of context (input tokens per run, every run scored 100%, 84 runs). Codex / Claude by environment: E0 228k / 606k; E1 256k / 639k; E2 278k / 661k; E3 313k / 614k; E4 570k / 678k; E5 495k / 653k; E6 391k / 581k." },
      { kind: "p", text: "Two very different shapes, one shared punchline. Codex climbs steeply: from 228k tokens in the empty workspace to 570k in the full scaffold (E4), a +150% increase for context the task did not need. Claude is almost flat, and flat at a much higher floor: ~610k to 680k everywhere, only +12% from E0 to E4. Adding structure barely moves Claude's bill in either direction." },
      { kind: "p", text: "The shared punchline is the success row that isn't drawn because it's a straight line: all 84 runs passed. So whatever the context did, it did not change the outcome; it changed only how many tokens were burned getting to the same green test. (For the curious: this is robust to caching. ~86% of Codex's input was served from cache, and the effect survives cache-adjustment; Claude's is cached even more heavily. Cheap tokens are still spent tokens, and they bought nothing.)" },
      { kind: "h2", text: "3. Two agents, two reading habits" },
      { kind: "p", text: "Cost is a symptom. The cause is reading: how many of the files in the workspace the agent actually opens. Same ladder, but now counting distinct files read per run:" },
      { kind: "p", text: "Chart: What they actually open (distinct files read per run). Codex / Claude by environment: E0 5.3 / 4.5; E1 6.0 / 4.5; E2 8.0 / 4.7; E3 9.7 / 4.7; E4 11.5 / 4.3; E5 9.0 / 4.3; E6 9.2 / 4.7." },
      { kind: "p", text: "This is the same story told as behavior. Codex's reading scales with the workspace: 5 files when it's empty, 11 to 12 when it's full (a 2.2× swing). It is responsive to context: put a document in front of it and there's a good chance it opens it. Claude's reading is a flat line at four-and-a-half files: 4.3 to 4.7, a 1.08× swing, statistically indistinguishable across all seven conditions. Claude reads its handful of code files and gets to work; the scaffold may as well not exist." },
      { kind: "p", text: "Look closer and these two policies turn out to be two different cost engines. Plot every one of the 84 runs by how many files it opened (across) against how many tokens it spent (up):" },
      { kind: "p", text: "Chart: Two cost engines (each dot is one run; right = opened more files, up = spent more tokens; 84 runs). Claude's runs collapse into a vertical stack at 4 to 5 files with cost swinging 390k to 1M tokens; Codex's runs fan out along a diagonal, the bill climbing as it reads more." },
      { kind: "p", text: "The two clouds barely touch. Claude's runs collapse into a vertical stack at four or five files: it reads the same handful every time, yet its bill swings from 390k to over a million tokens. That cost is not coming from the workspace; it is intrinsic, the price of how much the model deliberates. Codex's runs fan out along a diagonal: its bill rides on how many files it opens, climbing rightward as it reads its way through whatever you put in the folder. One agent pays to read the room; the other pays to think in it. And, back to the first chart, neither way of spending bought a better result. Every dot, low or high, left or right, ended at the same passing test." },
      { kind: "p", text: "But both policies share a blind spot, and it only shows up when you stop counting files and ask which files get read." },
      { kind: "h2", text: "4. The depth cliff" },
      { kind: "p", text: "Group every readable file by how deep it sits in the environment's intended hierarchy (from the source code the agent must touch, out to the surface docs, out to the curated memory/ that was the whole point of the rich conditions) and measure how often each layer gets opened at least once:" },
      { kind: "p", text: "Chart: The depth cliff (% of runs that open each layer). Codex / Claude: Source code 100% / 100%; AGENTS.md (surface) 67% / 20%; PROJECT.md (structure) 78% / 0%; memory/ (curated) 28% / 0%." },
      { kind: "p", text: "This is the result the whole study is about. Both agents always read the code; they have to. From there it falls away. Codex opens the surface docs most of the time (AGENTS.md 67%, PROJECT.md 78%) and then drops to 28% for the curated memory/. Claude opens AGENTS.md in 20% of runs, PROJECT.md in 0%, and memory/ in 0%: a clean cliff straight off the edge." },
      { kind: "p", text: "The single sharpest number: E5 is the condition we built entirely around the seeded memory: episodic and procedural notes written specifically to brief the agent on this codebase. Across the twelve E5 runs of the two agents, the memory/ directory was opened in one of them. We wrote the agent a letter explaining the job; eleven times out of twelve, it never opened the envelope." },
      { kind: "h2", text: "5. Environmental curiosity" },
      { kind: "p", text: "Put the three charts together and a single trait explains all of them." },
      { kind: "quote", text: "Environmental curiosity: an agent's tendency to seek out the parts of its environment that would help it, in proportion to how much they would help, rather than reading whatever happens to be in front of it (or nothing at all)." },
      { kind: "p", text: "Our two agents fail this in mirror-image ways:" },
      { kind: "list", items: [
        "Claude doesn't read the map. Its reading is invariant to the environment (a flat 4.5 files), so the contract, the brief, and the memory all go unopened. Context is free for Claude, and useless, because it's ignored. It pays a high flat token bill for its own reasoning and treats the workspace as decoration.",
        "Codex reads the signposts but never walks the path. It is curious about the surface (it opens the docs sitting at the root and pays for them in tokens) but its curiosity is shallow and undirected. It explores more without exploring deeper, so it pays the +150% bill of a rich environment while still skipping the curated knowledge that the richness was for.",
      ] },
      { kind: "p", text: "Neither agent does the thing the environment was designed to reward: notice that a folder called memory/ full of notes about this exact task is the highest-value thing in the room, and go read it first. And so the punchline of section 2 stops being a surprise. The carefully structured environment performs almost exactly like the empty one, because, functionally, nothing reads the structure. You cannot get credit for context the agent never consumes. The treatment was placed in the room; it was never delivered to the model." },
      { kind: "quote", text: "This reframes a lot of \"context engineering.\" Most of the effort goes into authoring better environments: sharper contracts, richer memory, cleaner scaffolds. Our data says the authoring is not the bottleneck. Consumption is. A perfect memory/ that is opened 8% of the time is, in expectation, 92% wasted, no matter how good the 8% is. The leverage is in getting the agent to navigate toward relevance, or, until agents do that on their own, in the environment pulling its own highest-value context into the agent's hands instead of waiting to be asked." },
      { kind: "h2", text: "6. How to read this honestly" },
      { kind: "p", text: "This is a small, controlled study and we report it as one. The caveats are not footnotes; they shape what you're allowed to conclude." },
      { kind: "list", items: [
        "Success was at the ceiling. Every run passed, which is exactly why we can talk about cost but not about benefit. These two tasks are well-specified enough that a bare agent already aces them, so there was never any outcome headroom for context to improve. The fair reading is \"on tasks the agent can already do, context it doesn't read is pure overhead\", not \"context never helps.\" The interesting experiment is the harder task where the bare agent fails and the memory would have saved it; that is the next one to run.",
        "A single session, a five-file repo. Episodic memory earns its keep across sessions (\"I've worked here before\"); every run here started cold and ended in one shot, so the design can't show memory's main payoff. And a tiny codebase gives curiosity little to be rewarded for; there is no deep module to discover. A larger, deeper repo is where a read-everything habit should start to really hurt, and where directed curiosity should start to really pay.",
        "Two agents, two tasks, three reps each. Enough to see a 2.5× cost spread and a clean depth cliff; not enough to rank the middle rungs of the ladder against each other. We're reporting the large, robust effects, not the fine ones.",
        "One blind spot is structural: Codex's transcripts carry no timing, so the original \"does context help the agent orient faster\" question is unanswerable on that side. We measure what gets read and what it costs, not how quickly.",
      ] },
      { kind: "quote", text: "This complicates our own earlier pilot. Our first, single-task pilot (How the Environment Affects Agent Performance and Token Cost) found richer context coming out cheaper, a hopeful early read. The fuller matrix here, with three replications and a functional gate, does not reproduce that headline: across both agents and both tasks, more context trends costlier, and the cause is now visible. We'd rather correct ourselves in public than keep a tidy story. The method held; the early number didn't generalize." },
      { kind: "h2", text: "7. Why we think this is the real frontier" },
      { kind: "p", text: "It is tempting to read these charts as a contest (Codex spends less, Claude reads less) and miss the thing they agree on. Both of the strongest coding agents we have, handed a workspace engineered to help them, left the most useful part of it unopened. The bottleneck on structured agent environments isn't the quality of the structure we can author; we can already author more than the agents will read. It's whether the agent is curious in the right direction, and today, neither reading-everything nor reading-nothing is." },
      { kind: "p", text: "That points the work in two directions, and we're pursuing both: building agents that triage their environment by expected value before they start (curiosity as a skill), and building environments that don't wait to be explored, that surface their own highest-relevance context into the agent's hands at the moment of need. The harness, the tasks, and all 84 runs are saved and reusable; the next round raises the task difficulty until the bare agent breaks, so that for the first time there's something for curiosity to win." },
    ],
  },
];

export const getPost = (slug: string) =>
  POSTS.find((post) => post.slug === slug);
