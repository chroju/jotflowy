import { Hono } from "hono";
import { BaseLayout } from "./components/layouts/BaseLayout";
import { MainPage } from "./components/pages/MainPage";
import api from "./api/handlers";
import type { Env } from "./types";

const app = new Hono<{ Bindings: Env }>();

app.route("/api", api);

app.get("/", (c) => {
  return c.html(
    <BaseLayout>
      <MainPage />
    </BaseLayout>
  );
});

app.get("/share", (c) => {
  return c.html(
    <BaseLayout>
      <MainPage />
    </BaseLayout>
  );
});

export default app;
