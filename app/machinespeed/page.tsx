import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Agents } from "./agents";
import { AGENDA, BRIDGE, FAQ, MODELS, ORG, SECTIONS, TRUST } from "./content";
import { HeroWord } from "./hero-word";
import { Intake } from "./intake";
import { CloudGlyph, GateGlyph, Logo, RecordGlyph, ScopeGlyph, ShieldGlyph } from "./logos";
// Commented out with their sections (2026-09-24): the control room and the use cases.
// import { Cases } from "./cases";
// import { ControlRoom } from "./control-room";
// import { BEFORE } from "./diagrams";
import { SectionLinks } from "./section-nav";
import styles from "./machinespeed.module.css";

/**
 * MachineSpeed v2, ported from machinespeed-int/website/machinespeed-site.html.
 *
 * A sub-brand ("built on quirq technology") reached from the Enterprise link in
 * the site nav, opened in a new tab. It keeps the brandkit it was authored
 * with and its own chrome: the site Nav hides itself on this route and the
 * page closes with its own footer, so there is one header and one footer.
 *
 * Server-rendered apart from four narrow client islands: the hero's changing
 * word, the agents hub, the intake form and the section-link highlighter.
 * "What's underneath" is a diagram animated with CSS alone.
 * Copy lives in content.ts.
 *
 * Commented out below on 2026-09-24 feedback, not deleted: the hero control
 * room, Foundation, the use cases ("The same workflow, both ways") and People +
 * Infrastructure, and the Engagement section ("Book a 45-minute call…"). Their
 * copy and components are still in this folder.
 */

/** The 45-minute fit-check call. */
const BOOKING_URL = "https://calendly.com/machinespeed-quirq/fit-check";

export const metadata: Metadata = {
  // Absolute: this page is not a quirq page, so it does not take the root
  // layout's "· quirq" title template.
  title: { absolute: "MachineSpeed" },
  description:
    "Don't duct-tape AI onto your business. Book a 45-minute call with MachineSpeed and walk away with a live agent in production in 24 hours.",
};

export const viewport: Viewport = {
  themeColor: "#10120F",
};

function Mark() {
  return (
    <a className={styles.mark} href="#top" aria-label="MachineSpeed, back to top">
      <span className={styles.bars} aria-hidden>
        <i />
        <i />
        <i />
      </span>
      <b>MACHINESPEED</b>
    </a>
  );
}

function Arrow() {
  return <span className={styles.arr} aria-hidden>→</span>;
}

/* Icons for the Foundation section, kept with it while it is commented out.
const ICONS: Record<(typeof FOUNDATION)[number]["icon"], React.ReactNode> = {
  scope: (
    <div className={styles.icoScope}>
      <i className={styles.on} /><i className={styles.on} /><i className={styles.no} /><i className={styles.on} />
    </div>
  ),
  gate: (
    <div className={styles.icoGate}>
      <i /><b />
    </div>
  ),
  log: (
    <div className={styles.icoLog}>
      <i /><i /><i /><i />
    </div>
  ),
  swap: (
    <div className={styles.icoSwap}>
      <i /><i className={styles.b} /><i /><i />
    </div>
  ),
};
*/

