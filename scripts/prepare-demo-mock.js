/**
 * 为 build:demo 准备浏览器端 mock 数据：
 * 1. 把 mock/ 目录复制到 src/demo-mock/（umi 禁止 src 直接 import mock/**）
 * 2. 把其中 fs.readFileSync 读 JSON 的写法改写成静态 import（浏览器无法用 fs）
 *
 * 产物 src/demo-mock/ 已加入 .gitignore，仅构建时生成。
 */
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "mock");
const DEST = path.join(__dirname, "..", "src", "demo-mock");

function copyDir(src, dest) {
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const s = path.join(src, name);
    const d = path.join(dest, name);
    if (fs.statSync(s).isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

/**
 * 解析 path.join(D, ...) / path.join(__dirname, ...) 参数，
 * 以文件目录（相对 mock 根）为基准，返回目标目录的绝对段数组；".." 回退一级。
 */
function resolveJoinArgs(args, baseSegs) {
  const segs = [...baseSegs];
  for (const a of args) {
    if (a === "D") continue;
    if (a === '".."' || a === "'..'") segs.pop();
    else if (/^["'][^"']+["']$/.test(a)) segs.push(a.slice(1, -1));
    else throw new Error(`无法解析的 path.join 参数: ${a}`);
  }
  return segs;
}

/** 计算从 from 段到 to 段的相对路径（如 ["web"] -> ["data"] 得 "../data"） */
function toRelative(from, to) {
  let i = 0;
  while (i < from.length && i < to.length && from[i] === to[i]) i++;
  const ups = from.slice(i).map(() => "..");
  return [...ups, ...to.slice(i)].join("/");
}

function splitArgs(inner) {
  // 按逗号切分顶层参数（无嵌套括号的简单场景）
  const out = [];
  let depth = 0;
  let cur = "";
  for (const ch of inner) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function transformFile(file) {
  let code = fs.readFileSync(file, "utf-8");

  // Buffer.from(x).toString("base64") → btoa(x)（浏览器无 Buffer，无论是否 import fs 都要处理）
  const beforeBuffer = code;
  code = code.replace(/Buffer\.from\(([^)]+)\)\.toString\("base64"\)/g, (_m, expr) => `btoa(${expr})`);

  if (!/from ["']fs["']/.test(code) && !/from ["']path["']/.test(code)) {
    if (code !== beforeBuffer) {
      fs.writeFileSync(file, code); // 仅需 Buffer 替换的文件
      return true;
    }
    return false;
  }

  // 文件自身目录（相对复制目标根，与 mock 结构一致）段，作为 ".." 解析基准
  const fileDir = path.relative(DEST, path.dirname(file)).split(path.sep).filter(Boolean);
  let dirSegs = [];
  // 1. 提取并删除 const D = path.join(__dirname, ...) 行，解析出数据目录（绝对段）
  code = code.replace(
    /const\s+D\s*=\s*path\.join\(__dirname((?:,\s*["'][^"']+["'])+)\);?/g,
    (_m, litArgs) => {
      const args = splitArgs(litArgs.slice(1)); // 去掉开头的逗号
      dirSegs = resolveJoinArgs(args, fileDir);
      return "";
    },
  );

  // 2. 删除 fs / path 的 import
  code = code
    .replace(/import\s+\*\s+as\s+fs\s+from\s+["']fs["'];?\s*/g, "")
    .replace(/import\s+\*\s+as\s+path\s+from\s+["']path["'];?\s*/g, "");

  const jsonKeys = new Set();

  // 3. 先替换 read 工具函数（其内部 path.join(D, f) 的 f 是变量，需整行替换为查表）
  //    read 调用点传入的是相对 D 的文件名，查表需补上 D 的前缀
  const readPrefix = dirSegs.length ? `${dirSegs.join("/")}/` : "";
  code = code.replace(
    /const\s+read\s*=\s*\([^)]*\)\s*:\s*any\s*=>\s*JSON\.parse\(fs\.readFileSync\(path\.join\(D,\s*f\),\s*["']utf-8["']\)\);?/g,
    `const read = (f: string): any => __jsonMap[${JSON.stringify(readPrefix)} + f];`,
  );

  // 4. 再替换字面量 readFileSync 调用：JSON.parse(fs.readFileSync(path.join(...), "utf-8"))
  code = code.replace(
    /JSON\.parse\(fs\.readFileSync\(path\.join\(([^)]*)\),\s*["']utf-8["']\)\)/g,
    (_m, inner) => {
      const segs = resolveJoinArgs(splitArgs(inner), dirSegs);
      const key = segs.join("/");
      jsonKeys.add(key);
      return `__jsonMap[${JSON.stringify(key)}]`;
    },
  );

  // 5. 收集 read("xxx.json") 调用点（key = 数据目录绝对段 + 文件名）
  for (const m of code.matchAll(/\bread\((["'])([^"']+?\.(?:json))\1\)/g)) {
    jsonKeys.add(dirSegs.length ? `${dirSegs.join("/")}/${m[2]}` : m[2]);
  }

  // 6. 生成静态 import 与查表 map，插到文件头部（import 路径按文件位置换算相对路径）
  const imports = [];
  const entries = [];
  [...jsonKeys].sort().forEach((key, i) => {
    const target = key.split("/");
    let dir = toRelative(fileDir, target.slice(0, -1));
    if (dir === ".") dir = "./";
    else if (!dir.startsWith("..")) dir = "./" + dir;
    const importPath = `${dir}/${target[target.length - 1]}`;
    imports.push(`import __json${i} from ${JSON.stringify(importPath)};`);
    entries.push(`  ${JSON.stringify(key)}: __json${i},`);
  });
  const header =
    `// [prepare-demo-mock] 由 scripts/prepare-demo-mock.js 生成：fs 读取已改为静态 JSON import\n` +
    imports.join("\n") +
    `\nconst __jsonMap: Record<string, any> = {\n${entries.join("\n")}\n};\n\n`;
  code = header + code;

  // 7. 兜底校验：不允许残留 fs/path/Buffer 引用
  if (/fs\.readFileSync|path\.join|from ["']fs["']|from ["']path["']|Buffer\./.test(code)) {
    throw new Error(`${file} 转换后仍残留 fs/path 引用，请人工检查`);
  }

  fs.writeFileSync(file, code);
  return true;
}

copyDir(SRC, DEST);

let transformed = 0;
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (name.endsWith(".ts") && transformFile(p)) transformed++;
  }
}
walk(DEST);
console.log(`[prepare-demo-mock] 已复制 mock/ -> src/demo-mock/，转换 ${transformed} 个使用 fs 的文件`);
