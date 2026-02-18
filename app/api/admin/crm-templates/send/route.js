import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { sendCrmTemplate } from "@/lib/crm";
import { writeAuditLog } from "@/lib/audit";

export async function POST(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["admin"] });
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const templateKey = String(body.templateKey || "").trim();
  const channel = String(body.channel || "").trim();
  const recipient = String(body.recipient || "").trim();
  const userId = String(body.userId || "").trim();

  if (!templateKey || !["email", "sms", "whatsapp"].includes(channel)) {
    return NextResponse.json({ ok: false, error: "templateKey and valid channel are required" }, { status: 400 });
  }
  if (!recipient && !userId) {
    return NextResponse.json({ ok: false, error: "recipient or userId is required" }, { status: 400 });
  }

  const sent = await sendCrmTemplate({
    templateKey,
    channel,
    recipient,
    userId: userId || null,
    variables: typeof body.variables === "object" && body.variables ? body.variables : {},
    meta: { source: "admin_test_send" },
  });
  if (!sent.ok) {
    return NextResponse.json({ ok: false, error: sent.error || "Failed to send CRM message" }, { status: 400 });
  }

  await writeAuditLog({
    actorId: user.userId,
    actorRole: user.role,
    action: "crm.template.send",
    targetType: "crm_message",
    targetId: sent.log?._id || null,
    metadata: { templateKey, channel, recipient: recipient || userId },
    req,
  });

  const res = NextResponse.json({ ok: true, log: sent.log });
  return applyRefreshCookies(res, refreshedResponse);
}
