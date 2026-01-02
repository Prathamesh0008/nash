import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      id: 1,
      senderId: "u_other",
      text: "Hello! This is a test message.",
      time: "10:30 AM",
    },
    {
      id: 2,
      senderId: "u_me",
      text: "Hi! This is my reply.",
      time: "10:32 AM",
    },
  ]);
}
