import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import CrmTemplate from "@/models/CrmTemplate";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { upsertCrmTemplate } from "@/lib/crm";
import { writeAuditLog } from "@/lib/audit";

export async function GET() {
  await dbConnect();
  const { errorResponse, refreshedResponse } = await requireAuth({ roles: ["admin"] });
  if (errorResponse) return errorResponse;

  const templates = await CrmTemplate.find({}).sort({ key: 1, channel: 1 }).lean();
  const res = NextResponse.json({ ok: true, templates });
  return applyRefreshCookies(res, refreshedResponse);
}

export async function POST(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["admin"] });
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const key = String(body.key || "").trim();
  const channel = String(body.channel || "").trim();
  const messageBody = String(body.body || "").trim();
  if (!key || !["email", "sms", "whatsapp"].includes(channel) || !messageBody) {
    return NextResponse.json({ ok: false, error: "key, channel and body are required" }, { status: 400 });
  }

  const template = await upsertCrmTemplate({
    key,
    channel,
    title: String(body.title || ""),
    subject: String(body.subject || ""),
    body: messageBody,
    active: body.active !== false,
    updatedBy: user.userId,
  });

  await writeAuditLog({
    actorId: user.userId,
    actorRole: user.role,
    action: "crm.template.upsert",
    targetType: "crm_template",
    targetId: template._id,
    metadata: { key, channel },
    req,
  });

  const res = NextResponse.json({ ok: true, template });
  return applyRefreshCookies(res, refreshedResponse);
}
