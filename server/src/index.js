import express from "express";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { capturePage } from "./services/capture.js";
import { compareSnapshots } from "./services/diff.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, "../../data");
const dataFile = path.join(dataDir, "sites.json");
const app = express();

app.use(express.json());
app.use(express.static(path.resolve(__dirname, "../../public")));

async function loadSites() {
  try {
    return JSON.parse(await readFile(dataFile, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function saveSites(sites) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFile, JSON.stringify(sites, null, 2));
}

app.get("/api/sites", async (_req, res, next) => {
  try { res.json(await loadSites()); } catch (error) { next(error); }
});

app.post("/api/sites", async (req, res, next) => {
  try {
    const url = String(req.body.url || "").trim();
    if (!url) return res.status(400).json({ error: "url is required" });
    const snapshot = await capturePage(url);
    const sites = await loadSites();
    const site = { id: randomUUID(), url: snapshot.url, createdAt: new Date().toISOString(), snapshots: [snapshot] };
    sites.push(site);
    await saveSites(sites);
    res.status(201).json(site);
  } catch (error) { next(error); }
});

app.post("/api/sites/:id/check", async (req, res, next) => {
  try {
    const sites = await loadSites();
    const site = sites.find((item) => item.id === req.params.id);
    if (!site) return res.status(404).json({ error: "site not found" });
    const latest = await capturePage(site.url);
    const previous = site.snapshots.at(-1);
    const diff = compareSnapshots(previous, latest);
    site.snapshots.push(latest);
    await saveSites(sites);
    res.json({ snapshot: latest, diff });
  } catch (error) { next(error); }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: error.message || "Internal server error" });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`WebGhost API listening on http://localhost:${port}`));
