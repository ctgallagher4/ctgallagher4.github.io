import fs from "fs-extra";
import path from "path";
import { marked } from "marked";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.resolve(__dirname, "../content/");
const outputDir = path.resolve(__dirname, "../public/pages");

const script = `
  const toggle = document.getElementById('dark-mode-toggle');
  const root = document.documentElement;

  // Initialize from localStorage
  if (localStorage.theme === 'dark') {
    root.classList.add('dark');
  }

  toggle.addEventListener('click', () => {
    if (root.classList.contains('dark')) {
      root.classList.remove('dark');
      localStorage.theme = 'light';
    } else {
      root.classList.add('dark');
      localStorage.theme = 'dark';
    }
  });
`;

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
          <link href="/style.css" rel="stylesheet" />
          <link href="https://unpkg.com/prismjs@1.29.0/themes/prism-tomorrow.css" rel="stylesheet" />
          <script src="https://unpkg.com/prismjs@1.29.0/prism.js"></script>
          <script src="https://unpkg.com/prismjs@1.29.0/components/prism-rust.min.js"></script>
        </head>
        <body class="markdown-body">
          <div class="markdown flex flex-col mr-auto">
            <button
              id="dark-mode-toggle"
              class="fixed top-4 right-4 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-3 py-1 rounded shadow"
            >
              Toggle Dark Mode
            </button>
            ${html}
          </div>
          <script> ${script} </script>
          <footer class="mt-16 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
            © 2025 Charlie Gallagher All rights reserved.
          </footer>
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
