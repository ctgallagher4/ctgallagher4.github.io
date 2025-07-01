import { Application, Assets, Graphics, Sprite } from "pixi.js";

const templateCard = document.getElementById("project-card");
const templateRow = document.getElementById("project-row");
const projects = document.getElementById("projects");
const prs = document.getElementById("open-source-prs");

const canvas = document.getElementById("canvas") as HTMLCanvasElement;

(async () => {
  const app = new Application();
  await app.init({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundAlpha: 0,
    canvas: canvas,
  });

  Assets.add({
    alias: "astronaut",
    src: "/astronaut.png",
  });
  Assets.add({
    alias: "rocket",
    src: "/rocket.png",
  });

  const promises = Assets.load(["astronaut", "rocket"]);

  // Load your rocket texture
  promises.then((textures) => {
    let astronaut: Sprite | undefined = Sprite.from(textures.astronaut);
    astronaut.x = 0;
    astronaut.y = Math.random() * app.screen.height;
    astronaut.zIndex = 1;
    astronaut.pivot = (app.screen.width / 2, app.screen.height / 2);
    astronaut.height = 100;
    astronaut.width = 100;
    astronaut.visible = false;
    let rocket: Sprite | undefined = Sprite.from(textures.rocket);
    rocket.anchor.set(0.5);
    rocket.x = app.screen.width - 10; // off-screen left
    rocket.y = app.screen.height;
    rocket.width = 100;
    rocket.height = 100;
    rocket.rotation = (-1.1 * Math.PI) / 4;
    rocket.zIndex = 1;
    let x_vel = 0;
    let y_vel = 0;
    app.stage.addChild(rocket);
    app.stage.addChild(astronaut);

    let count = 0;
    let totalTime = 0;
    let time = app.ticker.lastTime;

    const graph = new Graphics()
      .rect(0, 0, app.screen.width, app.screen.height)
      .fill({ color: "black" });
    graph.zIndex = 0;

    app.stage.addChild(graph);

    app.ticker.add((delta) => {
      const deltaT = delta.lastTime - time;
      if (rocket) {
        rocket.rotation -= count / 25000;
        x_vel -= deltaT / 50000;
        y_vel -= deltaT / 800 / (count + 1);
        rocket.x += x_vel;
        rocket.y += y_vel;
        graph.y += y_vel;
        graph.alpha -= 0.001;
        if (rocket.y < -rocket.height) {
          rocket.removeFromParent();
          Assets.unload("rocket");
          graph.destroy();
          rocket = undefined;
        }
      }
      if (!rocket && astronaut && totalTime > 10000) {
        astronaut.visible = true;
        astronaut.x += 1;
        astronaut.y += 1;
        astronaut.rotation += 0.001;
        if (
          astronaut.y >= app.screen.height ||
          astronaut.x >= app.screen.width
        ) {
          totalTime = 0;
          astronaut.visible = false;
        }
        astronaut.x %= app.screen.width;
        astronaut.y %= app.screen.height;
      }
      time = delta.deltaMS;
      totalTime += delta.elapsedMS;
      count += 1;
    });
  });
})();

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
  a.className = "mr-auto hover:text-orange-400 hover:underline";
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
