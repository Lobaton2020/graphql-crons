const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "src", "views", "schema");
const dst = path.join(__dirname, "..", "dist", "views", "schema");

fs.mkdirSync(dst, { recursive: true });
for (const file of fs.readdirSync(src)) {
  if (file.endsWith(".graphql")) {
    fs.copyFileSync(path.join(src, file), path.join(dst, file));
  }
}
console.log("copied graphql schemas to dist/views/schema");
