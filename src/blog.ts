const menu = document.getElementById("blog-menu");

const articles = [
  { name: "The Math Behind My Rocket Game", file: "rocket.html" },
  { name: "How to Build a Simple Markdown Blog", file: "blog.html" },
];

for (const [index, article] of articles.entries()) {
  const a = document.createElement("a");
  a.href = "/pages/" + article.file;
  a.innerText = (index + 1).toString() + ".) " + article.name;
  a.className = "mr-auto my-2 hover:text-blue-800 hover:underline";
  menu?.appendChild(a);
}
