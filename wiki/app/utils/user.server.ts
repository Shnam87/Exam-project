import { User } from "@prisma/client";
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import bcrypt from "bcryptjs";
import { prisma } from "./dbConnection.server";
export type { User };

/*
export async function getUser(username: string) {
  return prisma.user.findUnique({ where: { username } });
}
*/

export async function getUserByUsername(username: User["username"]) {
  return prisma.user.findUnique({
    where: { username },
    include: {
      articles: {
        select: {
          title: true,
        },
      },
    },
  });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

type UserForm = {
  username: string;
  email: string;
  password: string;
  newsletter?: boolean;
};

export async function registerUser({
  username,
  email,
  password,
  newsletter,
}: UserForm) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { username, email, passwordHash, newsletter },
  });
  return { id: user.id, username, email };
}

export async function verifyLogin(
  email: User["email"],
  password: User["passwordHash"]
) {
  const loggingIn = await prisma.user.findUnique({ where: { email } });
  if (!loggingIn) return null;

  const isValid = await bcrypt.compare(password, loggingIn.passwordHash);
  if (!isValid) return null;

  return loggingIn;
}

export async function validatePassword(username: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { username },
  });
  if (!user) return null;

  const passwordValidation = await bcrypt.compare(password, user.passwordHash);

  return passwordValidation;
}

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error("SESSION_SECRET environment variable is not set");
}

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "wiki_session",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    httpOnly: true,
  },
});

export function currentSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("cookie"));
}

const USER_SESSION_KEY = "username";

export async function getUsername(request: Request) {
  const session = await currentSession(request);
  const username = session.get(USER_SESSION_KEY);
  if (!username || typeof username !== "string") return null;
  return username;
}

export async function getInLoggedUserByUsername(username: User["username"]) {
  return prisma.user.findUnique({ where: { username } });
}

export async function requireUsername(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const username = await getUsername(request);
  if (!username || typeof username !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return username;
}

export async function getUser(request: Request) {
  const username = await getUsername(request);
  if (typeof username !== "string") {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username: username },
      //select: { id: true, username: true },
      include: {
        articles: {
          select: {
            title: true,
          },
        },
      },
    });
    return user;
  } catch {
    throw logout(request);
  }
}

export async function requireUser(username: string) {
  //const username = await requireUsername(request);
  const user = await getUserByUsername(username);
  if (user) return user;

  //throw await logout(request);
}

export async function requireInLoggedUsername(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const username = await getUsername(request);
  if (!username) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return username;
}

export async function requireInLoggedUser(request: Request) {
  const username = await requireUsername(request);
  const user = await getInLoggedUserByUsername(username);
  if (user) return user;
  throw await logout(request);
}

export async function logout(request: Request) {
  const session = await currentSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}

export async function deleteUser(username: string) {
  return prisma.user.delete({ where: { username } });
}

type sessionParams = {
  request: Request;
  username: string;
  remember: boolean;
  redirectTo: string;
};

export async function createUserSession({
  request,
  username,
  remember,
  redirectTo,
}: sessionParams) {
  const session = await sessionStorage.getSession();
  session.set(USER_SESSION_KEY, username);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
      }),
    },
  });
}
