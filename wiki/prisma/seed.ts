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
      passwordHash: hashedPassword,
    },
  });

  const articles = [
    {
      slug: "Var-far-jag-tag-i-det",
      title: "Var får jag tag i det?",
      markdown:
        "Det finns många olika varianter av Lorem Ipsum, men majoriteten av dessa har ändrats på någotvis. Antingen med inslag av humor, eller med inlägg av ord som knappast ser trovärdiga ut. Skall man använda långa stycken av Lorem Ipsum bör man försäkra sig om att det inte gömmer sig något pinsamt mitt i texten. Lorem Ipsum-generatorer på internet tenderar att repetera Lorem Ipsum-texten styckvis efter behov, något som gör denna sidan till den första riktiga Lorem Ipsum-generatorn på internet. Den använder ett ordförråd på över 200 ord, kombinerat med ett antal meningsbyggnadsstrukturer som tillsamman genererar Lorem Ipsum som ser ut som en normal mening. Lorem Ipsum genererad på denna sidan är därför alltid fri från repetitioner, humorinslag, märkliga ordformationer osv.",
      authorId: user.id,
    },
    {
      slug: "Var-kommer-det-ifran",
      title: "Var kommer det ifrån?",
      markdown:
        "I motsättning till vad många tror, är inte Lorem Ipsum slumpvisa ord. Det har sina rötter i ett stycke klassiskt litteratur på latin från 45 år före år 0, och är alltså över 2000 år gammalt. Richard McClintock, en professor i latin på Hampden-Sydney College i Virginia, översatte ett av de mer ovanliga orden, consectetur, från ett stycke Lorem Ipsum och fann dess ursprung genom att studera användningen av dessa ord i klassisk litteratur. Lorem Ipsum kommer från styckena 1.10.32 och 1.10.33 av 'de Finibus Bonorum et Malorum' (Ytterligheterna av ont och gott) av Cicero, skriven 45 före år 0. Boken är en avhandling i teorier om etik, och var väldigt populär under renäsanssen. Den inledande meningen i Lorem Ipsum, 'Lorem Ipsum dolor sit amet...', kommer från stycke 1.10.32.",
      authorId: user.id,
    },
    {
      slug: "Varfor-anvander-vi-det",
      title: "Varför använder vi det?",
      markdown:
        "Det är ett välkänt faktum att läsare distraheras av läsbar text på en sida när man skall studera layouten. Poängen med Lorem Ipsum är att det ger ett normalt ordflöde, till skillnad från 'Text här, Text här', och ger intryck av att vara läsbar text. Många publiseringprogram och webbutvecklare använder Lorem Ipsum som test-text, och en sökning efter 'Lorem Ipsum' avslöjar många webbsidor under uteckling. Olika versioner har dykt upp under åren, ibland av olyckshändelse, ibland med flit (mer eller mindre humoristiska).",
      authorId: user.id,
    },
    {
      slug: "vad-ar-lorem-ipsum",
      title: "Vad är Lorem Ipsum?",
      markdown:
        "Lorem Ipsum är en utfyllnadstext från tryck- och förlagsindustrin. Lorem ipsum har varit standard ända sedan 1500-talet, när en okänd boksättare tog att antal bokstäver och blandade dem för att göra ett provexemplar av en bok. Lorem ipsum har inte bara överlevt fem århundraden, utan även övergången till elektronisk typografi utan större förändringar. Det blev allmänt känt på 1960-talet i samband med lanseringen av Letraset-ark med avsnitt av Lorem Ipsum, och senare med mjukvaror som Aldus PageMaker.",
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
