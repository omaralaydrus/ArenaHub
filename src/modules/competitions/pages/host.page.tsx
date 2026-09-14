"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Eye,
  Pencil,
  Plus,
  Save,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { useAppDispatch, useAppSelector, useAppStore } from "@store/hooks";
import { DEMO_USER, type Competition } from "@shared/models/competition.model";
import { gameImage, games } from "@shared/data/competitions";
import { validateCompetition } from "@shared/services/competition.service";
import { selectArena } from "../store/competition.selector";
import * as A from "../store/competition.action";
import { Empty, GameArt, Modal, dateLabel } from "@shared/components/ui";
import { PageHeading } from "./arena.page";
import { ReferenceFields } from "@modules/resources/pages/resources.page";

function freshEvent(): Competition {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    title: "",
    game: games[0].name,
    description: "",
    image: gameImage(games[0].name),
    host: "Alex Chen",
    hostId: DEMO_USER,
    region: "Southeast Asia",
    platform: "PC",
    skill: "All levels",
    mode: "Online",
    location: "",
    zoneCode: "",
    licenseCode: "",
    activityCode: "",
    teamSize: 1,
    capacity: 16,
    occupied: 0,
    startsAt: new Date(now + 7 * 86400000).toISOString(),
    deadline: new Date(now + 6 * 86400000).toISOString(),
    prize: "",
    rules:
      "Play fair. No cheating, exploits, or harassment.\nCheck in 15 minutes before your first match.\nFollow the host’s decisions on disputed results.",
    approval: false,
    status: "draft",
    cancelReason: "",
    format: "Single elimination",
  };
}

