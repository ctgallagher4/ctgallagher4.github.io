const templateCard = document.getElementById("project-card");
const templateRow = document.getElementById("project-row");
const projects = document.getElementById("projects");
const prs = document.getElementById("open-source-prs");

const rows = 5;
const codeExampleNames = [
  {
    label: "Simple Rust Asteroids Clone",
    href: "https://github.com/ctgallagher4/rocket-rs",
  },
  {
    label: "TypeScript Website",
    href: "https://ctgallagher4.github.io",
  },
  {
    label: "Custom Markdown Blog",
    href: "https://ctgallagher4.github.io",
  },
];
const prExampleNames = [
  {
    label: "pixi-scroll-mask TypeScipt Library",
    href: "https://www.npmjs.com/package/pixi-scroll-mask",
  },
];

const articles = [
  { name: "The Math Behind My Rocket Game", file: "rocket.html" },
  { name: "How to Build a Simple Markdown Blog", file: "blog.html" },
];

if (
  templateCard instanceof HTMLTemplateElement &&
  templateRow instanceof HTMLTemplateElement &&
  projects instanceof HTMLDivElement &&
  prs instanceof HTMLDivElement
) {
  let yCols = calcYCols(codeExampleNames, rows);
  fillCards(templateCard, templateRow, projects, rows, yCols, codeExampleNames);
  yCols = calcYCols(prExampleNames, rows);
  fillCards(templateCard, templateRow, prs, rows, yCols, prExampleNames);
}

document.addEventListener("DOMContentLoaded", () => {
  const aboutButton = document.getElementById("about-button")!;
  const aboutTarget = document.getElementById("about-section")!;
  const codeButton = document.getElementById("code-button")!;
  const codeTarget = document.getElementById("code-section")!;
  const constactButton = document.getElementById("contact-button")!;
  const contactTarget = document.getElementById("contact-section")!;

  addScrollToListener(aboutButton, aboutTarget);
  addScrollToListener(codeButton, codeTarget);
  addScrollToListener(constactButton, contactTarget);
});

const menu = document.getElementById("blog-menu");
for (const [index, article] of articles.entries()) {
  const a = document.createElement("a");
  a.href = "/pages/" + article.file;
  a.innerText = (index + 1).toString() + ") " + article.name;
  a.className = "mr-auto hover:text-emerald-400 hover:underline";
  menu?.appendChild(a);
}

function addScrollToListener(button: HTMLElement, target: HTMLElement) {
  if (button && target) {
    button.addEventListener("click", () => {
      target.scrollIntoView({ behavior: "smooth" });
    });
  }
}

function calcYCols(names: { label: string; href: string }[], rows: number) {
  return Math.floor(names.length / rows) + 1;
}

function fillCards(
  cardTemp: HTMLTemplateElement,
  rowTemp: HTMLTemplateElement,
  target: HTMLDivElement,
  xLength: number,
  yLength: number,
  names: { label: string; href: string }[],
) {
  if (
    rowTemp instanceof HTMLTemplateElement &&
    cardTemp instanceof HTMLTemplateElement &&
    target instanceof HTMLDivElement
  ) {
    for (let y = 0; y < yLength; y++) {
      const rowFragment = rowTemp.content.cloneNode(true) as DocumentFragment;
      const rowElement = rowFragment.firstElementChild;

      const length = y === yLength - 1 ? names.length % rows : rows;
      for (let x = 0; x < length; x++) {
        const cardFragment = cardTemp.content.cloneNode(
          true,
        ) as DocumentFragment;
        const cardElement = cardFragment.firstElementChild;
        const cardDiv = cardElement?.firstElementChild;
        if (cardElement && rowElement && cardDiv?.firstElementChild) {
          const aTag = cardDiv.firstElementChild;
          aTag.textContent = names[xLength * y + x].label;
          (aTag as HTMLAnchorElement).href = names[xLength * y + x].href;
          rowElement.appendChild(cardElement);
        }
      }

      if (rowElement) {
        target?.appendChild(rowElement);
      }
    }
  }
}
