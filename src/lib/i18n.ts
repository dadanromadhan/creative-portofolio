import en from "../../locales/en.json";
import id from "../../locales/id.json";
import type { Request, Response, NextFunction } from "express";

const dict: Record<string, Record<string, string>> = { en, id };

export function detectLocale(req: Request): "en" | "id" {
  if (req.query.lang && ["en", "id"].includes(req.query.lang as string))
    return req.query.lang as "en" | "id";
  if (req.cookies?.lang && ["en", "id"].includes(req.cookies.lang as string))
    return req.cookies.lang as "en" | "id";
  const al = req.headers["accept-language"] || "";
  return al.toLowerCase().includes("id") ? "id" : "en";
}

export function i18n(req: Request, res: Response, next: NextFunction) {
  const lang = detectLocale(req);
  (req as any).language = lang;
  res.locals.lang = lang;
  res.locals.t = (key: string) => dict[lang][key] || key;
  res.locals.otherLang = lang === "en" ? "id" : "en";
  if (req.query.lang && req.query.lang !== req.cookies?.lang) {
    res.cookie("lang", req.query.lang, { maxAge: 365 * 24 * 60 * 60 * 1000 });
  }
  next();
}

export function t(lang: "en" | "id", key: string) {
  return dict[lang]?.[key] || key;
}