export function HostPage({
  dashboard,
  notify,
}: {
  dashboard: boolean;
  notify: (message: string) => void;
}) {
  const data = useAppSelector(selectArena);
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const [editing, setEditing] = useState<Competition | null>(null);
  const [cancelling, setCancelling] = useState<Competition | null>(null);
  const [reason, setReason] = useState("");
  const [managing, setManaging] = useState<string | null>(null);
  const [saved, setSaved] = useState<Competition | null>(null);
  const hosted = data.competitions.filter((e) => e.hostId === DEMO_USER);
  const reviewEvent = data.competitions.find((e) => e.id === managing);
  const complete = (event: Competition) => {
    setEditing(null);
    setSaved(event);
    notify(
      event.status === "draft"
        ? "Draft saved. Find it in your host dashboard."
        : "Your competition is published and ready to discover.",
    );
  };
  if ((!dashboard || editing) && !saved)
    return (
      <EventEditor
        key={editing?.id ?? "new"}
        initial={editing}
        complete={complete}
        cancel={editing ? () => setEditing(null) : undefined}
      />
    );
  return (
    <>
      <PageHeading
        eyebrow="YOUR RULES. YOUR ARENA."
        title="Make great competition happen."
        description="Your events, registrations, and next big ideas. All in one place."
        action={
          <button
            className="primary"
            onClick={() => {
              setSaved(null);
              setEditing(freshEvent());
            }}
          >
            <Plus size={17} />
            Create competition
          </button>
        }
      />
      {saved && (
        <div className="success-banner">
          <Check size={20} />
          <div>
            <strong>
              {saved.status === "published"
                ? "Your arena is open."
                : "Your draft is saved."}
            </strong>
            <p>
              {saved.title}
              {saved.status === "published"
                ? " is now listed in Explore."
                : " is ready to edit and publish when you are."}
            </p>
          </div>
          {saved.status === "published" && (
            <Link href={`/competitions/${saved.id}`} className="secondary">
              View competition
              <ArrowUpRight size={16} />
            </Link>
          )}
        </div>
      )}
      <div className="stats-row">
        <div className="panel">
          <Trophy size={20} />
          <strong>{hosted.length}</strong>
          <span>Competitions hosted</span>
        </div>
        <div className="panel">
          <Users size={20} />
          <strong>
            {
              data.registrations.filter(
                (r) =>
                  hosted.some((e) => e.id === r.competitionId) &&
                  ["pending", "confirmed"].includes(r.status),
              ).length
            }
          </strong>
          <span>Active registrations</span>
        </div>
        <div className="panel">
          <Pencil size={20} />
          <strong>{hosted.filter((e) => e.status === "draft").length}</strong>
          <span>Drafts in the making</span>
        </div>
      </div>
      {!hosted.length ? (
        <Empty
          title="Give your community a place to compete."
          text="Create your first competition. You set the game, the format, and the rules."
          action={() => {
            setSaved(null);
            setEditing(freshEvent());
          }}
          label="Create your first competition"
        />
      ) : (
        <div className="entry-list">
          {hosted.map((event) => (
            <article className="panel host-row" key={event.id}>
              <div className="entry-row">
                <GameArt src={event.image} alt="" />
                <div className="entry-info">
                  <span className="eyebrow">{event.game}</span>
                  <h2>{event.title}</h2>
                  <p>
                    {dateLabel(event.startsAt, true)} ·{" "}
                    {event.teamSize === 1
                      ? "Solo"
                      : `${event.teamSize}-player teams`}
                  </p>
                </div>
                <span
                  className={`status-chip ${event.status === "published" ? "green" : ""}`}
                >
                  {event.status}
                </span>
              </div>
              <div className="host-actions">
                <Link
                  href={`/competitions/${event.id}`}
                  className="text-button"
                >
                  <Eye size={15} />
                  View
                </Link>
                {event.status !== "cancelled" && (
                  <>
                    <button
                      className="text-button"
                      onClick={() => {
                        setSaved(null);
                        setEditing(event);
                      }}
                    >
                      <Pencil size={15} />
                      Edit {event.status === "draft" ? "draft" : "event"}
                    </button>
                    <button
                      className="text-button"
                      onClick={() => setManaging(event.id)}
                    >
                      <Users size={15} />
                      Manage registrations
                    </button>
                    <button
                      className="text-button danger"
                      onClick={() => {
                        setReason("");
                        setCancelling(event);
                      }}
                    >
                      <X size={15} />
                      Cancel event
                    </button>
                  </>
                )}
                {event.status === "cancelled" && (
                  <p className="muted">
                    Cancellation reason: {event.cancelReason}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      {cancelling && (
        <Modal
          title="Cancel this competition"
          close={() => setCancelling(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              dispatch(A.cancelCompetition({ id: cancelling.id, reason }));
              if (!store.getState().competitions.error) {
                setCancelling(null);
                notify(
                  "Competition cancelled. The reason is shown to participants.",
                );
              }
            }}
          >
            <p className="muted">
              Participants will see the cancellation reason on{" "}
              {cancelling.title}.
            </p>
            <label className="field">
              Cancellation reason
              <textarea
                required
                minLength={3}
                maxLength={1000}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Let players know what happened."
              />
            </label>
            <button className="danger-button" type="submit">
              Cancel competition
            </button>
          </form>
        </Modal>
      )}
      {reviewEvent && (
        <Modal
          title={`Registrations · ${reviewEvent.title}`}
          close={() => setManaging(null)}
        >
          {data.registrations.filter((r) => r.competitionId === managing)
            .length ? (
            data.registrations
              .filter((r) => r.competitionId === managing)
              .map((r) => (
                <div className="registration-review" key={r.id}>
                  <strong>{r.name}</strong>
                  <span className="status-chip">{r.status}</span>
                  <p>{r.roster.join(", ")}</p>
                  {r.status === "pending" &&
                    reviewEvent.status === "published" &&
                    Date.parse(reviewEvent.startsAt) > Date.now() && (
                      <div className="button-row">
                        <button
                          className="primary"
                          onClick={() => {
                            dispatch(
                              A.reviewRegistration({
                                id: r.id,
                                approved: true,
                              }),
                            );
                            notify("Registration approved.");
                          }}
                        >
                          Approve
                          <Check size={15} />
                        </button>
                        <button
                          className="secondary"
                          onClick={() => {
                            dispatch(
                              A.reviewRegistration({
                                id: r.id,
                                approved: false,
                              }),
                            );
                            notify(
                              "Registration rejected and its place released.",
                            );
                          }}
                        >
                          Reject
                          <X size={15} />
                        </button>
                      </div>
                    )}
                </div>
              ))
          ) : (
            <Empty
              title="The roster starts here."
              text="Registrations for this event will appear here. This local demo cannot receive entries from other browsers."
            />
          )}
        </Modal>
      )}
    </>
  );
}

function localDate(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}
function EventEditor({
  initial,
  complete,
  cancel,
}: {
  initial: Competition | null;
  complete: (e: Competition) => void;
  cancel?: () => void;
}) {
  const data = useAppSelector(selectArena);
  const store = useAppStore();
  const dispatch = useAppDispatch();
  const [event, setEvent] = useState<Competition>(
    () => initial ?? freshEvent(),
  );
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");
  const [customGame, setCustomGame] = useState(
    !games.some((g) => g.name === event.game),
  );
  const [imageError, setImageError] = useState(false);
  const locked = data.registrations.some((r) => r.competitionId === event.id);
  const patch = <K extends keyof Competition>(
    key: K,
    value: Competition[K],
  ) => {
    setEvent((old) => ({ ...old, [key]: value }));
    setError("");
  };
  const save = (publish: boolean) => {
    const error = validateCompetition(event, data);
    if (error) {
      setError(error);
      return;
    }
    if (imageError) {
      setError(
        "Your selected cover could not load. Choose the default artwork or another HTTPS image.",
      );
      return;
    }
    dispatch(A.saveCompetition({ event, publish }));
    const failure = store.getState().competitions.error;
    if (failure) setError(failure);
    else complete({ ...event, status: publish ? "published" : "draft" });
  };
  return (
    <>
      <PageHeading
        eyebrow="BRING YOUR COMMUNITY TOGETHER"
        title={
          initial?.title
            ? "Fine-tune your competition."
            : "Great games start with a host."
        }
        description="Set the stage. Invite your people. Make it a competition to remember."
      />
      <div className="editor-steps">
        <span className={!preview ? "active" : ""}>
          <b>1</b>The details
        </span>
        <span className="step-line" />
        <span className={preview ? "active" : ""}>
          <b>2</b>Preview & publish
        </span>
        <span className="editor-draft">
          {event.status === "published"
            ? "Editing published event"
            : "Draft competition"}
        </span>
      </div>
      <form
        className="editor-grid"
        onSubmit={(e) => {
          e.preventDefault();
          const error = validateCompetition(event, data);
          if (error) setError(error);
          else {
            setPreview(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
      >
        <div className="editor-main">
          {preview ? (
            <>
              <div className="panel preview-panel">
                <GameArt src={event.image} alt="Competition cover preview" />
                <span className="eyebrow">
                  {event.game} · {event.mode}
                </span>
                <h2>{event.title}</h2>
                <p className="preserve-lines">{event.description}</p>
                <div className="detail-facts">
                  <span>
                    {dateLabel(event.startsAt, true)}
                    <small>Start time</small>
                  </span>
                  <span>
                    {event.capacity}{" "}
                    {event.teamSize === 1 ? "players" : "teams"}
                    <small>{event.teamSize} player(s) per entry</small>
                  </span>
                </div>
                <h3>Competition rules</h3>
                <p className="preserve-lines">{event.rules}</p>
                <p>Registration closes {dateLabel(event.deadline, true)}.</p>
                {event.location && <p>Venue: {event.location}</p>}
                {event.zoneCode && <p>Council zone: {event.zoneCode}</p>}
                <p>
                  {event.approval
                    ? "Host approval required."
                    : "Eligible entries are automatically confirmed."}
                </p>
              </div>
              <div className="notice">
                <Check size={20} />
                <p>
                  Looking good? Publish to list this competition in Explore, or
                  save it as a draft to come back later. This demo saves your
                  event in this browser.
                </p>
              </div>
            </>
          ) : (
            <>
              <section className="panel form-section">
                <div className="form-section-title">
                  <span>01</span>
                  <div>
                    <h2>Make it yours</h2>
                    <p>A great name is the start of a great competition.</p>
                  </div>
                </div>
                <label className="field">
                  Competition title
                  <input
                    required
                    minLength={5}
                    maxLength={100}
                    value={event.title}
                    onChange={(e) => patch("title", e.target.value)}
                    placeholder="e.g. Friday Night Community Clash"
                  />
                </label>
                <div className="form-grid">
                  <label className="field">
                    Game
                    <select
                      aria-label="Game"
                      disabled={locked}
                      value={customGame ? "Other game" : event.game}
                      onChange={(e) => {
                        setCustomGame(e.target.value === "Other game");
                        patch(
                          "game",
                          e.target.value === "Other game" ? "" : e.target.value,
                        );
                        patch("image", gameImage(e.target.value));
                        setImageError(false);
                      }}
                    >
                      {games.map((g) => (
                        <option key={g.name}>{g.name}</option>
                      ))}
                      <option>Other game</option>
                    </select>
                  </label>
                  <label className="field">
                    Platform
                    <select
                      aria-label="Platform"
                      value={event.platform}
                      onChange={(e) => patch("platform", e.target.value)}
                    >
                      <option>PC</option>
                      <option>Console</option>
                      <option>Mobile</option>
                      <option>Cross-platform</option>
                    </select>
                  </label>
                </div>
                {customGame && (
                  <label className="field">
                    Game name
                    <input
                      required
                      disabled={locked}
                      maxLength={80}
                      value={event.game}
                      onChange={(e) => patch("game", e.target.value)}
                    />
                  </label>
                )}
                <label className="field">
                  Description
                  <textarea
                    required
                    maxLength={3000}
                    rows={4}
                    value={event.description}
                    onChange={(e) => patch("description", e.target.value)}
                    placeholder="Tell players what makes your competition worth joining."
                  />
                </label>
                <label className="field">
                  Custom cover image{" "}
                  <span className="optional">Optional · HTTPS image URL</span>
                  <input
                    type="url"
                    pattern="https://.*"
                    maxLength={1000}
                    value={
                      event.image.startsWith("https://") ? event.image : ""
                    }
                    onChange={(e) => {
                      patch("image", e.target.value || gameImage(event.game));
                      setImageError(false);
                    }}
                    placeholder="https://example.com/your-cover.jpg"
                  />
                </label>
              </section>
              <section className="panel form-section">
                <div className="form-section-title">
                  <span>02</span>
                  <div>
                    <h2>Choose the challenge</h2>
                    <p>Let players know how the competition works.</p>
                  </div>
                </div>
                <div className="form-grid">
                  <label className="field">
                    Players per entry
                    <select
                      aria-label="Players per entry"
                      disabled={locked}
                      value={event.teamSize}
                      onChange={(e) =>
                        patch("teamSize", Number(e.target.value))
                      }
                    >
                      {Array.from({ length: 10 }, (_, i) => (
                        <option key={i} value={i + 1}>
                          {i === 0
                            ? "Solo · 1 player"
                            : `Team · ${i + 1} players`}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    Maximum {event.teamSize === 1 ? "players" : "teams"}
                    <input
                      required
                      type="number"
                      min={2}
                      max={256}
                      value={event.capacity}
                      onChange={(e) =>
                        patch("capacity", Number(e.target.value))
                      }
                    />
                  </label>
                  <label className="field">
                    Tournament format
                    <select
                      aria-label="Tournament format"
                      value={event.format}
                      onChange={(e) => patch("format", e.target.value)}
                    >
                      <option>Single elimination</option>
                      <option>Round robin</option>
                      <option>Battle royale</option>
                      <option>Custom format</option>
                    </select>
                  </label>
                  <label className="field">
                    Skill level
                    <select
                      aria-label="Skill level"
                      value={event.skill}
                      onChange={(e) => patch("skill", e.target.value)}
                    >
                      <option>All levels</option>
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </label>
                </div>
                <label className="field">
                  Prize description{" "}
                  <span className="optional">
                    Optional · No payments are processed
                  </span>
                  <input
                    maxLength={80}
                    value={event.prize}
                    onChange={(e) => patch("prize", e.target.value)}
                    placeholder="e.g. RM 500 or community bragging rights"
                  />
                </label>
                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    checked={event.approval}
                    onChange={(e) => patch("approval", e.target.checked)}
                  />
                  Review and approve registrations before confirming entries
                </label>
              </section>
              <section className="panel form-section">
                <div className="form-section-title">
                  <span>03</span>
                  <div>
                    <h2>Set the time and place</h2>
                    <p>
                      Times use your local time zone:{" "}
                      {Intl.DateTimeFormat().resolvedOptions().timeZone}.
                    </p>
                  </div>
                </div>
                <div className="form-grid">
                  <label className="field">
                    Competition starts
                    <input
                      required
                      type="datetime-local"
                      value={localDate(event.startsAt)}
                      onChange={(e) =>
                        patch(
                          "startsAt",
                          e.target.value
                            ? new Date(e.target.value).toISOString()
                            : "",
                        )
                      }
                    />
                  </label>
                  <label className="field">
                    Registration closes
                    <input
                      required
                      type="datetime-local"
                      value={localDate(event.deadline)}
                      onChange={(e) =>
                        patch(
                          "deadline",
                          e.target.value
                            ? new Date(e.target.value).toISOString()
                            : "",
                        )
                      }
                    />
                  </label>
                  <label className="field">
                    Play location
                    <select
                      aria-label="Play location"
                      value={event.mode}
                      onChange={(e) =>
                        patch("mode", e.target.value as Competition["mode"])
                      }
                    >
                      <option>Online</option>
                      <option>In person</option>
                    </select>
                  </label>
                  <label className="field">
                    Region
                    <select
                      aria-label="Region"
                      value={event.region}
                      onChange={(e) => patch("region", e.target.value)}
                    >
                      <option>Southeast Asia</option>
                      <option>East Asia</option>
                      <option>Europe</option>
                      <option>North America</option>
                      <option>Oceania</option>
                      <option>Global</option>
                    </select>
                  </label>
                </div>
                {event.mode === "In person" && (
                  <>
                    <label className="field">
                      Venue name and address
                      <input
                        required
                        maxLength={300}
                        value={event.location}
                        onChange={(e) => patch("location", e.target.value)}
                        placeholder="Venue name, street, city"
                      />
                    </label>
                    <ReferenceFields event={event} patch={patch} />
                  </>
                )}
              </section>
              <section className="panel form-section">
                <div className="form-section-title">
                  <span>04</span>
                  <div>
                    <h2>Keep it fair</h2>
                    <p>
                      Clear expectations make a better experience for everyone.
                    </p>
                  </div>
                </div>
                <label className="field">
                  Competition rules
                  <textarea
                    required
                    maxLength={5000}
                    rows={5}
                    value={event.rules}
                    onChange={(e) => patch("rules", e.target.value)}
                  />
                </label>
              </section>
            </>
          )}
          {error && (
            <p className="alert" role="alert">
              {error}
            </p>
          )}
          <div className="editor-actions">
            {preview ? (
              <>
                <button
                  className="secondary"
                  type="button"
                  onClick={() => setPreview(false)}
                >
                  <Pencil size={16} />
                  Back to details
                </button>
                {event.status !== "published" && (
                  <button
                    className="secondary"
                    type="button"
                    onClick={() => save(false)}
                  >
                    <Save size={16} />
                    Save draft
                  </button>
                )}
                <button
                  className="primary"
                  type="button"
                  onClick={() => save(true)}
                >
                  {event.status === "published"
                    ? "Publish changes"
                    : "Publish competition"}
                  <ArrowUpRight size={17} />
                </button>
              </>
            ) : (
              <>
                {cancel && (
                  <button
                    className="text-button"
                    type="button"
                    onClick={cancel}
                  >
                    Back to dashboard
                  </button>
                )}
                {event.status !== "published" && (
                  <button
                    className="secondary"
                    type="button"
                    onClick={() => save(false)}
                  >
                    <Save size={16} />
                    Save draft
                  </button>
                )}
                <button className="primary" type="submit">
                  Preview competition
                  <ArrowRight size={17} />
                </button>
              </>
            )}
          </div>
        </div>
        <aside className="editor-aside">
          <div className="panel cover-preview">
            <div className="cover-image">
              <img
                src={event.image}
                alt="Selected competition cover"
                onError={() => setImageError(true)}
                onLoad={() => setImageError(false)}
              />
            </div>
            <span className="eyebrow">YOUR COMPETITION AT A GLANCE</span>
            <h3>{event.title || "Your next great competition"}</h3>
            <p>
              {event.game || "Your game"} ·{" "}
              {event.teamSize === 1 ? "Solo" : `${event.teamSize}-player teams`}
            </p>
            <div className="preview-divider" />
            <span>
              <Users size={16} />
              {event.capacity} places · {event.mode}
            </span>
            <span>
              <Trophy size={16} />
              {event.prize || "For the love of the game"}
            </span>
          </div>
          <div className="host-tip">
            <span className="eyebrow">A LITTLE HOST WISDOM</span>
            <h3>Good hosts build great communities.</h3>
            <p>
              Keep the rules clear, give players time to prepare, and make
              everyone feel welcome.
            </p>
          </div>
        </aside>
      </form>
    </>
  );
}
