// import dbConnect from "@/lib/dbConnect";
// import Notification from "@/models/Notification";
// import User from "@/models/User";
// import { NextResponse } from "next/server";
// import { cookies } from "next/headers";
// import { verifyToken } from "@/lib/auth";

// export async function GET() {
//   await dbConnect();

//   const token = (await cookies()).get("auth")?.value;
//   const decoded = token ? verifyToken(token) : null;
//   if (!decoded)
//     return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });

//   // Load notifications
//   let notifications = await Notification.find({ userId: decoded.userId })
//     .sort({ createdAt: -1 })
//     .lean();

//   // Populate actor info directly from DB
//   const actorIds = notifications.map((n) => n.actorId).filter(Boolean);
//   const actors = await User.find({ _id: { $in: actorIds } }).lean();
//   const actorMap = {};
//   actors.forEach((a) => (actorMap[a._id.toString()] = a));

//   // Attach actor info to notification
//   notifications = notifications.map((n) => ({
//     ...n,
//     actor: n.actorId ? actorMap[n.actorId.toString()] : null,
//   }));

//   return NextResponse.json({ ok: true, notifications });
// }



import dbConnect from "@/lib/dbConnect";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();

    const token = (await cookies()).get("auth")?.value;
    const decoded = token ? verifyToken(token) : null;
    
    if (!decoded) {
      return NextResponse.json({ 
        ok: false, 
        error: "Not authenticated" 
      }, { 
        status: 401 
      });
    }

    // Load notifications with limit
    const notifications = await Notification.find({ 
      userId: decoded.userId 
    })
    .sort({ createdAt: -1 })
    .limit(50) // Limit to prevent too many
    .populate({
      path: 'actorId',
      select: 'fullName profilePhoto username email',
      model: 'User'
    })
    .lean();

    // Transform the data
    const transformedNotifications = notifications.map((n) => ({
      ...n,
      actor: n.actorId || null,
      actorId: undefined // Remove duplicate
    }));

    return NextResponse.json({ 
      ok: true, 
      notifications: transformedNotifications,
      unreadCount: transformedNotifications.filter(n => !n.read).length
    });

  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ 
      ok: false, 
      error: "Internal server error" 
    }, { 
      status: 500 
    });
  }
}

// Optional: DELETE route to clear old notifications
export async function DELETE() {
  try {
    await dbConnect();

    const token = (await cookies()).get("auth")?.value;
    const decoded = token ? verifyToken(token) : null;
    
    if (!decoded) {
      return NextResponse.json({ 
        ok: false, 
        error: "Not authenticated" 
      }, { 
        status: 401 
      });
    }

    // Delete notifications older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Notification.deleteMany({
      userId: decoded.userId,
      createdAt: { $lt: thirtyDaysAgo }
    });

    return NextResponse.json({ 
      ok: true, 
      deletedCount: result.deletedCount 
    });

  } catch (error) {
    console.error("Error deleting old notifications:", error);
    return NextResponse.json({ 
      ok: false, 
      error: "Internal server error" 
    }, { 
      status: 500 
    });
  }
}
