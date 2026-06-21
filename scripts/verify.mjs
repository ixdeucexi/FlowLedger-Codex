import { readFile } from "node:fs/promises";

const required = ["index.html", "styles.css", "app.js", "vercel.json"];
for (const file of required) {
  const source = await readFile(new URL(`../${file}`, import.meta.url), "utf8");
  if (!source.trim()) throw new Error(`${file} is empty`);
}

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
for (const id of ["app", "modal-root", "toast-root"]) {
  if (!html.includes(`id="${id}"`)) throw new Error(`Missing #${id}`);
}

console.log("FlowLedger static build verified.");

