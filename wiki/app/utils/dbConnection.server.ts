import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

declare global {
  var dbConnection: PrismaClient;
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
// in production we'll have a single connection to the DB.
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.dbConnection) {
    global.dbConnection = new PrismaClient({ log: ["info"] });
    console.log("Database connected successfully");
  }
  prisma = global.dbConnection;
}

export { prisma };
