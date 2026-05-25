import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// New order: positions 1-26 contain the OLD section numbers to place there
// new[0] = old §1, new[1] = old §2, ... (0-indexed, but sections are 1-indexed)
const NEW_ORDER = [1, 2, 3, 21, 5, 6, 7, 8, 9, 13, 14, 10, 11, 12, 4, 15, 16, 17, 24, 18, 19, 20, 22, 23, 25, 26];

// New headings for each new position (1-indexed)
const NEW_HEADINGS = {
  1:  '## 1. Overview',
  2:  '## 2. Technology Stack',
  3:  '## 3. Compatibility Matrix',
  4:  '## 4. Project Structure',
  5:  '## 5. Feature ↔ Domain ↔ API Mapping',
  6:  '## 6. API Contract (Single Source of Truth)',
  7:  '## 7. Authentication and Authorization (End-to-End)',
  8:  '## 8. Multi-Tenancy (End-to-End)',
  9:  '## 9. CORS (CDK — Required)',
  10: '## 10. Data Strategy',
  11: '## 11. Asynchronous Messaging',
  12: '## 12. Real-Time Channel (WebSocket API Gateway)',
  13: '## 13. File Upload (Pre-Signed S3)',
  14: '## 14. Push Notifications (Web Push)',
  15: '## 15. UI Stack',
  16: '## 16. Server State — TanStack Query',
  17: '## 17. Client State — Zustand',
  18: '## 18. PWA — Cache Strategy and Offline Behavior',
  19: '## 19. Internationalization (i18n)',
  20: '## 20. Observability',
  21: '## 21. Infrastructure as Code — CDK Outputs → Frontend',
  22: '## 22. Unified CI/CD Pipeline',
  23: '## 23. New Feature Checklist (Frontend + Backend)',
  24: '## 24. Anti-Patterns (Forbidden — Both Sides)',
  25: '## 25. Versioning Strategy',
  26: '## 26. Cost Reference',
};

function reorderFile(inputPath, outputPath, preambleUpdate) {
  const raw = readFileSync(inputPath, 'utf8');
  const lines = raw.split('\n');

  // Find section boundary lines (lines starting with ## N.)
  const sectionStarts = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^## (\d+)\. /);
    if (m) {
      sectionStarts.push({ lineIndex: i, num: parseInt(m[1], 10) });
    }
  }

  if (sectionStarts.length !== 26) {
    throw new Error(`Expected 26 sections, found ${sectionStarts.length}`);
  }

  // Extract preamble (everything before first section)
  let preamble = lines.slice(0, sectionStarts[0].lineIndex).join('\n');

  // Apply preamble cross-reference updates
  preamble = preambleUpdate(preamble);

  // Extract each section (from its heading line to just before the next heading)
  const sections = {};
  for (let i = 0; i < sectionStarts.length; i++) {
    const start = sectionStarts[i].lineIndex;
    const end = i + 1 < sectionStarts.length ? sectionStarts[i + 1].lineIndex : lines.length;
    const num = sectionStarts[i].num;
    // content includes the heading line and everything up to (not including) next heading
    sections[num] = lines.slice(start, end).join('\n');
  }

  // Reassemble in new order with updated headings and cross-references
  const parts = [preamble];

  for (let newPos = 1; newPos <= 26; newPos++) {
    const oldNum = NEW_ORDER[newPos - 1];
    let sectionContent = sections[oldNum];

    // Replace the old heading line with the new one
    const oldHeadingMatch = sectionContent.match(/^## \d+\. .+/m);
    if (oldHeadingMatch) {
      sectionContent = sectionContent.replace(oldHeadingMatch[0], NEW_HEADINGS[newPos]);
    }

    // Apply cross-reference fixes within section content
    sectionContent = fixCrossRefs(sectionContent);

    parts.push(sectionContent);
  }

  const result = parts.join('\n');
  writeFileSync(outputPath, result, 'utf8');
  console.log(`Written: ${outputPath} (${result.split('\n').length} lines)`);
}

// Cross-reference fixes: old section number → new section number
// Handles both English (Section N) and Portuguese (Seção N) patterns
function fixCrossRefs(content) {
  return content
    // English
    .replace(/\bSection 13\b/g, 'Section 10')
    .replace(/\bSection 14\b/g, 'Section 11')
    .replace(/\bSection 18\b/g, 'Section 20')
    .replace(/\bSection 4\b/g, 'Section 15')
    // Portuguese
    .replace(/\bSeção 13\b/g, 'Seção 10')
    .replace(/\bSeção 14\b/g, 'Seção 11')
    .replace(/\bSeção 18\b/g, 'Seção 20')
    .replace(/\bSeção 4\b/g, 'Seção 15');
}

function enPreambleUpdate(preamble) {
  return fixCrossRefs(preamble);
}

function ptPreambleUpdate(preamble) {
  // Preamble fixes are handled by fixCrossRefs as well, but apply them here too for safety
  return fixCrossRefs(preamble);
}

const docsDir = resolve(process.cwd(), 'docs');

// Process English version
reorderFile(
  resolve(docsDir, 'architecture-guide.md'),
  resolve(docsDir, 'architecture-guide.md.new'),
  enPreambleUpdate
);

// Process Portuguese version
reorderFile(
  resolve(docsDir, 'architecture-guide.pt_BR.md'),
  resolve(docsDir, 'architecture-guide.pt_BR.md.new'),
  ptPreambleUpdate
);
