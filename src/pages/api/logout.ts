import { sessions } from "../../db";

import type { APIContext } from "astro";

export async function POST(context: APIContext): Promise<Response> {
  if (!context.locals.session) {
    return new Response(null, {
      status: 401,
    });
  }
  sessions.delete(context.locals.session.sessionId);
  context.cookies.set("session", "", {
    httpOnly: true,
    secure: import.meta.env.PROD,
    path: "/",
    maxAge: 0,
  });
  return new Response(null, {
    status: 200,
  });
}
