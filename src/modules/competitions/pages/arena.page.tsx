"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowDownWideNarrow,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  CalendarDays,
  Check,
  ChevronDown,
  Compass,
  Gamepad2,
  Globe2,
  LayoutDashboard,
  Menu,
  Plus,
  Radio,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Swords,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { useAppDispatch, useAppSelector, useAppStore } from "@store/hooks";
import { selectArena } from "../store/competition.selector";
import * as A from "../store/competition.action";
import { DEMO_USER, type Competition } from "@shared/models/competition.model";
import { games } from "@shared/data/competitions";
import {
  entryStatus,
  reservedPlaces,
  validateRegistration,
} from "@shared/services/competition.service";
import { Empty, GameArt, Modal, dateLabel } from "@shared/components/ui";
import { HostPage } from "./host.page";
import { ResourcesPage } from "@modules/resources/pages/resources.page";

const nav = [
  { href: "/", label: "Discover", icon: Compass },
  { href: "/competitions", label: "All competitions", icon: Swords },
  { href: "/my-competitions", label: "My competitions", icon: Trophy },
  { href: "/saved", label: "Saved competitions", icon: Bookmark },
];

export function ArenaPage() {
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const data = useAppSelector(selectArena);
  const path = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [game, setGame] = useState("All games");
  const [status, setStatus] = useState("All statuses");
  const [platform, setPlatform] = useState("All platforms");
  const [mode, setMode] = useState("All locations");
  const [skill, setSkill] = useState("All skill levels");
  const [region, setRegion] = useState("All regions");
  const [sort, setSort] = useState("Recommended");
  const [moreFilters, setMoreFilters] = useState(false);
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState("");
  const [help, setHelp] = useState(false);
  const [joining, setJoining] = useState<Competition | null>(null);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    dispatch(A.initialize());
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, [dispatch]);
  useEffect(() => {
    setMenu(false);
  }, [path]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4200);
    return () => clearTimeout(timer);
  }, [toast]);
  const isHome = path === "/";
  const eventId = path.startsWith("/competitions/") ? path.split("/")[2] : null;
  const event = data.competitions.find((e) => e.id === eventId);
  const activeEntries = data.registrations.filter(
    (r) =>
      r.userId === DEMO_USER && ["pending", "confirmed"].includes(r.status),
  );
  const reset = () => {
    setSearch("");
    setGame("All games");
    setStatus("All statuses");
    setPlatform("All platforms");
    setMode("All locations");
    setSkill("All skill levels");
    setRegion("All regions");
  };
  const notify = (message: string) => setToast(message);
  const savedToggle = (id: string) => {
    const saved = data.saved.includes(id);
    dispatch(A.toggleSaved(id));
    notify(
      saved
        ? "Removed from saved competitions."
        : "Competition saved. Find it in your sidebar.",
    );
  };
  const filtered = data.competitions
    .filter(
      (e) =>
        e.status === "published" &&
        (path !== "/saved" || data.saved.includes(e.id)),
    )
    .filter((e) =>
      `${e.title} ${e.game} ${e.host}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    )
    .filter((e) => game === "All games" || e.game === game)
    .filter(
      (e) =>
        status === "All statuses" ||
        entryStatus(e, data.registrations, now) === status,
    )
    .filter((e) => platform === "All platforms" || e.platform === platform)
    .filter((e) => mode === "All locations" || e.mode === mode)
    .filter((e) => skill === "All skill levels" || e.skill === skill)
    .filter((e) => region === "All regions" || e.region === region)
    .sort((a, b) =>
      sort === "Starting soon"
        ? Date.parse(a.startsAt) - Date.parse(b.startsAt)
        : sort === "Most spots available"
          ? b.capacity -
            reservedPlaces(b, data.registrations) -
            (a.capacity - reservedPlaces(a, data.registrations))
          : 0,
    );
  const title =
    path === "/saved"
      ? "Keep your next challenge close."
      : path === "/my-competitions"
        ? "Your competition center."
        : "Your next win starts here.";

  return (
    <div className="app-shell">
      {menu && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        />
      )}
      <aside className={`sidebar ${menu ? "open" : ""}`}>
        <Link href="/" className="brand">
          <span className="brand-mark">
            <Swords size={24} strokeWidth={2.6} />
          </span>
          Arena<span>Hub</span>
          <span className="brand-dot">.</span>
        </Link>
        <div className="nav-group-label">PLAY YOUR WAY</div>
        <nav aria-label="Main navigation">
          {nav.map((item) => (
            <Link
              href={item.href}
              key={item.href}
              className={`nav-item ${path === item.href || (item.href === "/competitions" && eventId) ? "active" : ""}`}
            >
              <item.icon size={19} />
              {item.label}
              {item.href === "/my-competitions" && activeEntries.length > 0 && (
                <span className="nav-count">{activeEntries.length}</span>
              )}
            </Link>
          ))}
        </nav>
        <div className="nav-group-label second-label">MAKE IT HAPPEN</div>
        <nav aria-label="Organizer navigation">
          <Link
            href="/host"
            className={`nav-item ${path === "/host" ? "active" : ""}`}
          >
            <Plus size={19} />
            Host a competition
          </Link>
          <Link
            href="/dashboard"
            className={`nav-item ${path === "/dashboard" ? "active" : ""}`}
          >
            <LayoutDashboard size={19} />
            Host dashboard
          </Link>
          <Link
            href="/resources"
            className={`nav-item ${path === "/resources" ? "active" : ""}`}
          >
            <ShieldCheck size={19} />
            Organizer resources<span className="small-new">API</span>
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <div className="host-promo">
            <span className="promo-icon">
              <Trophy size={21} />
            </span>
            <h3>Your rules. Your arena.</h3>
            <p>
              Bring your community together.
              <br />
              Host something worth playing.
            </p>
            <Link href="/host">
              Create a competition
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <button className="help-link" onClick={() => setHelp(true)}>
            <Gamepad2 size={18} />
            New to ArenaHub?
            <ArrowUpRight size={14} />
          </button>
          <div className="sidebar-foot">BUILT FOR THE LOVE OF THE GAME</div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            aria-label="Open navigation"
            onClick={() => setMenu(!menu)}
          >
            <Menu />
          </button>
          <div className="breadcrumb">
            The community arena <span>/</span>{" "}
            <strong>
              {isHome
                ? "Discover"
                : path === "/resources"
                  ? "Organizer resources"
                  : path === "/host"
                    ? "Host a competition"
                    : path === "/dashboard"
                      ? "Host dashboard"
                      : eventId
                        ? "Competition details"
                        : path === "/my-competitions"
                          ? "My competitions"
                          : path === "/saved"
                            ? "Saved"
                            : "Competitions"}
            </strong>
          </div>
          <div className="topbar-right">
            <span className="demo-pill">
              <span />
              LOCAL DEMO
            </span>
            <span className="topbar-divider" />
            <Link href="/profile" className="profile-link">
              <span className="avatar">AX</span>
              <span>
                Alex Chen<small>PLAYER & HOST</small>
              </span>
              <ChevronDown size={14} />
            </Link>
          </div>
        </header>
        <main id="main-content">
          {data.error && (
            <div role="alert" className="alert">
              {data.error}
              <button
                className="icon-button"
                onClick={() => dispatch(A.clearError())}
                aria-label="Dismiss message"
              >
                <X size={16} />
              </button>
            </div>
          )}
          {!data.ready ? (
            <div className="loading">
              <span className="spinner" />
              Loading your arena…
            </div>
          ) : path === "/host" || path === "/dashboard" ? (
            <HostPage
              key={path}
              dashboard={path === "/dashboard"}
              notify={notify}
            />
          ) : path === "/resources" ? (
            <ResourcesPage />
          ) : path === "/profile" ? (
            <>
              <PageHeading
                eyebrow="YOUR PLAYER CARD"
                title="Every great run starts with you."
                description="Your demo identity for playing and hosting on ArenaHub."
              />
              <div className="profile-card panel">
                <span className="avatar large">AX</span>
                <div>
                  <h2>
                    Alex Chen <span className="tag">Demo player</span>
                  </h2>
                  <p>Gamer tag: Alex#2048 · Southeast Asia</p>
                  <p>
                    You are the captain when registering a demo team. Add your
                    teammates’ in-game names when you join.
                  </p>
                  <div className="profile-stats">
                    <span>
                      <strong>{activeEntries.length}</strong>Active entries
                    </span>
                    <span>
                      <strong>
                        {
                          data.competitions.filter(
                            (e) => e.hostId === DEMO_USER,
                          ).length
                        }
                      </strong>
                      Hosted events
                    </span>
                    <span>
                      <strong>{data.saved.length}</strong>Saved competitions
                    </span>
                  </div>
                  <Link href="/competitions" className="primary">
                    Find a competition
                    <ArrowRight size={17} />
                  </Link>
                </div>
              </div>
            </>
          ) : eventId ? (
            event &&
            (event.status !== "draft" || event.hostId === DEMO_USER) ? (
              <CompetitionDetail
                event={event}
                onJoin={() => setJoining(event)}
                onSave={() => savedToggle(event.id)}
                notify={notify}
              />
            ) : (
              <Empty
                title="Competition not found"
                text="This event may have been removed or the link is incorrect."
                action={() => router.push("/competitions")}
              />
            )
          ) : ["/", "/competitions", "/saved", "/my-competitions"].includes(
              path,
            ) ? (
            <>
              <PageHeading
                eyebrow={
                  path === "/my-competitions"
                    ? "YOUR JOURNEY"
                    : path === "/saved"
                      ? "THE SHORTLIST"
                      : "FIND YOUR GAME. MEET YOUR RIVALS."
                }
                title={title}
                description={
                  path === "/my-competitions"
                    ? "Keep track of your entries and get ready for game day."
                    : path === "/saved"
                      ? "All the competitions you bookmarked, in one place."
                      : "Discover competitions, squad up, and turn your game into something bigger."
                }
                action={
                  <Link href="/host" className="primary">
                    <Plus size={17} />
                    Host a competition
                  </Link>
                }
              />
              {isHome && (
                <>
                  <section className="hero" aria-label="Featured competition">
                    <GameArt
                      src="/games/hero.jpg"
                      alt="Counter-Strike 2 competition artwork"
                      className="hero-art"
                    />
                    <div className="hero-overlay" />
                    <div className="hero-content">
                      <div className="hero-eyebrow">
                        <span />
                        <span>THE COMMUNITY SPOTLIGHT</span>
                        <span className="hero-number">SEASON 01</span>
                      </div>
                      <h2>
                        GOOD GAMES.
                        <br />
                        GREAT <em>RIVALS.</em>
                      </h2>
                      <p>
                        The lobby is open. Your next challenge is waiting.
                        <br />
                        Make your mark in the Community Clash.
                      </p>
                      <div className="hero-meta">
                        <span>
                          <Trophy size={16} />
                          RM 2,000 prize pool
                        </span>
                        <span>
                          <Users size={16} />
                          5v5 · Southeast Asia
                        </span>
                      </div>
                      <Link href="/competitions/arena-1" className="primary">
                        Explore the competition
                        <ArrowUpRight size={18} />
                      </Link>
                    </div>
                    <div className="hero-corner">
                      <span>COUNTER-STRIKE 2</span>
                      <strong>COMMUNITY CLASH</strong>
                      <span className="hero-corner-line" />
                    </div>
                    <div className="hero-label">
                      FEATURED COMPETITION <ArrowUpRight size={14} />
                    </div>
                  </section>
                  <div className="benefit-strip">
                    <span>
                      <span className="benefit-icon">
                        <Globe2 size={19} />
                      </span>
                      <span>
                        <strong>Your game. Your community.</strong>
                        <small>Find your people, one match at a time.</small>
                      </span>
                    </span>
                    <span>
                      <span className="benefit-icon">
                        <ShieldCheck size={20} />
                      </span>
                      <span>
                        <strong>Fair play comes first.</strong>
                        <small>Clear rules. Great competition.</small>
                      </span>
                    </span>
                    <span>
                      <span className="benefit-icon">
                        <Trophy size={19} />
                      </span>
                      <span>
                        <strong>Everyone starts somewhere.</strong>
                        <small>All skill levels. All welcome.</small>
                      </span>
                    </span>
                  </div>
                </>
              )}
              {path === "/my-competitions" ? (
                <MyCompetitions notify={notify} />
              ) : (
                <section className="discover-section">
                  <div className="section-heading">
                    <div>
                      <span className="eyebrow">
                        {path === "/saved"
                          ? "READY WHEN YOU ARE"
                          : "PICK YOUR NEXT CHALLENGE"}
                      </span>
                      <h2>
                        {path === "/saved"
                          ? "Saved competitions"
                          : "Explore competitions"}
                        <span className="count-badge">{filtered.length}</span>
                      </h2>
                    </div>
                    <span className="free-entry">
                      <span />
                      Free to enter. Made to compete.
                    </span>
                  </div>
                  <div
                    className="game-tabs"
                    role="group"
                    aria-label="Filter by game"
                  >
                    <button
                      className={game === "All games" ? "selected" : ""}
                      onClick={() => setGame("All games")}
                    >
                      <Gamepad2 size={18} />
                      All games
                    </button>
                    {games.map((g) => (
                      <button
                        key={g.name}
                        className={game === g.name ? "selected" : ""}
                        onClick={() => setGame(g.name)}
                      >
                        <span className="game-mini" style={{ color: g.color }}>
                          {g.short}
                        </span>
                        {g.name === "PUBG: Battlegrounds" ? "PUBG" : g.name}
                      </button>
                    ))}
                  </div>
                  <div className="filter-bar">
                    <label className="search-field">
                      <Search size={18} />
                      <input
                        aria-label="Search competitions"
                        placeholder="Search competitions, games, or hosts…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                      {search && (
                        <button
                          onClick={() => setSearch("")}
                          aria-label="Clear search"
                        >
                          <X size={15} />
                        </button>
                      )}
                    </label>
                    <label className="select-wrap">
                      <Globe2 size={16} />
                      <select
                        aria-label="Filter by region"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                      >
                        <option>All regions</option>
                        {Array.from(
                          new Set(data.competitions.map((e) => e.region)),
                        ).map((r) => (
                          <option key={r}>{r}</option>
                        ))}
                      </select>
                    </label>
                    <label className="select-wrap">
                      <Users size={16} />
                      <select
                        aria-label="Filter by skill"
                        value={skill}
                        onChange={(e) => setSkill(e.target.value)}
                      >
                        <option>All skill levels</option>
                        <option>All levels</option>
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                      </select>
                    </label>
                    <button
                      className={`secondary filter-button ${moreFilters ? "selected" : ""}`}
                      onClick={() => setMoreFilters(!moreFilters)}
                      aria-expanded={moreFilters}
                    >
                      <SlidersHorizontal size={16} />
                      Filters
                    </button>
                  </div>
                  {moreFilters && (
                    <div className="extra-filters">
                      <label>
                        Registration
                        <select
                          aria-label="Registration"
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                        >
                          <option>All statuses</option>
                          <option>Registration open</option>
                          <option>Registration closed</option>
                          <option>Full</option>
                          <option>Started</option>
                        </select>
                      </label>
                      <label>
                        Platform
                        <select
                          aria-label="Platform"
                          value={platform}
                          onChange={(e) => setPlatform(e.target.value)}
                        >
                          <option>All platforms</option>
                          <option>PC</option>
                          <option>Console</option>
                          <option>Mobile</option>
                          <option>Cross-platform</option>
                        </select>
                      </label>
                      <label>
                        Play location
                        <select
                          aria-label="Play location"
                          value={mode}
                          onChange={(e) => setMode(e.target.value)}
                        >
                          <option>All locations</option>
                          <option>Online</option>
                          <option>In person</option>
                        </select>
                      </label>
                      <button className="text-button" onClick={reset}>
                        Reset filters
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  <div className="results-bar">
                    <p>
                      Showing <strong>{filtered.length}</strong> competitions{" "}
                      <span>· Find your kind of competitive.</span>
                    </p>
                    <label>
                      <ArrowDownWideNarrow size={15} />
                      <select
                        aria-label="Sort competitions"
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                      >
                        <option>Recommended</option>
                        <option>Starting soon</option>
                        <option>Most spots available</option>
                      </select>
                    </label>
                  </div>
                  {filtered.length ? (
                    <div className="competition-grid">
                      {filtered.map((e) => (
                        <CompetitionCard
                          key={e.id}
                          event={e}
                          saved={data.saved.includes(e.id)}
                          onSave={() => savedToggle(e.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <Empty
                      title={
                        path === "/saved" && !data.saved.length
                          ? "Your next challenge belongs here."
                          : "No competitions match just yet."
                      }
                      text={
                        path === "/saved" && !data.saved.length
                          ? "Tap the bookmark on a competition to save it for later."
                          : "Try another game or clear your filters to see more competitions."
                      }
                      action={
                        path === "/saved" && !data.saved.length
                          ? () => router.push("/competitions")
                          : reset
                      }
                      label={
                        path === "/saved" && !data.saved.length
                          ? "Explore competitions"
                          : "Clear filters"
                      }
                    />
                  )}
                </section>
              )}
              {isHome && (
                <section className="bottom-cta">
                  <div className="cta-icon">
                    <Swords size={30} />
                  </div>
                  <div>
                    <h2>Don’t just play the game. Create the arena.</h2>
                    <p>
                      Bring your community together with a competition of your
                      own.
                    </p>
                  </div>
                  <Link href="/host" className="secondary">
                    Let’s make it happen
                    <ArrowUpRight size={17} />
                  </Link>
                </section>
              )}
            </>
          ) : (
            <Empty
              title="This arena doesn’t exist."
              text="Head back to discover your next competition."
              action={() => router.push("/")}
            />
          )}
          <footer className="footer">
            <span>
              <Swords size={15} />
              ArenaHub<span className="footer-dot">·</span>For players. By
              players.
            </span>
            <span>
              Sample competitions · Saved in this browser
              <button onClick={() => setHelp(true)}>
                About this demo
                <ArrowUpRight size={12} />
              </button>
            </span>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <span>
            <Check size={17} />
          </span>
          {toast}
          <button
            className="icon-button"
            onClick={() => setToast("")}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}
      {joining && (
        <JoinDialog
          event={joining}
          close={() => setJoining(null)}
          joined={() => {
            setJoining(null);
            notify(
              joining.approval
                ? "Registration submitted. Your host will review your entry."
                : "You’re in! Your entry is in My competitions.",
            );
          }}
        />
      )}
      {help && (
        <Modal title="Welcome to your arena." close={() => setHelp(false)}>
          <div className="help-content">
            <p>
              Discover a competition, read the rules, and join as a solo player
              or a team captain. Want to run the show? Create a competition and
              manage it from your host dashboard.
            </p>
            <div className="notice">
              <Gamepad2 size={20} />
              <p>
                This is an interactive demo. Events, registrations, and
                bookmarks are saved in this browser. Sample prizes are
                illustrative; there are no entry fees or payouts.
              </p>
            </div>
            <p>
              Organizer resources use the live Rebana License sandbox. This API
              provides council reference information; it does not store
              tournaments or submit license applications.
            </p>
            <Link
              href="/resources"
              className="primary"
              onClick={() => setHelp(false)}
            >
              View organizer resources
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </Modal>
      )}
    </div>
  );
}

export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

export function CompetitionCard({
  event,
  saved,
  onSave,
}: {
  event: Competition;
  saved: boolean;
  onSave: () => void;
}) {
  const registrations = useAppSelector((s) => s.competitions.registrations);
  const occupied = reservedPlaces(event, registrations);
  const state = entryStatus(event, registrations);
  const open = state === "Registration open";
  return (
    <article className="competition-card">
      <div className="card-image">
        <Link
          href={`/competitions/${event.id}`}
          tabIndex={-1}
          aria-hidden="true"
        >
          <GameArt src={event.image} alt="" />
        </Link>
        <span className={`entry-badge ${open ? "" : "closed"}`}>
          <span />
          {open ? "REGISTRATION OPEN" : state.toUpperCase()}
        </span>
        <button
          className={`save-button ${saved ? "is-saved" : ""}`}
          aria-label={`${saved ? "Unsave" : "Save"} ${event.title}`}
          aria-pressed={saved}
          onClick={onSave}
        >
          <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
        </button>
        <span className="game-label">{event.game}</span>
      </div>
      <div className="card-content">
        <div className="card-kicker">
          <span>
            {event.teamSize === 1
              ? "SOLO"
              : `${event.teamSize}V${event.teamSize}`}
          </span>
          <span>·</span>
          <span>{event.skill}</span>
          <span className="free-label">FREE ENTRY</span>
        </div>
        <h3>
          <Link href={`/competitions/${event.id}`}>{event.title}</Link>
        </h3>
        <p className="card-host">
          <span className="host-initial">{event.host[0]}</span>by {event.host}
          <ShieldCheck size={12} />
        </p>
        <div className="card-meta">
          <span>
            <CalendarDays size={14} />
            {dateLabel(event.startsAt)}
          </span>
          <span>
            <Globe2 size={14} />
            {event.mode} ·{" "}
            {event.region === "Southeast Asia" ? "SEA" : event.region}
          </span>
        </div>
        <div className="card-prize">
          <span>
            <Trophy size={16} />
            <strong>{event.prize || "Bragging rights"}</strong>
            <small>{event.prize ? "prize pool" : ""}</small>
          </span>
          <span>{event.platform}</span>
        </div>
        <div className="capacity">
          <div>
            <span>
              <Users size={13} />
              {occupied}
              <span>
                {" "}
                / {event.capacity} {event.teamSize === 1 ? "players" : "teams"}
              </span>
            </span>
            <span
              className={
                open && event.capacity - occupied <= 8 ? "limited" : ""
              }
            >
              {open
                ? `${event.capacity - occupied} spots left`
                : state === "Full"
                  ? "All spots taken"
                  : "Entries closed"}
            </span>
          </div>
          <div className="progress-track">
            <span
              style={{
                width: `${Math.min(100, (occupied / event.capacity) * 100)}%`,
              }}
            />
          </div>
        </div>
        <Link href={`/competitions/${event.id}`} className="card-action">
          View competition
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </article>
  );
}

function CompetitionDetail({
  event,
  onJoin,
  onSave,
  notify,
}: {
  event: Competition;
  onJoin: () => void;
  onSave: () => void;
  notify: (s: string) => void;
}) {
  const data = useAppSelector(selectArena);
  const dispatch = useAppDispatch();
  const registration = data.registrations.find(
    (r) =>
      r.competitionId === event.id &&
      r.userId === DEMO_USER &&
      ["pending", "confirmed"].includes(r.status),
  );
  const state = entryStatus(event, data.registrations);
  return (
    <>
      <Link href="/competitions" className="back-link">
        ← Back to competitions
      </Link>
      <div className="detail-banner">
        <GameArt src={event.image} alt={`${event.game} artwork`} />
        <div />
        <span className="tag">{event.game}</span>
        <h1>{event.title}</h1>
      </div>
      <div className="detail-grid">
        <div>
          <div className="panel detail-about">
            <span className="eyebrow">YOUR NEXT CHALLENGE</span>
            <h2>About the competition</h2>
            <p className="preserve-lines">{event.description}</p>
            <div className="detail-facts">
              <span>
                <Globe2 />
                {event.region}
                <small>
                  {event.mode}
                  {event.location ? ` · ${event.location}` : ""}
                </small>
              </span>
              <span>
                <Users />
                {event.teamSize === 1
                  ? "Solo players"
                  : `Teams of ${event.teamSize}`}
                <small>{event.skill}</small>
              </span>
              <span>
                <Gamepad2 />
                {event.platform}
                <small>{event.format}</small>
              </span>
            </div>
          </div>
          <div className="panel detail-about">
            <h2>Know the rules. Play your best.</h2>
            <p className="preserve-lines">{event.rules}</p>
          </div>
          {event.zoneCode && (
            <div className="panel detail-about">
              <h2>Organizer references</h2>
              <p>
                Council zone: {event.zoneCode}
                {event.licenseCode && ` · License type: ${event.licenseCode}`}
                {event.activityCode &&
                  ` · Business activity: ${event.activityCode}`}
              </p>
              <p className="muted">
                Reference selections do not indicate a license application or
                approval.
              </p>
            </div>
          )}
        </div>
        <aside className="detail-sidebar">
          <div className="panel">
            <span
              className={`status-chip ${state === "Registration open" ? "green" : ""}`}
            >
              {state}
            </span>
            <div className="detail-prize">
              <Trophy />
              <h2>{event.prize || "Bragging rights"}</h2>
              <p>
                {event.prize
                  ? "Illustrative prize pool · Free entry"
                  : "Free community competition"}
              </p>
            </div>
            <dl>
              <div>
                <dt>Competition starts</dt>
                <dd>{dateLabel(event.startsAt, true)}</dd>
              </div>
              <div>
                <dt>Registration closes</dt>
                <dd>{dateLabel(event.deadline, true)}</dd>
              </div>
              <div>
                <dt>Available places</dt>
                <dd>
                  {Math.max(
                    0,
                    event.capacity - reservedPlaces(event, data.registrations),
                  )}{" "}
                  of {event.capacity}{" "}
                  {event.teamSize === 1 ? "players" : "teams"}
                </dd>
              </div>
              <div>
                <dt>Hosted by</dt>
                <dd>{event.host}</dd>
              </div>
            </dl>
            {event.status === "cancelled" && (
              <p className="alert">Cancelled: {event.cancelReason}</p>
            )}
            {registration ? (
              <>
                <div className="notice">
                  <Check size={18} />
                  <p>
                    Your registration is <strong>{registration.status}</strong>.
                  </p>
                </div>
                {Date.parse(event.startsAt) > Date.now() && (
                  <button
                    className="secondary full-width"
                    onClick={() => {
                      dispatch(A.withdrawRegistration(registration.id));
                      notify(
                        "Registration withdrawn. Your spot has been released.",
                      );
                    }}
                  >
                    Withdraw registration
                  </button>
                )}
              </>
            ) : event.hostId === DEMO_USER ? (
              <Link href="/dashboard" className="primary full-width">
                Manage your competition
                <ArrowRight size={16} />
              </Link>
            ) : (
              <button
                className="primary full-width"
                disabled={state !== "Registration open"}
                onClick={onJoin}
              >
                Join competition
                <ArrowUpRight size={17} />
              </button>
            )}
            <button className="secondary full-width" onClick={onSave}>
              <Bookmark size={16} />
              {data.saved.includes(event.id)
                ? "Saved to your shortlist"
                : "Save for later"}
            </button>
            <p className="fine-print">
              {event.approval ? "Host approval required. " : ""}Demo
              registration · Saved in this browser.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

function JoinDialog({
  event,
  close,
  joined,
}: {
  event: Competition;
  close: () => void;
  joined: () => void;
}) {
  const data = useAppSelector(selectArena);
  const store = useAppStore();
  const dispatch = useAppDispatch();
  const [name, setName] = useState(event.teamSize === 1 ? "Alex Chen" : "");
  const [roster, setRoster] = useState<string[]>(
    Array.from({ length: event.teamSize }, (_, i) =>
      i === 0 ? "Alex#2048" : "",
    ),
  );
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  return (
    <Modal title="Your next challenge awaits." close={close}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const error = validateRegistration(
            event,
            data,
            name,
            roster,
            accepted,
          );
          if (error) {
            setError(error);
            return;
          }
          dispatch(
            A.joinCompetition({
              eventId: event.id,
              name,
              roster,
              accepted,
              id: crypto.randomUUID(),
            }),
          );
          const failure = store.getState().competitions.error;
          if (failure) setError(failure);
          else joined();
        }}
      >
        <p className="muted">
          {event.title} ·{" "}
          {event.teamSize === 1 ? "Solo entry" : `Team of ${event.teamSize}`}
        </p>
        <label className="field">
          {event.teamSize === 1 ? "Player name" : "Team name"}
          <input
            required
            maxLength={60}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Give your squad a name"
          />
        </label>
        {event.teamSize > 1 && (
          <p className="fine-print">
            You are registering as the team captain. Enter the full roster
            below.
          </p>
        )}
        <div className="form-grid">
          {roster.map((player, i) => (
            <label className="field" key={i}>
              Player {i + 1}
              {i === 0 ? " · You (captain)" : ""}
              <input
                required
                maxLength={60}
                aria-label={`Player ${i + 1} username`}
                value={player}
                onChange={(e) =>
                  setRoster((old) =>
                    old.map((p, j) => (i === j ? e.target.value : p)),
                  )
                }
                placeholder="In-game username"
              />
            </label>
          ))}
        </div>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />
          I accept the competition rules and confirm this roster.
        </label>
        {error && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}
        <button className="primary full-width" type="submit">
          {event.approval ? "Submit for approval" : "Confirm registration"}
          <ArrowRight size={17} />
        </button>
        <p className="fine-print">
          Free entry. This demo registration is stored in this browser.
        </p>
      </form>
    </Modal>
  );
}

function MyCompetitions({ notify }: { notify: (s: string) => void }) {
  const data = useAppSelector(selectArena);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const mine = data.registrations.filter((r) => r.userId === DEMO_USER);
  if (!mine.length)
    return (
      <Empty
        title="Your first competition is waiting."
        text="Join a competition and follow your registration right here."
        action={() => router.push("/competitions")}
      />
    );
  return (
    <div className="entry-list">
      {mine.map((r) => {
        const e = data.competitions.find((e) => e.id === r.competitionId);
        if (!e) return null;
        return (
          <article className="panel entry-row" key={r.id}>
            <GameArt src={e.image} alt="" />
            <div className="entry-info">
              <span className="eyebrow">{e.game}</span>
              <h2>
                <Link href={`/competitions/${e.id}`}>{e.title}</Link>
              </h2>
              <p>
                {r.name} · {dateLabel(e.startsAt, true)}
              </p>
              {e.status === "cancelled" && (
                <p className="error-text">Event cancelled: {e.cancelReason}</p>
              )}
            </div>
            <span
              className={`status-chip ${r.status === "confirmed" ? "green" : ""}`}
            >
              {r.status}
            </span>
            {["confirmed", "pending"].includes(r.status) &&
              Date.parse(e.startsAt) > Date.now() && (
                <button
                  className="secondary"
                  onClick={() => {
                    dispatch(A.withdrawRegistration(r.id));
                    notify("Registration withdrawn.");
                  }}
                >
                  Withdraw
                </button>
              )}
          </article>
        );
      })}
    </div>
  );
}