export default function MachineSpeed() {
  return (
    <div className={styles.page} id="top">
      <header className={styles.subnav}>
        <div className={styles.wrap}>
          <Mark />
          <SectionLinks />
          <a className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`} href="#book">
            Get your agentic org
          </a>
        </div>
      </header>

      <main>
        {/* ============ HERO ============ */}
        <section className={styles.hero} aria-labelledby="hero-h">
          <div className={styles.wrap}>
            <h1 id="hero-h">
              <span className="sr-only">Run your business at machinespeed.</span>
              <span aria-hidden>
                <span className={styles.w}>Run</span> <span className={styles.w}>your</span> <HeroWord />
              </span>
              <span className={styles.accent} aria-hidden>at machinespeed.</span>
            </h1>

            <div className={styles.heroFoot}>
              <p className={styles.sub}>
                Governed AI agents, built into how your company already runs.{" "}
                <strong>Not a pilot, not a deck: a working agent on your systems, with the controls on.</strong>
              </p>
              <div className={styles.actions}>
                <a className={`${styles.btn} ${styles.btnPrimary}`} href="#book">
                  Get your agentic org <Arrow />
                </a>
                <a className={`${styles.btn} ${styles.btnGhost}`} href="#agents">
                  See ours ↓
                </a>
              </div>
            </div>

            {/* The promise, where the live control room used to sit. */}
            <div className={styles.promise}>
              <p className={styles.promiseBig}>
                Book a 45-minute call. <em>Walk away with a live agent in production in 24 hours.</em>
              </p>
              <ol className={styles.path} aria-label="How it goes">
                <li><b>01</b><span><strong>The call.</strong> 45 minutes, one workflow, a straight answer.</span></li>
                <li><b>02</b><span><strong>24 hours.</strong> A live agent on your systems, controls on.</span></li>
                <li><b>03</b><span><strong>Feedback.</strong> You run it, we tune it with you.</span></li>
                <li><b>04</b><span><strong>Expand.</strong> More team members, more flows, more systems.</span></li>
              </ol>
            </div>

            <div className={styles.trust} aria-label="Security and credentials">
              <div className={styles.trustCell}>
                <span className={styles.k}>{TRUST.runs.k}</span>
                <div className={styles.trustRow}><CloudGlyph /><b>{TRUST.runs.title}</b></div>
                <p>{TRUST.runs.body}</p>
              </div>
              <div className={styles.trustCell}>
                <span className={styles.k}>{TRUST.controls.k}</span>
                <ul className={styles.controls}>
                  {TRUST.controls.items.map((item, i) => (
                    <li key={item}>{[<ScopeGlyph key="s" />, <GateGlyph key="g" />, <RecordGlyph key="r" />][i]}{item}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.trustCell}>
                <span className={styles.k}>{TRUST.meets.k}</span>
                <ul className={styles.seals}>
                  {TRUST.meets.badges.map((b) => <li key={b}><ShieldGlyph />{b}</li>)}
                </ul>
              </div>
              <div className={`${styles.trustCell} ${styles.trustWide}`}>
                <span className={styles.k}>{TRUST.trusted.k} <em>· {TRUST.trusted.lead}</em></span>
                <ul className={styles.logos}>
                  {TRUST.trusted.names.map((n) => <li key={n}><Logo name={n} /><span>{n}</span></li>)}
                </ul>
              </div>
            </div>

            {/* Live control room (commented out, 2026-09-24): <ControlRoom /> */}
          </div>
        </section>

        {/* ============ OUR AGENTS ============ */}
        <section className={styles.section} id="agents" aria-labelledby="agents-h">
          <div className={styles.wrap}>
            <div className={`${styles.head} ${styles.split} ${styles.reveal}`}>
              <div>
                <span className={styles.label}>See it in action</span>
                <h2 id="agents-h">
                  MachineSpeed runs on <span className={styles.accent}>agents too.</span>
                </h2>
              </div>
              <p>
                Here are some of the agents that work alongside our team. Click any area to see what they handle, and
                where they check in with us.
              </p>
            </div>
            <div className={styles.reveal}>
              <Agents org={ORG} />
            </div>
          </div>
        </section>

        {/* ============ WHAT'S UNDERNEATH (from slide 6 of the deck) ============ */}
        <section className={`${styles.section} ${styles.tint}`} id="how" aria-labelledby="how-h">
          <div className={styles.wrap}>
            <div className={`${styles.head} ${styles.split} ${styles.reveal}`}>
              <div>
                <span className={styles.label}>What&rsquo;s underneath</span>
                <h2 id="how-h">
                  Any model. Your apps. <span className={styles.accent}>Control in between.</span>
                </h2>
              </div>
              <p>Every agent runs through the same layers of control: scoped access, approvals where you set them, a record of every step.</p>
            </div>

            {/* One run, drawn: a trigger comes up from your apps, the control layer asks the model,
                stops at a person where a gate is set, then acts back in your apps. All CSS. */}
            <div className={`${styles.diagram} ${styles.reveal}`} role="img" aria-label="A run comes in from your applications, passes through the control layer, which asks the model, checks scope, stops at a person where you set a gate, and records every step, then acts back in your applications.">
              <div className={styles.band} data-part="models">
                <span className={styles.k}>Any model</span>
                <div className={styles.chips}>
                  {MODELS.map((m) => <span key={m}><Logo name={m} />{m}</span>)}
                </div>
              </div>

              <div className={styles.wireV} data-part="up" aria-hidden><i /><i /></div>

              <div className={styles.runtimeRow}>
                <div className={styles.runtime} data-part="runtime">
                  <div className={styles.runtimeH}>
                    <span className={styles.bars} aria-hidden><i /><i /><i /></span>
                    <b>Control layer</b>
                    <span className={styles.k}>one set of rules for every agent</span>
                  </div>
                  <ul className={styles.layers}>
                    {BRIDGE.layers.map((l) => (
                      <li key={l.title} className={styles.layer} data-part={l.title} title={l.body}>
                        <i aria-hidden>{l.icon}</i>
                        <h3>{l.title}</h3>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={styles.gateWire} data-part="gate" aria-hidden><i /></div>
                <div className={styles.person} data-part="person">
                  <span className={styles.avatar} aria-hidden />
                  <b>A person</b>
                  <span>approves money &amp; customers</span>
                </div>
              </div>

              <div className={styles.wireV} data-part="down" aria-hidden><i /><i /></div>

              <div className={styles.band} data-part="apps">
                <span className={styles.k}>Your apps</span>
                <div className={styles.chips}>
                  {BRIDGE.apps.map((a) => <span key={a}>{a !== "Your internal tools" && <Logo name={a} />}{a}</span>)}
                </div>
              </div>

              {/* The caption cycles with the dots: four phases, one run. */}
              <div className={styles.phases} aria-hidden>
                <span>Trigger from your apps</span>
                <span>Reasoning with your model</span>
                <span>Scope checked · waiting for a person</span>
                <span>Acting in your apps, on the record</span>
              </div>
            </div>
            <p className={styles.caseNote}>Illustrative application list. Hover a layer for what it does.</p>
          </div>
        </section>

        {/* ============ ENGAGEMENT (commented out, 2026-09-24) ============
        <section className={styles.section} id="engagement" aria-labelledby="eng-h">
          <div className={styles.wrap}>
            <div className={`${styles.head} ${styles.lede} ${styles.reveal}`}>
              <h2 id="eng-h" className={styles.big}>
                Book a 45-minute call. <em>Walk away with a live agent in production in 24 hours.</em>
              </h2>
            </div>
            <div className={`${styles.commit} ${styles.reveal}`} aria-label="What every engagement commits to">
              <div><b>24 hours</b><span>from the call to a live agent in production on your own systems</span></div>
              <div><b>Feedback</b><span>you run it, we tune what it does alone and where it stops for you</span></div>
              <div><b>Expand</b><span>more team members, more flows, more systems, under the same rules</span></div>
            </div>
            <ol className={`${styles.tl} ${styles.reveal}`}>
              {TIMELINE.map((step) => (
                <li key={step.title}>
                  <span className={styles.when}>{step.when}</span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                  <div className={styles.get}>
                    <b>You leave with</b>
                    {step.get}
                  </div>
                </li>
              ))}
            </ol>
            <div className={`${styles.rule} ${styles.reveal}`}>
              <p>
                <b>Our scoping rule:</b> if we can&rsquo;t show you on the call that the first agent will be worth it,
                we&rsquo;ll say so and we won&rsquo;t propose one. You&rsquo;ll have lost 45 minutes.
              </p>
              <a className={`${styles.btn} ${styles.btnPrimary}`} href="#book">
                Get your agentic org <Arrow />
              </a>
            </div>
          </div>
        </section>
        ============ END ENGAGEMENT ============ */}

        {/* ============ PEOPLE + INFRASTRUCTURE (commented out, 2026-09-24) ============
        <section className={`${styles.section} ${styles.tint}`} aria-labelledby="two-h">
          <div className={styles.wrap}>
            <div className={`${styles.head} ${styles.split} ${styles.reveal}`}>
              <h2 id="two-h">You don&rsquo;t buy software from us. You buy the outcome, and the people who own it.</h2>
              <p>
                MachineSpeed is a service. Our engineers sit inside your team and ship. Everything they ship runs where
                your work already lives, in your own cloud or on-prem, under one set of rules, so your security review
                happens once, not once per workflow.
              </p>
            </div>
            <div className={`${styles.halves} ${styles.reveal}`}>
              <div className={styles.half}>
                <div className={styles.halfTop}>
                  <span className={styles.pill}>The people</span>
                  <span className={styles.k}>MachineSpeed</span>
                </div>
                <h3>A small team inside yours.</h3>
                <p>
                  No handoff from sales to delivery, and no bench of juniors. The engineers on your walkthrough are the
                  ones who build your sprint and run it.
                </p>
                TODO: confirm the nature of each team relationship before publishing.
                <p className={styles.cred}>
                  <b>Built by engineers who&rsquo;ve shipped agents and infrastructure</b> at the labs and clouds your
                  stack already runs on.
                </p>
                <div className={styles.names}>
                  {["OpenAI", "Google DeepMind", "Google Cloud", "AWS", "NVIDIA"].map((n) => <span key={n}>{n}</span>)}
                </div>
                TODO: add GM name, headshot and engineer backgrounds once confirmed
                <ul className={styles.plist}>
                  {PEOPLE.map((p) => (
                    <li key={p.title}><b>{p.title}</b><span>{p.body}</span></li>
                  ))}
                </ul>
              </div>
              <div className={styles.half}>
                <div className={styles.halfTop}>
                  <span className={`${styles.pill} ${styles.pillBlue}`}>The infrastructure</span>
                  <span className={styles.k}>Your cloud or on-prem</span>
                </div>
                <h3>One set of rules for every agent.</h3>
                <p>
                  Your security team reviews the controls once. Every blueprint after that runs under them: scoped
                  access, approval gates, a full run record and your data rules.
                </p>
                <div>
                  <span className={`${styles.k} ${styles.complyLabel}`}>Designed to meet</span>
                  <ul className={styles.comply} aria-label="Compliance frameworks">
                    {COMPLIANCE.map((c) => (
                      <li key={c.name}><b>{c.name}</b><span>{c.body}</span></li>
                    ))}
                  </ul>
                </div>
                <div className={styles.chips} aria-label="Models we work with">
                  {MODELS.map((m) => <span key={m}><Logo name={m} />{m}</span>)}
                </div>
              </div>
              <div className={styles.modelsLine}>
                <blockquote>
                  You shouldn&rsquo;t have to choose your model or apps.{" "}
                  <em>Keep what you already use, or let us recommend what works.</em>
                </blockquote>
                <a className={`${styles.btn} ${styles.btnGhost}`} href="#faq">How we pick models and tools</a>
              </div>
            </div>
          </div>
        </section>
        ============ END PEOPLE + INFRASTRUCTURE ============ */}

        {/* ============ FAQ ============ */}
        <section className={styles.section} id="faq" aria-labelledby="faq-h">
          <div className={styles.wrap}>
            <div className={`${styles.head} ${styles.plain} ${styles.reveal}`}>
              <h2 id="faq-h">The questions that come up before the call.</h2>
            </div>
            <div className={`${styles.faq} ${styles.reveal}`}>
              {FAQ.map((column, ci) => (
                <div key={ci}>
                  {column.map(([q, a]) => (
                    <details key={q}>
                      <summary>{q}</summary>
                      <p>{a}</p>
                    </details>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ CLOSE ============ */}
        <section className={styles.close} id="book" aria-labelledby="book-h">
          <div className={styles.wrap}>
            <div>
              <span className={styles.label}>The call · 45 minutes</span>
              <h2 id="book-h">
                Get your <span className={styles.accent}>agentic org.</span>
              </h2>
              <p className={styles.sub}>
                Bring the workflow that eats a morning every week, or the one that broke last month. We&rsquo;ll show
                you, live, how it runs with the guardrails on, and tell you straight if it&rsquo;s not worth building.
                If it is, a live agent is in production on your systems within 24 hours.
              </p>
              <div className={styles.actions}>
                <a className={`${styles.btn} ${styles.btnPrimary}`} href={BOOKING_URL} target="_blank" rel="noreferrer">
                  Book a 45-minute call <Arrow />
                  <span className="sr-only"> (opens Calendly in a new tab)</span>
                </a>
              </div>
              <ul className={styles.agenda}>
                {AGENDA.map((a) => (
                  <li key={a.when}>
                    <b>{a.when}</b>
                    <span><strong>{a.lead}</strong> {a.body}</span>
                  </li>
                ))}
              </ul>
              {/* TODO: confirm this capacity statement reflects how you actually take on new orgs. */}
              <p className={`${styles.sub} ${styles.capacity}`}>
                We take on a handful of new orgs at a time, so the engineers on your call are the ones who build. If
                we&rsquo;re full, we&rsquo;ll tell you the next start date rather than take the booking.
              </p>
            </div>
            <Intake />
          </div>
        </section>
      </main>

      <footer className={styles.msFoot}>
        <div className={styles.wrap}>
          <div className={styles.foot}>
            <div>
              <Mark />
              <p className={styles.footTag}>Agents that do the work at machine speed, with controls that answer to people.</p>
            </div>
            <nav className={styles.footLinks} aria-label="MachineSpeed footer">
              {SECTIONS.slice(1, 3).map((s) => <a key={s.id} href={`#${s.id}`}>{s.label}</a>)}
              <Link href="/whitepaper">Whitepaper</Link>
              <a href="/llm.txt" target="_blank" rel="noreferrer">llm.txt<span className="sr-only"> (opens in a new tab)</span></a>
              <a href="#book">Contact</a>
            </nav>
          </div>
          <div className={styles.legal}>
            <span>© 2026 MachineSpeed</span>
            <span>built on <em>quirq</em> technology</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
