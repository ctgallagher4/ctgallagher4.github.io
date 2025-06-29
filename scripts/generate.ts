import fs from "fs-extra";
import path from "path";
import { marked } from "marked";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.resolve(__dirname, "../content/");
const outputDir = path.resolve(__dirname, "../public/pages");

async function buildPages() {
  await fs.ensureDir(outputDir);
  const files = await fs.readdir(inputDir);

  for (const file of files) {
    if (file.endsWith(".md")) {
      const markdown = await fs.readFile(path.join(inputDir, file), "utf-8");
      const html = marked(markdown);

      const pageHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>${file.replace(".md", "")}</title>
        </head>
        <body>
          ${html}
        </body>
        </html>
      `;

      const outputPath = path.join(outputDir, file.replace(".md", ".html"));
      await fs.writeFile(outputPath, pageHtml);
      console.log(`✅ Generated ${outputPath}`);
    }
  }
}

buildPages().catch((err) => {
  console.error("❌ Build failed:", err);
  process.exit(1);
});
