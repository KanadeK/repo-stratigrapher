import type { FileScore, TreeNode } from "./types";

export function buildTree(
  paths: string[],
  scores: Map<string, FileScore> = new Map(),
): TreeNode {
  const root: TreeNode = {
    name: "root",
    path: "",
    type: "directory",
    children: [],
  };

  for (const filePath of [...new Set(paths)].sort()) {
    const parts = filePath.split("/").filter(Boolean);
    let cursor = root;
    let path = "";

    parts.forEach((part, index) => {
      path = path ? `${path}/${part}` : part;
      const type = index === parts.length - 1 ? "file" : "directory";
      let child = cursor.children.find(
        (node) => node.name === part && node.type === type,
      );

      if (!child) {
        child = {
          name: part,
          path,
          type,
          children: [],
          hotspotScore: scores.get(path)?.hotspotScore,
        };
        cursor.children.push(child);
      }

      cursor = child;
    });
  }

  sortTree(root);
  return root;
}

function sortTree(node: TreeNode): void {
  node.children.sort((left, right) => {
    if (left.type !== right.type) return left.type === "directory" ? -1 : 1;
    return left.name.localeCompare(right.name);
  });
  node.children.forEach(sortTree);
}
