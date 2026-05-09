import path from "node:path";

// const res = await fetch(url);
// const data = await res.json();

// console.log(data);



export function createSourceCodeApath(...filePaths: string[]) {
  const dir = path.join(import.meta.dirname, ...filePaths);
  return dir;
}

console.log(createSourceCodeApath())
