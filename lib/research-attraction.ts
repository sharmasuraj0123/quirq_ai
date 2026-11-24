/**
 * The attraction paper, verbatim: generated from the paper's final section sources by
 * tools/paper_to_blocks.py (outside this repo). Edit the paper, then regenerate; do not hand-edit.
 */
import type { Block } from "./prose";

export const ATTRACTION_WORDS = 16244;

export const ATTRACTION_BODY: Block[] = [
 {
  "kind": "h2",
  "text": "Abstract"
 },
 {
  "kind": "p",
  "text": "Can shared, public information replace a central coordinator in a multi-agent system? We study attraction, a pull $A(a,s)$ between an agent $a$ and a space $s$. Each agent computes it locally and moves toward the strongest pull, so no orchestrator assigns tasks. Events do not pull agents; they change the field."
 },
 {
  "kind": "p",
  "text": "Starting from the original attraction $A_0$ ($\\text{Tension}_0 \\cdot \\text{Match}_0 \\cdot \\text{Velocity}_0$ over $(1 + \\text{Occupancy}_0) \\cdot \\text{Entry}_0$), we test each term on Space Hub logs, four open-source repositories (377,950 commits), simulated worlds, live AI-agent trials and six pre-registered replays of Space Hub. The result is the Attraction Field $A_\\Phi$:"
 },
 {
  "kind": "p",
  "text": "$$A_\\Phi(a,s) = \\max\\bigl(0, T(s) - \\text{Occ}(s)\\bigr) \\cdot P_{\\text{now}}(a) \\cdot 2^{\\Delta I(a,s)} \\cdot F(a)$$"
 },
 {
  "kind": "p",
  "text": "Waiting work $T(s)$ is discounted by crowding $\\text{Occ}(s)$, presence $P_{\\text{now}}(a)$ is recent activity, fit $\\Delta I(a,s)$ is in bits, and $F(a)$ marks a free agent. Work is held for an agent with dominant context until a pass or one hour."
 },
 {
  "kind": "p",
  "text": "Where agents' histories differ, the agent-side terms carry real signal: the notify pull $A_2$ cut wrong notifications by 84% on real project messages, and holding work for specialists cut live routing errors to 0–1.7%. On today's Space Hub, only tension and the released hold matter: $A_\\Phi$ completes about 71% of tasks correctly, tying oldest-first (oracle: 73%), because fewer than 1% of decisions offer a choice between two spaces with waiting work. Dense swarms with many such choices remain open."
 },
 {
  "kind": "p",
  "text": "**Keywords:** multi-agent coordination; information-theoretic routing; Bayesian expertise inference; decentralized allocation; prices; pre-registered simulation."
 },
 {
  "kind": "h2",
  "text": "1 Introduction"
 },
 {
  "kind": "p",
  "text": "Workspaces shared by engineers and software agents receive a steady stream of work: tickets, reviews, questions, follow-ups. Deciding who does what usually takes a coordinator: a job dispatcher, a scheduling queue, or a human lead. Space Hub, the platform studied here, groups activity into *spaces* (projects and channels). Under its current policy, an agent joined to a space sees all of its activity and claims the oldest open task."
 },
 {
  "kind": "p",
  "text": "**Thesis.** Shared public information, read by local rules, can replace explicit central coordination. If every agent sees a field computed only from public events, agents organize themselves by moving toward their strongest pull. We call this pull *attraction*. It acts between an agent and a space; events such as postings, claims, commits and completions do not pull agents but change the field."
 },
 {
  "kind": "p",
  "text": "The field cannot be measured directly, so we infer it from events. Each experimental setting is an instrument for one term, showing where that term works and where it fails."
 },
 {
  "kind": "p",
  "text": "**Contributions.**"
 },
 {
  "kind": "list",
  "items": [
   "**A field with consistent units.** The Attraction Field $A_\\Phi$ gives every term a unit: waiting work, presence, fit in bits of surprisal, availability, and crowding priced as a subtraction rather than a divisor (Section 6).",
   "**Term-by-term derivation.** We trace how each term was tested and repaired, turning a rule that froze its queues into one that does not stall (Sections 3–5; Appendices A–I).",
   "**Agent-side signals.** On platform logs, four large open-source repositories and live multi-agent runs, the agent-side terms capture expertise and availability. In closed loop, an agent seen recently active is usually busy.",
   "**A pre-registered negative result.** In pre-registered replays of Space Hub's topology, $A_\\Phi$ completes about 71% of tasks correctly, tying oldest-first, because fewer than 1% of decisions offer a choice between viable spaces (Sections 5.8, 8).",
   "**The text match from task text.** In 72 task-text routing experiments, sentence embeddings and corrected task history drive the text match $m_{\\text{text}}(a,e)$ of A₀ from unlabelled task sentences, beating static agent descriptions by 13 percentage points and keyword baselines by 11 points on held-out tasks, with a 16 ms median decision time on 2 CPU cores."
  ]
 },
 {
  "kind": "p",
  "text": "**Series Context.** This is the first paper in a series on how far shared, public information can coordinate work."
 },
 {
  "kind": "h2",
  "text": "2 Preliminaries"
 },
 {
  "kind": "h3",
  "text": "2.1 Definitions"
 },
 {
  "kind": "p",
  "text": "**Table 1.** Definitions."
 },
 {
  "kind": "table",
  "header": [
   "Term",
   "Formal Symbol",
   "Meaning"
  ],
  "rows": [
   [
    "**Agent**",
    "$a$",
    "Anything that does work: a human engineer or a software agent."
   ],
   [
    "**Space**",
    "$s$",
    "A shared workspace (project, channel or workstream) where agents work. On Space Hub, a project is the coarsest space."
   ],
   [
    "**Place**",
    "$\\ell$",
    "The finest location in the logs: a directory, file or thread. A space is a set of places."
   ],
   [
    "**Event**",
    "$e$",
    "A logged act: new work, claim, push, reply, pass or completion. $L(e)$ is the set of places $e$ touches."
   ],
   [
    "**Field**",
    "$A(a,s)$",
    "All attraction values, computed only from public records and visible to every agent."
   ],
   [
    "**Taker**",
    "—",
    "The agent who took an event in the logs; the ground truth in replays."
   ],
   [
    "**Done Right**",
    "—",
    "Percentage of tasks completed correctly (verified, merged, not reverted)."
   ],
   [
    "**Oracle**",
    "—",
    "A reference policy that knows hidden ground truth (such as each task's right specialist) but obeys the same constraints as all agents."
   ]
  ]
 },
 {
  "kind": "h3",
  "text": "2.2 Background"
 },
 {
  "kind": "p",
  "text": "**Surprisal and bits.** An outcome with probability $p$ carries $-\\log_2 p$ bits of surprisal. A directory edited by two of twenty developers says far more about expertise (about 3 bits) than a file everyone edits (near 0 bits). Measuring competence in bits gives rare expertise its due weight and lets costs and gains add."
 },
 {
  "kind": "p",
  "text": "**Bayesian form.** The log-probability that agent $a$ takes event $e$ splits into a prior (agent $a$'s share of all activity) and a likelihood ratio (how often $a$ works at the event's places relative to everyone):"
 },
 {
  "kind": "p",
  "text": "$$\\log_2 \\Pr(a \\mid e) = \\log_2 \\Pr(a) + \\log_2 \\frac{\\Pr(e \\mid a)}{\\Pr(e)} + \\text{const} \\tag{1}$$"
 },
 {
  "kind": "p",
  "text": "The first term is *presence*, the second *fit*; each can be tracked from event logs on its own timescale."
 },
 {
  "kind": "p",
  "text": "**Fading counters.** Each act increments a counter that decays with half-life $h$. After time $\\Delta t$:"
 },
 {
  "kind": "p",
  "text": "$$c \\leftarrow c \\cdot 2^{-\\Delta t / h} + 1 \\tag{2}$$"
 },
 {
  "kind": "p",
  "text": "Short half-lives track current activity; long ones track domain familiarity. Each update takes constant time and memory."
 },
 {
  "kind": "p",
  "text": "**Prices.** When workers compete for the same tasks, a price that rises with contention lets each pick the task with the best $\\text{value} - \\text{price}$; auction algorithms show such choices reach the best overall assignment without a coordinator. Subtracting crowding, rather than dividing by it, lets heavy crowding cancel a pull without distorting the value scale."
 },
 {
  "kind": "p",
  "text": "**Hysteresis.** An agent moves only when another space pulls at least 1.3 times harder than its current one."
 },
 {
  "kind": "h3",
  "text": "2.3 Notation"
 },
 {
  "kind": "p",
  "text": "**Table 2.** Notation."
 },
 {
  "kind": "table",
  "header": [
   "Symbol",
   "Meaning"
  ],
  "rows": [
   [
    "$A(a,s)$",
    "Current pull of space $s$ on agent $a$."
   ],
   [
    "$T(s)$",
    "Tension (waiting work): $\\sum_w (1 + \\text{age}(w)/W)$ over open items $w$ in $s$ not rejected by the agent, where $\\text{age}(w)$ is how long $w$ has waited."
   ],
   [
    "$W$",
    "Pick-up window: typical time before open work is claimed."
   ],
   [
    "$\\text{Occ}(s)$",
    "Occupancy: agents working in, inspecting or moving toward $s$ (idle agents excluded)."
   ],
   [
    "$T^{+}(s)$",
    "Crowding-priced tension, $\\max\\bigl(0, T(s) - \\text{Occ}(s)\\bigr)$."
   ],
   [
    "$P_{\\text{now}}(a)$",
    "Presence: agent $a$'s recent share of activity, from fast-fading counters."
   ],
   [
    "$P_a(\\ell),\\ P(\\ell)$",
    "Share of agent $a$'s activity, and of all activity, at place $\\ell$ (slow 7-day half-life)."
   ],
   [
    "$\\Delta I(a,s)$",
    "Fit in bits: $\\log_2 \\bigl(P_a(\\ell) / P(\\ell)\\bigr)$ averaged over places in $s$ (or event $e$). Positive for specialists, near zero for generalists, negative for newcomers."
   ],
   [
    "$F(a)$",
    "Availability: 1 if agent $a$ has no unfinished task, about 0.05 if busy."
   ],
   [
    "$S_1(a,e)$",
    "The Bayes form $A_3$: $S_1(a,e) = \\log_2 P_{\\text{now}}(a) + \\Delta I(a,e)$, presence and fit as one log-probability (Equation 1)."
   ],
   [
    "$\\sigma(a)$",
    "Agent $a$'s share of the pull on a task, $A(a) / \\sum_b A(b)$."
   ],
   [
    "$\\pi_s$",
    "Price of tasks in $s$; rises with contention."
   ],
   [
    "$t_s,\\ \\lambda(a,s)$",
    "Expected task time in $s$, and the time agent $a$ needs to gain context; written $t, \\lambda$ when clear."
   ],
   [
    "$\\rho$",
    "Hub rate: completed work per unit of agent time."
   ]
  ]
 },
 {
  "kind": "h3",
  "text": "2.4 Formula lineage"
 },
 {
  "kind": "p",
  "text": "**Table 3.** Formula lineage."
 },
 {
  "kind": "table",
  "header": [
   "Name",
   "Symbol",
   "Defining equation",
   "What changed from its predecessor, and why",
   "Status"
  ],
  "rows": [
   [
    "The original attraction",
    "$A_0$",
    "3",
    "—",
    "Superseded — froze when every tension expired at once"
   ],
   [
    "The repaired original",
    "$A_0'$",
    "8",
    "Tension grows with waiting, urgency $\\times$ $(1 + \\text{age}/15)$, per-agent entry cost",
    "Superseded — its entry cost overrode right matches"
   ],
   [
    "Attraction Rate",
    "$A_1$",
    "10",
    "Every term in a unit, prices instead of a headcount divisor, hub rate $\\rho$",
    "Superseded — its lead came from information from the future; a tool for intuition about prices, units and hysteresis"
   ],
   [
    "The notify pull",
    "$A_2$",
    "11",
    "Reads history from the public record, weights places in bits",
    "Superseded by $A_3$ — a tool for intuition about fit"
   ],
   [
    "The Bayes form",
    "$A_3$",
    "13",
    "Presence plus fit as one log-probability, each on its own clock",
    "A tool — the agent side of $A_\\Phi$, used to score events"
   ],
   [
    "The learned field",
    "$A_3^L$",
    "18",
    "Learns a place-to-place map so fit reaches neighbouring places",
    "A tool — pays only with 10,000+ events"
   ],
   [
    "The Attraction Field",
    "$A_\\Phi$",
    "7",
    "Waiting work priced by crowding, presence, fit in bits, availability, the 1.3 margin and the released hold",
    "Current (Paper 1)"
   ]
  ]
 },
 {
  "kind": "h3",
  "text": "2.5 Using the Attraction Field $A_\\Phi$"
 },
 {
  "kind": "p",
  "text": "The reader can use the Attraction Field $A_\\Phi$ from this table alone."
 },
 {
  "kind": "p",
  "text": "**Table 4.** Symbols of the Attraction Field $A_\\Phi$."
 },
 {
  "kind": "table",
  "header": [
   "Symbol",
   "Meaning"
  ],
  "rows": [
   [
    "$A_\\Phi(a,s)$",
    "Pull of space $s$ on agent $a$: $A_\\Phi(a,s) = T^{+}(s) \\cdot P_{\\text{now}}(a) \\cdot 2^{\\Delta I(a,s)} \\cdot F(a)$."
   ],
   [
    "$T(s)$",
    "Tension (waiting work): $\\sum_w (1 + \\text{age}(w)/W)$ over open items $w$ in $s$ not rejected by the agent."
   ],
   [
    "$\\text{age}(w)$",
    "How long open item $w$ has waited."
   ],
   [
    "$W$",
    "Pick-up window: typical time before open work is claimed."
   ],
   [
    "$\\text{Occ}(s)$",
    "Occupancy: agents working in, inspecting or moving toward $s$ (idle agents excluded)."
   ],
   [
    "$T^{+}(s)$",
    "Crowding-priced tension, $\\max\\bigl(0, T(s) - \\text{Occ}(s)\\bigr)$."
   ],
   [
    "$P_{\\text{now}}(a)$",
    "Presence: agent $a$'s recent share of activity, from fast-fading counters."
   ],
   [
    "$P_a(\\ell),\\ P(\\ell)$",
    "Share of agent $a$'s activity, and of all activity, at place $\\ell$ (slow 7-day half-life)."
   ],
   [
    "$\\Delta I(a,s)$",
    "Fit in bits: $\\log_2 \\bigl(P_a(\\ell) / P(\\ell)\\bigr)$ averaged over places in $s$."
   ],
   [
    "$2^{\\Delta I(a,s)}$",
    "Fit factor: scales presence by fit on a ratio scale."
   ],
   [
    "$F(a)$",
    "Availability: 1 if agent $a$ has no unfinished task, about 0.05 if busy."
   ],
   [
    "$\\sigma(a)$",
    "Agent $a$'s share of the pull on a task, $A(a) / \\sum_b A(b)$."
   ],
   [
    "The 1.3 hysteresis margin",
    "An agent moves only when another space pulls at least 1.3 times harder than its current one."
   ],
   [
    "The released hold",
    "Work is held for agent $a$ when $\\sigma(a) \\ge \\frac{1}{2}$; released on a public pass or after one hour; $\\sigma$ computed without $F$."
   ]
  ]
 },
 {
  "kind": "h2",
  "text": "3 The original attraction formula"
 },
 {
  "kind": "p",
  "text": "The original attraction, A₀, combined five signals into one multiplicative score:"
 },
 {
  "kind": "p",
  "text": "$$A_0 = \\frac{\\text{Tension}_0 \\times \\text{Match}_0 \\times \\text{Velocity}_0}{(1 + \\text{Occupancy}_0) \\times \\text{Entry}_0} \\tag{3}$$"
 },
 {
  "kind": "p",
  "text": "**Table 5.** The terms of the original attraction A₀."
 },
 {
  "kind": "table",
  "header": [
   "Term",
   "Definition",
   "Motivation"
  ],
  "rows": [
   [
    "**Tension₀**",
    "Priority-weighted sum of open work; a task stopped counting after 15 ticks.",
    "Open work should pull."
   ],
   [
    "**Match₀**",
    "Overlap between an agent's declared skills and the space's stated needs.",
    "Send agents where their skills are needed."
   ],
   [
    "**Velocity₀**",
    "$1 + \\log(1 + \\text{recent events logged in the space})$.",
    "Active spaces have momentum."
   ],
   [
    "**Occupancy₀**",
    "Number of agents in the space; the added 1 keeps an empty space at full strength.",
    "Push back so swarms do not pile into one space."
   ],
   [
    "**Entry₀**",
    "Number of task kinds in the space the agent has not done.",
    "Charge for switching and onboarding."
   ]
  ]
 },
 {
  "kind": "p",
  "text": "An agent moved only when another space pulled at least 1.3 times harder. The product form meant a space with no open work, or needing skills the agent lacks, would not pull at all."
 },
 {
  "kind": "p",
  "text": "**Simulation Failure.** In a first benchmark (5 agents, 3 spaces, 30 tasks, 60 ticks), A₀ never cleared the queues; random assignment took 29.0 ticks, round-robin 25.0, and an all-knowing planner 20.7."
 },
 {
  "kind": "p",
  "text": "All 30 tasks were posted at tick 0, so every Tension₀ expired at tick 16. The numerator fell to zero everywhere, no space could beat another by the 1.3 margin, and agents stopped moving, stranding the rest of the work. With arrivals spread over time, A₀ cleared all tasks in 10 out of 10 runs (32.3 ticks on average against 31.9 for the optimal schedule)."
 },
 {
  "kind": "p",
  "text": "**Key Questions Exposed.** The failure exposed flaws in every term, taken up in Sections 4 and 5:"
 },
 {
  "kind": "list",
  "items": [
   "**Tension₀:** How can waiting work keep pulling without an expiry that zeroes the product?",
   "**Match₀:** Declared skills had zero overlap with the code paths events touched. How can competence be read from public logs?",
   "**Velocity₀:** Should activity track the space or the agent, and over what timescale?",
   "**Occupancy₀:** Should crowding be a divisor, or a price subtracted from the pull?",
   "**Entry₀:** What unit measures what an agent lacks when it switches domains?",
   "**Missing Variables:** Does recent activity mean an agent is free or busy? How should a task be routed when only one agent has its thread context?"
  ],
  "ordered": true
 },
 {
  "kind": "h2",
  "text": "4 Method"
 },
 {
  "kind": "h3",
  "text": "4.1 Reading a hidden field from events"
 },
 {
  "kind": "p",
  "text": "Most evaluations replay historical or simulated events forward in time. At each event we compute the Attraction Field $A_\\Phi$ from public information available before it and compare its pick with the true taker."
 },
 {
  "kind": "p",
  "text": "Within one event, tension, occupancy and time windows are the same for every candidate, so a single-event test isolates the agent-side terms:"
 },
 {
  "kind": "p",
  "text": "$$A(a,s) \\propto 2^{S_1(a,e)} \\cdot F(a) \\quad \\text{for candidate agents compared on event } e \\text{ in space } s \\tag{4}$$"
 },
 {
  "kind": "p",
  "text": "How free agents choose *between* spaces needs closed loops, where agents' actions reshape $A_\\Phi$: multi-agent replays (Section 4.4) and live tests (Section 4.3)."
 },
 {
  "kind": "h3",
  "text": "4.2 Data and environments"
 },
 {
  "kind": "p",
  "text": "**Table 6.** Data and environments."
 },
 {
  "kind": "table",
  "header": [
   "Data Source",
   "Description and Scope",
   "Sample Size"
  ],
  "rows": [
   [
    "**Space Hub (Read-only)**",
    "Messages and commits from mixed teams of humans and AI agents.",
    "1,326 events; held-out sets of 208 messages and 290 commits."
   ],
   [
    "**Calibrated Hub Simulator**",
    "Synthetic platforms matched to six measured distributions of Space Hub at $1\\times$, $3\\times$ and $10\\times$ worker scale.",
    "5–30 seeds per scale."
   ],
   [
    "**Public Open-Source Repositories**",
    "Three years of commit history from Rust, PyTorch, CPython and the Linux kernel.",
    "377,950 commits; over 190,000 scored events."
   ],
   [
    "**Closed-Loop Synthetic Worlds**",
    "Identical simulated agents whose own task choices reshape their histories.",
    "10–30 seeds per setting."
   ],
   [
    "**Our Router Simulator**",
    "An attraction-based allocator simulating agents over real commits.",
    "3,300 runs in the main sealed evaluation."
   ],
   [
    "**Live Multi-Agent Swarms**",
    "Teams of AI agents on a private local copy of Space Hub's workflows.",
    "28 runs (Tests A–C) plus pilots."
   ],
   [
    "**Full Platform Replay**",
    "Multi-round simulation replaying Space Hub's real histories (Section 4.4).",
    "6 pre-registered rounds; 20–40 seeds per arm."
   ]
  ]
 },
 {
  "kind": "h3",
  "text": "4.3 Live tests"
 },
 {
  "kind": "p",
  "text": "Teams of six to seven AI agents worked on an isolated local copy of Space Hub, each with its own code copy and private notes the router could not read."
 },
 {
  "kind": "p",
  "text": "$A_\\Phi$ decided only *who was notified*; each agent chose whether to take the work, and its work fed the public record the field read next. Test A ran 60 coding tasks per run with shocks mid-run. Tests B and C used threads of a kickoff and three dependent follow-ups, whose context only the kickoff agent held (Appendix H)."
 },
 {
  "kind": "h3",
  "text": "4.4 Hub replay simulation"
 },
 {
  "kind": "p",
  "text": "The replay keeps Space Hub's topology: its 19 agents and their projects. Work arrives at the times and projects of 63 real agent work sessions, at $1\\times$, $10\\times$ and $30\\times$ volume, plus a 57-agent deployment at $10\\times$. Each task's taker is the agent who did it in the logs."
 },
 {
  "kind": "p",
  "text": "Thread acceptance and completion rates come from live Tests A–C; coding-task completion follows pre-specified assumptions. Presence updates on 60-second heartbeats. There are no global locks, and joining another project takes a request that can be refused. We compared:"
 },
 {
  "kind": "list",
  "items": [
   "**drift:** agents move on their own according to $A_\\Phi$;",
   "**today's hub:** free agents claim the oldest open task in their spaces;",
   "**fixed:** agents stay in their home project;",
   "**joining:** drift plus cross-space moves and human-commissioned single-task helper agents;",
   "**oracle:** offers each task straight to its right agent, under the same constraints (Appendix I)."
  ]
 },
 {
  "kind": "h3",
  "text": "4.5 Pre-registration and evidence standards"
 },
 {
  "kind": "p",
  "text": "From November 19, 2026, all rules, parameter bounds and evaluation code were pre-registered and fingerprinted before we saw test data. Where possible, parameters were fitted on a training split and tested on a later period; results on already-seen data are marked."
 },
 {
  "kind": "p",
  "text": "Comparisons are paired over the same events or seeds (paired $t$-tests, or 95% bootstrap intervals across replay rounds), with Holm correction for multiple hypotheses. Key information claims carry *scramble controls*: the rule is rerun with agent histories shuffled, and if routing collapses, the gain came from real history rather than the rule's structure. In Appendices A–I, measurements are tagged **[Observed]** with their conditions and explanations beyond them **[Inferred]**. “Points” means percentage points."
 },
 {
  "kind": "h3",
  "text": "4.6 Routing from task text"
 },
 {
  "kind": "p",
  "text": "Work often arrives as an unlabelled one-sentence software task, typed by a developer or generated by a tool. To see whether the original attraction $A_0$ can route such work without directory tags or target spaces, we built a text-based router. Across 72 experiments we tested how well an agent's attraction to one task, $\\text{attraction}(a,e)$ under $A_0$ and under the repaired $A_0'$ with its per-agent entry cost, can be derived from the task's text. The workspace has four AI coding agents (frontend, backend, infrastructure, reviewer), each declared in one description document."
 },
 {
  "kind": "p",
  "text": "The router sees only the task sentence and the project name, and runs locally on 2 CPU cores with no generative language model and no hand-written rules. It embeds the sentence with an 8-bit, 384-dimensional sentence embedding model (35 MB in memory) and takes cosine similarity against the agent's description and the nearest task that agent previously completed. The two similarities are standardised and blended into the text match $m_{\\text{text}}(a,e)$."
 },
 {
  "kind": "h2",
  "text": "5 Findings"
 },
 {
  "kind": "h3",
  "text": "5.1 Tension must grow while work waits"
 },
 {
  "kind": "p",
  "text": "$A_0$ froze its queues. In simulated swarms, four corrections let the attraction rule match the optimal central allocation at up to 100,000 agents:"
 },
 {
  "kind": "list",
  "items": [
   "tension stays above zero while startable work remains;",
   "only unblocked tasks pull;",
   "occupancy is read when the agent decides;",
   "each task carries one explicit claim."
  ],
  "ordered": true
 },
 {
  "kind": "p",
  "text": "Our repaired $A_0'$ reached the same fix, scaling tension as $\\text{urgency} \\times (1 + \\text{age} / 15)$; in our router simulator it picked the best free agent 63% of the time, against 28% at random. We write backlog tension as:"
 },
 {
  "kind": "p",
  "text": "$$T(s) = \\sum_{w \\in \\text{unclaimed work in } s} \\Bigl(1 + \\frac{\\text{age}(w)}{W}\\Bigr) \\tag{5}$$"
 },
 {
  "kind": "p",
  "text": "Each pending task pulls at least 1, more as it waits, so $T(s)$ is zero only in an empty space; declined tasks drop out of the decliner's sum, so none can deadlock it. In full platform replays, removing tension cut work claimed within an hour by about 26 percentage points at baseline volume, and agents kept in their starting space completed 20 points less work correctly (Appendices A, I)."
 },
 {
  "kind": "h3",
  "text": "5.2 Fit is information about places, in bits"
 },
 {
  "kind": "p",
  "text": "Declared skills predicted nothing; activity history predicted well. Weighting an agent's history by the surprisal of each place it touched (the notify pull $A_2$, $\\text{pull}(a,e)$, precursor of fit) cut wrong notifications from 8.40 to 1.37 per message (84%) on 208 held-out Space Hub discussions, still reaching the true replier 80% of the time. Scrambled histories fell to chance (53% against 52%)."
 },
 {
  "kind": "p",
  "text": "History must decay: in closed-loop synthetic worlds, binary “has acted here” records filled with ones (6.99 steps per task), while decaying counters let twelve identical agents split the work (4.35 steps, within 2% of the central oracle)."
 },
 {
  "kind": "p",
  "text": "In the Bayes form $A_3$ (Equation 1), the combined score $S_1$ (presence plus fit) found the true taker in 82% of real platform messages (already-seen data, nothing tuned), against 75% for presence and 49% for fit alone. In the learned field $A_3^L$, embeddings of related directories added 2.5 to 5.2 points across four large repositories (+0.7 in a sealed PyTorch run, +4.1 in a post-hoc rerun without merge bots), but needed at least 10,000 mature events. Onboarding cost folds into fit: unfamiliarity is missing information, counted as negative bits (Appendices C, D, E)."
 },
 {
  "kind": "image",
  "src": "/research/attraction/figure-01.png",
  "width": 1408,
  "height": 655,
  "alt": "Figure 1",
  "caption": "**Figure 1.** 208 held-out Space Hub messages, 123 answered. Telling everyone reaches the replier 90% of the time at 8.40 wrong notifications per message; information-weighted history reaches 80% at 1.37, an 84% cut. With who-did-what shuffled the same rule falls to 53%, the level of random choice (52%)."
 },
 {
  "kind": "image",
  "src": "/research/attraction/figure-02.png",
  "width": 1408,
  "height": 566,
  "alt": "Figure 2",
  "caption": "**Figure 2.** Closed-loop toy world, load 0.9, 10 seeds. Routing by compression gain (fading counts, fit in bits) reaches 4.35 steps per task and specialization 0.86, close to the oracle's 4.28 and 0.90; a yes/no history pull barely specializes (6.97, 0.11), and with a threshold it never starts."
 },
 {
  "kind": "h3",
  "text": "5.3 Presence belongs to the agent, on a matched clock"
 },
 {
  "kind": "p",
  "text": "Presence $P_{\\text{now}}(a)$, whether an agent is active now, replaces the space's $\\text{Velocity}_0$, on a clock spanning several recent actions and at least the usual pick-up time. In CPython, a half-life of a day or a week doubled taker identification (14% to 28%); in fast team chat a 1-hour window worked and longer ones dropped accuracy from 75% to 29%. Weights fitted over three clocks gained 9 to 15 percentage points on three of four repositories (Appendix D)."
 },
 {
  "kind": "image",
  "src": "/research/attraction/figure-03.png",
  "width": 1408,
  "height": 563,
  "alt": "Figure 3",
  "caption": "**Figure 3.** Takers found with one guess as the presence clock lengthens, fit held fixed. On code, a day or a week doubles cpython (14% to 28%); on Space Hub chat (already-seen data), presence alone falls from 75% to 29% on long clocks, so the 1-hour clock is the informative one."
 },
 {
  "kind": "h3",
  "text": "5.4 Present is not free"
 },
 {
  "kind": "p",
  "text": "Live runs showed what replays cannot: in an exploratory look at Test A logs, 79% of first notifications went to agents already on another task. The most active agent is the busiest."
 },
 {
  "kind": "p",
  "text": "An availability factor $F(a)$ (1 when free, about 0.05 when busy), with busy agents notified last, cut wrong notifications from 1.07 to 0.07 per task and lost no tasks; the first agent notified accepted 94% of the time. The arm was pre-specified, but applying the full verdict to it was decided after the results (Appendix H)."
 },
 {
  "kind": "image",
  "src": "/research/attraction/figure-04.png",
  "width": 1408,
  "height": 343,
  "alt": "Figure 4",
  "caption": "**Figure 4.** Live test A: six then seven real AI agents, 60 coding tasks per run, 14 clean runs. Telling busy agents last brings wrong notifications to 0.07 per task with no task lost; telling everyone sends 5.26 and loses 5.8%."
 },
 {
  "kind": "h3",
  "text": "5.5 Crowding works as a price, not a divisor"
 },
 {
  "kind": "p",
  "text": "In synthetic benchmarks, agents bidding value minus a contention price matched a central planner in all 6 configurations (exploratory). In live pilots with crowding as a divisor, agents piled onto the same tasks: 27 moves for 10 tasks, 19 of them wasted. A divisor never reaches zero, so we subtract crowding as a price:"
 },
 {
  "kind": "p",
  "text": "$$T^{+}(s) = \\max\\bigl(0, T(s) - \\text{Occ}(s)\\bigr) \\tag{6}$$"
 },
 {
  "kind": "p",
  "text": "In the full platform replay neither form mattered measurably, as collisions were rare (0.1 to 0.5 per task) (Appendices B, H, I)."
 },
 {
  "kind": "h3",
  "text": "5.6 Confidence: hold work for the sure agent, then release it"
 },
 {
  "kind": "p",
  "text": "When a follow-up needed earlier context, the Attraction Field $A_\\Phi$ ranked the context holder first in 98–100% of live dispatches, and agents lacking it declined 95–98% of such tasks. But when the specialist passed (busy, or its scratchpad notes lost), the task drifted to unqualified agents and 35–47% of follow-ups were lost. Holding work for an agent whose attraction share reached $\\sigma(a) \\ge \\tfrac{1}{2}$ cut wrong routing to 0–1.7%."
 },
 {
  "kind": "p",
  "text": "In full platform replays, holds with no release stranded 11–12% of tasks. Releasing on a public pass or after one hour recovered all of it (+6.6 to +7.5 points in completed tasks), but then holds added nothing over no hold on the historical Space Hub (Appendices H, I)."
 },
 {
  "kind": "image",
  "src": "/research/attraction/figure-05.png",
  "width": 1408,
  "height": 516,
  "alt": "Figure 5",
  "caption": "**Figure 5.** Live tests B and C, 60 follow-ups per arm whose thread has a context holder. Holding the work for the agent the field is sure of (test C) keeps wrong takes to 0–1.7%; done right stays at 43.3%, bounded by the right agent's memory."
 },
 {
  "kind": "h3",
  "text": "5.7 Spaces can be read off the record"
 },
 {
  "kind": "p",
  "text": "Grouping directories that co-occur in events more than chance predicts (positive pointwise mutual information, PMI) recovered six hidden modules exactly in synthetic worlds (Adjusted Rand Index 1.00), with up to 25% of events crossing boundaries. In four large open-source repositories they matched official ownership above chance but beat top-level directories in only two."
 },
 {
  "kind": "p",
  "text": "Coordinators can be read as agents whose fit straddles module boundaries (suggestive). With a second, slower log of cross-module events, a stable layer of 2–4 coordinators formed in most runs when 10–15% of events crossed modules, and dissolved at 20%. A slow 70-day cross-boundary memory cut taker prediction by 3.6 to 11.5 percentage points by favouring dormant contributors. An earlier Space Hub module analysis carried an uncorrected smoothing artifact; its scores should not be cited until re-run (Appendices F, G)."
 },
 {
  "kind": "h3",
  "text": "5.8 The whole field on today's hub"
 },
 {
  "kind": "p",
  "text": "Six pre-registered rounds tested $A_\\Phi$ in the platform replay."
 },
 {
  "kind": "image",
  "src": "/research/attraction/figure-06.png",
  "width": 1408,
  "height": 540,
  "alt": "Figure 6",
  "caption": "**Figure 6.** Work done right by rule at 10× the real hub's volume, 20 seeds per rule. Attraction with a released hold (70.8%), oldest first (70.6%) and random moves (70.8%) all sit in the shaded band below the oracle (73.3%); a hold never released drops to 63.3%, joining with one-task workers to 58.2%, and never moving to 44.3%."
 },
 {
  "kind": "p",
  "text": "**Table 7.** Pre-registered replay rounds (Appendix I has the full tables)."
 },
 {
  "kind": "table",
  "header": [
   "Round",
   "Intervention",
   "Finding"
  ],
  "rows": [
   [
    "**1**",
    "$A_\\Phi$ against all baselines.",
    "Beats the *fixed* baseline by about 20 points in completed tasks but trails current dispatch by 6–7, as permanent holds strand tasks. Crowding form, fit and price: no measurable difference."
   ],
   [
    "**2**",
    "Fit from verified work (accepted commits).",
    "Null ($\\pm 1$ percentage point). One owner per project; code tasks reach the right taker 93–94% of the time without fit."
   ],
   [
    "**3**",
    "Release holds on a pass or after 1 hour.",
    "Recovers all stranded tasks (+6.6 to +7.5 points), level with current dispatch; no gain over FIFO with the same release."
   ],
   [
    "**4**",
    "Hidden synthetic skill differences.",
    "Null (70.3–71.4% success); a real choice between spaces in only 0.1–0.3% of decisions."
   ],
   [
    "**5**",
    "Round 4 at $30\\times$ volume and on a $3\\times$ larger hub.",
    "Still null (70.1–70.4%); choices rise only to 0.6%."
   ],
   [
    "**6**",
    "Cross-project movers as guests (claim only work unclaimed for $\\ge 1$ hour).",
    "+0.8 points over free joining at $10\\times$ volume; moving still costs 10–12 points against local drift."
   ]
  ]
 },
 {
  "kind": "p",
  "text": "The platform routes work before the field can: each project has one owner, agents stay home, arrivals are sparse. When an agent finishes, at most one of its spaces usually has work waiting, so fit and price have almost nothing to decide (Appendix I)."
 },
 {
  "kind": "image",
  "src": "/research/attraction/figure-07.png",
  "width": 1408,
  "height": 776,
  "alt": "Figure 7",
  "caption": "**Figure 7.** Every key pre-registered replay test as a paired difference in work done right, with 95% bootstrap intervals over seeds (10× volume unless marked 30×). Moving beats never moving by about 20 points and releasing the hold adds about 7.5; once released, attraction against oldest first and every fit comparison lie within about ±1 point, while joining costs 10–13."
 },
 {
  "kind": "h3",
  "text": "5.9 The match from task text"
 },
 {
  "kind": "p",
  "text": "For the text match $m_{\\text{text}}(a,e)$ in $A_0$, similarity to an agent's past tasks is the reliable signal. On the held-out set of 153 tasks across 12 projects (Set 2), our text router made 64% right or acceptable first picks (95% bootstrap interval: 59–69%), against 51% for agent description files alone (paired gain +13 percentage points, $p < 0.001$) and 45% for always picking the most common agent (+19 points, $p < 0.001$). TF-IDF keyword vectors in the same router reached 53% ($p = 0.007$). Descriptions fail because similarity tracks topic, not kind of work: “fix the login page” and “fix the login endpoint” share a topic but belong to different roles."
 },
 {
  "kind": "image",
  "src": "/research/attraction/figure-08.png",
  "width": 1408,
  "height": 485,
  "alt": "Figure 8",
  "caption": "**Figure 8.** Task-text routing, first pick right or acceptable, 95% intervals over tasks. The strategy reaches 74% on set 1 (used to choose settings) and 64% on held-out set 2, against 51% for description files and 45% for the most common agent."
 },
 {
  "kind": "p",
  "text": "For one task with positive $\\text{Tension}_0$, the other terms of $A_0$ ($\\text{Tension}_0$, $\\text{Velocity}_0$, $\\text{Occupancy}_0$, $\\text{Entry}_0$) are equal across candidates, so $m_{\\text{text}}$ alone ranks agents; the rest set task order. In the earlier commit-replay phase, the 15-tick urgency expiry zeroed every score and froze work in all 90 runs until constant $\\text{Tension}_0$ replaced it. $A_0'$, adding a per-agent entry cost, fell to 72% by overriding a correct best text match 5.2 times per run, so $A_\\Phi$ folds entry cost into fit."
 },
 {
  "kind": "p",
  "text": "Under simulated load, accuracy fell from 74% with all agents free to 44% at the heaviest load with $A_0$ as written; of 55.9 wrong assignments per run, 33.0 came from the best match being busy. When saturated, **availability** ($F(a)$), not the formula, limits performance. Routing only the 20% most confident tasks (largest score margin between the top two candidates) raised Set 2 accuracy from 64% to 80%. Learning from its own unverified assignments, without human corrections, drove accuracy down to 38%."
 },
 {
  "kind": "h2",
  "text": "6 The Attraction Field $A_\\Phi$"
 },
 {
  "kind": "p",
  "text": "Section 5 leaves the Attraction Field $A_\\Phi$:"
 },
 {
  "kind": "p",
  "text": "$$A_\\Phi(a,s) = T^{+}(s) \\cdot P_{\\text{now}}(a) \\cdot 2^{\\Delta I(a,s)} \\cdot F(a), \\qquad T^{+}(s) = \\max\\bigl(0, T(s) - \\text{Occ}(s)\\bigr) \\tag{7}$$"
 },
 {
  "kind": "p",
  "text": "Two rules go with it:"
 },
 {
  "kind": "list",
  "items": [
   "**Hysteresis margin:** an agent switches only when another space pulls at least 1.3 times harder than its own, or above zero when its own pulls zero. The margin is the entry threshold $1 + \\lambda / t$, onboarding time over working time (Appendix B; not tested, as no simulator modelled onboarding time).",
   "**Released reservation hold:** when an agent's share $\\sigma(a) = A_\\Phi(a) / \\sum_b A_\\Phi(b)$ of a task reaches $\\tfrac{1}{2}$, the task is held for it, with the reason published, until it declines or one hour passes. In live trials $\\sigma$ was computed without $F(a)$."
  ]
 },
 {
  "kind": "p",
  "text": "Presence and availability belong to the agent, so they cancel when one agent compares spaces, leaving $T^{+}(s)$ and fit $\\Delta I(a,s)$ to decide *where* it goes; they matter when comparing *agents* for one task, and so decide holds."
 },
 {
  "kind": "p",
  "text": "**Table 8.** From the terms of A₀ to the terms of the Attraction Field $A_\\Phi$."
 },
 {
  "kind": "table",
  "header": [
   "Original attraction A₀ (Equation 3)",
   "Attraction Field $A_\\Phi$ (Equation 7)",
   "Why"
  ],
  "rows": [
   [
    "**Tension₀** (expiring threshold)",
    "$T(s)$ (grows with waiting time)",
    "Hard expiry zeroed the product (Section 3)."
   ],
   [
    "**Match₀** (declared profiles)",
    "$2^{\\Delta I(a,s)}$ (decaying activity counters)",
    "Declared skills predicted nothing (Section 5.2)."
   ],
   [
    "**Velocity₀** (space event volume)",
    "$P_{\\text{now}}(a)$ (agent activity, matched clock)",
    "Readiness belongs to the agent (Section 5.3)."
   ],
   [
    "$\\div (1 + \\text{Occupancy}_0)$",
    "$\\max\\bigl(0, T(s) - \\text{Occ}(s)\\bigr)$",
    "A divisor never reaches zero (Section 5.5)."
   ],
   [
    "$\\div \\text{Entry}_0$",
    "Negative bits of $\\Delta I$; hysteresis threshold",
    "Unfamiliarity is missing bits; moving cost is the 1.3 margin (Section 5.2)."
   ],
   [
    "*None*",
    "$F(a)$; released reservation hold",
    "Active means busy (Section 5.4); hold for the specialist, release before deadlock (Section 5.6)."
   ]
  ]
 },
 {
  "kind": "p",
  "text": "**What each event changes.**"
 },
 {
  "kind": "list",
  "items": [
   "**Task arrives:** raises $T(s)$, which keeps rising while it waits.",
   "**Task claimed:** lowers $T(s)$, sets the claimer's $F(a)$ to busy, raises $\\text{Occ}(s)$.",
   "**Agent acts:** raises the decaying counters behind its $\\Delta I$ and $P_{\\text{now}}$.",
   "**Hold released:** a public pass or the one-hour timeout returns the task to general dispatch.",
   "**Task done:** frees $F(a)$, lowers $\\text{Occ}(s)$; the agent re-reads the field."
  ]
 },
 {
  "kind": "p",
  "text": "Each is a constant-time counter update."
 },
 {
  "kind": "p",
  "text": "**Worked example.** Space *money* has two unclaimed tasks, waiting 60 and 0 seconds, with $W = 120$ seconds: $T = 1.5 + 1.0 = 2.5$, $\\text{Occ} = 0$. Space *delivery* has one task waiting 120 seconds ($T = 2.0$) that one agent is inspecting ($\\text{Occ} = 1$): $T^{+} = 2.0 - 1.0 = 1.0$."
 },
 {
  "kind": "p",
  "text": "Specialist B has $2^{\\Delta I} = 4.0$ in *money* and $0.5$ in *delivery*; generalist C has $2^{\\Delta I} = 1.0$ in both. Both are free ($F = 1.0$) with $P_{\\text{now}} = 0.25$."
 },
 {
  "kind": "p",
  "text": "B scores *money* $2.5 \\times 0.25 \\times 4.0 = 2.50$ and *delivery* $1.0 \\times 0.25 \\times 0.5 = 0.13$; C scores them $2.5 \\times 0.25 \\times 1.0 = 0.63$ and $1.0 \\times 0.25 \\times 1.0 = 0.25$. Both head for *money*."
 },
 {
  "kind": "p",
  "text": "B claims the older task: *money*'s tension drops to 1.0 and occupancy rises to 1, so $T^{+} = \\max(0, 1.0 - 1) = 0$ and C moves to *delivery*. If B is slow, the remaining task's tension passes 1.0 and *money* pulls again. Under A₀'s divisor, *money* would have kept a false pull of 0.13 on C."
 },
 {
  "kind": "h2",
  "text": "7 Limits"
 },
 {
  "kind": "h3",
  "text": "7.1 The original attraction A₀"
 },
 {
  "kind": "p",
  "text": "A₀ got the idea right: agents coordinating through a shared public field of pulls, pushed from crowds by Occupancy₀ and kept from churning by a hysteresis threshold. Under continuous arrivals this cleared queues within 1.3% of an optimal central schedule."
 },
 {
  "kind": "p",
  "text": "Every term of its formula failed. Hard expiry on Tension₀ zeroed the product and froze the simulation. Declared skills in Match₀ said nothing about who would act. Velocity₀ rewarded busy spaces, not free workers. Occupancy₀ as a divisor never took a crowded space's pull to zero. Entry₀ had no unit to trade against value. The Attraction Field $A_\\Phi$ (Equation 7) makes pull zero exactly when startable work or free capacity is absent."
 },
 {
  "kind": "h3",
  "text": "7.2 The Attraction Field $A_\\Phi$"
 },
 {
  "kind": "p",
  "text": "**Table 9.** Where each term and rule of $A_\\Phi$ works, where it does not, and why."
 },
 {
  "kind": "table",
  "header": [
   "Term or Rule",
   "What worked",
   "What failed, and why",
   "Guidance"
  ],
  "rows": [
   [
    "**Backlog Tension $T$**",
    "Ends queue freezing; about 20 points over fixed assignment in replays.",
    "None once tension stays above zero.",
    "Keep."
   ],
   [
    "**Domain Fit $2^{\\Delta I}$**",
    "Precursors cut notification spam by 84%; found context holders with 92–100% accuracy live.",
    "No gain for choosing spaces today: under 1% of decisions offer competing spaces. Misses newcomers and unlinked aliases.",
    "Use on fine-grained spaces with competing agents; require declared scopes and one identity per agent."
   ],
   [
    "**Presence $P_{\\text{now}}$**",
    "Multi-timescale weights gained 9–15 points in code repositories.",
    "Noisy on a mismatched clock; live, high presence means busy.",
    "Match half-life to pick-up time; pair with $F$."
   ],
   [
    "**Availability $F$**",
    "Cut wrong notifications from 1.07 to 0.07 per task live.",
    "Inside $\\sigma(a)$ it suppresses a working context holder (about 20-fold).",
    "Order dispatch by $F$; compute $\\sigma(a)$ without it."
   ],
   [
    "**Crowding as Price**",
    "Matched a central planner in synthetic tests (exploratory).",
    "No difference in the replay; simultaneous claims are rare.",
    "May matter in dense swarms (untested)."
   ],
   [
    "**Released Hold**",
    "Wrong routing 0–1.7% live; recovered stranded work (+6.6 to +7.5 points) in replays.",
    "Ties simple dispatch today, where agents already decline tasks they lack context for.",
    "Always set a release timeout; keep agents' right to decline."
   ],
   [
    "**Cross-Space Joining**",
    "1-hour pick-up up 9–29 points with single-task workers.",
    "Success down up to 7 points, 3–13 with extra workers: newcomers lack fit and crowd.",
    "Emergencies only."
   ]
  ]
 },
 {
  "kind": "h3",
  "text": "7.3 What no formula can do"
 },
 {
  "kind": "p",
  "text": "The field is built from public events, so it can keep or lose signal but never create it. It cannot:"
 },
 {
  "kind": "list",
  "items": [
   "**find newcomers:** 2–6% of open-source takers had never acted at the event's places; no field found them more than 1.3% of the time;",
   "**use the future:** A₁'s early gains vanished once evaluation used only data visible at arrival (Appendix B);",
   "**learn from thin logs** (about 300 events);",
   "**spot service bots** without a declaration;",
   "**restore context** an agent purged from its scratchpad;",
   "**beat the topology:** on today's Space Hub, structure caps any gain over oldest-first dispatch at 2–3 percentage points."
  ]
 },
 {
  "kind": "h3",
  "text": "7.4 What was tried and did not survive"
 },
 {
  "kind": "list",
  "items": [
   "Hard expiry on Tension₀ (froze the queue).",
   "Throughput rates $\\rho$ and strict selectivity thresholds (gains came from future information).",
   "Binary activity records (saturated).",
   "Slow 70-day cross-boundary memory (favoured dormant contributors).",
   "Presence without availability (spammed busy agents).",
   "Occupancy₀ as a divisor (did not clear crowds).",
   "Holds with no release (stranded work).",
   "Fit from verified work, and fit against hidden synthetic skill (both null).",
   "Unrestricted cross-space moves, with or without guest rules (lowered quality)."
  ]
 },
 {
  "kind": "h2",
  "text": "8 Verdict and future work"
 },
 {
  "kind": "h3",
  "text": "8.1 Verdict"
 },
 {
  "kind": "list",
  "items": [
   "**On today's Space Hub, backlog tension and the released hold account for all the measurable benefit.** Sending free agents toward rising tension beats static assignment by about 20 percentage points in correctly completed work at every volume tested. A hold with no release strands 11–12% of tasks; releasing on a pass or after one hour removes that loss. Fit and crowding price stay within $\\pm 1$ point. Moving across spaces lowers quality.",
   "**The Attraction Field $A_\\Phi$ ties FIFO dispatch (“oldest task first”), at about 71% correctly completed tasks against an oracle's 73%.** Fewer than 1% of decisions offer a real choice between spaces, so $A_\\Phi$, FIFO and even random moves land within the same 2–3 points of the oracle.",
   "**$A_\\Phi$'s value lies in dense swarms with many simultaneous choices.** Where agents differed in history or context, presence, fit and availability carried real signal, and holding tasks for the agent the field was sure of cut live wrong routing to 0–1.7%. Whether agents moving by $A_\\Phi$ beat simpler dispatch there remains open. The task-text experiments agree: across four roles the text match $m_{\\text{text}}(a,e)$ beats the most-common-agent baseline by 19 points on held-out tasks, though they test how A₀ routes tasks to agents, not how agents choose spaces."
  ],
  "ordered": true
 },
 {
  "kind": "p",
  "text": "The nulls reflect the platform's structure, not a limit of $A_\\Phi$: a decentralized policy beats FIFO only when there is something to choose. On the Space Hub, several of an agent's spaces have work at once in only 0.1% to 0.6% of decisions, and secondary contributors make only 6% to 13% of completions, too few to learn competence from. Wherever a real choice existed (whom to notify, whether to hold), the agent-side terms of $A_\\Phi$ beat their baselines."
 },
 {
  "kind": "h3",
  "text": "8.2 Future work"
 },
 {
  "kind": "p",
  "text": "This first paper in a series sets the boundary conditions. Next we test $A_\\Phi$ where choices dominate:"
 },
 {
  "kind": "list",
  "items": [
   "**Finer spaces:** directories, channels and issue threads, where choices arise per task; Equation 7 applies unchanged.",
   "**Dense-choice swarms:** overlapping specialists per space, with a pre-registered minimum share of decisions that offer real alternatives.",
   "**Fit and price under density:** re-test both where many agents compete for the same tasks.",
   "**Newcomers:** place agents without history using declared scopes, stable identifiers and ownership records.",
   "**Shadow trials:** compute $A_\\Phi$ on live streams without assigning anything and compare with what agents did.",
   "**Task-text routing, live:** run the text router with real agents and real people correcting it; set its asking threshold from its own recent history; test it on a third held-out set; and add a second labeller to know how high a router can reasonably go."
  ]
 },
 {
  "kind": "h3",
  "text": "Data and code availability"
 },
 {
  "kind": "p",
  "text": "Pre-registered protocols, cryptographic fingerprints, analysis pipelines and full result tables are available from the authors on request. Space Hub logs were read only; open-source datasets are complete public commit histories over the stated windows."
 },
 {
  "kind": "h3",
  "text": "References"
 },
 {
  "kind": "list",
  "items": [
   "A mathematical theory of communication. *Bell System Technical Journal*, 1948.",
   "An essay towards solving a problem in the doctrine of chances. *Philosophical Transactions of the Royal Society*, 1763.",
   "The auction algorithm: a distributed relaxation method for the assignment problem. *Annals of Operations Research*, 1988.",
   "Rate control for communication networks: shadow prices, proportional fairness and stability. *Journal of the Operational Research Society*, 1998.",
   "Optimal foraging, the marginal value theorem. *Theoretical Population Biology*, 1976.",
   "On nonlinear fractional programming. *Management Science*, 1967.",
   "Attention is all you need. *Advances in Neural Information Processing Systems*, 2017.",
   "The architecture of complexity. *Proceedings of the American Philosophical Society*, 1962.",
   "Expertise Browser: a quantitative approach to identifying expertise. *International Conference on Software Engineering*, 2002.",
   "Who should fix this bug? *International Conference on Software Engineering*, 2006.",
   "Mining version histories to guide software changes. *International Conference on Software Engineering*, 2004.",
   "Identification of coordination requirements: implications for the design of collaboration and awareness tools. *Conference on Computer-Supported Cooperative Work*, 2006.",
   "Word association norms, mutual information, and lexicography. *Computational Linguistics*, 1990.",
   "Comparing partitions. *Journal of Classification*, 1985."
  ],
  "ordered": true
 },
 {
  "kind": "p",
  "text": "**Relation to Prior Work.** This formulation draws on information theory [1], Bayesian inference [2], auctions and congestion shadow prices [3, 4], optimal foraging and fractional renewal objectives [5, 6], attention [7], near-decomposable hierarchies [8], expertise mining from repositories [9, 10], co-change analysis and coordination requirements [11, 12], pointwise mutual information [13] and partition agreement [14]. It joins them into one decentralized field between agents and shared spaces, built only from public events, with every term in explicit units on an explicit clock. Its own contributions are the closed-loop finding that active means busy, the released specialist hold, and the structural reason $A_\\Phi$ ties FIFO on today's platforms."
 },
 {
  "kind": "h2",
  "text": "Appendix A. The repaired formula: tension must keep pulling"
 },
 {
  "kind": "p",
  "text": "**Method.** We fixed the defects of $A_0$ one at a time in the original validation simulator, then compared fairly at up to 100,000 agents and 10,000 workspaces (10 seeds per setting). **[Observed (simulation)]**"
 },
 {
  "kind": "p",
  "text": "Four repairs were needed:"
 },
 {
  "kind": "list",
  "items": [
   "**Tension stays above zero** while actionable work remains. This alone ends the frozen queue.",
   "**Only actionable tasks pull;** blocked tasks had drawn agents to sit idle.",
   "**Occupancy is read at the moment of choice.** Counts three ticks stale made pairs of workers swap between two workspaces every three ticks, even with hysteresis raised to 1.3 and 1.5.",
   "**Each task has a claim lock,** so two workers cannot take the same work."
  ],
  "ordered": true
 },
 {
  "kind": "p",
  "text": "**Results.** With all four, the decentralized formula matched an optimal central planner in every simulated swarm (identical workers, single-worker tasks). Without locks, about 6.6% of agents stayed in error as workspaces grew with the swarm."
 },
 {
  "kind": "p",
  "text": "**Our router simulator.** Our repaired formula $A_0'$ reached the same fix, scaling tension as $\\text{urgency} \\times (1 + \\text{age} / 15)$. The attraction of agent $a$ to task $e$ in project $p$ is:"
 },
 {
  "kind": "p",
  "text": "$$\\begin{gathered} A_0'(a,e) = \\frac{\\mathrm{urgency}(e)\\,\\bigl(1 + \\mathrm{age}(e)/15\\bigr)\\cdot \\mathrm{Match}_0(a,e)\\cdot \\bigl(1 + \\ln(1 + \\mathrm{Velocity}_0(p))\\bigr)}{\\bigl(1 + \\mathrm{Occupancy}_0'(p)\\bigr)\\cdot \\mathrm{Entry}_0'(a,p)}, \\\\[6pt] \\mathrm{Entry}_0'(a,p) = 1 + 2\\,(1 - \\varphi), \\qquad \\varphi = 1 - e^{-n/3} \\end{gathered} \\tag{8}$$"
 },
 {
  "kind": "p",
  "text": "$\\mathrm{age}(e)$ is the ticks the task has waited; $\\mathrm{Occupancy}_0'(p)$ counts agents working in $p$ now; $n$ is the tasks agent $a$ has finished and kept in $p$, so entry cost falls from 3 toward 1 as the agent builds a record there (unlike $A_0$'s, it depends on the agent). With 30 agents, $A_0'$ picked the best available specialist 63% of the time (56% with static skill profiles, 28% at random); first-try approval was 57%, against 58% for an oracle that reads the hidden skills. We reproduced all 60,480 recorded metrics exactly. **[Observed (simulation)]**"
 },
 {
  "kind": "p",
  "text": "**Tension, defined.**"
 },
 {
  "kind": "p",
  "text": "$$T(s) = \\sum_{w \\in \\text{unclaimed work in } s} \\Bigl(1 + \\frac{\\text{age}(w)}{W}\\Bigr) \\tag{9}$$"
 },
 {
  "kind": "p",
  "text": "$\\text{age}(w)$ is how long task $w$ has waited; $W$ is the usual pick-up window. Each pending task pulls at least 1, rising with its wait, so $T(s)$ is zero only when $s$ has no pending work. Tasks an agent has declined drop out of its tension, so work nobody can do cannot trap workers."
 },
 {
  "kind": "image",
  "src": "/research/attraction/figure-09.png",
  "width": 1408,
  "height": 618,
  "alt": "Figure 9",
  "caption": "**Figure 9.** The repaired original A₀′ against the notify pull A₂, first-try approval, 95% intervals over 50 seeds (25 at 300 agents). With labels read from the finished commit (information from the future), A₀′ is better in 6 of 8 settings; with only what is known at arrival, the two are level (2 each, 4 unclear)."
 },
 {
  "kind": "h2",
  "text": "Appendix B. Attraction Rate: give every term a unit"
 },
 {
  "kind": "p",
  "text": "The Attraction Rate A₁ keeps the rule of falling toward the strongest pull but gives every term a unit (value, probability or time), so costs subtract instead of dividing:"
 },
 {
  "kind": "p",
  "text": "$$N(a \\to s) = T_s P(a,s) - \\pi_s - \\rho \\bigl(t_s + \\lambda(a,s)\\bigr) \\tag{10}$$"
 },
 {
  "kind": "p",
  "text": "**Table 10.** Symbols of Attraction Rate A₁."
 },
 {
  "kind": "table",
  "header": [
   "Symbol",
   "Meaning"
  ],
  "rows": [
   [
    "$N(a \\to s)$",
    "Net attraction. An agent moves to the space with the highest $N$, if $N > 0$."
   ],
   [
    "$P(a,s)$",
    "Probability that $a$ succeeds at work in $s$ (replaces declared Match₀)."
   ],
   [
    "$\\pi_s$",
    "Price of work in $s$: rises with competing bids, falls while work waits. Replaces division by Occupancy₀."
   ],
   [
    "$t_s,\\ \\lambda(a,s)$",
    "Time to do the work in $s$, and time for $a$ to load its context (0 if already in $s$). $\\lambda$ replaces Entry₀."
   ],
   [
    "$\\rho$",
    "Platform productivity: resolved work per unit of worker time, the opportunity cost of time."
   ]
  ]
 },
 {
  "kind": "p",
  "text": "**Why a price beats a headcount divisor.** Take two equal tasks. Agent A succeeds on Task 1 with probability 0.9 and on Task 2 with 0.8; Agent B with 0.6 and 0.1. Greedy matching gives A Task 1 and B Task 2: $0.9 + 0.1 = 1.0$. With prices, B bids on Task 1, the only one it is useful for, raising its price; A moves to Task 2, giving $0.8 + 0.6 = 1.4$ with no central direction. A divisor cannot tell an agent displaced by a better specialist from a space that is simply full; a price can."
 },
 {
  "kind": "p",
  "text": "**Simulation results** (30 agents, 50 fresh seeds per setting, 3,300 runs). **[Observed (simulation)]**"
 },
 {
  "kind": "list",
  "items": [
   "**Pre-registered:** A₁ without $\\rho$ beat our repaired formula A₀′ in 2 settings (+0.9 and +1.0 percentage points in first-try approval), tied in 4, lost in none.",
   "**Exploratory, bidding:** local bids against prices matched a central planner's optimum in all 6 settings. Prices on A₀′ with greedy matching gained nothing, so the gain is the bidding.",
   "**Exploratory, with $\\rho$:** ranked first of ten realistic methods in all 6 settings, beating A₀′ by 1.8 to 3.0 points in 4, at the cost of 25–38% longer queue waits under heavy load (50 tasks per agent)."
  ]
 },
 {
  "kind": "image",
  "src": "/research/attraction/figure-10.png",
  "width": 1408,
  "height": 594,
  "alt": "Figure 10",
  "caption": "**Figure 10.** First-try approval against average wait as ρ is scaled (exploratory, 30 agents). With true success chances, ρ gains 5.9 points for about one tick of waiting; with learned chances, a similar gain costs about eight ticks."
 },
 {
  "kind": "p",
  "text": "**The audit.** On November 19, 2026 an audit found the engine had been reading task size, labels and some urgency from the git commits that later resolved the tasks, that is, from the future. Rerun under pre-registered rules with only data available at arrival: **[Observed]**"
 },
 {
  "kind": "image",
  "src": "/research/attraction/figure-11.png",
  "width": 1408,
  "height": 409,
  "alt": "Figure 11",
  "caption": "**Figure 11.** Most of A₁'s lead was information from the future. In the simulator, +1.5 points over the repaired formula became −0.6; on real commits, +4.8 over whoever committed last became −1.4."
 },
 {
  "kind": "list",
  "items": [
   "In the simulator, a +1.5 point lead over A₀′ fell to $-0.6$, a tie across all 6 settings.",
   "On real commits, a +4.8 point lead over a “most recent committer” rule (calibrated post hoc) reversed to $-1.4$."
  ]
 },
 {
  "kind": "p",
  "text": "One ability survived: **selective abstention.** With arrival data only, a confidence threshold let the engine assign 28% of real commits at 90.5% precision (2.7 errors per 100), against 87.1% and 4.2 errors for the recent-committer rule with its own cut-off."
 },
 {
  "kind": "p",
  "text": "**Lessons:**"
 },
 {
  "kind": "list",
  "items": [
   "**Occupancy should be a price:** subtracting congestion let local bidding match central optimization (exploratory).",
   "**Onboarding is time and information:** switching cost is time to load context, written in Appendix D as missing bits.",
   "**The hysteresis margin follows from the formula:** an agent already in a space has $\\lambda = 0$, so another space must beat it by $1 + \\lambda / t$; 3 ticks of loading and 10 of work give 1.3, the original margin. (Not tested: the simulator had no loading cost.)",
   "**Selectivity uses knowledge but cannot create it:** $\\rho$ was left out of the Attraction Field $A_\\Phi$, since arrival data held too little signal to justify waiting for a better specialist."
  ]
 },
 {
  "kind": "image",
  "src": "/research/attraction/figure-12.png",
  "width": 1408,
  "height": 533,
  "alt": "Figure 12",
  "caption": "**Figure 12.** How one Attraction Rate A₁ choice runs with no router: the hub publishes work, prices and ρ; each free agent goes where (rate − ρ) × time is largest, if above zero; contention raises a price and the displaced agent chooses again; review updates its success belief by Bayes' rule."
 },
 {
  "kind": "image",
  "src": "/research/attraction/figure-13.png",
  "width": 1408,
  "height": 801,
  "alt": "Figure 13",
  "caption": "**Figure 13.** Attraction Rate A₁ minus the repaired original A₀′, first-try approval, 30 agents, 50 seeds per setting. Without ρ (the frozen primary test) A₁ is better in 2 of 6 settings and worse in none; with ρ, better in 4 by 1.8–3.0 points. These inputs still held information from the future."
 },
 {
  "kind": "image",
  "src": "/research/attraction/figure-14.png",
  "width": 1408,
  "height": 480,
  "alt": "Figure 14",
  "caption": "**Figure 14.** Who made each later commit, first guess right, on 1,084 commits of 20 unseen repositories. Calibrated A₁ reaches 67.5% against 62.7% for whoever committed last; these inputs still read the commit's own files."
 },
 {
  "kind": "image",
  "src": "/research/attraction/figure-15.png",
  "width": 1408,
  "height": 480,
  "alt": "Figure 15",
  "caption": "**Figure 15.** The same, on 297 commits into files their author had not all touched. Whoever committed last leads at 47.8%, ahead of calibrated A₁ (42.8%)."
 },
 {
  "kind": "image",
  "src": "/research/attraction/figure-16.png",
  "width": 1408,
  "height": 620,
  "alt": "Figure 16",
  "caption": "**Figure 16.** Wrong names per 100 commits when a rule may decline to decide. Deciding on everything, A₁ gives 32.5 against 37.3 for whoever committed last; with a cut-off frozen for 90% right it decides on 39% of commits and gives 4.2."
 },
 {
  "kind": "h2",
  "text": "Appendix C. The Space Hub pull: fit read from the public record"
 },
 {
  "kind": "p",
  "text": "**The question.** Match₀ assumed declared skills and published requirements. On the real Space Hub, declared skills never once named the paths or channels events touched. Can fit be read from the public record instead?"
 },
 {
  "kind": "p",
  "text": "**Method.** For each event we measure how much of it falls on places the agent has acted in, weighting each place by its rarity (surprisal), discounted by idle time and open load. An agent is notified when this notify pull A₂ clears a threshold $\\tau$, set on the first 30% of events and then frozen. The method was sealed before any test event was scored. **[Observed (real hub record, read only)]**"
 },
 {
  "kind": "p",
  "text": "$$\\mathrm{pull}(a,e) = \\frac{h(a,e) + d(a,e)}{(1 + \\Delta t_a)(1 + n_a)} \\tag{11}$$"
 },
 {
  "kind": "p",
  "text": "$$h(a,e) = \\frac{\\sum_{\\ell \\in L(e)} w_\\ell \\, \\mathbf{1}[a \\text{ acted in } \\ell]}{\\sum_{\\ell \\in L(e)} w_\\ell}, \\qquad w_\\ell = -\\log_2 \\frac{|A_\\ell| + \\tfrac{1}{2}}{|A| + 1} \\tag{12}$$"
 },
 {
  "kind": "p",
  "text": "**Table 11.** Symbols of the notify pull A₂."
 },
 {
  "kind": "table",
  "header": [
   "Symbol",
   "Meaning"
  ],
  "rows": [
   [
    "$L(e),\\ \\ell$",
    "The places event $e$ touches (channels, directories), and one such place."
   ],
   [
    "$w_\\ell$",
    "Surprisal of place $\\ell$ in bits. $A_\\ell$ is the agents who have touched $\\ell$, $A$ all agents; each halving of the share adds one bit. The $+\\tfrac{1}{2}$ and $+1$ keep untouched places finite."
   ],
   [
    "$h(a,e)$",
    "Overlap: the share of the event's bits on places where $a$ has acted, in $[0, 1]$. $\\mathbf{1}[\\cdot]$ is 1 if true, else 0."
   ],
   [
    "$d(a,e)$",
    "1 if a declared skill names one of the places."
   ],
   [
    "$\\Delta t_a,\\ n_a$",
    "Days since $a$ was last active, and $a$'s unfinished tasks."
   ]
  ]
 },
 {
  "kind": "p",
  "text": "**Worked example.** With 20 agents, an event touches `src/world` (touched by 2 agents: $w = -\\log_2(2.5 / 21) = 3.07$ bits) and `README.md` (18 agents: $w = -\\log_2(18.5 / 21) = 0.18$ bits), $3.07 + 0.18 = 3.25$ bits in all. Agent B has committed in `src/world`, was active half a day ago ($\\Delta t_a = 0.5$) and has no open tasks ($n_a = 0$): $h = 3.07 / 3.25 = 0.94$, pull $0.94 / (1 + 0.5) = 0.63$, notified. Agent C has only edited `README.md`: $h = 0.18 / 3.25 = 0.06$, well below threshold. One specialist is pinged instead of all twenty."
 },
 {
  "kind": "p",
  "text": "See Figure 1."
 },
 {
  "kind": "p",
  "text": "**Results:**"
 },
 {
  "kind": "list",
  "items": [
   "**Less spam:** on 208 held-out Space Hub messages (123 answered), broadcast reached the replier 90% of the time with 8.40 wrong pings per message; A₂ reached them 80% of the time with 1.37, 84% fewer. With activity histories scrambled, it reached the replier 53% of the time, the same as random (52%).",
   "**Code follow-ups:** on 290 commits (24 with follow-up), A₂ sent 0.09 wrong pings per commit against 9.0 for broadcast.",
   "**Why it misses:** in 23 of the 24 misses, the replier had no prior activity at the event's places; the information was absent, not misused.",
   "**Scale:** in our calibrated router simulator at $10\\times$ the agents, broadcast spam rose from 8.8 to 83.8 wrong pings per message; under A₂ it held at 0.41–0.46, since agents with no history at a place exert no pull."
  ]
 },
 {
  "kind": "p",
  "text": "**What this means for Match₀.** Fit should come from where agents have acted, weighted by rarity; the scramble control shows the accuracy comes from that history, not tuning. In closed loops where every worker eventually touches every place, a yes/no “has acted here” record fills with ones, raising mean time-in-system to 6.99 steps (4.35 with decaying counts, 4.28 for an oracle). Fit must be kept as fading counts."
 },
 {
  "kind": "image",
  "src": "/research/attraction/figure-17.png",
  "width": 1408,
  "height": 707,
  "alt": "Figure 17",
  "caption": "**Figure 17.** Telling one agent only when confident. Attraction's top candidate sends 0.22–0.31 wrong notifications against about 0.68 for whoever was active last in simulated hubs, and 0.07 against 0.98 on real commits."
 },
 {
  "kind": "image",
  "src": "/research/attraction/figure-18.png",
  "width": 1408,
  "height": 528,
  "alt": "Figure 18",
  "caption": "**Figure 18.** As agents grow tenfold in calibrated simulated hubs, telling everyone rises from 8.8 to 83.8 wrong notifications per message, while the information-weighted pull stays at 0.41–0.46."
 },
 {
  "kind": "image",
  "src": "/research/attraction/figure-19.png",
  "width": 1408,
  "height": 512,
  "alt": "Figure 19",
  "caption": "**Figure 19.** Simulated swarms of 8, 30 and 100 agents: attraction gives every claim to the right agent, while the default rule is right 16%, 3.5% and 0.35% of the time."
 },
 {
  "kind": "h2",
  "text": "Appendix D. S₁, Bayes and the clocks: presence and fit as one probability"
 },
 {
  "kind": "p",
  "text": "**Formulation.** The chance that agent $a$ claims event $e$ on places $L(e)$ is a Bayesian posterior: its prior (how active it is now, its presence) times how much more than average $a$ works at those places (its fit). In logs this is a sum of bits:"
 },
 {
  "kind": "p",
  "text": "$$S_1(a,e) = \\log_2 P_{\\text{now}}(a) + \\Delta I(a,e) \\tag{13}$$"
 },
 {
  "kind": "p",
  "text": "$$\\Delta I(a,e) = \\frac{1}{|L(e)|} \\sum_{\\ell \\in L(e)} \\log_2 \\frac{P_a(\\ell)}{P(\\ell)} \\tag{14}$$"
 },
 {
  "kind": "p",
  "text": "**Table 12.** Symbols of the Bayes form A₃."
 },
 {
  "kind": "table",
  "header": [
   "Term",
   "Meaning"
  ],
  "rows": [
   [
    "$P_{\\text{now}}(a)$",
    "Presence: $a$'s share of recent platform activity, on fast-fading counters (the fast clock)."
   ],
   [
    "$P_a(\\ell)$",
    "Focus: share of $a$'s own activity at place $\\ell$, on slow counters (7-day half-life), pulled toward the background for agents with little history."
   ],
   [
    "$P(\\ell)$",
    "Share of all activity at $\\ell$, on the same 7-day clock."
   ],
   [
    "$\\Delta I(a,e)$",
    "Fit in bits: positive for specialists, near 0 for generalists, negative for newcomers. $2^{\\Delta I}$ turns it back into a multiplier."
   ]
  ]
 },
 {
  "kind": "p",
  "text": "**Worked example.** An event touches `src/world`, which holds 10% of activity ($P = 0.10$)."
 },
 {
  "kind": "list",
  "items": [
   "**Agent A** did 50% of all activity in the last hour ($P_{\\text{now}} = 0.50$) but only 5% of its work is here ($P_a = 0.05$): $$S_1 = \\log_2 0.50 + \\log_2(0.05 / 0.10) = -1.0 - 1.0 = -2.0 \\text{ bits} \\tag{15}$$",
   "**Agent B**, the specialist, did 10% of recent activity ($P_{\\text{now}} = 0.10$) with 60% of its work here ($P_a = 0.60$): $$S_1 = \\log_2 0.10 + \\log_2(0.60 / 0.10) = -3.32 + 2.58 = -0.74 \\text{ bits} \\tag{16}$$",
   "**Agent C**, a generalist, did 40% of recent activity ($P_{\\text{now}} = 0.40$) with 10% of its work here ($P_a = 0.10$): $$S_1 = \\log_2 0.40 + \\log_2(0.10 / 0.10) = -1.32 + 0.0 = -1.32 \\text{ bits} \\tag{17}$$"
  ]
 },
 {
  "kind": "p",
  "text": "B ranks first. Presence alone would pick A; fit alone gives C 0 bits, so presence is what brings generalists in."
 },
 {
  "kind": "p",
  "text": "**Results:**"
 },
 {
  "kind": "list",
  "items": [
   "**Synthetic hubs:** a single top-1 guess found the taker in 80%, 80% and 83% of events at $1\\times$, $3\\times$ and $10\\times$ workers, above the notify pull $A_2$ (77%, 77%, 79%). **[Observed (simulation)]**",
   "**Space Hub messages:** on 297 messages (already seen, nothing tuned), the Bayes form $A_3$ found the replier in 82% of cases, against 69% for $A_2$, 75% for presence alone and 49% for fit alone. **[Observed (seen data)]**"
  ]
 },
 {
  "kind": "p",
  "text": "**Clocks.** Holding fit fixed, we varied the presence half-life from 1 hour to 90 days on four large open-source repositories (over 190,000 scored events) and Space Hub chat. **[Observed]**"
 },
 {
  "kind": "p",
  "text": "See Figure 3."
 },
 {
  "kind": "p",
  "text": "A presence counter separates candidates only if its window holds several actions. At about 13 commits a day, CPython's hour before an event is often empty, so every candidate gets the default score; Linux, at 230 a day, fills it. Mixing three clocks (1 hour, 7 days, 90 days) with fitted weights was our cheapest gain: 9 to 15 percentage points on CPython, PyTorch and Rust, 3 on Linux."
 },
 {
  "kind": "p",
  "text": "**Lessons:**"
 },
 {
  "kind": "list",
  "items": [
   "**Velocity₀ moves to the agent:** it becomes presence $P_{\\text{now}}(a)$, on a window holding several actions and at least the usual pick-up time (1 hour for team chat, days or weeks for code, 120 seconds in live swarms).",
   "**Match₀ becomes $2^{\\Delta I}$:** onboarding cost folds into fit, since unfamiliarity is missing bits.",
   "**Presence and ownership run on separate clocks:** availability needs a fast clock, competence a long memory. Re-weighting the two on their own clocks changed nothing, so their 1:1 balance was right."
  ]
 },
 {
  "kind": "h2",
  "text": "Appendix E. Learned geometry: fit between neighbouring places"
 },
 {
  "kind": "p",
  "text": "**The question.** Fit credits an agent only for past work at the exact places an event touches. Are people who maintain *neighbouring* directories also good at the task?"
 },
 {
  "kind": "p",
  "text": "**Method.** The Bayes form $A_3$ is a single attention head whose place-to-place matrix is fixed to the identity. To learn which places are close, we fitted an unconstrained bilinear map from past follow-ups (the learned field $A_3^L$), giving each place two 16-number vectors whose dot products set cross-place pull. The score of agent $a$ on event $e$ is:"
 },
 {
  "kind": "p",
  "text": "$$\\mathrm{score}(a,e) = x_e^{\\top}\\, W\\, k_a + b_a, \\qquad W = U V^{\\top} \\tag{18}$$"
 },
 {
  "kind": "p",
  "text": "$x_e$ is the event's places (each weighted $1/|L(e)|$), $k_a$ is agent $a$'s vector of log-ratios $\\log_2\\bigl(P_a(\\ell)/P(\\ell)\\bigr)$ over places, $b_a = \\log_2 P_{\\text{now}}(a)$, and $U$, $V$ hold each place's two learned vectors. With $W$ equal to the identity this is exactly $A_3$. A softmax over the candidates, plus a “nobody will take it” option, turns scores into chances."
 },
 {
  "kind": "p",
  "text": "We trained strictly forward in time on three years of commits from four large open-source repositories, learning only from events whose 24-hour window had closed. The protocol was sealed before scoring. **[Observed]**"
 },
 {
  "kind": "p",
  "text": "**Results:**"
 },
 {
  "kind": "list",
  "items": [
   "**Gains:** learned geometry added 2.5 to 5.2 percentage points over presence on all four repositories. (On PyTorch the sealed run gave +0.7, because a merge bot dominated the log; the +4.1 used here is a rerun with bot accounts filtered, a step added after the sealed run.) Scrambling the learned matrix fell below the identity form $A_3$, so it encodes real structure. Freezing it mid-run cost 2 to 6 points: the geometry must keep updating as code changes.",
   "**What it learns:** neighbourhoods of related work, not ownership lines. In Rust, events in `library/core` pulled toward maintainers of `library/alloc`. About half the learned links were one-way.",
   "**Data needed:** it pays only after about 10,000 mature events. On Space Hub (about 300 messages), plain $A_3$ scored 82%, above every learned variant of $A_3^L$ (71–80%).",
   "**Open:** the pre-registered test of new directories could not be decided; they appeared only 3 to 42 times per codebase."
  ]
 },
 {
  "kind": "p",
  "text": "**Lesson.** Fit does spread to neighbouring modules, but learning that takes thousands of events. On small or new platforms the plain $\\Delta I$ routes better; learned geometry is an add-on for mature repositories, not a replacement."
 },
 {
  "kind": "image",
  "src": "/research/attraction/figure-20.png",
  "width": 1408,
  "height": 491,
  "alt": "Figure 20",
  "caption": "**Figure 20.** The learned field A₃ᴸ on four codebases, takers found with one notification. Most of the gain comes from presence clocks; the learned map adds 2.5–5.2 points, and scrambling it drops the rule below clocks alone."
 },
 {
  "kind": "image",
  "src": "/research/attraction/figure-21.png",
  "width": 1408,
  "height": 409,
  "alt": "Figure 21",
  "caption": "**Figure 21.** Takers found at no more than 0.10 wrong notifications per event (secondary, descriptive). The learned field with a “nobody will take it” option reaches 4–12 times S₁ in three codebases and twice in linux."
 },
 {
  "kind": "h2",
  "text": "Appendix F. Hierarchy and modules: what a space is"
 },
 {
  "kind": "p",
  "text": "**The question.** The attraction framework takes “space” as given. Can spaces be found in raw logs? And does a layer of coordinators emerge to handle work that spans several of them?"
 },
 {
  "kind": "p",
  "text": "**Method.** In a closed-loop toy world, 12 identical agents worked across 6 hidden topics of 4 places each. Agents got up to three times faster with practice, and familiarity faded exponentially. Each task went to the agent that could describe it in the fewest bits, and doing it reshaped that agent's profile. A share $p$ of tasks touched two or three topics. Modules were found without labels by grouping places that co-occur in events more often than chance (positive pointwise mutual information, PMI). The threshold for calling a “coordination layer” was pre-registered (10 seeds per setting). **[Observed (toy world)]**"
 },
 {
  "kind": "p",
  "text": "**Results:**"
 },
 {
  "kind": "list",
  "items": [
   "**Territories form on their own:** when an agent happened to take two tasks from one topic in a row, its counters tilted toward that topic, the next tasks from it preferred that agent, and the tilt deepened. The 12 agents split the six topics among themselves, finishing within 2% of an oracle.",
   "**Modules recovered:** place co-occurrence recovered the true modules exactly (Adjusted Rand Index 1.00) with cross-module traffic up to 25%.",
   "**No hierarchy on a flat log:** agents doing cross-module tasks just grew broad profiles; no coordinator tier formed.",
   "**Coordinators with a second log:** adding a higher-level log of cross-module moves, on a slower clock, produced a layer of 2 to 4 coordinators in 7 to 8 of 10 runs when cross-module traffic was 10% to 15%. It cost nothing in completion time, and vanished above 20%."
  ]
 },
 {
  "kind": "image",
  "src": "/research/attraction/figure-22.png",
  "width": 1408,
  "height": 609,
  "alt": "Figure 22",
  "caption": "**Figure 22.** Runs (of 10) in which a coordinator layer formed, against the share of events crossing module boundaries. It forms at about 10–15% crossing and melts from about 20%; modules found from the event stream behave much like the true ones."
 },
 {
  "kind": "p",
  "text": "**Why the layer appears and dissolves.** With 6 topics, an agent devoted to one topic is about $6 / (1 - p)$ times more concentrated than the baseline, an edge of $\\log_2 \\frac{6}{1 - p}$ bits on in-topic tasks. On the high-level log a crossing occurs once every $1 / p$ tasks, so a bridging specialist earns $\\log_2(1 / p)$ bits per crossing. Bridging pays only while it beats staying in a topic:"
 },
 {
  "kind": "p",
  "text": "$$\\log_2(1 / p) > \\log_2 \\frac{6}{1 - p} \\iff \\frac{1}{p} > \\frac{6}{1 - p} \\iff p < \\frac{1}{7} \\approx 14.3\\% \\tag{19}$$"
 },
 {
  "kind": "p",
  "text": "Near $p \\approx 14.3\\%$ the bridging edge fades, and it is gone by about 20%. **[Inferred]**"
 },
 {
  "kind": "p",
  "text": "**Lessons:**"
 },
 {
  "kind": "list",
  "items": [
   "**A space is a cluster of places that co-occur** in events, and can be read from the record.",
   "**Coordinators are specialists at boundaries,** not a separate kind of agent: the same attraction, with fit to the seams between spaces, on a slower, higher-level clock.",
   "**A coordinator layer needs near-modular work:** it lasts only while cross-boundary events stay $< 15\\%$."
  ]
 },
 {
  "kind": "image",
  "src": "/research/attraction/figure-23.png",
  "width": 1408,
  "height": 540,
  "alt": "Figure 23",
  "caption": "**Figure 23.** Closed-loop toy world, twelve agents, load 0.9. Territories hold below about 1 bit of routing randomness and dissolve by 10."
 },
 {
  "kind": "h2",
  "text": "Appendix G. Public git: does it hold at 100× scale?"
 },
 {
  "kind": "p",
  "text": "**Method.** We ran the module finder on three years of commits from four large open-source repositories (Rust, PyTorch, CPython and the Linux kernel; 377,950 commits). Maintainer files and code-ownership records were opened only after the modules were extracted and fingerprinted. **[Observed]**"
 },
 {
  "kind": "p",
  "text": "**Results:**"
 },
 {
  "kind": "list",
  "items": [
   "**Unsmoothed PMI breaks at scale:** as first specified, it gave positive scores to pairs of rare directories never changed in the same commit. At 15,000 to 250,000 commits, one runaway cluster swallowed 97% to 99.5% of directories. The pre-registered fix, adding $+\\tfrac{1}{2}$ to the expected co-occurrence count, split the repositories into 31 to 125 coherent modules.",
   "**The same flaw hit earlier Space Hub results:** in its main repository, 1,386 of 2,072 directory pairs scored as related had never been changed together. That result must not be cited until recomputed with smoothing.",
   "**Agreement with maintainers:** modules matched ownership above chance in all four repositories (Adjusted Rand Index 0.09 to 0.39), but beat a simple split by top-level folder in only two (PyTorch and CPython).",
   "**Boundary work is concentrated:** cross-module activity was 5 to 13 times more concentrated in particular people than chance (1.7 to 2.5 times under a stricter test controlling for each person's home module). These people form a smooth gradient, not a separate tier.",
   "**Long memory hurts:** a 70-day cross-module window lowered taker prediction by 3.6 to 11.5 percentage points in all four codebases, by ranking people who bridged modules weeks ago above those active now."
  ]
 },
 {
  "kind": "p",
  "text": "**Lessons:**"
 },
 {
  "kind": "list",
  "items": [
   "**What transfers:** finding spaces from co-occurrence, and fit at the seams between them (though modules beat a top-level folder split in only 2 of 4).",
   "**What does not:** months-long windows that ignore current presence hurt routing, and open-source projects show no coordinator tier. Every routing term must stay tied to presence.",
   "**Prior work:** clustering modules by co-change and studying boundary-spanning developers are established topics in software engineering research."
  ]
 },
 {
  "kind": "h2",
  "text": "Appendix H. Live tests A–C: availability, crowding and confidence"
 },
 {
  "kind": "p",
  "text": "**Setup.** AI coding agents worked on an isolated local copy of Space Hub's messaging, each with its own code and private notes the router could not see. The Attraction Field $A_\\Phi$ decided only *who was notified*; agents chose whether to claim. Each test was sealed before it ran. **[Observed (live agents)]**"
 },
 {
  "kind": "h3",
  "text": "Test A: Throughput, Shocks, and Availability"
 },
 {
  "kind": "p",
  "text": "14 clean runs of 60 coding tasks over six modules, with six agents growing to seven mid-run and three shocks: a new agent joined, the fastest was killed, the directories were reorganized."
 },
 {
  "kind": "p",
  "text": "**Table 13.** Live test A by arm."
 },
 {
  "kind": "table",
  "header": [
   "Dispatch Policy",
   "Notifications per Task",
   "Wrong Pings per Task",
   "Tasks Lost",
   "Success (Tests Passed)"
  ],
  "rows": [
   [
    "**$A_3$ (Presence $\\times$ Fit) Only**",
    "2.06",
    "1.07",
    "0.6%",
    "92.8%"
   ],
   [
    "**$A_3$ with Busy Agents Notified Last**",
    "**1.07**",
    "**0.07**",
    "**0%**",
    "**97.2%**"
   ],
   [
    "**Shuffled Order (Control)**",
    "1.76",
    "0.77",
    "1.1%",
    "96.1%"
   ],
   [
    "**Broadcast to All (2 seeds)**",
    "6.20",
    "5.26",
    "5.8%",
    "94.2%"
   ],
   [
    "**First Free Agent Takes Oldest Task**",
    "All notified",
    "—",
    "0%",
    "98.3%"
   ]
  ]
 },
 {
  "kind": "p",
  "text": "**Why raw presence failed live.** An agent that had just claimed a task and pushed an update 30 seconds earlier scored highest, got the next task, and declined it. In an exploratory look at the logs, 79% of first dispatches went to busy agents. In replays recent activity means “here”; live, it means “busy”."
 },
 {
  "kind": "p",
  "text": "Notifying busy agents last fixed this: the first agent notified claimed in 94% of dispatches. (That arm was planned in advance; applying the full verdict to it was decided after the results.) Broadcast lost work: when all were busy, all declined, and the pile-up of background processes crashed the workspace five times."
 },
 {
  "kind": "h3",
  "text": "Tests B and C: Asymmetric Thread Context and Reservation Holds"
 },
 {
  "kind": "p",
  "text": "Tests B and C (10 paired runs each) used threads opening with a *kickoff* message holding details that could not be guessed; three follow-ups relied on them unrepeated, so only an agent that had worked earlier in the thread could do them right."
 },
 {
  "kind": "p",
  "text": "**Findings:**"
 },
 {
  "kind": "list",
  "items": [
   "**The specialist is found:** the Bayes form $A_3$ ranked the context holder first in 98–100% of dispatches (fit alone 92–100%, presence alone only 27–38%).",
   "**Agents check themselves:** agents without the context declined 95–98% of follow-ups sent to them. Without that check (first free agent claims), 68% went to agents without context and success fell to 13.3%.",
   "**But work drifts away:** context holders claimed only 35–57% of follow-ups when first notified (busy, or notes pruned); the rest drifted to agents without context, and 35–47% were abandoned.",
   "**Holds in Test C:** when an agent's share of attraction reached $\\sigma(a) \\ge \\tfrac{1}{2}$, the task was held for it, re-offered once it was free, with one line reminding it of the thread."
  ]
 },
 {
  "kind": "p",
  "text": "See Figure 5."
 },
 {
  "kind": "p",
  "text": "Across 60 context-dependent follow-ups per arm:"
 },
 {
  "kind": "list",
  "items": [
   "Holding work cut follow-ups taken by agents without context to 0–1.7%.",
   "Lost tasks fell to 17% with the reminder line (31.7% without), from 47% under free drift.",
   "Success topped out at 43.3% in both hold arms, limited by how much the agents' notes retained, not by routing."
  ]
 },
 {
  "kind": "h3",
  "text": "Test D Pilots: Congestion in Fine-Grained Tasks"
 },
 {
  "kind": "p",
  "text": "In exploratory, unscored pilots, an event-side version with no congestion term sent every free agent to the same best place: 97 notifications for 10 tasks. Dividing by congestion gave 27 workspace moves for 10 tasks, 19 wasted: a divisor never reaches zero, so a crowded space with pending work keeps pulling. Formal trials stopped after 1 of 12 planned runs; the question moved to the platform replays in Appendix I."
 },
 {
  "kind": "p",
  "text": "**Lessons:**"
 },
 {
  "kind": "list",
  "items": [
   "**Availability $F(a)$ is needed:** 1 for free agents, about 0.05 for busy ones.",
   "**Congestion as a subtracted price (hypothesis, from pilots and Appendix B; tested in Appendix I):** $T^{+}(s) = \\max\\bigl(0, T(s) - \\text{Occ}(s)\\bigr)$ stops a space with as many agents as tasks from pulling more.",
   "**Confident routing earns a hold:** when $\\sigma(a) \\ge \\tfrac{1}{2}$, keep the work for that specialist, computing the share without availability $F$.",
   "**Agent judgement is the safety net:** agents without context declined most work they could not do."
  ]
 },
 {
  "kind": "image",
  "src": "/research/attraction/figure-24.png",
  "width": 1408,
  "height": 343,
  "alt": "Figure 24",
  "caption": "**Figure 24.** Live test B: follow-ups that only the agent holding the thread's context can do well, 2 seeds per arm. First-claim-wins lets a wrong agent take 68.3% of follow-ups; attraction (frozen S₁) 11.7%, with 41.7% done right."
 },
 {
  "kind": "h2",
  "text": "Appendix I. The simulation loop, rounds 1–6: agents choosing spaces on today's hub"
 },
 {
  "kind": "p",
  "text": "**The question.** Does the whole decentralized field, where agents move between workspaces and their moves reshape it, beat Space Hub's current dispatch rule?"
 },
 {
  "kind": "p",
  "text": "**The simulated world.** We replayed Space Hub: 19 historical agents with their real project memberships, each starting where it did most of its work. Tasks arrived as recorded across 63 real agent work sessions, at $1\\times$, $10\\times$ and $30\\times$ volume, plus a 57-agent hub at $10\\times$. A task's true taker is whoever completed it in the logs."
 },
 {
  "kind": "p",
  "text": "Discussion-task claim and success rates came from Live Tests B and C; code and module rates are stated assumptions. Presence was a 60-second heartbeat, there were no global locks, and joining another project needed a request that could be refused. Every round was frozen before scoring (20–40 random seeds per arm; paired differences with 95% bootstrap confidence intervals). **[Observed (simulation)]**"
 },
 {
  "kind": "p",
  "text": "**Table 14.** Rules compared in the hub replay."
 },
 {
  "kind": "table",
  "header": [
   "Baseline Strategy Arm",
   "Decision Rule"
  ],
  "rows": [
   [
    "**drift**",
    "Free agents move by the Attraction Field $A_\\Phi(a,s)$, with subtractive congestion pricing and the 1.3 hysteresis threshold."
   ],
   [
    "**today's hub**",
    "Free agents claim the oldest unassigned task in their own spaces (“oldest task first”)."
   ],
   [
    "**fixed**",
    "Agents never leave their home workspace."
   ],
   [
    "**joining**",
    "Drift plus moves into other spaces (judged from public summaries) and human-commissioned single-task helpers."
   ],
   [
    "**oracle**",
    "Each task goes to its true historical specialist, at the usual acceptance rates."
   ]
  ]
 },
 {
  "kind": "p",
  "text": "**Table 15.** Replay rounds and results."
 },
 {
  "kind": "table",
  "header": [
   "Round",
   "What was tested",
   "Findings"
  ],
  "rows": [
   [
    "**1**",
    "Full $A_\\Phi$ against all baselines.",
    "Drift beats *fixed* (about 25 percentage points fewer abandoned, about 20 more done right) but trails today's dispatch by 6–7 points. Every task it left undone was stranded by a permanent hold, which happens whenever the named specialist is absent or wrong (about 25% of holds). Congestion pricing, fit and price form made no difference."
   ],
   [
    "**2**",
    "Fit from verified work (accepted commits) instead of raw activity.",
    "Null ($\\pm 1$ point). Projects mostly have one owner; code tasks reach the right taker 93–94% of the time without fit."
   ],
   [
    "**3**",
    "Release holds on an explicit pass or after a 1-hour timeout.",
    "Recovers all stranded tasks (+6.6 to +7.5 points). Drift ties today's dispatch (within 1 point), but not today's dispatch with the same timeout. **The ceiling:** every policy sending free agents to waiting work lands near 71%, below the oracle's 73–74%."
   ],
   [
    "**4**",
    "Hidden synthetic skill levels (poor, average, good).",
    "Null: fit from activity, from commits, or none scored 70.3–71.4%; low-skill agents got work at the random rate. A real choice of space arose in only 0.1–0.3% of decisions."
   ],
   [
    "**5**",
    "Round 4 again at $30\\times$ volume and on a $3\\times$ larger hub.",
    "Still null (70.1–70.4%); real choices rose only to 0.6%. Fit is dropped for hubs of this shape."
   ],
   [
    "**6**",
    "Joiners as guests (claim only work waiting $\\ge 1$ hour).",
    "Slightly beats free joining at $10\\times$ (+0.8 points done right, 3.6 fewer tasks missing context), but joining still costs 10–12 points against drift alone: speed bought with quality."
   ]
  ]
 },
 {
  "kind": "p",
  "text": "See Figure 6."
 },
 {
  "kind": "p",
  "text": "**What we learned:**"
 },
 {
  "kind": "list",
  "items": [
   "**Backlog tension drives all the gains.** Without it, 1-hour pick-up falls about 26 points at base volume (3–4 at $10\\times$ and $30\\times$); agents that cannot move lose about 20 points.",
   "**Holds must be released.** Release is a protocol, not a signal, yet it gives all of Round 3's recovery; released holds then tie no hold, as agents already turn down tasks they lack context for.",
   "**Fit, congestion pricing and price form add nothing here**, across three volumes and two hub sizes (intervals within $\\pm 1$ point).",
   "**Why:** single-owner repositories, separate assignments and sparse arrivals pre-route the hub. When an agent frees up, usually at most one of its spaces has work, so the real choice is which task within a workspace, not which workspace."
  ]
 },
 {
  "kind": "image",
  "src": "/research/attraction/figure-25.png",
  "width": 1408,
  "height": 632,
  "alt": "Figure 25",
  "caption": "**Figure 25.** Round 1, work done right for every rule at real volume and 10×, 20 seeds each. Every variant with a permanent hold lands at 63–66%, whatever its crowding or fit term; rules without that hold reach 70.5–71.3%, against 73.3–74.0% for the oracle."
 },
 {
  "kind": "image",
  "src": "/research/attraction/figure-26.png",
  "width": 1408,
  "height": 413,
  "alt": "Figure 26",
  "caption": "**Figure 26.** Rounds 4 and 5, with a hidden skill per agent and project (40 seeds per scenario). Every fit variant lands at 70.1–71.4% done right, and takes by agents poor at the project stay at 33–38%, about chance: on this hub, fit does not learn hidden skill."
 },
 {
  "kind": "image",
  "src": "/research/attraction/figure-27.png",
  "width": 1408,
  "height": 622,
  "alt": "Figure 27",
  "caption": "**Figure 27.** Round 6, speed against quality. At 10× volume, joining other spaces raises pick-up within the hour from about 37–40% to 42–69% but lowers work done right from about 70–71% to 58–60%."
 },
 {
  "kind": "h2",
  "text": "Appendix J. Assumptions ledger"
 },
 {
  "kind": "h3",
  "text": "Idealized inputs identified and permanently removed"
 },
 {
  "kind": "p",
  "text": "Every unrealistic assumption or privileged input our audits found was removed before evaluation:"
 },
 {
  "kind": "list",
  "items": [
   "**Leaks from the future:** task size, category labels and part of the urgency signal came from the commits that later resolved each task. Purging them on November 19, 2026 removed the apparent advantage of Attraction Rate A₁ (Appendix B).",
   "**Hidden-skill oracles:** policies given the true, unobservable skills were replaced by Bayesian estimates or parameter-free baselines.",
   "**Early multi-agent simulations:** global locks, inputs agents could not see, idle agents counted as congestion, biased oracles, self-service joins, synthetic steady ownerless workloads, and a 120-second timescale were removed, and every result obtained under them retracted before the pre-registered replay rounds of Appendix I."
  ]
 },
 {
  "kind": "h3",
  "text": "Operational assumptions retained in platform replays"
 },
 {
  "kind": "p",
  "text": "**Table 16.** Assumptions that remain in the hub replay."
 },
 {
  "kind": "table",
  "header": [
   "Model Parameter / Mechanism",
   "Value",
   "Basis"
  ],
  "rows": [
   [
    "**Discussion Tasks: Claim Probability** (Specialist / Other)",
    "0.60 / 0.04",
    "Measured in Live Tests A–C."
   ],
   [
    "**Discussion Tasks: Success Rate** (Specialist / Other)",
    "0.69 / 0.17",
    "Measured in Live Tests A–C."
   ],
   [
    "**Module Tasks: Claim Probability / Success** (Specialist; Other)",
    "0.95 / 0.85; 0.30 / 0.35",
    "Stated assumption."
   ],
   [
    "**Code Development: Claim Probability / Success** (Specialist; Other)",
    "0.95 / 0.85; 0.95 / 0.60",
    "Stated assumption."
   ],
   [
    "**Secondary Contributor Skill Improvement**",
    "+0.05 per project success (capped at 3)",
    "Stated assumption."
   ],
   [
    "**Task Rejections (Passes)**",
    "Permanent for role/context; 30 min for workload",
    "Live behavior: specialists declined mainly when saturated."
   ],
   [
    "**Task Execution Latency**",
    "Lognormal (median: 10 minutes)",
    "Stated assumption."
   ],
   [
    "**Workspace Join Overhead and Approval**",
    "60 s base + 20 s per project + approval delay (median: 30 min); 30% rejection rate",
    "Hypothesis, stated as such."
   ],
   [
    "**Single-Task Auxiliary Workers**",
    "Human-commissioned for tasks waiting $\\ge 1$ hour; 5 min boot; 0.35 success",
    "Stated assumption."
   ],
   [
    "**Agent Presence Broadcast**",
    "60-second heartbeat",
    "Matches Space Hub publishing."
   ],
   [
    "**Swarm Scaling Limit**",
    "Up to 57 agents",
    "Compute limits prevented larger replays."
   ]
  ]
 },
 {
  "kind": "h3",
  "text": "Operational assumptions in live agent trials"
 },
 {
  "kind": "p",
  "text": "The live tests used a small, fast model with scratchpads the router could not see. In Tests B and C, agents could not re-read earlier kickoff messages, unlike on Space Hub, so the 43.3% success ceiling is pessimistic: agent memory set it, not routing. Presence $P_{\\text{now}}$ and availability $F$ played no part in replay workspace choice: both are agent-level and cancel when one worker compares spaces."
 },
 {
  "kind": "h2",
  "text": "Appendix K. Strength of each claim"
 },
 {
  "kind": "p",
  "text": "**Table 17.** Strength of each claim."
 },
 {
  "kind": "table",
  "header": [
   "Claim",
   "Status",
   "Basis"
  ],
  "rows": [
   [
    "**Expiring tension freezes multiplicative products; tension that grows fixes it.**",
    "**Established**",
    "Large synthetic simulations; our software replication."
   ],
   [
    "**Past place activity weighted in bits identifies task takers; scrambling identities drops accuracy to chance.**",
    "**Established**",
    "Pre-registered, sealed test on real Space Hub messages and commits."
   ],
   [
    "**Presence needs a clock matched to typical task pick-up time.**",
    "**Established**",
    "Four open-source repositories, 190,000+ scored events; Space Hub chat (seen data)."
   ],
   [
    "**Recent activity is not availability; busy agents should be notified last.**",
    "**Suggestive**",
    "Shown in Live Test A; the full classification was made post hoc from the trial logs."
   ],
   [
    "**Reserving tasks for identified specialists prevents misrouting.**",
    "**Established**",
    "Pre-registered Live Test C (sealed before running, designed after Test B's first seed), paired with B."
   ],
   [
    "**On today's hub, backlog tension and released holds do all the measurable coordination; fit and congestion pricing add nothing.**",
    "**Established (Simulation)**",
    "Six pre-registered replay rounds (20–40 seeds each), three volumes, two hub sizes."
   ],
   [
    "**Congestion works better as a subtractive price than as a divisor.**",
    "**Suggestive**",
    "Exploratory simulations and live pilots; no difference in sparse hub replays."
   ],
   [
    "**Workspaces can be extracted from co-occurrence logs; coordinators are agents whose fit is to module boundaries.**",
    "**Suggestive**",
    "Synthetic settings; matched maintainer boundaries in four open-source repositories (beating directory rules in 2 of 4); Space Hub modularity needs re-checking with proper smoothing."
   ],
   [
    "**Agents choosing workspaces by the Attraction Field $A_\\Phi$ beat simple dispatch where choices are dense.**",
    "**Open**",
    "Not yet tested at scale with many concurrent agents."
   ]
  ]
 },
 {
  "kind": "h2",
  "text": "Appendix L. Routing tasks from their text"
 },
 {
  "kind": "h3",
  "text": "L.1 Setting and answer key"
 },
 {
  "kind": "p",
  "text": "Can $A_0$ route an unlabelled task sentence to the right agent? A shared workspace holds several projects and four AI coding agents, divided by kind of work, not by project. The **frontend** agent builds pages, components, styles and browser behaviour. The **backend** agent builds and fixes server code (endpoints, services, parsers, databases), including bug fixes found by others. The **infrastructure** agent owns CI, containers, build configuration, shell scripts and command-line tools. The **reviewer** agent writes documentation and tests, reviews and audits code, and investigates causes before code is changed. Each agent is defined by one description file. The router sees only the task sentence and its project name. It runs on 2 CPU cores, calls no generative model and is given nothing hand-written about tasks."
 },
 {
  "kind": "list",
  "items": [
   "**Set 1** (99 tasks, 5 of our projects) was used to choose the settings. It contains groups of near-identical tasks, which favour comparing with past tasks. Expected agents: backend 39, reviewer 32, infrastructure 25, frontend 3.",
   "**Set 2** (153 tasks, 12 projects: 7 popular open-source projects, mostly real open GitHub issues in their authors' wording, and 5 of ours) is held out. Its labels were written in a separate file before the router ran, and the strategy was run once, unchanged. Expected agents: infrastructure 57, backend 52, frontend 28, reviewer 13, and 3 noise tasks (spam, a complaint, non-English text) for which any pick is wrong."
  ]
 },
 {
  "kind": "p",
  "text": "**Answer key.** Both sets were drafted with the help of an AI assistant from real repositories and issues. One person assigned an expected agent to each task by four written rules (documentation, tests, reviews and investigations to the reviewer; CI, Docker, build, scripts and command-line code to infrastructure; server-side fixes and features to the backend, even when the task is a bug; browser-rendered pages and styles to the frontend). 29 tasks of Set 1 and 61 of Set 2 also have a second acceptable agent, a sign of how often the right answer is debatable. There was no second labeller."
 },
 {
  "kind": "p",
  "text": "**Score and uncertainty.** A first pick counts if it is the expected or the acceptable agent (“right or acceptable”). Each configuration runs 20 times (seeds 1–20), each a different task order, and we report the mean. The *run range* is the lowest and highest of the 20 runs. The *95% interval* comes from resampling the tasks (10,000 draws), and pairs of methods are compared with McNemar's exact test. Two things make these intervals narrow: they describe the average over 20 orders, while one deployment sees a single order, and resampling reuses each task's recorded outcome instead of rerunning the router. The drop of about ten points from Set 1 to Set 2 may come from tuning on Set 1, from Set 2's greater variety, or both; the data cannot separate them."
 },
 {
  "kind": "h3",
  "text": "L.2 The formula and why only the match decides the agent"
 },
 {
  "kind": "p",
  "text": "For a single task $e$ in project $p$, the router used $A_0$ in this form:"
 },
 {
  "kind": "p",
  "text": "$$\\mathrm{attraction}(a,e) = \\frac{\\mathrm{Tension}_0(e) \\cdot \\mathrm{Match}_0(a,e) \\cdot (1 + \\ln(1 + \\mathrm{Velocity}_0(p)))}{(1 + \\mathrm{Occupancy}_0(p)) \\cdot \\mathrm{Entry}_0(p)} \\tag{20}$$"
 },
 {
  "kind": "p",
  "text": "$\\mathrm{Tension}_0(e)$ is the task's urgency (1 to 5, constant while it waits), $\\mathrm{Velocity}_0(p)$ counts tasks of $p$ finished in the last 10 ticks, $\\mathrm{Occupancy}_0(p)$ counts agents working on or recently finishing a task of $p$, and $\\mathrm{Entry}_0(p)$ counts the distinct kinds of waiting tasks. The match is the text match $m_{\\mathrm{text}}(a,e)$ of L.3."
 },
 {
  "kind": "p",
  "text": "**Proposition 1.** *For a fixed task $e$ with $\\mathrm{Tension}_0(e) > 0$, the agent with the highest $\\mathrm{attraction}(a,e)$ is the agent with the highest $\\mathrm{Match}_0(a,e)$.*"
 },
 {
  "kind": "p",
  "text": "*Proof.* Every term but the match is positive and the same for all agents, so $\\mathrm{attraction}(a,e) = \\mathrm{Match}_0(a,e)\\cdot K(e)$ with $K(e) > 0$, which keeps the agents' order. $\\blacksquare$"
 },
 {
  "kind": "p",
  "text": "The other terms decide which waiting task is served first, and so which agents are still free; they never decide which free agent a task goes to. The repaired $A_0'$ (Equation 8) breaks the proposition, because its entry cost depends on the agent."
 },
 {
  "kind": "p",
  "text": "**Two earlier phases explain the method.** In Phase 1, the formula was replayed over real commits with agents simulated as skill numbers. Urgency set to 0 after 15 ticks stalled the queue in all 90 runs, so that rule was removed. Most of the benefit came from the match term; the other terms added 4 to 7 points. Learning skill numbers from approvals made routing worse: the best free agent was picked 89% of the time with the true skills left alone and 70% when they were updated. In Phase 2, the router ran live in a shared workspace with five projects and four real AI coding agents. It read tasks through a fixed word list, and only 7 of the 18 reviewed first picks were approved; 6 of the 19 tasks contained no word from the list. The arithmetic was right and the inputs were wrong: the bottleneck was reading the task. On Set 1 the same word list scores 45%."
 },
 {
  "kind": "h3",
  "text": "L.3 The method"
 },
 {
  "kind": "list",
  "items": [
   "**Embed.** A small embedding model (BAAI/bge-small-en-v1.5, 8-bit ONNX export, 35 MB, run with onnxruntime on 2 CPU threads, inputs cut at 256 tokens) maps a text to a 384-number unit vector; similarity is the dot product.",
   "**Description score.** Each agent's file is cut into passages (8, 9, 9 and 7 for the frontend, backend, infrastructure and reviewer agents). The task, prefixed with the model's search instruction (“Represent this sentence for searching relevant passages: ”), is compared with every passage; the best one counts, minus the agent's average over earlier tasks.",
   "**Past-task score.** Similarity to the single most similar task already filed under the agent (task against task, no instruction).",
   "**Standardise** each score across agents (subtract the mean, divide by the standard deviation). An agent with no past tasks contributes 0 to that term.",
   "**Combine**:"
  ],
  "ordered": true
 },
 {
  "kind": "p",
  "text": "$$c(a) = 0.25 \\cdot z(\\mathrm{desc}) + 0.75 \\cdot z(\\mathrm{past}) \\tag{21}$$"
 },
 {
  "kind": "list",
  "items": [
   "**Rescale** so the best agent gets $m_{\\mathrm{text}} = 1.0$ and the worst $0.1$ (all equal: 0.55).",
   "**Learn.** When a pick is wrong, a person moves the task to the expected agent, and the task joins that agent's past tasks; otherwise it joins the picked agent's. Corrections here are simulated from the answer key. Nothing is trained: it is a nearest-neighbour lookup over lists that only grow."
  ],
  "ordered": true
 },
 {
  "kind": "p",
  "text": "The weights 0.25/0.75 and the single nearest task were chosen on Set 1; description weight 0 scored about the same there (74% against 73%). In each run, 0, 1 or 2 tasks arrive per tick and urgency is drawn from 1 to 5. By default nobody is busy; in the load runs a task takes 2 to 5 ticks."
 },
 {
  "kind": "h3",
  "text": "L.4 Results"
 },
 {
  "kind": "table",
  "header": [
   "Configuration",
   "Set 1 (95% interval)",
   "Set 1 run range",
   "Set 2 (95% interval)",
   "Set 2 run range",
   "Strategy vs this, Set 2"
  ],
  "rows": [
   [
    "**The strategy**",
    "**74%** (69–78%)",
    "69–79%",
    "**64%** (59–69%)",
    "57–70%",
    "—"
   ],
   [
    "Same strategy, keyword (TF-IDF) vectors",
    "70% (65–75%)",
    "—",
    "53% (48–57%)",
    "—",
    "+11 pts ($p = 0.007$)"
   ],
   [
    "Description files only",
    "52% (42–61%)",
    "—",
    "51% (43–58%)",
    "—",
    "+13 pts ($p < 0.001$)"
   ],
   [
    "Keyword vectors, description files only",
    "45% (36–54%)",
    "—",
    "44% (36–51%)",
    "—",
    "—"
   ],
   [
    "Always the most common agent",
    "47% (37–58%)",
    "—",
    "45% (38–53%)",
    "—",
    "+19 pts ($p < 0.001$)"
   ],
   [
    "The strategy, no corrections",
    "28% (25–30%)",
    "6–49%",
    "38% (36–41%)",
    "24–52%",
    "+26 pts ($p < 0.001$)"
   ]
  ]
 },
 {
  "kind": "p",
  "text": "*Table L.1: Headline results, mean of 20 task orders. For the run without corrections the run range is the better guide, because its uncertainty lies between runs, not between tasks.*"
 },
 {
  "kind": "p",
  "text": "On Set 1 the strategy leads keyword vectors by 4 points (paired $p = 0.80$, within chance); on Set 2 by 11. Set 1's near-identical tasks share words, so keywords find them; on Set 2 a task rarely shares exact words with an earlier one. By expected agent on Set 2: frontend 74%, infrastructure 67%, backend 65%, reviewer 39%, noise 0%. A plausible but untested reason for the weak reviewer score: a request to investigate a server bug reads much like a request to fix it. By project, Set 2 ranges from 48% to 91% (4 to 17 tasks each)."
 },
 {
  "kind": "table",
  "header": [
   "Group",
   "Configuration",
   "Set 1",
   "Set 2"
  ],
  "rows": [
   [
    "**Describing the agents** (no past tasks)",
    "One-line description<br>Paragraph<br>Paragraph, usual similarity subtracted<br>Full description files<br>Word list and skill numbers (Phase 2)",
    "52%<br>46%<br>46%<br>52%<br>45%",
    "—<br>—<br>—<br>51%<br>—"
   ],
   [
    "**Using past tasks** (description/past weights 0.25/0.75)",
    "Single nearest task<br>Mean of the 3 nearest<br>Mean of all<br>Meaning plus shared rare words (BM25)<br>Trained classifier",
    "73%<br>73%<br>71%<br>72%<br>64%",
    "—<br>—<br>—<br>—<br>—"
   ],
   [
    "**Other ways, tasks taken one at a time** (base: 74% / 61%)",
    "Vote among the 5 nearest<br>Vote among the 10 nearest<br>Nearest within the same project<br>Moved tasks counted slightly closer",
    "69%<br>64%<br>70%<br>74%",
    "64%<br>64%<br>66%<br>61%"
   ],
   [
    "**Project information**",
    "Name in the text; same-project tasks counted closer; project file profile",
    "72–75%",
    "—"
   ],
   [
    "**Carrying learning over**",
    "Each project routed with the other four projects' tasks only; then also learning",
    "66%; 78%",
    "—"
   ],
   [
    "",
    "Set 2 starting with Set 1's tasks filed (empty start: 64%)<br>Set 1's tasks only, nothing learned on Set 2",
    "—<br>—",
    "64%<br>53%"
   ],
   [
    "**Examples given up front** (set aside: hand-written knowledge)",
    "1, 2, 3, 5 examples per agent, nothing learned<br>5 examples, every later task confirmed<br>5 examples, half of wrong picks moved<br>5 examples, nothing corrected<br>As above, keeping only the latest 5 / 20 past tasks",
    "49%, 53%, 57%, 60%<br>79%<br>71%<br>63%<br>44% / 62%",
    "—<br>—<br>—<br>—<br>—"
   ],
   [
    "**Project track record** (set aside: found from Set 2's misses)",
    "Lean toward the agents a project's earlier tasks went to, medium / heavy weight",
    "74% / 73%",
    "67% / 70%"
   ]
  ]
 },
 {
  "kind": "p",
  "text": "*Table L.2: Secondary experiments. Most differences of 1 to 3 points are within chance; the “one at a time” rows use the description files without the formula.*"
 },
 {
  "kind": "h3",
  "text": "L.5 Corrections, learning and asking when unsure"
 },
 {
  "kind": "p",
  "text": "Without corrections, an early mistake filed under the wrong agent attracts similar tasks to that agent for the rest of the run. On Set 1 (paragraph descriptions, match alone):"
 },
 {
  "kind": "table",
  "header": [
   "Feedback",
   "Set 1"
  ],
  "rows": [
   [
    "Description only, nothing learned",
    "46%"
   ],
   [
    "Every task filed under its right agent",
    "73%"
   ],
   [
    "Every wrong pick moved to the right agent",
    "74%"
   ],
   [
    "Half / a quarter of wrong picks moved",
    "61% / 55%"
   ],
   [
    "Wrong picks marked wrong, right agent not named",
    "49%"
   ],
   [
    "Marked wrong and held against that agent",
    "55%"
   ],
   [
    "No feedback (full router: 28%, runs 6–49%)",
    "38%"
   ]
  ]
 },
 {
  "kind": "p",
  "text": "*Table L.3: Feedback needed for learning (Set 1, paragraph descriptions, match alone).*"
 },
 {
  "kind": "p",
  "text": "Approvals are not needed; the useful part of a correction is the name of the right agent. Missed corrections hurt much more than misdirected ones:"
 },
 {
  "kind": "table",
  "header": [
   "Corrections",
   "Set 1",
   "Set 2"
  ],
  "rows": [
   [
    "All, 75%, 50%, 25%, none of the wrong picks moved",
    "74, 69, 60, 49, 28%",
    "64, 63, 59, 52, 38%"
   ],
   [
    "All moved, 10%, 20%, 30% of them to another wrong agent",
    "72, 70, 68%",
    "63, 62, 60%"
   ]
  ]
 },
 {
  "kind": "p",
  "text": "*Table L.4: Missed against misdirected corrections.*"
 },
 {
  "kind": "image",
  "src": "/research/attraction/figure-28.png",
  "width": 1408,
  "height": 524,
  "alt": "Figure 28",
  "caption": "**Figure 28.** Accuracy as fewer wrong picks are corrected. With a quarter moved, the router falls to the level of description files alone; with none, below it (28% on set 1, 38% on set 2)."
 },
 {
  "kind": "p",
  "text": "Accuracy grows with the record. By fifths of a run it was 58, 70, 76, 79 and 85% on Set 1 and 56, 64, 66, 68 and 65% on Set 2; on Set 1, by tasks already filed, from 58% (0–19 filed) to 86% (79–98)."
 },
 {
  "kind": "image",
  "src": "/research/attraction/figure-29.png",
  "width": 1408,
  "height": 458,
  "alt": "Figure 29",
  "caption": "**Figure 29.** Accuracy in each fifth of a run. Set 1 rises from 58% to 85%; held-out set 2 from 56% to 68% before ending at 65%."
 },
 {
  "kind": "p",
  "text": "**Asking when unsure.** The lead of the best agent over the second separates right from wrong picks. Routing only the most confident 80, 60, 40 or 20% of tasks gives 79, 85, 89 and 93% on Set 1 and 67, 70, 75 and 80% on Set 2."
 },
 {
  "kind": "image",
  "src": "/research/attraction/figure-30.png",
  "width": 1408,
  "height": 524,
  "alt": "Figure 30",
  "caption": "**Figure 30.** Accuracy when only the most confident picks are routed. Routing the top 20% raises set 1 to 93% and held-out set 2 to 80%; the ranking transfers, the gain is smaller."
 },
 {
  "kind": "p",
  "text": "As a rule, a threshold on the lead was set on Set 1 for a target accuracy and used unchanged on Set 2:"
 },
 {
  "kind": "table",
  "header": [
   "Target on Set 1",
   "Set 1: asked; right of the rest",
   "Set 2: asked; right of the rest",
   "Set 2: router's own pick on asked tasks"
  ],
  "rows": [
   [
    "80%",
    "25%; 80%",
    "28%; 70%",
    "51%"
   ],
   [
    "85%",
    "43%; 85%",
    "46%; 72%",
    "55%"
   ],
   [
    "90%",
    "67%; 92%",
    "68%; 78%",
    "59%"
   ],
   [
    "95%",
    "94%; 97%",
    "93%; 88%",
    "64%"
   ]
  ]
 },
 {
  "kind": "p",
  "text": "*Table L.5: The asking rule, with its threshold set on Set 1 and used unchanged on Set 2.*"
 },
 {
  "kind": "p",
  "text": "The signal transfers: the asked tasks are the hard ones on both sets. The accuracy target does not: on Set 2 a lead of the same size is right less often, so the lead keeps its ranking but not its meaning. A live router would have to set its threshold from its own recent history (not tested). At the 80% threshold, agents start wrong work on 22% of Set 2 tasks instead of 36%."
 },
 {
  "kind": "h3",
  "text": "L.6 Load and the formula's other terms"
 },
 {
  "kind": "p",
  "text": "With nobody busy, the full formula ties the match alone (74% against 73% on Set 1, 64% both on Set 2). The repaired $A_0'$ scores 72%: its entry cost overrode a right best match about 5.2 times per run, and the two picked the same agent for 85% of tasks. The attraction value says nothing about rightness (median 2.12 right, 2.12 acceptable, 2.10 wrong), and urgency level made no difference (72–75% at each level)."
 },
 {
  "kind": "p",
  "text": "Under load (arrivals and work times simulated, so direction only):"
 },
 {
  "kind": "table",
  "header": [
   "Setting (Set 1, agents busy)",
   "Right or acceptable",
   "Wrong picks per run, best match right but busy"
  ],
  "rows": [
   [
    "Nobody busy",
    "74%",
    "0 of 26.1"
   ],
   [
    "Arrivals 6 times slower than the heaviest load",
    "66%",
    "10.7 of 34.0"
   ],
   [
    "Arrivals 3 times slower",
    "53%",
    "24.6 of 46.6"
   ],
   [
    "Heaviest load, formula as written",
    "44%",
    "33.0 of 55.9"
   ],
   [
    "Heaviest load, repaired $A_0'$ / match alone",
    "43% / 46%",
    "33.6 / 28.5"
   ],
   [
    "Heaviest load, project profile on",
    "43–44%",
    "—"
   ],
   [
    "Heaviest load, half of wrong picks moved",
    "40%",
    "—"
   ],
   [
    "Heaviest load, description files only",
    "38%",
    "—"
   ]
  ]
 },
 {
  "kind": "p",
  "text": "*Table L.6: Routing under simulated load (direction only).*"
 },
 {
  "kind": "p",
  "text": "Under load the formula gives a task to whoever is free. Its other terms never sent a task away from a right, free best match; $A_0'$ did so 0.1 times per run. Availability, not the formula, limits the result."
 },
 {
  "kind": "h3",
  "text": "L.7 Where misses come from, cost"
 },
 {
  "kind": "p",
  "text": "Each wrong pick, counted in the first cause that applies:"
 },
 {
  "kind": "table",
  "header": [
   "Cause",
   "Set 1",
   "Set 2"
  ],
  "rows": [
   [
    "Noise: no agent should take it",
    "0%",
    "5%"
   ],
   [
    "The picked agent had no past task yet",
    "5%",
    "2%"
   ],
   [
    "The right agent had no past task yet",
    "5%",
    "3%"
   ],
   [
    "The nearest past task was right; the description tipped it away",
    "10%",
    "10%"
   ],
   [
    "A past task with similarity 0.75 or more was filed under another agent",
    "17%",
    "3%"
   ],
   [
    "Nothing that similar seen yet; the nearest loose match was another agent's",
    "63%",
    "78%"
   ]
  ]
 },
 {
  "kind": "p",
  "text": "*Table L.7: Causes of wrong picks.*"
 },
 {
  "kind": "p",
  "text": "Whether the last group are genuinely new kinds of work was not checked. Cost, over 297 decisions on 2 CPUs and 1 GB: embedding a task takes a median 9 ms, a whole choice 16 ms (at most 38 ms); loading the model takes 0.54 s, and peak memory is 214 MB."
 },
 {
  "kind": "h3",
  "text": "L.8 Limits of these experiments"
 },
 {
  "kind": "p",
  "text": "Corrections were simulated, not made by people. One person labelled the tasks, with no second labeller, and the description files follow the same rules as the answer key. The same four agents, divided by kind of work, were used throughout; agents divided by project are untested. Settings were chosen on Set 1, so Set 2 is the fair estimate. The sets are small. Load results are simulated. In this phase no agent did real work, and the router cannot refuse a task unless the asking rule is used. One embedding model, English tasks and software work only; no generative-model router was run."
 },
 {
  "kind": "h3",
  "text": "L.9 How it informs each term of $A_\\Phi(a,s)$"
 },
 {
  "kind": "list",
  "items": [
   "**Tension ($T(s)$).** Expiring urgency stalls the queue; lasting tension keeps work moving and sets the order of service, not who serves.",
   "**Match and fit ($2^{\\Delta I(a,s)}$).** Only the match picks the agent (Proposition 1). Declared descriptions failed (51–52%), as declared skills did on the real hub. The record of past tasks carried the signal, read here from what tasks say rather than which files they touch.",
   "**Feedback and lock-in.** Learning only from its own picks locks in early mistakes (28% and 38%); the record needs corrections to stay informative.",
   "**Entry cost.** $A_0'$'s per-agent entry cost lowered accuracy from 74% to 72%, which supports folding entry into fit rather than dividing by it.",
   "**Availability ($F(a)$).** Under load, most wrong picks came from a busy best match: present is not free.",
   "**Confidence.** The lead over the second agent marks the hard tasks, but a threshold set on one set of tasks drifts on another, as the learned confidences did elsewhere.",
   "**Value of choice.** With a real choice among four agents that differ, the match beat the most-common-agent baseline by 19 points on held-out tasks. These experiments route tasks to agents; they do not test agents choosing spaces."
  ],
  "ordered": true
 }
];
