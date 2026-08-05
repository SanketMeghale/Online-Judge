import { createApp } from "./app.js";
import { connectDatabase } from "./lib/db.js";

const port = Number(process.env.PORT || 4000);
const app = createApp();

async function startServer() {
  await connectDatabase();
  app.listen(port, () => {
    console.log(`Online Judge API listening on http://localhost:${port}`);
  });
}

startServer();
