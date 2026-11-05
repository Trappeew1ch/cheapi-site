import { NextResponse } from "next/server";
import {
  assertSameOrigin,
  getSessionUser,
  revokeApiKey,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function DELETE(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Запрос отклонён." }, { status: 403 });
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Требуется вход." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const revoked = revokeApiKey(user.id, id);
  if (!revoked) {
    return NextResponse.json({ error: "Ключ не найден." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
