// utils/fileHelpers.js
import fs from "fs/promises";
import path from "path";
import QRCode from "qrcode";

export async function fileToDataUrl(publicPathOrUrl) {
  if (!publicPathOrUrl) return null;
  try {
    // if it's already a remote url, return it (puppeteer can fetch remote),
    // but prefer embedding local public files for reliability
    if (/^https?:\/\//i.test(publicPathOrUrl)) return publicPathOrUrl;

    // map a public/ path like "/exercises/pushup/main.jpg" or "exercises/.."
    const rel = publicPathOrUrl.replace(/^\//, "");
    const p = path.join(process.cwd(), "public", rel);
    const b = await fs.readFile(p);
    const ext = path.extname(p).slice(1).toLowerCase();
    const mime = ext === "jpg" ? "jpeg" : ext;
    return `data:image/${mime};base64,${b.toString("base64")}`;
  } catch (e) {
    console.warn("fileToDataUrl failed:", publicPathOrUrl, e.message);
    return null;
  }
}

export async function qrDataUrl(text) {
  if (!text) return null;
  try {
    return await QRCode.toDataURL(text, { margin: 1, width: 220 });
  } catch (e) {
    console.warn("qrDataUrl failed", e);
    return null;
  }
}
