import { NextResponse } from "next/server";
import { getMessagesWith } from "@/queries/messages";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const result = await getMessagesWith(userId);
  if (!result) return NextResponse.json({ messages: [] });
  return NextResponse.json(result);
}
