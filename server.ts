import "dotenv/config";
import express, { type Request, type Response } from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import expressLayouts from "express-ejs-layouts";
import next from "next";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

import { i18n, t } from "./src/lib/i18n.js";
import { getPublicData } from "./src/lib/getPayloadClient.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";

const start = async () => {
  const app = express();
  const nextApp = next({ dev, hostname: "localhost", port: PORT });
  const handle = nextApp.getRequestHandler();

  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));
  app.set("layout", "layouts/base");
  app.set("trust proxy", 1);

  app.use(expressLayouts);

  await nextApp.prepare();

  // Forward /admin, /api, /graphql, and /_next to Next.js BEFORE helmet & body parsers
  // so that Payload can read request body and serve its admin SPA without CSP conflicts.
  app.use((req, res, next) => {
    if (
      req.path.startsWith("/admin") ||
      req.path.startsWith("/api") ||
      req.path.startsWith("/graphql") ||
      req.path.startsWith("/_next")
    ) {
      try {
        return handle(req, res);
      } catch (err) {
        console.error("Next.js handler error:", err);
        if (!res.headersSent) res.status(500).send("Internal Server Error");
      }
    }
    next();
  });

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "blob:", "https:"],
          mediaSrc: ["'self'", "blob:", "https:"],
          scriptSrc: ["'self'", "'unsafe-inline'", dev ? "'unsafe-eval'" : "", "https://cdn.jsdelivr.net", "https://cdn.tailwindcss.com", "https://www.instagram.com", "https://connect.facebook.net", "https://platform.vimeo.com", "https://www.youtube.com"].filter(Boolean),
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          frameSrc: [
            "'self'",
            "https://www.youtube.com",
            "https://www.youtube-nocookie.com",
            "https://player.vimeo.com",
            "https://www.instagram.com",
            "https://vimeo.com",
            "https://www.tiktok.com",
          ],
          connectSrc: ["'self'", "https://fonts.gstatic.com", "https://www.instagram.com", "https://connect.facebook.net", "https://platform.vimeo.com"],
          upgradeInsecureRequests: null,
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, "public"), { maxAge: "7d", etag: true }));

  app.use(i18n as express.RequestHandler);

  // Body parsers only for non-Next.js routes (public EJS routes)
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // ===== PUBLIC EJS ROUTES =====
  app.get("/", async (req: Request, res: Response) => {
    const lang = (req as any).language;
    const data = await getPublicData(lang);
    res.render("public/home", { ...data, title: t(lang, "nav.home") });
  });

  app.get("/work", async (req: Request, res: Response) => {
    const lang = (req as any).language;
    const data = await getPublicData(lang);
    res.render("public/work", { ...data, title: t(lang, "nav.work") });
  });

  app.get("/about", async (req: Request, res: Response) => {
    const lang = (req as any).language;
    const data = await getPublicData(lang);
    res.render("public/about", {
      ...data,
      title: t(lang, "nav.about"),
    });
  });

  app.get("/contact", async (req: Request, res: Response) => {
    const lang = (req as any).language;
    const data = await getPublicData(lang);
    const s = data.settings;
    res.render("public/contact", {
      ...data,
      title: t(lang, "nav.contact"),
      email: s?.contactEmail || "",
      socials: {
        instagram: s?.instagram || "",
        youtube: s?.youtube || "",
        vimeo: s?.vimeo || "",
        tiktok: s?.tiktok || "",
      },
    });
  });

  // 404 / 500 for EJS routes only
  app.use((req, res, _next) => {
    res.status(404).render("public/404", { title: "404" });
  }) as express.RequestHandler;

  app.use(((err, req, res, _next) => {
    console.error(err);
    res.status(500).render("public/500", { title: "Error", message: err.message });
  }) as express.ErrorRequestHandler);

  const server = http.createServer(app);

  server.on("upgrade", (req, socket, head) => {
    if (req.url?.startsWith("/_next")) {
      nextApp.getUpgradeHandler()(req, socket, head);
    } else {
      socket.destroy();
    }
  });

  server.listen(PORT, () => {
    console.log(`🎬 Portfolio running at http://localhost:${PORT}`);
  });
};

start();
