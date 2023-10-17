import { defineMiddleware } from "astro:middleware";

import { sessions, type Session } from "./db";

export const onRequest = defineMiddleware(async (context, next) => {
  const sessionId = context.cookies.get("session")?.value ?? null;
  let session: Session | null = null;
  if (sessionId) {
    session = sessions.get(sessionId) ?? null;
  }
  context.locals.session = session;
  return next();
});
