# How to Build a Simple Markdown Blog

This blog works by taking markdown files, converting them to html, and styling them with css at build time. I use TailwindCSS for this and I will be assuming that is what you are using too, but this should work with or without any css framework.

## Setup

First, in the root of your website's repository, you should create a folder called `/content`. This is where you will place all of your markdown files. Next, you should create a folder called `/scripts`, if you do not have it already. Now, create a script called `generate.ts` within the `/scripts`. You should feel free to tweak this however you like, but the basic pieces are:
  * importing `marked`
  * setting up our input and output directories
  * defining some light scripting for our markdown page
  * converting our html to markdown
  * inserting those markdown and script strings into a simple string of html * writing the string to a file in the public directory.

I've broken the script down into sections below.

### Imports

```javascript
import fs from "fs-extra";
import path from "path";
import { marked } from "marked";
import { fileURLToPath } from "url";
```

### Setting up Input and Output Directories

```javascript
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.resolve(__dirname, "../content/");
const outputDir = path.resolve(__dirname, "../public/pages");
```

### Creating Some Light scripting

In this case I setup some scripting that allows us to toggle light and dark mode.

```javascript
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
```

### Putting It All Together

You will notice several `link` and `script` tags. Styling with tailwind is as simple as linking to your `style.css`! Just be sure to include html in the public directory in your `tailwind.config.ts`. The next few are links and scripts for code syntax highlighting. Without this, it would be up to us to color `const` purple for example, or the `=` blue. It would be very tedious to get right for all the popular programming lanugages.

```javascript
async function buildPages() {
  await fs.ensureDir(outputDir);
  const files = await fs.readdir(inputDir);

  for (const file of files) {
    if (file.endsWith(".md")) {
      const markdown = await fs.readFile(path.join(inputDir, file), "utf-8");
      const html = marked(markdown);

      // inserting the markdown and script strings
      const pageHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>${file.replace(".md", "")}</title>
          <link href="/src/style.css" type="text/css" rel="stylesheet" />
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

      // writing to the public directory
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
```

## Building

I prefer to run my TypeScript scripts with `tsx`. It is as easy as `npm install -g tsx`. You could easily add building with `tsx /scripts/generate.ts` to your CI/CD pipeline, even on github pages, although that is beyond the scope of this post.
