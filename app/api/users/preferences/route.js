import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";

function normalizeSearch(body = {}) {
  return {
    q: String(body.q || "").trim().slice(0, 120),
    city: String(body.city || "").trim().slice(0, 80),
    category: String(body.category || "").trim().slice(0, 80),
  };
}

export async function GET() {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "worker", "admin"] });
  if (errorResponse) return errorResponse;

  const me = await User.findById(user.userId)
    .select("preferences")
    .lean();

  const res = NextResponse.json({
    ok: true,
    preferences: {
      favoriteWorkerIds: me?.preferences?.favoriteWorkerIds || [],
      savedSearchFilters: me?.preferences?.savedSearchFilters || [],
      recentSearches: me?.preferences?.recentSearches || [],
    },
  });
  return applyRefreshCookies(res, refreshedResponse);
}

export async function PATCH(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "worker", "admin"] });
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const action = String(body.action || "").trim();

  const me = await User.findById(user.userId);
  if (!me) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
  me.preferences = me.preferences || {};
  me.preferences.favoriteWorkerIds = Array.isArray(me.preferences.favoriteWorkerIds) ? me.preferences.favoriteWorkerIds : [];
  me.preferences.savedSearchFilters = Array.isArray(me.preferences.savedSearchFilters) ? me.preferences.savedSearchFilters : [];
  me.preferences.recentSearches = Array.isArray(me.preferences.recentSearches) ? me.preferences.recentSearches : [];

  if (action === "toggleFavorite") {
    const workerId = String(body.workerId || "");
    if (!mongoose.Types.ObjectId.isValid(workerId)) {
      return NextResponse.json({ ok: false, error: "Invalid worker id" }, { status: 400 });
    }
    const key = workerId.toString();
    const has = me.preferences.favoriteWorkerIds.some((id) => id.toString() === key);
    me.preferences.favoriteWorkerIds = has
      ? me.preferences.favoriteWorkerIds.filter((id) => id.toString() !== key)
      : [...me.preferences.favoriteWorkerIds, new mongoose.Types.ObjectId(key)];
  } else if (action === "saveFilter") {
    const search = normalizeSearch(body.filter || {});
    if (!search.q && !search.city && !search.category) {
      return NextResponse.json({ ok: false, error: "Filter cannot be empty" }, { status: 400 });
    }
    const filterId = `sf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    me.preferences.savedSearchFilters.unshift({
      filterId,
      name: String(body?.filter?.name || "").trim().slice(0, 80),
      ...search,
      createdAt: new Date(),
    });
    me.preferences.savedSearchFilters = me.preferences.savedSearchFilters.slice(0, 20);
  } else if (action === "removeFilter") {
    const filterId = String(body.filterId || "");
    me.preferences.savedSearchFilters = me.preferences.savedSearchFilters.filter((row) => row.filterId !== filterId);
  } else if (action === "trackSearch") {
    const search = normalizeSearch(body.search || {});
    if (search.q || search.city || search.category) {
      const key = `${search.q.toLowerCase()}|${search.city.toLowerCase()}|${search.category.toLowerCase()}`;
      me.preferences.recentSearches = me.preferences.recentSearches.filter((row) => {
        const rowKey = `${String(row.q || "").toLowerCase()}|${String(row.city || "").toLowerCase()}|${String(row.category || "").toLowerCase()}`;
        return rowKey !== key;
      });
      me.preferences.recentSearches.unshift({ ...search, at: new Date() });
      me.preferences.recentSearches = me.preferences.recentSearches.slice(0, 15);
    }
  } else if (action === "clearRecentSearches") {
    me.preferences.recentSearches = [];
  } else {
    return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
  }

  await me.save();

  const res = NextResponse.json({
    ok: true,
    preferences: {
      favoriteWorkerIds: me.preferences.favoriteWorkerIds || [],
      savedSearchFilters: me.preferences.savedSearchFilters || [],
      recentSearches: me.preferences.recentSearches || [],
    },
  });
  return applyRefreshCookies(res, refreshedResponse);
}
