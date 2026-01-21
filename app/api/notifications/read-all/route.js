import dbConnect from "@/lib/dbConnect";
import Notification from "@/models/Notification";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function PATCH() {
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

    const result = await Notification.updateMany(
      { 
        userId: decoded.userId, 
        read: false 
      },
      { 
        $set: { 
          read: true,
          readAt: new Date()
        }
      }
    );

    return NextResponse.json({ 
      ok: true, 
      updatedCount: result.modifiedCount,
      message: `Marked ${result.modifiedCount} notifications as read`
    });

  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json({ 
      ok: false, 
      error: "Internal server error" 
    }, { 
      status: 500 
    });
  }
}