import { prisma } from "./db.sever";

export async function getArticles() {
  return prisma.article.findMany();
}
