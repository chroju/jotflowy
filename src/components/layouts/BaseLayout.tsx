import type { FC, PropsWithChildren } from "hono/jsx";

export const BaseLayout: FC<PropsWithChildren<{ title?: string }>> = ({ children, title }) => (
  <html lang="ja">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <meta name="theme-color" content="#5E81AC" />
      <title>{title || "Jotflowy"}</title>
      <link rel="manifest" href="/manifest.json" />
      <link rel="icon" type="image/png" href="/favicon.png" />
      <link rel="apple-touch-icon" href="/icon-192.png" />
      <link rel="stylesheet" href="/styles/main.css" />
    </head>
    <body>
      {children}
      <script src="/scripts/client.js" type="module"></script>
    </body>
  </html>
);
