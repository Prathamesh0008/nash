import fs from "fs";
import path from "path";

function usage() {
  console.error("Usage: node scripts/generate-report-pdf.mjs <input.txt|md> <output.pdf>");
  process.exit(1);
}

if (process.argv.length < 4) usage();

const inputPath = path.resolve(process.argv[2]);
const outputPath = path.resolve(process.argv[3]);

if (!fs.existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`);
  process.exit(1);
}

const raw = fs.readFileSync(inputPath, "utf8");
const sourceLines = raw.split(/\r?\n/);

function sanitizeToPdfText(line) {
  return line
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapLine(line, width = 92) {
  const trimmed = line.replace(/\s+/g, " ").trim();
  if (!trimmed) return [""];
  if (trimmed.length <= width) return [trimmed];

  const out = [];
  let buf = "";
  for (const word of trimmed.split(" ")) {
    if (!buf) {
      buf = word;
      continue;
    }
    if ((buf + " " + word).length <= width) {
      buf += ` ${word}`;
    } else {
      out.push(buf);
      buf = word;
    }
  }
  if (buf) out.push(buf);
  return out;
}

const wrapped = [];
for (const line of sourceLines) {
  if (line.trim() === "") {
    wrapped.push("");
    continue;
  }
  wrapped.push(...wrapLine(line));
}

const pageWidth = 595;
const pageHeight = 842;
const margin = 40;
const fontSize = 11;
const lineHeight = 14;
const maxLinesPerPage = Math.floor((pageHeight - margin * 2) / lineHeight);

const pages = [];
for (let i = 0; i < wrapped.length; i += maxLinesPerPage) {
  pages.push(wrapped.slice(i, i + maxLinesPerPage));
}
if (pages.length === 0) pages.push([""]);

function buildContentStream(lines) {
  const startY = pageHeight - margin;
  let stream = "BT\n";
  stream += `/F1 ${fontSize} Tf\n`;
  stream += `${margin} ${startY} Td\n`;

  lines.forEach((line, idx) => {
    const safe = sanitizeToPdfText(line);
    stream += `(${safe}) Tj\n`;
    if (idx < lines.length - 1) {
      stream += `0 -${lineHeight} Td\n`;
    }
  });

  stream += "ET";
  return stream;
}

const objects = [];

objects.push("<< /Type /Catalog /Pages 2 0 R >>");

const pageCount = pages.length;
const firstPageObj = 4;
const kids = [];
for (let i = 0; i < pageCount; i++) {
  kids.push(`${firstPageObj + i * 2} 0 R`);
}
objects.push(`<< /Type /Pages /Count ${pageCount} /Kids [ ${kids.join(" ")} ] >>`);

objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

for (let i = 0; i < pageCount; i++) {
  const pageObjNum = firstPageObj + i * 2;
  const contentObjNum = pageObjNum + 1;
  const pageObj = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjNum} 0 R >>`;
  objects.push(pageObj);

  const stream = buildContentStream(pages[i]);
  const length = Buffer.byteLength(stream, "latin1");
  const contentObj = `<< /Length ${length} >>\nstream\n${stream}\nendstream`;
  objects.push(contentObj);
}

let pdf = "%PDF-1.4\n";
const offsets = [0];

for (let i = 0; i < objects.length; i++) {
  offsets.push(Buffer.byteLength(pdf, "latin1"));
  pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
}

const xrefPos = Buffer.byteLength(pdf, "latin1");
pdf += `xref\n0 ${objects.length + 1}\n`;
pdf += "0000000000 65535 f \n";
for (let i = 1; i < offsets.length; i++) {
  pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
}
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, Buffer.from(pdf, "latin1"));

console.log(`PDF generated: ${outputPath}`);
