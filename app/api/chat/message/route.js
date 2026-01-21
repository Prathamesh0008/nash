// import dbConnect from "@/lib/dbConnect";
// import Conversation from "@/models/Conversation";
// import Message from "@/models/Message";
// import { NextResponse } from "next/server";
// import { cookies } from "next/headers";
// import { verifyToken } from "@/lib/auth";
// import mongoose from "mongoose";

// export async function POST(req) {
//   await dbConnect();

//   const cookieStore = await cookies();
//   const token = cookieStore.get("auth")?.value;
//   const decoded = token ? verifyToken(token) : null;

//   if (!decoded) return NextResponse.json({ ok: false }, { status: 401 });

//   const { conversationId, text } = await req.json();

//   if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
//     return NextResponse.json({ ok: false, error: "Invalid conversationId" }, { status: 400 });
//   }

//   if (!text || !text.trim()) {
//     return NextResponse.json({ ok: false, error: "Empty message" }, { status: 400 });
//   }

//   const convo = await Conversation.findById(conversationId);
//   if (!convo) return NextResponse.json({ ok: false }, { status: 404 });

//   const isUser = convo.userId.toString() === decoded.userId;
//   const isWorker = convo.workerUserId.toString() === decoded.userId;
//   const isAdmin = decoded.role === "admin";

//   if (!isUser && !isWorker && !isAdmin) {
//     return NextResponse.json({ ok: false }, { status: 403 });
//   }

//   const msg = await Message.create({
//     conversationId,
//     senderId: decoded.userId,
//     text: text.trim(),
//     readBy: [decoded.userId], // ✅ sender already read
//   });

//   // ✅ update updatedAt so inbox sorts by latest activity
//   convo.updatedAt = new Date();
//   await convo.save();

//   return NextResponse.json({ ok: true, message: msg });
// }
import dbConnect from "@/lib/dbConnect";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    await dbConnect();

    const cookieStore = await cookies();
    const token = cookieStore.get("auth")?.value;
    const decoded = token ? verifyToken(token) : null;

    if (!decoded) {
      return NextResponse.json({ 
        ok: false, 
        error: "Not authenticated" 
      }, { 
        status: 401 
      });
    }

    const { conversationId, text } = await req.json();

    // Validate conversationId
    if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
      return NextResponse.json({ 
        ok: false, 
        error: "Invalid conversation ID" 
      }, { 
        status: 400 
      });
    }

    // Validate message text
    if (!text || !text.trim()) {
      return NextResponse.json({ 
        ok: false, 
        error: "Message cannot be empty" 
      }, { 
        status: 400 
      });
    }

    // Trim and limit message length
    const trimmedText = text.trim();
    if (trimmedText.length > 2000) {
      return NextResponse.json({ 
        ok: false, 
        error: "Message too long (max 2000 characters)" 
      }, { 
        status: 400 
      });
    }

    // Find conversation
    const convo = await Conversation.findById(conversationId);
    if (!convo) {
      return NextResponse.json({ 
        ok: false, 
        error: "Conversation not found" 
      }, { 
        status: 404 
      });
    }

    // Check permissions
    const isUser = convo.userId.toString() === decoded.userId;
    const isWorker = convo.workerUserId.toString() === decoded.userId;
    const isAdmin = decoded.role === "admin";

    if (!isUser && !isWorker && !isAdmin) {
      return NextResponse.json({ 
        ok: false, 
        error: "Not authorized for this conversation" 
      }, { 
        status: 403 
      });
    }

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Create message
      const msg = await Message.create([{
        conversationId,
        senderId: decoded.userId,
        text: trimmedText,
        readBy: [decoded.userId],
      }], { session });

      // Update conversation timestamp
      convo.updatedAt = new Date();
      await convo.save({ session });

      // Determine recipient
      const recipientId = isUser ? convo.workerUserId : convo.userId;

      // Get sender info for notification
      const sender = await User.findById(decoded.userId)
        .select('fullName username')
        .session(session);

      // Create notification for recipient (but not for sender)
      if (recipientId.toString() !== decoded.userId) {
        await Notification.create([{
          userId: recipientId,
          actorId: decoded.userId,
          type: "message",
          title: `${sender?.fullName || sender?.username || "Someone"} sent you a message`,
          body: trimmedText.length > 100 
            ? trimmedText.substring(0, 100) + "..." 
            : trimmedText,
          href: `/chat/${conversationId}`,
          meta: { 
            conversationId: conversationId.toString(),
            messageId: msg[0]._id.toString(),
            senderName: sender?.fullName || sender?.username
          },
        }], { session });
      }

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      return NextResponse.json({ 
        ok: true, 
        message: msg[0] 
      });

    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }

  } catch (error) {
    console.error("Error sending message:", error);
    
    return NextResponse.json({ 
      ok: false, 
      error: error.message || "Internal server error" 
    }, { 
      status: 500 
    });
  }
}
