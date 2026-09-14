# ArenaHub

Find your next competition. Build your team. Host your own tournament.

ArenaHub is a gaming competition app where players can discover tournaments, register as individuals or teams, and organize competitions for their communities.

## Project status

**Working interactive demo with a live Rebana integration.** The README was created first, and the app is now implemented in Next.js and TypeScript using `../innovation_license1` as its architectural blueprint.

Run the app at **http://localhost:3700**. Competition data is saved in the current browser. Organizer reference data comes from the real Rebana License sandbox.

## Implemented today

- Competition discovery with game, search, region, skill, platform, location, registration status, and sorting controls.
- Competition details, rules, local time zone display, capacity, deadlines, and bookmarks.
- Solo and team entries, roster validation, duplicate prevention, host approval states, and withdrawals.
- Host forms with game artwork or custom HTTPS covers, preview, drafts, publishing, editing, and cancellation reasons.
- A host dashboard for reviewing registrations. Only the demo host can edit their own events.
- Live council zones, license types, fully paginated business activities, and separate licensing statistics tables.
- Optional live council reference selections in the in-person event form.
- Desktop and mobile layouts, keyboard-accessible dialogs, local fonts and artwork, and explicit empty/error states.

There is one demo identity, Alex Chen. Each browser has its own data; other browsers cannot submit entries to your local event. Team rosters are entered during registration; separate team accounts, invitations, notifications, automatic brackets, and match results are roadmap features.

## Blueprint and Rebana integration

The app follows `innovation_license1`'s shared model/service catalog and feature modules with separate action, reducer, selector, effect, state, and page files. Its OAuth token broker and HTTP gateway were adapted for ArenaHub, with one Redux listener middleware instance per store.

| Layer                                                 | Location                                                                  |
| ----------------------------------------------------- | ------------------------------------------------------------------------- |
| Server-only OAuth token broker                        | `src/core/auth/`                                                          |
| Browser transport, server gateway, proxy policy       | `src/core/http/`                                                          |
| Shared types and transport/domain services            | `src/shared/models/`, `src/shared/services/`                              |
| Competition actions, reducers, selectors, and effects | `src/modules/competitions/store/`                                         |
| Discovery, details, registration, and host screens    | `src/modules/competitions/pages/`                                         |
| Blueprint resource modules                            | `src/modules/zone/`, `license-type/`, `business-activity/`, `statistics/` |
| Organizer reference screen                            | `src/modules/resources/pages/`                                            |
| Root Redux store and typed hooks                      | `src/store/`                                                              |
| Next.js routes and same-origin API proxy              | `src/app/`                                                                |

