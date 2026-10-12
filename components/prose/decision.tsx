import type { DecisionBlock } from "@/lib/prose";

/**
 * A decision, drawn: one input, the questions asked of it side by side, what
 * comes back, and the rules that sit around the answer.
 *
 * Built from the DOM rather than SVG for the same reasons the bar figure is:
 * the labels stay real text at the site's scale, the two questions stack on a
 * phone, and the whole thing reads top to bottom with no JavaScript. Nothing
 * here is decoration over hidden data, so there is no separate summary; the
 * picked option says "Selected" in words, not only in colour.
 *
 * Server component, reached from components/prose/body.tsx. Keep it free of
 * client imports.
 */

const classes = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

function Down() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M6 2V10M6 10L2.5 6.5M6 10L9.5 6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Across() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      className="shrink-0 rotate-90 text-faint sm:rotate-0"
    >
      <path
        d="M2 6H10M10 6L6.5 2.5M10 6L6.5 9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The head of one question: its ordinal, its kind, and how it is answered. */
function QuestionHead({
  ordinal,
  kind,
  hint,
  title,
}: {
  ordinal: string;
  kind: string;
  hint: string;
  title: string;
}) {
  return (
    <>
      <p className="flex items-baseline justify-between gap-3 font-mono text-[10px] tracking-[0.14em] uppercase">
        <span className="flex items-baseline gap-2.5">
          <span className="numeric text-faint">{ordinal}</span>
          <span className="text-ink">{kind}</span>
        </span>
        <span className="text-faint">{hint}</span>
      </p>
      <p className="mt-4 text-[17px] font-semibold leading-[1.3] tracking-[-0.01em] text-ink">
        {title}
      </p>
    </>
  );
}

export function DecisionView({ block }: { block: DecisionBlock }) {
  const { input, choice, tags, result, rules } = block;

  return (
    <figure className="mt-7 overflow-hidden rounded-2xl border border-hair bg-black/70">
      <div className="border-b border-hair-soft px-5 py-3">
        <p className="font-mono text-[10px] tracking-[0.14em] text-dim uppercase">
          {block.title}
        </p>
      </div>

      <div className="bg-white/[0.03] px-5 py-5">
        <p className="font-mono text-[10px] tracking-[0.14em] text-faint uppercase">
          {input.label}
        </p>
        <p className="mt-3 text-[18px] leading-[1.45] tracking-[-0.01em] text-ink">
          &ldquo;{input.text}&rdquo;
        </p>
      </div>

      <p className="flex items-center justify-between gap-4 border-y border-hair-soft px-5 py-3 font-mono text-[10px] tracking-[0.14em] text-dim uppercase">
        <Down />
        <span className="text-center">{block.ask}</span>
        <Down />
      </p>

      <div className="grid sm:grid-cols-2">
        <div className="border-b border-hair-soft px-5 py-5 sm:border-r sm:border-b-0">
          <QuestionHead
            ordinal="01"
            kind="Choice"
            hint={choice.hint}
            title={choice.title}
          />

          <ul className="mt-4 space-y-2">
            {choice.options.map((option) => (
              <li
                key={option.name}
                className={classes(
                  "rounded-xl border px-3.5 py-3",
                  option.selected
                    ? "border-ink/40 bg-white/[0.07]"
                    : "border-hair-soft",
                )}
              >
                <p className="flex items-center gap-2.5">
                  <span
                    aria-hidden
                    className={classes(
                      "h-2 w-2 shrink-0 rounded-full",
                      !option.selected && "border border-faint",
                    )}
                    style={
                      option.selected
                        ? { background: "var(--spectrum)" }
                        : undefined
                    }
                  />
                  <span className="text-[14px] font-semibold text-ink">
                    {option.name}
                  </span>
                  {option.selected && (
                    <span className="ml-auto font-mono text-[9.5px] tracking-[0.14em] text-dim uppercase">
                      Selected
                    </span>
                  )}
                </p>
                <p className="mt-1.5 pl-[18px] text-[13px] leading-[1.55] text-ink/70">
                  {option.note}
                </p>
                <p className="mt-1.5 pl-[18px] font-mono text-[10.5px] tracking-[0.06em] text-dim">
                  {option.detail}
                </p>
              </li>
            ))}
          </ul>

          <p className="mt-3 px-3.5 text-[12.5px] leading-[1.55] text-faint">
            <span className="font-semibold text-dim">{choice.otherwise.name}</span>
            {" · "}
            {choice.otherwise.note}
          </p>
        </div>

        <div className="px-5 py-5">
          <QuestionHead
            ordinal="02"
            kind="Tags"
            hint={tags.hint}
            title={tags.title}
          />

          <ul className="mt-4 border-t border-hair-soft">
            {tags.items.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-3 border-b border-hair-soft py-3"
              >
                <span
                  aria-hidden
                  className={classes(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border text-[10px] leading-none",
                    item.applies
                      ? "border-ink/60 bg-ink text-void"
                      : "border-hair text-faint",
                  )}
                >
                  {item.applies ? "✓" : "−"}
                </span>
                <span className="text-[13.5px] text-ink/85">{item.label}</span>
                <span className="ml-auto font-mono text-[10px] tracking-[0.14em] text-faint uppercase">
                  {item.applies ? "Yes" : "No"}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-5 text-dim">
            <Down />
          </p>
          <p className="mt-3 text-[13px] leading-[1.6] text-ink/70">
            {tags.note}
          </p>
        </div>
      </div>

      {/* The answer, left to right: what came back, what it configured, what
          ran. The spectrum sits on the sill, as it does on a banner. */}
      <div className="relative border-t border-hair-soft bg-white/[0.06] px-5 py-5">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-70"
          style={{ background: "var(--spectrum)" }}
        />
        <ol className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          {result.map((stage, i) => (
            <li
              key={stage.label}
              className="flex flex-col gap-4 sm:flex-1 sm:flex-row sm:items-center sm:gap-5"
            >
              {i > 0 && <Across />}
              <span className="block">
                <span className="block font-mono text-[9.5px] tracking-[0.14em] text-faint uppercase">
                  {stage.label}
                </span>
                <span className="mt-1.5 block text-[17px] font-semibold tracking-[-0.01em] text-ink">
                  {stage.value}
                </span>
                {stage.detail && (
                  <span className="mt-1 block text-[12.5px] text-dim">
                    {stage.detail}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <dl className="grid gap-x-8 gap-y-4 border-t border-hair-soft px-5 py-4 sm:grid-cols-2">
        {rules.map((rule) => (
          <div key={rule.title}>
            <dt className="text-[13px] font-semibold text-ink/90">
              {rule.title}
            </dt>
            <dd className="mt-1 text-[13px] leading-[1.55] text-ink/65">
              {rule.note}
            </dd>
          </div>
        ))}
      </dl>

      <figcaption className="border-t border-hair-soft px-5 py-3 font-mono text-[10px] leading-relaxed tracking-[0.06em] text-faint">
        {block.caption}
      </figcaption>
    </figure>
  );
}
