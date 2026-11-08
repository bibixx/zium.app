// Fails when the repo's agent docs drift from the code. Runs in `yarn lint`, see src/components/AGENTS.md.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const COMPONENTS_DIR = "src/components";
const SAMPLES_DIR = path.join(ROOT, COMPONENTS_DIR, "__doc_samples__");
const IGNORED_SAMPLE_ERRORS = new Set([
  2304, // Cannot find name: free variables in trimmed samples
  2552, // Cannot find name, did you mean
  18004, // Shorthand property with no value in scope
]);
const PATH_PATTERN = /^(?:src|docs|extension|scripts|public|\.agents|\.github)\/[\w./@-]*$/;

const errors = [];
const report = (doc, section, message) => errors.push(`${doc} [${section}]: ${message}`);
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), "utf8");
const exists = (relative) => fs.existsSync(path.join(ROOT, relative));
const toRelative = (absolute) => path.relative(ROOT, absolute).split(path.sep).join("/");

const atomDocs = fs
  .readdirSync(path.join(ROOT, COMPONENTS_DIR), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && exists(`${COMPONENTS_DIR}/${entry.name}/AGENTS.md`))
  .map((entry) => `${COMPONENTS_DIR}/${entry.name}/AGENTS.md`);

const docs = [
  "AGENTS.md",
  "extension/AGENTS.md",
  `${COMPONENTS_DIR}/AGENTS.md`,
  ...atomDocs,
  ...walkMarkdown("docs"),
];

let sampleCount = 0;
let propsTableCount = 0;

checkAtomTable();
for (const doc of docs) {
  checkReferences(doc);
}
const samples = atomDocs.flatMap(collectSamples);
for (const doc of atomDocs) {
  checkProps(doc);
}
checkSamples(samples);

if (errors.length > 0) {
  console.error(`Docs check failed with ${errors.length} problem(s):\n`);
  errors.forEach((error) => console.error(`  ${error}`));
  console.error("\nUpdate the doc or the code so they agree. Conventions: src/components/AGENTS.md");
  process.exit(1);
}

console.log(`Docs check passed: ${docs.length} docs, ${propsTableCount} props tables, ${sampleCount} samples.`);

function walkMarkdown(directory) {
  return fs.readdirSync(path.join(ROOT, directory), { withFileTypes: true }).flatMap((entry) => {
    const relative = `${directory}/${entry.name}`;
    if (entry.isDirectory()) {
      return walkMarkdown(relative);
    }
    return entry.name.endsWith(".md") ? [relative] : [];
  });
}

function checkAtomTable() {
  const listed = new Set([...read("AGENTS.md").matchAll(/\]\((src\/components\/[^/)]+\/AGENTS\.md)\)/g)].map((m) => m[1]));

  for (const doc of atomDocs) {
    if (!listed.has(doc)) {
      report("AGENTS.md", "Atoms", `${doc} is missing from the atom table`);
    }
  }
  for (const doc of listed) {
    if (!exists(doc)) {
      report("AGENTS.md", "Atoms", `${doc} is listed but doesn't exist`);
    }
  }
}

function stripFences(markdown) {
  return markdown.replace(/^( *)```[\s\S]*?^\1```/gm, "");
}

