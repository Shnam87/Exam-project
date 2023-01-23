import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const email = "admin@wiki.com";

  await prisma.user.delete({ where: { email } }).catch(() => {});

  const hashedPassword = await bcrypt.hash("remixwiki", 10);

  const user = await prisma.user.create({
    data: {
      username: "admin",
      email: "admin@wiki.com",
      role: "ADMIN",
      passwordHash: hashedPassword,
    },
  });

  const articles = [
    {
      slug: "Lorem-Ipsum",
      title: "Lorem Ipsum",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam porta congue ligula, eget ornare libero euismod vel. Curabitur efficitur et elit nec porttitor. Nulla pellentesque sapien tempor elit semper, non ultrices ipsum malesuada. Nulla malesuada dictum diam, sed molestie ipsum molestie quis. Donec nunc leo, volutpat sagittis augue sed, commodo egestas leo. Aliquam imperdiet nibh nec justo aliquet elementum. Nam sed sapien vel arcu mollis blandit at ut mi. Donec augue quam, blandit non sodales quis, aliquet a nulla. Vivamus erat enim, tincidunt ut tempus tempus, commodo at ligula. Cras molestie euismod tellus, in vulputate purus placerat non. Praesent libero mi, ultrices ac sagittis vel, lacinia quis odio. Donec pellentesque nibh velit, vel finibus lorem vehicula et. Proin convallis egestas ex non aliquet. Fusce auctor nisl et nisl efficitur malesuada ut quis lacus. Fusce sagittis pretium libero, eu interdum risus rhoncus vitae. Nulla auctor maximus enim ut convallis. Sed feugiat id tortor sit amet pharetra. In eu pulvinar metus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vivamus ultrices dictum quam.",
      authorId: user.id,
    },
    {
      slug: "Where-can-I-get-some",
      title: "Where can I get some?",
      content:
        "Det finns många olika varianter av Lorem Ipsum, men majoriteten av dessa har ändrats på någotvis. Antingen med inslag av humor, eller med inlägg av ord som knappast ser trovärdiga ut. Skall man använda långa stycken av Lorem Ipsum bör man försäkra sig om att det inte gömmer sig något pinsamt mitt i texten. Lorem Ipsum-generatorer på internet tenderar att repetera Lorem Ipsum-texten styckvis efter behov, något som gör denna sidan till den första riktiga Lorem Ipsum-generatorn på internet. Den använder ett ordförråd på över 200 ord, kombinerat med ett antal meningsbyggnadsstrukturer som tillsamman genererar Lorem Ipsum som ser ut som en normal mening. Lorem Ipsum genererad på denna sidan är därför alltid fri från repetitioner, humorinslag, märkliga ordformationer osv.",
      authorId: user.id,
    },
    {
      slug: "Where-does-it-come-from",
      title: "Where does it come from?",
      content:
        "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of 'de Finibus Bonorum et Malorum' (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, 'Lorem ipsum dolor sit amet..', comes from a line in section 1.10.32. The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from 'de Finibus Bonorum et Malorum' by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham..",
      authorId: user.id,
    },
    {
      slug: "Why-do-we-use-it",
      title: "Why do we use it?",
      content:
        "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).",
      authorId: user.id,
    },
    {
      slug: "What-is-Lorem-Ipsum",
      title: "What is Lorem Ipsum?",
      content:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      authorId: user.id,
    },
  ];

  for (const article of articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: article,
      create: article,
    });
  }

  console.log("Database has been seeded. ^_^ ");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
