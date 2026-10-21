import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../chatgpt-auth";

const MAX_BYTES = 2_000_000;
const response = (body: unknown, status = 200) => Response.json(body, {
  status, headers: { "Cache-Control": "no-store, private", "Vary": "Cookie" },
});
async function identity() {
  const user = await getChatGPTUser();
  if (!user) return null;
  if (user.userId) return user.userId;
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(user.email.trim().toLowerCase()));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, "0")).join("");
}
function unavailable(error: unknown) {
  console.error("Powerhouse storage failed", error instanceof Error ? error.message : "Unknown storage error");
  return response({ error: "Cloud saving is temporarily unavailable. Your browser copy is preserved; export a backup and retry." }, 503);
}
export async function GET() {
  const userId = await identity();
  if (!userId) return response({ authenticated: false }, 401);
  try {
    const row = await env.DB.prepare("SELECT payload_json, revision, updated_at FROM powerhouse_snapshots WHERE user_id = ?").bind(userId).first<{payload_json: string; revision: number; updated_at: string}>();
    return response({ authenticated: true, accountKey: userId, revision: row?.revision || 0, updatedAt: row?.updated_at || null, snapshot: row ? JSON.parse(row.payload_json) : null });
  } catch (error) { return unavailable(error); }
}
export async function POST(request: Request) {
  const userId = await identity();
  if (!userId) return response({ error: "Sign in with ChatGPT to save your evidence." }, 401);
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return response({error: "Invalid request origin."}, 403);
  let raw: string;
  try { raw = await request.text(); } catch { return response({error: "Could not read the save."}, 400); }
  if (new TextEncoder().encode(raw).byteLength > MAX_BYTES) return response({error: "This backup is too large for cloud saving. Export it and archive older records."}, 413);
  let input: { snapshot?: Record<string, unknown>; revision?: number };
  try { input = JSON.parse(raw); } catch { return response({error: "Invalid backup JSON."}, 400); }
  const snapshot = input?.snapshot;
  if (!snapshot || Array.isArray(snapshot) || !Array.isArray(snapshot.attempts) || !Array.isArray(snapshot.retests) || !Array.isArray(snapshot.dailyEntries) || !snapshot.profile || typeof snapshot.profile !== "object" || !Number.isSafeInteger(input.revision) || Number(input.revision) < 0) return response({error: "Invalid evidence backup."}, 400);
  try {
    const updatedAt = new Date().toISOString();
    // Compare-and-swap in one statement: a stale tab cannot overwrite a newer device.
    const row = await env.DB.prepare(`INSERT INTO powerhouse_snapshots (user_id, payload_json, revision, updated_at)
      SELECT ?, ?, 1, ? WHERE ? = 0 OR EXISTS (SELECT 1 FROM powerhouse_snapshots WHERE user_id = ? AND revision = ?)
      ON CONFLICT(user_id) DO UPDATE SET payload_json = excluded.payload_json, revision = powerhouse_snapshots.revision + 1, updated_at = excluded.updated_at
      WHERE powerhouse_snapshots.revision = ? RETURNING revision`).bind(userId, JSON.stringify(snapshot), updatedAt, input.revision, userId, input.revision, input.revision).first<{revision: number}>();
    if (!row) return response({error: "Another device saved a newer version. Review both copies before continuing.", conflict: true}, 409);
    return response({ok: true, revision: row.revision, updatedAt});
  } catch (error) { return unavailable(error); }
}