function getAnchors(markdown) {
  return new Set(
    [...stripFences(markdown).matchAll(/^#{1,6} +(.+)$/gm)].map((match) =>
      match[1]
        .replace(/`/g, "")
        .toLowerCase()
        .replace(/[^\w\- ]/g, "")
        .replace(/ /g, "-"),
    ),
  );
}

function checkReferences(doc) {
  const markdown = stripFences(read(doc));
  const directory = path.dirname(doc);

  for (const [, target] of markdown.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
    if (/^[a-z]+:/.test(target)) {
      continue;
    }

    const [file, anchor] = target.split("#");
    const resolved = file === "" ? doc : toRelative(path.resolve(ROOT, directory, file));
    if (!exists(resolved)) {
      report(doc, "links", `broken link ${target}`);
    } else if (anchor && !getAnchors(read(resolved)).has(anchor)) {
      report(doc, "links", `no heading for ${target}`);
    }
  }

  for (const [, code] of markdown.matchAll(/`([^`\n]+)`/g)) {
    if (PATH_PATTERN.test(code) && !exists(code)) {
      report(doc, "paths", `path doesn't exist: ${code}`);
    }
  }
}

function collectSamples(doc) {
  const markdown = read(doc);
  const atom = markdown.match(/^# +(.+)$/m)?.[1] ?? doc;
  const importFence = markdown.match(/^## Import\s+```ts\n([\s\S]*?)^```/m)?.[1] ?? "";

  return [...markdown.matchAll(/^```tsx\n([\s\S]*?)^```/gm)].map((match, index) => {
    const lines = match[1].split("\n");
    const from = lines[0].match(/^\/\/ from: (.+)$/)?.[1];
    const section = `Examples #${index + 1}`;

    if (from == null) {
      report(doc, section, "sample must start with // from: <path>");
    } else if (!exists(from)) {
      report(doc, section, `// from: file doesn't exist: ${from}`);
    } else if (!read(from).includes(atom)) {
      report(doc, section, `// from: ${from} no longer references ${atom}`);
    }

    const body = lines.slice(1);
    const sampleImports = body.filter((line) => line.startsWith("import "));
    const code = body
      .filter((line) => !line.startsWith("import "))
      .join("\n")
      .trim();
    const imports = [...new Set([...importFence.trim().split("\n"), ...sampleImports])].join("\n");
    const wrapped = code.startsWith("<")
      ? `export function Sample() {\n  return (\n<>\n${code}\n</>\n  );\n}`
      : `export function Sample() {\n${code}\n}`;

    sampleCount += 1;
    return {
      doc,
      section,
      fileName: path.join(SAMPLES_DIR, `${path.basename(path.dirname(doc))}_${index}.tsx`),
      source: `${imports}\n\n${wrapped}\n`,
    };
  });
}

function checkProps(doc) {
  const lines = read(doc).split("\n");
  let inProps = false;

  lines.forEach((line, index) => {
    if (/^## /.test(line)) {
      inProps = line === "## Props";
    }
    const startsTable = line.startsWith("|") && !lines[index - 1].startsWith("|");
    if (inProps && startsTable && !lines[index - 1].startsWith("<!-- props:")) {
      report(doc, "Props", "table has no <!-- props: path#Type --> marker");
    }

    const marker = line.match(/^<!-- props: (.+)#(\w+) -->$/);
    if (marker == null) {
      return;
    }

    const [, file, typeName] = marker;
    const section = `Props ${typeName}`;
    if (!exists(file)) {
      report(doc, section, `source doesn't exist: ${file}`);
      return;
    }

    propsTableCount += 1;
    const sourceFile = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true);
    const expected = getDeclaredMembers(sourceFile, typeName);
    if (expected == null) {
      report(doc, section, `type ${typeName} not found in ${file}`);
      return;
    }

    const documented = new Set();
    for (let row = index + 3; lines[row]?.startsWith("|"); row += 1) {
      const name = lines[row].match(/^\| *`([^`]+)`/)?.[1];
      if (name != null) {
        documented.add(name);
      }
    }

    for (const name of expected) {
      if (!documented.has(name)) {
        report(doc, section, `prop \`${name}\` exists in code but isn't documented`);
      }
    }
    for (const name of documented) {
      if (!expected.has(name)) {
        report(doc, section, `prop \`${name}\` is documented but doesn't exist in ${typeName}`);
      }
    }
  });
}

function getDeclaredMembers(sourceFile, typeName) {
  const declaration = sourceFile.statements.find(
    (statement) =>
      (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) &&
      statement.name.text === typeName,
  );
  if (declaration == null) {
    return null;
  }

  return ts.isInterfaceDeclaration(declaration)
    ? getMemberNames(declaration.members)
    : getTypeNodeMembers(sourceFile, declaration.type);
}

function getMemberNames(members) {
  return new Set(members.flatMap((member) => (member.name ? [member.name.getText()] : [])));
}

function getTypeNodeMembers(sourceFile, node) {
  if (ts.isTypeLiteralNode(node)) {
    return getMemberNames(node.members);
  }

  if (ts.isIntersectionTypeNode(node) || ts.isUnionTypeNode(node)) {
    return new Set(node.types.flatMap((type) => [...getTypeNodeMembers(sourceFile, type)]));
  }

  if (ts.isTypeReferenceNode(node)) {
    const name = node.typeName.getText();
    if (name === "Omit" && node.typeArguments?.length === 2) {
      const [base, omitted] = node.typeArguments;
      const omittedNames = (ts.isUnionTypeNode(omitted) ? omitted.types : [omitted]).map((type) =>
        type.getText().replace(/["']/g, ""),
      );
      return new Set([...getTypeNodeMembers(sourceFile, base)].filter((member) => !omittedNames.includes(member)));
    }

    return getDeclaredMembers(sourceFile, name) ?? new Set();
  }

  return new Set();
}

function checkSamples(allSamples) {
  const configPath = path.join(ROOT, "tsconfig.json");
  const { options } = ts.parseJsonConfigFileContent(
    ts.readConfigFile(configPath, ts.sys.readFile).config,
    ts.sys,
    ROOT,
  );
  const virtualFiles = new Map(allSamples.map((sample) => [sample.fileName, sample]));
  const ambientFiles = ["src/vite-env.d.ts", "src/mpd-parser.d.ts"].map((file) => path.join(ROOT, file));
  const compilerOptions = { ...options, plugins: [], noEmit: true };
  const host = ts.createCompilerHost(compilerOptions);
  const { getSourceFile, fileExists, readFile, directoryExists } = host;

  // Samples stay in memory so a build never writes into src/.
  host.fileExists = (file) => virtualFiles.has(file) || fileExists(file);
  host.readFile = (file) => virtualFiles.get(file)?.source ?? readFile(file);
  host.directoryExists = (directory) => directory === SAMPLES_DIR || (directoryExists?.(directory) ?? true);
  host.getSourceFile = (file, languageVersion, ...rest) => {
    const sample = virtualFiles.get(file);
    return sample != null
      ? ts.createSourceFile(file, sample.source, languageVersion, true, ts.ScriptKind.TSX)
      : getSourceFile(file, languageVersion, ...rest);
  };

  const program = ts.createProgram([...virtualFiles.keys(), ...ambientFiles], compilerOptions, host);

  for (const [fileName, sample] of virtualFiles) {
    const sourceFile = program.getSourceFile(fileName);
    const diagnostics = [...program.getSyntacticDiagnostics(sourceFile), ...program.getSemanticDiagnostics(sourceFile)];

    for (const diagnostic of diagnostics) {
      if (!IGNORED_SAMPLE_ERRORS.has(diagnostic.code)) {
        report(sample.doc, sample.section, ts.flattenDiagnosticMessageText(diagnostic.messageText, " "));
      }
    }
  }
}
