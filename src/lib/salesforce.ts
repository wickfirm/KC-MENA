/**
 * Salesforce dual-write. Submissions are always stored locally first; this mirrors them to
 * Salesforce as a Lead (REST API, OAuth2 username-password flow). Failures are recorded on the
 * submission (sf_sync_status = 'failed', sf_error) and can be replayed from /admin/submissions.
 *
 * Credentials come from env (client to provide): SALESFORCE_LOGIN_URL, SALESFORCE_CLIENT_ID,
 * SALESFORCE_CLIENT_SECRET, SALESFORCE_USERNAME, SALESFORCE_PASSWORD, optional SALESFORCE_SECURITY_TOKEN.
 * Field mapping below is a standard-Lead baseline and is pending the client's confirmation.
 */

export type LeadInput = {
  name: string;
  email: string;
  phone?: string | null;
  type: string;
  subject?: string | null;
  message?: string | null;
  source?: string | null;
};

export function isSalesforceConfigured(): boolean {
  return Boolean(
    process.env.SALESFORCE_LOGIN_URL &&
      process.env.SALESFORCE_CLIENT_ID &&
      process.env.SALESFORCE_CLIENT_SECRET &&
      process.env.SALESFORCE_USERNAME &&
      process.env.SALESFORCE_PASSWORD
  );
}

/** Standard Lead fields for a stored submission. Pure, so it can be unit tested. */
export function buildLeadPayload(lead: LeadInput): Record<string, string> {
  const trimmed = lead.name.trim();
  const [first, ...rest] = trimmed.split(/\s+/);
  const lastName = rest.join(" ") || first || "Unknown";
  const description = [
    `Type: ${lead.type}`,
    lead.subject ? `Subject: ${lead.subject}` : "",
    lead.source ? `Source: ${lead.source}` : "",
    lead.message ?? "",
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 32000);
  const payload: Record<string, string> = {
    LastName: lastName,
    Email: lead.email,
    Company: "Kasumigaseki Capital MENA Website",
    LeadSource: "Web",
    Description: description,
  };
  if (rest.length) payload.FirstName = first;
  if (lead.phone) payload.Phone = lead.phone;
  return payload;
}

async function authenticate(): Promise<{ token: string; instanceUrl: string }> {
  const res = await fetch(`${process.env.SALESFORCE_LOGIN_URL!.replace(/\/$/, "")}/services/oauth2/token`, {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "password",
      client_id: process.env.SALESFORCE_CLIENT_ID!,
      client_secret: process.env.SALESFORCE_CLIENT_SECRET!,
      username: process.env.SALESFORCE_USERNAME!,
      password: process.env.SALESFORCE_PASSWORD! + (process.env.SALESFORCE_SECURITY_TOKEN ?? ""),
    }),
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) throw new Error(`Salesforce authentication failed (${res.status})`);
  const data = (await res.json()) as { access_token: string; instance_url: string };
  return { token: data.access_token, instanceUrl: data.instance_url };
}

/** Create a Lead and return its Salesforce id. Throws when unconfigured or rejected. */
export async function pushLeadToSalesforce(lead: LeadInput): Promise<string> {
  if (!isSalesforceConfigured()) throw new Error("Salesforce credentials are not configured yet");
  const { token, instanceUrl } = await authenticate();
  const res = await fetch(`${instanceUrl}/services/data/v60.0/sobjects/Lead`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(buildLeadPayload(lead)),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Salesforce lead create failed (${res.status}): ${body.slice(0, 300)}`);
  }
  return ((await res.json()) as { id: string }).id;
}
