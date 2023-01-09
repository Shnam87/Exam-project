import { prisma } from "./db.sever";

export async function getArticles() {
  return prisma.article.findMany();
}

export async function getArticle(slug: string) {
  return prisma.article.findUnique({ where: { slug } });
}
