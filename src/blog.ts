const menu = document.getElementById("blog-menu");

const articles = [
  { name: "Building a drone with Rust!", file: "drone.html" },
  { name: "Building a markdown blog!", file: "blog.html" },
];

for (const [index, article] of articles.entries()) {
  const a = document.createElement("a");
  a.href = "/public/pages/" + article.file;
  a.innerText = (index + 1).toString() + ".) " + article.name;
  menu?.appendChild(a);
}
