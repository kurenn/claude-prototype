# Brief: agentic onboarding-workflow builder

Feed this verbatim to `/prototype` (choose **Quick** mode), then score the output folder.

> I would like to create a design for an application in charge of user onboardings, for
> banking applications, or any type. My idea is to allow users to create workflows or
> onboardings, must be agentic first. Right now there are some players such as footprint or
> aiprise, but feel a bit clunky.
>
> Scope: 4 screens — Workflow builder (agentic canvas to assemble onboarding steps),
> Onboarding run / preview (what an end-user sees stepping through), Results dashboard
> (completions, drop-off, review queue), Settings. Content: realistic placeholder — real
> KYC/verification step names, plausible completion rates and applicant records.

> **Note:** the source prompt (the user's own words, verbatim above the scope line) is
> deliberately under-specified — it names no product name, tone, or screen count. The
> scope line was added only to give the benchmark a fixed screen count for the
> n=2–3 build matrix and the monoculture check; it is not part of the "how it looks"
> direction. This brief doubles as a test of how each skill version handles a loose,
> reference-driven ("footprint / aiprise") agentic brief — exactly the inspiration/study
> path the anti-slop port touches.

Expected from a good run: 4 screens; an agentic builder surface that reads as a *canvas /
step composer*, not a generic CRUD form; density or view-mode layouts appropriate to a
builder + a dashboard; personas covering at least one empty state (no workflows yet) and an
active state (workflows live, applicants flowing); a review-queue empty state; realistic
verification-step vocabulary (ID check, liveness, document upload, sanctions screen) and
plausible applicant records with recent dates; a named signature move (the agentic builder
is the natural candidate); non-reflex nav appropriate to a builder/dashboard tool; no
lorem, no purple-gradient slop, no horizontal scroll at 390px.
