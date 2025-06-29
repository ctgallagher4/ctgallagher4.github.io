const templateCard = document.getElementById("project-card");
const templateRow = document.getElementById("project-row");
const projects = document.getElementById("projects");
const prs = document.getElementById("open-source-prs");

const rows = 5;
const codeExampleNames = [
  "Rust Drone Tutorial",
  "Rust Asteroids Clone",
  "Python Asteroids Clone",
  "Calculate Pi in Rust",
  "Python Tank Game",
];
const prExampleNames = ["In progress"];

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

function addScrollToListener(button: HTMLElement, target: HTMLElement) {
  if (button && target) {
    button.addEventListener("click", () => {
      target.scrollIntoView({ behavior: "smooth" });
    });
  }
}

function calcYCols(names: string[], rows: number) {
  return Math.floor(names.length / rows) + 1;
}

function fillCards(
  cardTemp: HTMLTemplateElement,
  rowTemp: HTMLTemplateElement,
  target: HTMLDivElement,
  xLength: number,
  yLength: number,
  names: string[],
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
          cardDiv.firstElementChild.textContent = names[xLength * y + x];
          rowElement.appendChild(cardElement);
        }
      }

      if (rowElement) {
        target?.appendChild(rowElement);
      }
    }
  }
}
