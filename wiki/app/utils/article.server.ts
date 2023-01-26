import { Article, User } from "@prisma/client";
import { useEffect, useState } from "react";
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

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function addArticle({
  content,
  title,
  slug,
  authorId,
}: Pick<Article, "content" | "title" | "slug"> & { authorId: User["id"] }) {
  return prisma.article.create({
    data: {
      slug,
      title,
      content,
      author: {
        connect: {
          id: authorId,
        },
      },
    },
  });
}

export async function deleteArticle(slug: string) {
  return prisma.article.delete({
    where: { slug },
  });
}

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
increase or decrease
increased or decreased
*/

export async function updateLikes(
  slug: string,
  article: Pick<Article, "slug" | "likesCount">
) {
  return prisma.article.update({ data: article, where: { slug } });
}

/*
function increaseLikes(slug: string, isLiked: boolean, likesCount: number ) {
  // Updating the article with the slug and increasing the likesCount by 1 and setting isLiked to true.
  const increasedLikes = await prisma.article.update({
    where: { slug },
    include: { author: true},
    data: { likesCount: likesCount++, isLiked: true },
  });
  return increasedLikes  
}

function decreaseLikes(slug: string, isLiked: boolean, likesCount: number) {
  // Updating the article with the slug and decreasing the likesCount by 1 and setting isLiked to
  false.
  const decreasedLikes = await prisma.article.update({
    where: { slug },
    include: { author: true},
    data: { likesCount: likesCount--, isLiked: false },
  });
  return decreasedLikes
}
*/

/*
export async function increaseLikes(slug: string, likesCount: number) {
  const increasedLikes = await prisma.article.update({
    where: { slug },
    include: { author: true },
    data: { likesCount: likesCount + 1, isLiked: true },
  });
  return increasedLikes;
}
*/
/*
export async function getLikes(slug: string) {
  const article = await prisma.article.findUnique({
    where: { slug },
    include: { author: true },
  });

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    async function getLikeData() {
      if (!article) {
        return null;
      } else {
        setIsLiked(article.isLiked);
        setLikesCount(article.likesCount);
      }
    }
    getLikeData();
  }, []);


  // const likeBtn = useRef<HTMLButtonElement>(null);

  
   useEffect( () => {
    const likeBtn = document.getElementById("like");    
     likeBtn.addEventListener('click', async () => { 
       if (!isLiked) {
        const increasedLikes = await prisma.article.update({
          where: { slug },
          include: { author: true},
          data: { likesCount: likesCount +1, isLiked: true },
        });
        setIsLiked(true);
        setLikesCount(increasedLikes.likesCount);
       } else {
        const decreasedLikes = await prisma.article.update({
          where: { slug },
          include: { author: true},
          data: { likesCount: likesCount -1, isLiked: false },
        });
        setIsLiked(false);
        setLikesCount(decreasedLikes.likesCount)}
      })
    }, [likesCount, isLiked])
    
}

/*
export function LikeButton() {
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    async function fetchData() {
      // Fetch the current like count and isLiked status for the content from the database
      const content = await prisma.article.findFirst({ where: { authorId: 1 } });
      setLikesCount(content.likesCount);
      setIsLiked(content.isLiked);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const button = document.getElementById('like-button');
    button.addEventListener('click', async () => {
      if (!isLiked) {
        // Send a request to the server to update the like count
        const updatedContent = await prisma.content.update({
          where: { id: 1 },
          data: { likesCount: likesCount + 1, isLiked: true },
        });
        setLikesCount(updatedContent.likesCount);
        setIsLiked(true);
      } else {
        // Send a request to the server to update the like count
        const updatedContent = await prisma.content.update({
          where: { id: 1 },
          data: { likesCount: likesCount - 1, isLiked: false },
        });
        setLikesCount(updatedContent.likesCount);
        setIsLiked(false);
      }
    });
  }, [likesCount, isLiked]);

  return (
    <button id="like-button">
      {likesCount} Likes
    </button>
  );
}
*/
