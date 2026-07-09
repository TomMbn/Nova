import { NextResponse } from "next/server";
import { getUnreadMessagesCount } from "@/queries/messages";

export async function GET() {
  const count = await getUnreadMessagesCount();
  return NextResponse.json({ count });
}