The [Rebana API specification](https://rebana.canang.com.my/rebana-license/v3/api-docs/sandbox) exposes **read-only licensing resources**, with no competition, team, or registration endpoints. ArenaHub does not send gaming data to that API or relabel licensing statistics as gaming statistics.

| Browser endpoint                   | Real resource                      |
| ---------------------------------- | ---------------------------------- |
| `/api/sandbox/ping`                | Verify the sandbox connection      |
| `/api/sandbox/zones`               | Administrative zones               |
| `/api/sandbox/license-types`       | License and permit catalog         |
| `/api/sandbox/business-activities` | Business activity taxonomy         |
| `/api/sandbox/statistics`          | Non-financial licensing statistics |

The server obtains a token with the documented password grant, keeps credentials out of the client bundle, and allows only these GET paths. Paging uses up to 200 rows per request and continues until a short page. The UI preserves unclassified risk values, retains zero-valued statistics, and respects rate-limit retry delays. A reference selection does not submit a license application or establish approval.

The live connection was verified on 14 September 2026: **4 zones, 13 license types, 589 business activities**, and all six statistics fields. These counts may change upstream.

The sections below retain the broader product direction; the implemented scope is listed above.

## Who it is for

- **Players** looking for competitions that match their games, skill levels, region, and availability.
- **Teams** looking for tournaments to enter together.
- **Hosts** organizing events for friends, gaming communities, or esports teams.

A user can be both a player and a host using the same account.

## Core experience

### Discover competitions

- Browse upcoming competitions in a responsive card layout.
- Search by competition name or game.
- Filter by game, region, platform, skill level, online or in-person play, and registration status.
- View the schedule, participant capacity, format, and available spaces before opening an event.
- Open a competition page to read its rules, eligibility requirements, host information, and registration deadline.

Example game categories include Valorant, Counter-Strike 2, Mobile Legends, Dota 2, Fortnite, and EA Sports FC. Hosts can also enter another game.

### Join a competition

1. Choose an event and review its rules and requirements.
2. Register as a solo player or select a team, depending on the event format.
3. Provide the required in-game usernames and team roster.
4. Accept the competition rules and submit registration.
5. View registration status and event details under **My Competitions**.

Registrations can be pending approval, confirmed, rejected, or withdrawn. Events may accept eligible registrations automatically or require host approval. Joining closes when the deadline passes, the competition starts, or all available places are taken.

### Host a competition

1. Create a draft with a title, description, game, and cover image.
2. Choose online or in-person play, region, platform, and skill level.
3. Set the participant type, team size, capacity, tournament format, and schedule.
4. Add rules, registration requirements, and optional prize information.
5. Preview and publish the event.
6. Manage registrations, share announcements, and track competition progress from the host dashboard.

Hosts can edit their drafts, approve or reject pending registrations, and cancel events with a reason. Changes to published schedules or rules should be recorded and communicated to registered participants.

## Main screens

| Screen                    | Purpose                                                                |
| ------------------------- | ---------------------------------------------------------------------- |
| Home                      | Introduce the app and highlight upcoming competitions.                 |
| Explore                   | Search and filter available competitions.                              |
| Competition details       | Show rules, schedule, host, roster, and registration action.           |
| Create / edit competition | Guide hosts through event setup and publishing.                        |
| My Competitions           | Track joined and hosted events.                                        |
| Host dashboard            | Manage an event and its registrations.                                 |
| Team profile              | Display a team name, captain, and roster.                              |
| Player profile            | Display a gamer tag, favorite games, region, and competition activity. |

## First implementation: interactive demo

The first build makes the main discovery, joining, and hosting flows usable with sample data.

- Responsive interface for desktop and mobile.
- Dark visual theme with clear competition cards and prominent join and host actions.
- Seeded competitions covering multiple games, formats, and registration states.
- Search, filtering, competition details, and empty states.
- A demo player identity for solo and team registration.
- A create-event form with validation, preview, and publish actions.
- A dashboard showing joined events and competitions created in the demo.
- Local browser persistence for demo registrations and created events.
- Clear feedback for successful actions, validation errors, full events, and closed registration.

The demo will label its sample content and local-only behavior. Browser storage does not provide shared accounts, secure permissions, or live capacity enforcement across users. Demo events and registrations will stay in the browser where they were created.

The first release will support free entry. Optional prizes are informational; payment collection and prize payouts are outside the initial scope.

## Production roadmap

### Phase 1 — Discovery and hosting demo

Build the interface and complete the local discovery, registration, and event creation flows described above.

### Phase 2 — Shared accounts and registrations

- Add authentication and persistent player profiles.
- Store competitions, teams, and registrations in a shared database.
- Enforce event ownership and team captain permissions on the server.
- Prevent duplicate entries and capacity conflicts with database constraints and transactions.
- Add participant approvals, team invitations, and event notifications.
- Support reporting events and administrative moderation.

### Phase 3 — Tournament operations

- Generate single-elimination brackets after registrations are finalized.
- Support participant check-in and match scheduling.
- Let players submit results and hosts resolve disputed scores.
- Publish results and competition history.
- Add further formats, such as round robin, after the initial bracket flow is complete.

### Phase 4 — Community features

- Follow hosts and save competitions.
- Add team recruitment and player availability.
- Add host reputation and organizer analytics.

## Implementation direction

The current stack and future backend direction are:

| Area                          | Choice                                                          |
| ----------------------------- | --------------------------------------------------------------- |
| Application                   | Next.js with TypeScript                                         |
| Styling                       | Custom responsive CSS, local DM Sans and Barlow Condensed fonts |
| State                         | Redux Toolkit and React Redux, following the blueprint          |
| Icons                         | Lucide React                                                    |
| Demo data                     | Seed fixtures and browser local storage                         |
| Production database (planned) | PostgreSQL                                                      |
| Production access (planned)   | Server-side authentication and authorization                    |

Exact installed versions are recorded in `package-lock.json`. The current demo has no shared account authentication or database.

## Proposed data model

| Entity       | Key information                                                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| User         | ID, display name, gamer tag, avatar, region, preferred games.                                                                                          |
| Team         | ID, name, captain, game, roster.                                                                                                                       |
| Team member  | Team, user, role, membership status.                                                                                                                   |
| Competition  | Host, title, game, description, platform, region, location, participant type, team size, capacity, format, rules, prize description, schedule, status. |
| Registration | Competition, registering user, optional team, roster snapshot, status, submitted time.                                                                 |
| Match        | Competition, round, participants, scheduled time, scores, winner, status.                                                                              |
| Announcement | Competition, author, message, published time.                                                                                                          |

Competition status follows **draft → published → ongoing → completed**. A draft, published, or ongoing competition can also be cancelled. Whether registration is open is calculated separately from event status, capacity, and deadlines.

## Important behavior

- Only the owning host can edit a competition or manage its registrations.
- Only a team captain can register a team, and the submitted roster must satisfy the event's team size.
- A player cannot enter the same competition multiple times, including through different teams.
- Capacity counts players for solo events and teams for team events; pending and confirmed registrations reserve places.
- Rejected and withdrawn registrations release their reserved places.
- Registration deadlines must be before the competition start time.
- Dates are stored in UTC and displayed with an explicit local time zone.
- Cancelling an event stops registration and shows its cancellation reason to participants.
- Hosts cannot reduce capacity below reserved places or change the game, participant type, or team size after registrations exist.
- Contact details and private registration information are visible only to authorized users.
- Production rules must be enforced on the server; hiding a button is insufficient.

## Design and accessibility

- Make game, start time, region, and registration availability easy to scan.
- Keep forms readable on small screens and preserve input after validation errors.
- Use labels, keyboard-accessible controls, visible focus indicators, and sufficient color contrast.
- Pair status colors with text so availability and registration outcomes are understandable without color alone.
- Include loading, error, and empty states for each data-driven screen.
- Respect reduced-motion preferences.

## Acceptance criteria for the first build

- A player can find a competition through search and filters, then read its full details.
- A player can join an eligible solo event or register a demo team in a team event.
- Duplicate registration, invalid team size, full capacity, and expired registration produce clear feedback.
- A player can see and withdraw their registration from My Competitions before the event starts.
- A host can create a valid draft, preview it, publish it, and find it in Explore.
- A host can manage pending registrations and cancel their event.
- Created competitions and registration changes survive a page refresh in the same browser.
- Core flows work on mobile and desktop with keyboard navigation.
- Demo behavior and sample content are clearly identified.

## Getting started

Use Node.js 22.10 or later and npm. Development was verified with Node.js 24.

```powershell
cd ArenaHub
npm install
npm run dev
```

Open **http://localhost:3700**. Use the `localhost` address for the development server; Next.js restricts other development origins by default.

Competition features work without Rebana credentials. To configure the live reference section, copy `.env.example` to `.env.local` and set:

```dotenv
SANDBOX_BASE_URL=https://rebana.canang.com.my/rebana-license
SANDBOX_CLIENT_ID=your-sandbox-client-id
SANDBOX_CLIENT_SECRET=your-sandbox-client-secret
SANDBOX_USERNAME=your-sandbox-username
SANDBOX_PASSWORD=your-sandbox-password
```

Obtain these values from the council administrator under **Tetapan > Sandbox Pembangun**. Restart the server after changing them. The local development workspace reuses the existing blueprint configuration; no credentials are included in this README, example files, or client code. `.env.local` is gitignored.

If the connection is unconfigured or unavailable, the organizer reference screen shows the error and a retry action. Competition discovery and local hosting remain usable.

| Command             | Purpose                                                    |
| ------------------- | ---------------------------------------------------------- |
| `npm run dev`       | Development server on port 3700                            |
| `npm run build`     | Create a production build                                  |
| `npm run start`     | Serve the production build on port 3700                    |
| `npm run typecheck` | TypeScript validation                                      |
| `npm test`          | Competition rules and proxy policy tests                   |
| `npm run test:e2e`  | Desktop/mobile Playwright flows and simulated API failures |

Before the first browser test run, install Chromium with `npx playwright install chromium`. The test configuration reuses a running development server or starts one automatically.

Optional live verification, using the local server configuration:

```powershell
node --env-file=.env.local --conditions=react-server --import tsx scripts/check-rebana.ts
node scripts/inspect-resources.mjs
```

The second command needs the development server running; it checks the live reference screens and in-person zone selector. End-to-end tests save desktop and mobile screenshots under `test-results/`.

## Demo and deployment limits

- `localStorage` uses the key `arenahub.demo.v1`. Clearing this key resets local competitions, registrations, and bookmarks. Seed dates are relative to the first visit and then persist.
- Browser storage errors are shown explicitly; unreadable existing storage is preserved and the app uses session-only state.
- Each browser is an independent demo. There are no shared accounts, cross-browser registrations, payments, prize payouts, notifications, or automatic brackets.
- Ownership and capacity checks operate in the demo state. A production multiplayer version must enforce them with server-side authentication, database constraints, and transactions.
- The read-only Rebana proxy does not authenticate app visitors. A public production deployment needs its own access control and request budget protection before sharing the sandbox credential’s quota.
- Bundled game artwork is used to identify the respective games in this demo. Game names and artwork belong to their respective owners; ArenaHub is not an official or affiliated tournament platform.
