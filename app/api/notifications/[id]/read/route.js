// import dbConnect from "@/lib/dbConnect";
// import Notification from "@/models/Notification";
// import { NextResponse } from "next/server";
// import { cookies } from "next/headers";
// import { verifyToken } from "@/lib/auth";
// import mongoose from "mongoose";

// export async function PATCH(req, context) {
//   await dbConnect();
//   const token = (await cookies()).get("auth")?.value;
//   const decoded = token ? verifyToken(token) : null;
//   if (!decoded) return NextResponse.json({ ok: false }, { status: 401 });

//   const { id } = await context.params;
//   if (!mongoose.Types.ObjectId.isValid(id))
//     return NextResponse.json({ ok: false, error: "Invalid ID" }, { status: 400 });

//   await Notification.updateOne(
//     { _id: id, userId: decoded.userId },
//     { read: true, readAt: new Date() }
//   );

//   return NextResponse.json({ ok: true });
// }

import dbConnect from "@/lib/dbConnect";
import Notification from "@/models/Notification";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function PATCH(request, { params }) {
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

    const { id } = params;

    if (!id || id === "undefined" || id === "null") {
      return NextResponse.json({ 
        ok: false, 
        error: "Invalid notification ID" 
      }, { 
        status: 400 
      });
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        userId: decoded.userId
      },
      {
        $set: {
          read: true,
          readAt: new Date()
        }
      },
      {
        new: true, // Return updated document
        runValidators: true
      }
    ).populate('actorId', 'fullName profilePhoto');

    if (!notification) {
      return NextResponse.json({ 
        ok: false, 
        error: "Notification not found" 
      }, { 
        status: 404 
      });
    }

    return NextResponse.json({ 
      ok: true, 
      notification: {
        ...notification.toObject(),
        actor: notification.actorId || null
      }
    });

  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json({ 
      ok: false, 
      error: "Internal server error" 
    }, { 
      status: 500 
    });
  }
}
