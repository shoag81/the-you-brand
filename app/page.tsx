import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-bone flex flex-col items-center">
      {/* ---------- HERO ---------- */}
      <section
        className="relative w-full flex flex-col items-center justify-center overflow-hidden"
        style={{
          minHeight: "100svh",
          backgroundImage: "url('/hero-texture.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex flex-col items-center px-6">
          {/* Wordmark lockup — debossed into the paper */}
          <div className="flex items-baseline justify-center gap-[0.34em] leading-none">
            <span className="deboss font-body font-medium uppercase tracking-[0.26em] text-[clamp(13px,2vw,24px)] relative -top-[0.15em]">
              THE
            </span>
            <span className="deboss font-display font-extrabold text-[clamp(64px,13vw,150px)] tracking-[0.01em]">
              YOU
            </span>
            <span className="deboss font-body font-medium uppercase tracking-[0.26em] text-[clamp(13px,2vw,24px)] relative -top-[0.15em]">
              BRAND
              <span className="align-super text-[0.5em] ml-[0.15em]">&trade;</span>
            </span>
          </div>

          {/* Paintbrush underline under YOU */}
          <svg
            className="block mx-auto -mt-[0.1em] w-[clamp(150px,22vw,280px)] h-[26px]"
            viewBox="0 0 280 26"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <filter id="brushRough">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.9 0.4"
                  numOctaves="2"
                  seed="4"
                  result="n"
                />
                <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" />
              </filter>
            </defs>
            <path
              d="M10 15 C 60 9, 150 8, 270 12"
              stroke="var(--color-emerald)"
              strokeWidth="9"
              fill="none"
              strokeLinecap="round"
              filter="url(#brushRough)"
              opacity="0.96"
            />
            <path
              d="M16 16 C 70 11, 160 10, 262 13"
              stroke="var(--color-emerald)"
              strokeWidth="4.5"
              fill="none"
              strokeLinecap="round"
              filter="url(#brushRough)"
              opacity="0.55"
            />
          </svg>

          {/* Tagline */}
          <p className="tagline-deboss font-display text-[clamp(15px,2.4vw,28px)] text-center leading-[1.45] max-w-[80%] mt-[1.5em]">
            The most magnetic brands aren&apos;t created.
            <br />
            They&apos;re <em className="italic text-emerald">uncovered.</em>
          </p>

          {/* CTA */}
          <Link
            href="/questionnaire"
            className="mt-12 inline-flex items-center rounded-full bg-emerald px-8 py-4 font-body font-medium text-bone text-lg shadow-lg transition-transform hover:scale-[1.03] active:scale-[0.99]"
          >
            Begin your discovery
          </Link>
        </div>
      </section>
    </main>
  );
}