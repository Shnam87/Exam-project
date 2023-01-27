# My examination project

Creating a interaktiv and responsive Wiki page using Remix framework and TypeScript. 
 - Styling with Tailwind CSS 
 - Database in PostgreSQL 
 - Connecting to database using Prisma ORM

Loggning av process by:
 - Toggl: https://track.toggl.com/timer
 - Jira: https://wie21s-exam.atlassian.net/browse/WIKI

## Some requirements:
In order to run and test this, you need to have:
 - The Postgres software installed and running
 - Node version 18 or a relative new version
 - Add a .env file like the exemple


From your terminal:

```sh
cd wiki
npm install

npx prisma generate
npx prisma db push
npx prisma db seed

npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.
