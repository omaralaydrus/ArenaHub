"use client";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Database,
  Globe2,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { loadZones } from "@modules/zone/store/zone.action";
import { loadLicenseTypes } from "@modules/license-type/store/license-type.action";
import { loadBusinessActivities } from "@modules/business-activity/store/business-activity.action";
import { loadStatistics } from "@modules/statistics/store/statistics.action";
import { httpGet, HttpError } from "@core/http/http.client";
import type { SandboxPing } from "@shared/models/sandbox.model";
import type { Competition } from "@shared/models/competition.model";
import { PageHeading } from "@modules/competitions/pages/arena.page";

function useReferences() {
  const dispatch = useAppDispatch();
  const resources = useAppSelector(
    (s) => ({
      zone: s.zone,
      licenseType: s.licenseType,
      businessActivity: s.businessActivity,
      statistics: s.statistics,
    }),
    (a, b) =>
      a.zone === b.zone &&
      a.licenseType === b.licenseType &&
      a.businessActivity === b.businessActivity &&
      a.statistics === b.statistics,
  );
  const [ping, setPing] = useState<SandboxPing | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const [retryAt, setRetryAt] = useState(0);
  const [tick, setTick] = useState(Date.now());
  const errors = [
    error,
    resources.zone.zonesError,
    resources.licenseType.typesError,
    resources.businessActivity.activitiesError,
    resources.statistics.statisticsError,
  ].filter(Boolean);
  const retry = Math.max(
    resources.zone.retryAfterSeconds ?? 0,
    resources.licenseType.retryAfterSeconds ?? 0,
    resources.businessActivity.retryAfterSeconds ?? 0,
    resources.statistics.retryAfterSeconds ?? 0,
  );
  useEffect(() => {
    if (retry) setRetryAt(Date.now() + retry * 1000);
  }, [
    retry,
    resources.zone.zonesError,
    resources.licenseType.typesError,
    resources.businessActivity.activitiesError,
    resources.statistics.statisticsError,
  ]);
  useEffect(() => {
    if (!retryAt) return;
    const timer = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [retryAt]);
  const remaining = Math.max(0, Math.ceil((retryAt - tick) / 1000));
  const loading =
    connecting ||
    resources.zone.zonesLoading ||
    resources.licenseType.typesLoading ||
    resources.businessActivity.activitiesLoading ||
    resources.statistics.statisticsLoading;
  async function load(includeStats = false) {
    if (loading || remaining) return;
    setConnecting(true);
    setError("");
    try {
      const ping = await httpGet<SandboxPing>("ping");
      setPing(ping);
      dispatch(loadZones());
      dispatch(loadLicenseTypes());
      dispatch(loadBusinessActivities());
      if (includeStats) dispatch(loadStatistics());
    } catch (e) {
      setPing(null);
      setError(e instanceof Error ? e.message : "Could not connect to Rebana.");
      if (e instanceof HttpError && e.retryAfterSeconds) {
        setRetryAt(Date.now() + e.retryAfterSeconds * 1000);
        setTick(Date.now());
      }
    } finally {
      setConnecting(false);
    }
  }
  return {
    ...resources,
    ping,
    loading,
    errors: Array.from(new Set(errors)),
    remaining,
    load,
  };
}

export function ReferenceFields({
  event,
  patch,
}: {
  event: Competition;
  patch: <K extends keyof Competition>(key: K, value: Competition[K]) => void;
}) {
  const r = useReferences();
  return (
    <div className="reference-fields">
      <div className="reference-fields-title">
        <ShieldCheck size={19} />
        <strong>Local organizer references</strong>
        <span className="tag">REBANA</span>
      </div>
      <p className="muted">
        Optionally associate your venue with a council zone and reference codes.
        These selections do not submit an application or confirm approval.
      </p>
      <button
        type="button"
        className="secondary"
        disabled={r.loading || r.remaining > 0}
        onClick={() => r.load()}
      >
        <RefreshCw size={15} className={r.loading ? "spin" : ""} />
        {r.loading
          ? "Loading council references…"
          : r.remaining
            ? `Retry in ${r.remaining}s`
            : "Load live council references"}
      </button>
      {r.errors.map((e) => (
        <p className="error-text" role="alert" key={e}>
          {e}
        </p>
      ))}
      {r.zone.zones.length > 0 && (
        <div className="form-grid">
          <label className="field">
            Council zone
            <select
              aria-label="Council zone"
              value={event.zoneCode}
              onChange={(e) => patch("zoneCode", e.target.value)}
            >
              <option value="">No zone selected</option>
              {r.zone.zones.map((z) => (
                <option key={z.zoneCode} value={z.zoneCode}>
                  {z.zoneCode} · {z.nameEn || z.nameMs}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            License / permit reference
            <select
              aria-label="License / permit reference"
              value={event.licenseCode}
              onChange={(e) => patch("licenseCode", e.target.value)}
            >
              <option value="">No license type selected</option>
              {r.licenseType.types.map((t) => (
                <option key={t.code} value={t.code}>
                  {t.nameEn || t.name} · {t.family}
                </option>
              ))}
            </select>
          </label>
          <label className="field wide">
            Business activity reference
            <select
              aria-label="Business activity reference"
              value={event.activityCode}
              onChange={(e) => patch("activityCode", e.target.value)}
            >
              <option value="">No activity selected</option>
              {r.businessActivity.activities
                .filter((a) => a.selectable)
                .map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.code} · {a.nameEn || a.name}
                  </option>
                ))}
            </select>
          </label>
        </div>
      )}
      {(event.zoneCode || event.licenseCode || event.activityCode) && (
        <p className="fine-print">
          Saved references:{" "}
          {[event.zoneCode, event.licenseCode, event.activityCode]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}
    </div>
  );
}

export function ResourcesPage() {
  const r = useReferences();
  const [tab, setTab] = useState("Zones");
  const [filter, setFilter] = useState("");
  useEffect(() => {
    void r.load(true);
  }, []); // One initial load; refresh is explicit and respects Retry-After.
  const match = (...values: (string | null)[]) =>
    values.join(" ").toLowerCase().includes(filter.toLowerCase());
  return (
    <>
      <PageHeading
        eyebrow="BETTER INFORMED. BETTER ORGANIZED."
        title="A little groundwork goes a long way."
        description="Live council reference information for organizers planning in-person events."
        action={
          <button
            className="primary"
            onClick={() => r.load(true)}
            disabled={r.loading || r.remaining > 0}
          >
            <RefreshCw size={16} className={r.loading ? "spin" : ""} />
            {r.loading
              ? "Connecting…"
              : r.remaining
                ? `Retry in ${r.remaining}s`
                : "Refresh live data"}
          </button>
        }
      />
      <div className="resource-intro panel">
        <span className="resource-logo">
          <Database size={25} />
        </span>
        <div>
          <h2>Connected to Rebana License</h2>
          <p>
            Official sandbox reference data. Zones, license types, business
            activities, and licensing statistics.
          </p>
        </div>
        <span className={`status-chip ${r.ping ? "green" : ""}`}>
          {r.ping ? (
            <>
              <CheckCircle2 size={13} />
              Connected
            </>
          ) : r.loading ? (
            "Connecting"
          ) : (
            "Unavailable"
          )}
        </span>
      </div>
      <div className="notice">
        <ShieldCheck size={20} />
        <p>
          This reference catalog helps you describe your event’s location and
          activity. It does not determine whether a permit is required, submit
          applications, or indicate approval. Competition registrations are
          saved separately in this browser.
        </p>
      </div>
      {r.errors.map((e) => (
        <div className="alert" role="alert" key={e}>
          {e}
          {r.remaining > 0 && ` Retry available in ${r.remaining}s.`}
        </div>
      ))}
      <div className="stats-row">
        <div className="panel">
          <Globe2 size={20} />
          <strong>{r.zone.zones.length || "—"}</strong>
          <span>Council zones</span>
        </div>
        <div className="panel">
          <ShieldCheck size={20} />
          <strong>{r.licenseType.types.length || "—"}</strong>
          <span>License & permit types</span>
        </div>
        <div className="panel">
          <Database size={20} />
          <strong>{r.businessActivity.activities.length || "—"}</strong>
          <span>Business activity records</span>
        </div>
      </div>
      <section className="panel resource-panel">
        <div className="resource-tabs">
          {[
            "Zones",
            "License types",
            "Business activities",
            "Licensing statistics",
          ].map((t) => (
            <button
              key={t}
              className={tab === t ? "active" : ""}
              onClick={() => {
                setTab(t);
                setFilter("");
              }}
            >
              {t}
            </button>
          ))}
        </div>
        {tab !== "Licensing statistics" && (
          <label className="search-field resource-search">
            <Search size={17} />
            <input
              aria-label="Search organizer references"
              placeholder={`Search ${tab.toLowerCase()} by code or name…`}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </label>
        )}
        {r.loading && (
          <p className="loading">
            <span className="spinner" />
            Loading all pages from the council…
          </p>
        )}
        {tab === "Zones" && (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Zone code</th>
                  <th>Name</th>
                  <th>Parent DUN</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {r.zone.zones
                  .filter((z) =>
                    match(z.zoneCode, z.nameMs, z.nameEn, z.dunCode),
                  )
                  .map((z) => (
                    <tr key={z.zoneCode}>
                      <td className="code-cell">{z.zoneCode}</td>
                      <td>
                        {z.nameEn || z.nameMs}
                        <small>{z.nameEn ? z.nameMs : ""}</small>
                      </td>
                      <td>{z.dunCode}</td>
                      <td>
                        <span className="status-chip green">
                          {z.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {!r.loading &&
              !r.zone.zones.filter((z) =>
                match(z.zoneCode, z.nameMs, z.nameEn, z.dunCode),
              ).length && (
                <p className="table-empty">
                  {r.errors.length
                    ? "Reference data is unavailable. Use Refresh live data to retry."
                    : "No matching zones."}
                </p>
              )}
          </div>
        )}
        {tab === "License types" && (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Family</th>
                  <th>Risk classification</th>
                </tr>
              </thead>
              <tbody>
                {r.licenseType.types
                  .filter((t) => match(t.code, t.name, t.nameEn))
                  .map((t) => (
                    <tr key={t.code}>
                      <td className="code-cell">{t.code}</td>
                      <td>
                        {t.nameEn || t.name}
                        <small>{t.nameEn ? t.name : ""}</small>
                      </td>
                      <td>{t.family}</td>
                      <td>
                        {t.riskCategory === null
                          ? "Unclassified"
                          : t.riskCategory === "HIGH_RISK"
                            ? "High risk"
                            : "Not high risk"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {!r.loading &&
              !r.licenseType.types.filter((t) =>
                match(t.code, t.name, t.nameEn),
              ).length && (
                <p className="table-empty">No matching license types.</p>
              )}
          </div>
        )}
        {tab === "Business activities" && (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Activity</th>
                  <th>Tier</th>
                  <th>Usage</th>
                </tr>
              </thead>
              <tbody>
                {r.businessActivity.activities
                  .filter((a) => match(a.code, a.name, a.nameEn))
                  .map((a) => (
                    <tr key={a.code}>
                      <td className="code-cell">{a.code}</td>
                      <td>
                        {a.nameEn || a.name}
                        <small>{a.nameEn ? a.name : ""}</small>
                      </td>
                      <td>{a.tier}</td>
                      <td>
                        {a.selectable ? "Selectable activity" : "Grouping only"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {!r.loading &&
              !r.businessActivity.activities.filter((a) =>
                match(a.code, a.name, a.nameEn),
              ).length && (
                <p className="table-empty">No matching activities.</p>
              )}
          </div>
        )}
        {tab === "Licensing statistics" &&
          (r.statistics.statistics ? (
            <div className="statistics-content">
              <p className="muted">
                These are council licensing counts, not ArenaHub players or
                competitions.
              </p>
              <div className="statistics-grid">
                {Object.entries({
                  "Account lifecycle":
                    r.statistics.statistics.credentialStatusCounts,
                  "License application stages":
                    r.statistics.statistics.licenseApplicationStageCounts,
                  "Permit application stages":
                    r.statistics.statistics.permitApplicationStageCounts,
                }).map(([title, counts]) => (
                  <div key={title}>
                    <h3>{title}</h3>
                    <dl>
                      {Object.entries(counts).map(([key, value]) => (
                        <div key={key}>
                          <dt>{key.replaceAll("_", " ")}</dt>
                          <dd>{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
              <div className="stats-row">
                <div className="panel">
                  <strong>{r.statistics.statistics.expiringSoonCount}</strong>
                  <span>Accounts expiring in 30 days</span>
                </div>
                <div className="panel">
                  <strong>
                    {r.statistics.statistics.inspectionPendingCount}
                  </strong>
                  <span>Pending inspections</span>
                </div>
                <div className="panel">
                  <strong>
                    {r.statistics.statistics.inspectionCompletedCount}
                  </strong>
                  <span>Completed inspections</span>
                </div>
              </div>
            </div>
          ) : (
            !r.loading && (
              <p className="table-empty">
                Licensing statistics are unavailable. Refresh to try again.
              </p>
            )
          ))}
      </section>
      <p className="resource-source">
        Source: Rebana License sandbox · All available pages are loaded.
        <a
          href="https://rebana.canang.com.my/rebana-license/v3/api-docs/sandbox"
          target="_blank"
          rel="noreferrer"
        >
          API specification
          <ArrowUpRight size={13} />
        </a>
      </p>
    </>
  );
}
