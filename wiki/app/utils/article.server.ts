import { Article, User } from "@prisma/client";
import { prisma } from "./dbConnection.server";
export type { Article };

export async function getArticles() {
  return prisma.article.findMany({
    include: {
      //author: true, // Return all fields
      author: {
        select: {
          username: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getArticle(slug: string) {
  return prisma.article.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          username: true,
        },
      },
    },
  });
}

/*
  return prisma.article.findMany({
    where: {
      slug,
    },
    include: {
      author: true,
    },
  });
}
*/

export async function addArticle(
  article: Pick<Article, "slug" | "title" | "content"> & {
    authorId: User["id"];
  }
) {
  return prisma.article.create({ data: article });
}

export async function deleteArticle(slug: string) {
  return prisma.article.delete({
    where: { slug },
  });
}
//{ authorId }: { authorId: User["id"] }
/*
export function getUserArticles(authorId: number) {
  return prisma.article.findMany({
    where: { authorId },
    orderBy: { updatedAt: "desc" },
  });
}
*/

export function getUserArticles({ authorId }: { authorId: User["id"] }) {
  return prisma.article.findMany({
    where: { authorId },
    select: { authorId: true, title: true },
    orderBy: { updatedAt: "desc" },
  });
}

export function getNumberOfArticle(id: number) {
  if (!id) {
    throw new Error("id is required");
  }
  return prisma.article.count({
    where: {
      authorId: id,
    },
  });
}

/*  
  prisma.user.findUnique({
    where: { id },
    select: {
      _count: {
        select: {
          articles: true,
        },
      },
    },
  });
}

const c = await prisma.user.findUnique({
    where: { id: 2 },
    select: {
        id: true,
        name: true,
        _count: {
            select: {
                posts: true,
            },
        },
    },
})
*/
