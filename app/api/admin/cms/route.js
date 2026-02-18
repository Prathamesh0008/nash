import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import CmsContent from "@/models/CmsContent";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { writeAuditLog } from "@/lib/audit";

const CMS_KEY = "dashboard_content";

export async function GET() {
  await dbConnect();
  const { errorResponse, refreshedResponse } = await requireAuth({ roles: ["admin"] });
  if (errorResponse) return errorResponse;

  const content = await CmsContent.findOne({ key: CMS_KEY }).lean();
  const res = NextResponse.json({ ok: true, content: content?.value || {} });
  return applyRefreshCookies(res, refreshedResponse);
}

export async function PUT(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["admin"] });
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));

  const content = await CmsContent.findOneAndUpdate(
    { key: CMS_KEY },
    { $set: { value: body } },
    { upsert: true, new: true }
  );

  await writeAuditLog({
    actorId: user.userId,
    actorRole: user.role,
    action: "cms.update",
    targetType: "cms",
    targetId: content._id,
    metadata: body,
    req,
  });

  const res = NextResponse.json({ ok: true, content: content.value });
  return applyRefreshCookies(res, refreshedResponse);
}