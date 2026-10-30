# Beyond the Classroom — أنقذ المشروع!

An Arabic, right-to-left event game that helps university students practise time management, constructive communication, teamwork, and adaptability through a project-rescue story.

## Play modes

- **Quick solo round:** start immediately without registration or personal information.
- **Two-team competition:** teams take turns on the same device. Only short team names are requested, and the first team's results stay hidden until the second team finishes.

Each round has four connected challenges and 180 seconds of active play. Feedback and team handoffs pause the timer. Every challenge awards up to 25 deterministic points; decision quality determines the score, with remaining time used only to break a tie between teams.

The game includes prioritization with reordering controls, a simulated message builder, task delegation with workload limits, and a deadline-change decision. Keyboard/touch alternatives are available for drag interactions. Sound is muted by default, fullscreen is optional, and reduced-motion preferences are respected.

The 30 existing educational cards remain available in **استكشف المهارات**. Game scenarios and scoring are local; no messages are sent and no backend or AI service is used.

## Development

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm run build
pnpm exec tsc --noEmit
```
