// ── Roles and permissions ─────────────────────────────────────────────────────
//
// One place defines who may do what. Pure and dependency-free, so the edge middleware, route
// handlers, pages and the sidebar all use the same rules (same model as the KPD CMS).
//
//   admin        everything: settings, team, activity log, permanent deletion.
//   editor       writes and publishes content, edits the live pages, uploads media, handles
//                submissions and the RSS queue. Cannot delete permanently, change settings or
//                manage the team.
//   contributor  writes DRAFTS of news and projects only (and may submit news for review).
//                Cannot publish, change anything that is live, delete, or see submissions.
//   viewer       read-only: can look at content, submissions and the RSS queue, nothing else.

export const roles = ["admin", "editor", "contributor", "viewer"] as const;
export type Role = (typeof roles)[number];

export type Permission =
  | "content.write" //      create and edit drafts of news and projects
  | "content.editLive" //   change anything already live; edit site pages, FAQs, jobs; restore versions
  | "content.publish" //    publish / unpublish
  | "content.delete" //     permanently delete content
  | "media.upload" //       upload media, edit alt text
  | "media.delete"
  | "inbox.read" //         view submissions (incl. CVs) and the RSS queue
  | "messages.manage" //    retry Salesforce sync
  | "rss.review" //         fetch feeds, approve or reject RSS items, manage sources
  | "settings.manage"
  | "team.manage"
  | "activity.read";

const grants: Record<Permission, readonly Role[]> = {
  "content.write": ["admin", "editor", "contributor"],
  "content.editLive": ["admin", "editor"],
  "content.publish": ["admin", "editor"],
  "content.delete": ["admin"],
  "media.upload": ["admin", "editor", "contributor"],
  "media.delete": ["admin"],
  "inbox.read": ["admin", "editor", "viewer"],
  "messages.manage": ["admin", "editor"],
  "rss.review": ["admin", "editor"],
  "settings.manage": ["admin"],
  "team.manage": ["admin"],
  "activity.read": ["admin"],
};

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (roles as readonly string[]).includes(value);
}

/** Anything unrecognised is treated as the least-privileged role. */
export function normaliseRole(value: unknown): Role {
  return isRole(value) ? value : "viewer";
}

export function can(role: unknown, permission: Permission): boolean {
  return grants[permission].includes(normaliseRole(role));
}

export const roleLabels: Record<Role, string> = {
  admin: "Administrator",
  editor: "Editor",
  contributor: "Contributor",
  viewer: "Viewer",
};

export const roleSummaries: Record<Role, string> = {
  admin: "Full control: content, publishing, deleting, media, settings, the team and the activity log.",
  editor: "Writes and publishes content and edits the live pages. Cannot delete permanently, change settings or manage the team.",
  contributor: "Writes drafts of news and projects and can submit news for review. Cannot publish, delete, change anything live, or see submissions.",
  viewer: "Read-only. Can look at content, submissions and the RSS queue but cannot change anything.",
};

export const roleLabel = (role: unknown) => roleLabels[normaliseRole(role)];

// ── Content rules ─────────────────────────────────────────────────────────────

/** Statuses a contributor may still edit: the item is not live. */
const NOT_LIVE = ["draft", "in_review"];

/**
 * May this role save changes to an item that currently has this status?
 * Editors and admins always may. Contributors only while it is not live (or does not exist yet),
 * so they can never change what visitors see.
 */
export function mayEditContent(role: unknown, currentStatus?: string | null): boolean {
  if (can(role, "content.editLive")) return true;
  if (!can(role, "content.write")) return false;
  return !currentStatus || NOT_LIVE.includes(currentStatus);
}

/**
 * The status a save is allowed to store. Roles that can publish may store anything; a contributor
 * may only store "draft" or "in_review" (submit for review). Everything else becomes "draft".
 */
export function allowedStatus(role: unknown, requested: string): string {
  if (can(role, "content.publish")) return requested;
  return requested === "in_review" ? "in_review" : "draft";
}

// ── Which screens a role may open ─────────────────────────────────────────────

const adminOnlyPaths = ["/admin/users", "/admin/settings", "/admin/activity"];
/** Contributors write news and projects; these areas hold live pages, personal details or publishing controls. */
const noContributorPaths = ["/admin/site", "/admin/pages", "/admin/faqs", "/admin/jobs", "/admin/submissions", "/admin/rss"];

const under = (pathname: string, path: string) => pathname === path || pathname.startsWith(`${path}/`);

export function canViewPath(role: unknown, pathname: string): boolean {
  const current = normaliseRole(role);
  if (adminOnlyPaths.some((path) => under(pathname, path))) return current === "admin";
  if (current === "contributor" && noContributorPaths.some((path) => under(pathname, path))) return false;
  return true;
}
