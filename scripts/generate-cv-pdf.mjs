import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { site } from "../src/data/site.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.resolve(__dirname, "../public/assets/cv");
const outputFile = path.join(outputDir, "Cristhian-Guerrero-Zaldivar-CV.pdf");

const pageWidth = 612;
const pageHeight = 792;
const margin = 52;
const contentWidth = pageWidth - margin * 2;

const pages = [];
let operations = [];
let y = pageHeight - margin;

const escapePdf = (value) =>
  String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

const newPage = () => {
  if (operations.length) {
    pages.push(operations.join("\n"));
  }

  operations = [];
  y = pageHeight - margin;
};

const ensureSpace = (heightNeeded) => {
  if (y - heightNeeded < margin) {
    newPage();
  }
};

const drawText = (text, x, posY, font = "F1", size = 11, color = [0.19, 0.21, 0.27]) => {
  operations.push(
    `BT /${font} ${size} Tf ${color[0]} ${color[1]} ${color[2]} rg 1 0 0 1 ${x} ${posY} Tm (${escapePdf(
      text,
    )}) Tj ET`,
  );
};

const wrapText = (text, maxChars) => {
  const words = String(text).split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) lines.push(current);
  return lines;
};

const addBlock = (text, options = {}) => {
  const {
    font = "F1",
    size = 11,
    color = [0.27, 0.31, 0.38],
    leading = size * 1.45,
    maxChars = Math.floor(contentWidth / (size * 0.52)),
    x = margin,
    gapAfter = 6,
  } = options;

  const lines = wrapText(text, maxChars);
  ensureSpace(lines.length * leading + gapAfter);

  for (const line of lines) {
    drawText(line, x, y, font, size, color);
    y -= leading;
  }

  y -= gapAfter;
};

const addHeading = (text) => {
  ensureSpace(34);
  drawText(text, margin, y, "F2", 18, [0.06, 0.07, 0.1]);
  y -= 24;
  operations.push(
    `0.93 0.58 0.38 RG ${margin} ${y} m ${pageWidth - margin} ${y} l S`,
  );
  y -= 16;
};

const addBulletList = (items, indent = 14) => {
  for (const item of items) {
    const lines = wrapText(item, Math.floor((contentWidth - indent) / (11 * 0.52)));
    ensureSpace(lines.length * 16 + 4);
    drawText("•", margin, y, "F2", 11, [0.93, 0.58, 0.38]);
    lines.forEach((line, index) => {
      drawText(line, margin + indent, y - index * 16, "F1", 11, [0.27, 0.31, 0.38]);
    });
    y -= lines.length * 16 + 2;
  }
  y -= 4;
};

newPage();

drawText(site.name, margin, y, "F2", 24, [0.06, 0.07, 0.1]);
y -= 26;
drawText(
  `${site.role} · Founder of FlowMind Studio · Austin, Texas`,
  margin,
  y,
  "F1",
  12,
  [0.27, 0.31, 0.38],
);
y -= 20;
drawText(`${site.email} · ${site.phoneDisplay}`, margin, y, "F1", 10, [0.38, 0.43, 0.51]);
y -= 14;
drawText("LinkedIn, GitHub, and FlowMind Studio available from the personal website.", margin, y, "F1", 10, [
  0.38,
  0.43,
  0.51,
]);
y -= 26;

addHeading("Profile");
addBlock(
  "Austin-based developer and founder leading FlowMind Studio. I build artistic websites, trustworthy digital systems, and clean public-facing experiences that connect clear communication, search visibility, and professional credibility.",
  { size: 11.5 },
);

addHeading("Selected Work");
site.portfolio.forEach((project) => {
  addBlock(`${project.title} · ${project.category}`, {
    font: "F2",
    size: 12,
    color: [0.06, 0.07, 0.1],
    gapAfter: 2,
  });
  addBlock(project.summary, { gapAfter: 4 });
  addBlock(`Link: ${project.href}`, { size: 10, color: [0.38, 0.43, 0.51], gapAfter: 10 });
});

addHeading("Experience");
site.experience.forEach((item) => {
  addBlock(`${item.title} · ${item.company}`, {
    font: "F2",
    size: 12,
    color: [0.06, 0.07, 0.1],
    gapAfter: 2,
  });
  addBlock(`${item.start} — ${item.end} · ${item.location}`, {
    size: 10,
    color: [0.38, 0.43, 0.51],
    gapAfter: 4,
  });
  addBlock(item.body, { gapAfter: 4 });
  addBulletList(item.highlights);
});

addHeading("Strengths");
addBulletList(site.strengths.map((item) => item.title));

addHeading("Education");
site.education.forEach((item) => {
  addBlock(item.school, {
    font: "F2",
    size: 12,
    color: [0.06, 0.07, 0.1],
    gapAfter: 2,
  });
  addBlock(`${item.degree}`, { gapAfter: 2 });
  addBlock(`${item.start} — ${item.end}`, {
    size: 10,
    color: [0.38, 0.43, 0.51],
    gapAfter: 10,
  });
});

addHeading("Technical Range");
site.engineeringRange.forEach((group) => {
  addBlock(group.title, {
    font: "F2",
    size: 11.5,
    color: [0.06, 0.07, 0.1],
    gapAfter: 2,
  });
  addBlock(group.items.join(" · "), { gapAfter: 8 });
});

addBlock("Personal website: https://kriswarrior.github.io/Cristhian-Guerrero-Zaldivar/", {
  size: 10,
  color: [0.38, 0.43, 0.51],
});

if (operations.length) {
  pages.push(operations.join("\n"));
}

const pageCount = pages.length;
const fontHelvetica = 3 + pageCount * 2;
const fontHelveticaBold = fontHelvetica + 1;

let pdf = "%PDF-1.4\n";
const offsets = [0];

const addObject = (index, body) => {
  offsets[index] = Buffer.byteLength(pdf, "utf8");
  pdf += `${index} 0 obj\n${body}\nendobj\n`;
};

addObject(1, "<< /Type /Catalog /Pages 2 0 R >>");

const kids = Array.from({ length: pageCount }, (_, index) => `${3 + index * 2} 0 R`).join(" ");
addObject(2, `<< /Type /Pages /Count ${pageCount} /Kids [${kids}] >>`);

pages.forEach((content, index) => {
  const pageObjectNumber = 3 + index * 2;
  const contentObjectNumber = pageObjectNumber + 1;
  const stream = content;
  addObject(
    pageObjectNumber,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontHelvetica} 0 R /F2 ${fontHelveticaBold} 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`,
  );
  addObject(contentObjectNumber, `<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`);
});

addObject(fontHelvetica, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
addObject(fontHelveticaBold, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

const xrefOffset = Buffer.byteLength(pdf, "utf8");
const totalObjects = fontHelveticaBold;

pdf += `xref\n0 ${totalObjects + 1}\n`;
pdf += "0000000000 65535 f \n";

for (let index = 1; index <= totalObjects; index += 1) {
  const offset = String(offsets[index]).padStart(10, "0");
  pdf += `${offset} 00000 n \n`;
}

pdf += `trailer\n<< /Size ${totalObjects + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputFile, pdf, "binary");
console.log(`Generated ${path.relative(process.cwd(), outputFile)}`);
