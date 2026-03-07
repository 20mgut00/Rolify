import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Character, SelectedOption, WeaponSkills, RoguishFeats, Reputation } from '../types';
import { getAvatarUrl } from './avatarUrl';

/** Fetch any image URL and return a base64 data-URI for safe embedding in html2canvas. */
async function toBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror   = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Split a single canvas across PDF pages, never cutting mid-section. */
function sliceCanvasToPdf(
  canvas: HTMLCanvasElement,
  sectionBounds: Array<{ top: number; bottom: number }>,
  pdf: jsPDF,
  { margin, cw, contentH, scale }: { margin: number; cw: number; contentH: number; scale: number },
): void {
  const pxPerMm      = canvas.width / cw;
  const pageHeightPx = contentH * pxPerMm;

  let canvasY   = 0;
  let firstPage = true;

  while (canvasY < canvas.height) {
    const idealCutPx = canvasY + pageHeightPx;

    let cutPx: number;
    if (idealCutPx >= canvas.height) {
      cutPx = canvas.height;
    } else {
      cutPx = idealCutPx;
      for (const b of sectionBounds) {
        const sTop = b.top    * scale;
        const sBot = b.bottom * scale;
        if (sTop < idealCutPx && sBot > idealCutPx) {
          cutPx = sTop > canvasY ? sTop : idealCutPx;
          break;
        }
      }
    }

    const sliceH = cutPx - canvasY;
    if (sliceH <= 0) break;

    const slice = document.createElement('canvas');
    slice.width  = canvas.width;
    slice.height = sliceH;
    slice.getContext('2d')!.drawImage(canvas, 0, canvasY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

    if (!firstPage) pdf.addPage();
    pdf.addImage(slice.toDataURL('image/png'), 'PNG', margin, margin, cw, sliceH / pxPerMm);
    firstPage = false;
    canvasY = cutPx;
  }
}

/** Trigger a browser download for a jsPDF document. */
function downloadPdf(pdf: jsPDF, filename: string): void {
  const blob = pdf.output('blob');
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function exportCharacterToPDF(character: Character): Promise<void> {
  const pdf        = new jsPDF('p', 'mm', 'a4');
  const PAGE_H     = 297;
  const MARGIN     = 15;
  const CW         = 180;                    // content width mm
  const CONTENT_H  = PAGE_H - 2 * MARGIN;   // 267 mm per page
  const SCALE      = 2;

  // ── Style fragments ────────────────────────────────────────────────────────
  const T  = `color:#D9A441;font-size:17px;font-weight:bold;margin:0 0 10px;padding-bottom:5px;border-bottom:2px solid #D9A441;`;
  const C  = `padding:10px 12px;background:#f8f6f0;border-radius:6px;margin-bottom:8px;`;
  const LC = `padding:10px 12px;background:#f8f6f0;border-left:4px solid #D9A441;border-radius:0 6px 6px 0;margin-bottom:8px;`;

  // ── Derived data ──────────────────────────────────────────────────────────
  const selNature  = character.nature.filter(n => n.selected);
  const selDrives  = character.drives.filter(d => d.selected);
  const selMoves   = character.moves.filter(m => m.selected);
  const selSkills  = character.weaponSkills.skills.filter(s => s.selected);
  const selFeats   = character.roguishFeats.feats.filter(f => f.selected);
  const hasFactions = !!(character.reputation?.factions && Object.keys(character.reputation.factions).length > 0);
  const equipment  = character.equipment
    ? (typeof character.equipment === 'string' ? character.equipment : JSON.stringify(character.equipment, null, 2))
    : '';
  const createdDate = new Date(character.createdAt || '').toLocaleDateString();

  // Pre-fetch avatar as base64 so html2canvas embeds it without CORS issues
  const avatarBase64 = character.avatarImage
    ? await toBase64(getAvatarUrl(character.avatarImage))
    : null;

  // ── Build the full off-screen character sheet in a single container ────────
  // Each logical section is a direct child div — we record their offsetTops
  // so we can split the final canvas at section boundaries (never mid-section).
  const container = document.createElement('div');
  container.style.cssText = [
    'position:fixed', 'left:-9999px', 'top:0', 'z-index:-1',
    `width:${CW}mm`, 'background:#fff',
    'font-family:Arial,sans-serif', 'font-size:13px',
    'line-height:1.5', 'color:#0F2B3A', 'box-sizing:border-box',
  ].join(';');
  document.body.appendChild(container);

  const sectionEls: HTMLElement[] = [];
  const addSection = (html: string): void => {
    const div = document.createElement('div');
    div.style.marginBottom = '10px';
    div.innerHTML = html;
    container.appendChild(div);
    sectionEls.push(div);
  };

  // 1. Header
  addSection(`
    <div style="border-bottom:3px solid #D9A441;padding-bottom:16px;display:flex;align-items:center;gap:16px;">
      ${avatarBase64 ? `<img src="${avatarBase64}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid #D9A441;flex-shrink:0;" />` : ''}
      <div style="flex:1;text-align:${avatarBase64 ? 'left' : 'center'};">
        <h1 style="margin:0 0 4px;font-size:26px;color:#0F2B3A;font-family:Georgia,serif;">${character.name}</h1>
        <div style="font-size:14px;color:#D9A441;font-weight:700;margin-bottom:3px;">${character.className} &bull; ${character.system}</div>
        <div style="font-size:12px;color:#555;">${character.species} &bull; ${character.demeanor}</div>
        <div style="font-size:11px;color:#888;margin-top:6px;">${createdDate}</div>
      </div>
    </div>
  `);

  // 2. Stats
  if (character.stats.length > 0) {
    addSection(`
      <div>
        <div style="${T}">Stats</div>
        <div style="display:flex;gap:8px;">
          ${character.stats.map(s => `
            <div style="flex:1;text-align:center;padding:10px 6px;background:#f8f6f0;border-radius:6px;border:1px solid #e8e4da;">
              <div style="font-weight:700;text-transform:uppercase;font-size:10px;color:#666;letter-spacing:0.5px;">${s.name}</div>
              <div style="font-size:22px;font-weight:700;color:${s.value >= 0 ? '#D9A441' : '#888'};">${s.value >= 0 ? '+' : ''}${s.value}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `);
  }

  // 3. Background
  if (character.background.length > 0) {
    const bgCard = (q: string, a: string) => `<div style="${C}"><strong>${q}</strong><div style="margin-top:4px;color:#444;">${a}</div></div>`;
    addSection(`<div><div style="${T}">Background</div>${character.background.map(b => bgCard(b.question, b.answer)).join('')}</div>`);
  }

  // 4. Connections
  if (character.connections && character.connections.length > 0) {
    const connCard = (c: typeof character.connections[number]) => `
      <div style="${LC}">
        <strong>${c.characterName || c.type || ''}</strong>
        <div style="font-size:12px;color:#444;margin-top:4px;">${c.description || ''}</div>
        ${c.story ? `<div style="font-size:11px;color:#666;margin-top:3px;font-style:italic;">${c.story}</div>` : ''}
      </div>`;
    addSection(`<div><div style="${T}">Connections</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">${character.connections.map(connCard).join('')}</div></div>`);
  }

  // 5. Reputation
  if (hasFactions) {
    addSection(`
      <div>
        <div style="${T}">Reputation</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
          ${Object.entries(character.reputation!.factions).map(([name, rep]) => `
            <div style="${C}text-align:center;">
              <div style="font-weight:700;margin-bottom:6px;">${name}</div>
              <div style="display:flex;justify-content:space-around;">
                <div>
                  <div style="font-size:10px;color:#888;text-transform:uppercase;margin-bottom:2px;">Prestige</div>
                  <div style="font-size:20px;font-weight:700;color:${rep.prestige >= 0 ? '#16a34a' : '#dc2626'};">${rep.prestige >= 0 ? '+' : ''}${rep.prestige}</div>
                </div>
                <div style="width:1px;background:#ddd;"></div>
                <div>
                  <div style="font-size:10px;color:#888;text-transform:uppercase;margin-bottom:2px;">Notoriety</div>
                  <div style="font-size:20px;font-weight:700;color:${rep.notoriety > 0 ? '#dc2626' : '#16a34a'};">${rep.notoriety >= 0 ? '+' : ''}${rep.notoriety}</div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `);
  }

  // 6. Nature & Drives
  addSection(`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
      <div>
        <div style="${T}">Nature</div>
        ${selNature.length > 0
          ? selNature.map(n => `<div style="${LC}"><strong>${n.name}</strong><div style="font-size:12px;color:#444;margin-top:3px;">${n.description}</div></div>`).join('')
          : '<div style="color:#888;font-size:12px;">None selected</div>'}
      </div>
      <div>
        <div style="${T}">Drives</div>
        ${selDrives.length > 0
          ? selDrives.map(d => `<div style="${LC}"><strong>${d.name}</strong><div style="font-size:12px;color:#444;margin-top:3px;">${d.description}</div></div>`).join('')
          : '<div style="color:#888;font-size:12px;">None selected</div>'}
      </div>
    </div>
  `);

  // 7. Moves
  if (selMoves.length > 0) {
    const moveCard = (m: SelectedOption) => `<div style="${C}border:1px solid #e8e4da;"><strong>${m.name}</strong><div style="font-size:12px;color:#444;margin-top:3px;">${m.description}</div></div>`;
    const moveRow  = (sl: SelectedOption[]) => `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">${sl.map(moveCard).join('')}</div>`;
    const rows = Array.from({ length: Math.ceil(selMoves.length / 2) }, (_, i) => moveRow(selMoves.slice(i * 2, i * 2 + 2)));
    addSection(`<div><div style="${T}">Moves</div>${rows.join('')}</div>`);
  }

  // 8. Weapon Skills & Roguish Feats
  addSection(`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
      <div>
        <div style="${T}">Weapon Skills</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${selSkills.length > 0
            ? selSkills.map(s => `<span style="padding:5px 12px;background:rgba(217,164,65,0.2);border-radius:6px;font-weight:600;font-size:12px;">${s.name}</span>`).join('')
            : '<span style="color:#888;font-size:12px;">None selected</span>'}
        </div>
      </div>
      <div>
        <div style="${T}">Roguish Feats</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${selFeats.length > 0
            ? selFeats.map(f => `<span style="padding:5px 12px;background:#e8e4da;border-radius:6px;font-weight:600;font-size:12px;">${f.name}</span>`).join('')
            : '<span style="color:#888;font-size:12px;">None selected</span>'}
        </div>
      </div>
    </div>
  `);

  // 9. Equipment
  if (equipment) {
    addSection(`<div><div style="${T}">Equipment</div><div style="${C}white-space:pre-wrap;">${equipment}</div></div>`);
  }

  // 10. Footer
  addSection(`
    <div style="text-align:center;padding-top:10px;border-top:2px solid #D9A441;font-size:11px;color:#888;">
      ${createdDate} &mdash; ROLIFY &mdash; RPG Character Creator
    </div>
  `);

  // Record where each section starts/ends in the container (before rendering)
  const containerTop = container.getBoundingClientRect().top;
  const sectionBounds = sectionEls.map(el => {
    const r = el.getBoundingClientRect();
    return { top: r.top - containerTop, bottom: r.bottom - containerTop };
  });

  // ── Single html2canvas call ────────────────────────────────────────────────
  let canvas: HTMLCanvasElement;
  try {
    canvas = await html2canvas(container, {
      scale: SCALE,
      logging: false,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true,
    });
  } finally {
    document.body.removeChild(container);
  }

  sliceCanvasToPdf(canvas, sectionBounds, pdf, { margin: MARGIN, cw: CW, contentH: CONTENT_H, scale: SCALE });

  const filename = `${character.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_character.pdf`;
  downloadPdf(pdf, filename);
}

/**
 * Export character to JSON
 */
export function exportCharacterToJSON(character: Character): void {
  const dataStr = JSON.stringify(character, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${character.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_character.json`;
  link.click();
  
  URL.revokeObjectURL(url);
}

/**
 * Export character to CSV
 */
export function exportCharacterToCSV(character: Character): void {
  const rows: string[][] = [
    ['Field', 'Value'],
    ['Name', character.name],
    ['Class', character.className],
    ['System', character.system],
    ['Species', character.species],
    ['Demeanor', character.demeanor],
    ['Details', character.details || ''],
    [''],
    ['STATS', ''],
    ...character.stats.map(s => [s.name, s.value.toString()]),
    [''],
    ['BACKGROUND', ''],
    ...character.background.map(bg => [bg.question, bg.answer]),
    [''],
    ['CONNECTIONS', ''],
    ...(character.connections || []).map(c => [c.characterName || c.type || '', c.description + (c.story ? ` (${c.story})` : '')]),
    [''],
    ['NATURE', ''],
    ...character.nature.filter(n => n.selected).map(n => [n.name, n.description]),
    [''],
    ['DRIVES', ''],
    ...character.drives.filter(d => d.selected).map(d => [d.name, d.description]),
    [''],
    ['MOVES', ''],
    ...character.moves.filter(m => m.selected).map(m => [m.name, m.description]),
    [''],
    ['WEAPON SKILLS', ''],
    ...character.weaponSkills.skills.filter(s => s.selected).map(s => [s.name, s.description]),
    [''],
    ['ROGUISH FEATS', ''],
    ...character.roguishFeats.feats.filter(f => f.selected).map(f => [f.name, f.description]),
  ];

  if (character.reputation?.factions && Object.keys(character.reputation.factions).length > 0) {
    rows.push([''], ['REPUTATION', '']);
    for (const [faction, rep] of Object.entries(character.reputation.factions)) {
      rows.push([faction, `Prestige: ${rep.prestige}, Notoriety: ${rep.notoriety}`]);
    }
  }

  if (character.equipment) {
    rows.push(
      [''],
      ['EQUIPMENT', typeof character.equipment === 'string' ? character.equipment : JSON.stringify(character.equipment)],
    );
  }

  const csvContent = rows.map(row => 
    row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
  ).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${character.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_character.csv`;
  link.click();

  URL.revokeObjectURL(url);
}

/**
 * Read a file selected by the user and return its text content
 */
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Import character from JSON file.
 * Strips id/userId/timestamps so the backend creates a new character for the current user.
 */
export async function importCharacterFromJSON(file: File): Promise<Partial<Character>> {
  const text = await readFileAsText(file);
  const data = JSON.parse(text);

  // Strip ownership/metadata fields so the API assigns the current user
  const { id, userId, createdAt, updatedAt, ...characterData } = data;

  return validateImportedCharacter(characterData);
}

/**
 * Import character from CSV file.
 * Parses the CSV format produced by exportCharacterToCSV.
 */
export async function importCharacterFromCSV(file: File): Promise<Partial<Character>> {
  const text = await readFileAsText(file);
  const lines = text.split('\n').map(line => {
    // Parse CSV with quoted fields
    const matches = line.match(/"([^"]*(?:""[^"]*)*)"/g);
    if (!matches) return ['', ''];
    return matches.map(m => m.slice(1, -1).replace(/""/g, '"'));
  });

  // Skip header row
  const dataLines = lines.slice(1);

  let currentSection = '';
  const character: Record<string, unknown> = {};
  const stats: Array<{ name: string; value: number }> = [];
  const background: Array<{ question: string; answer: string }> = [];
  const connections: Array<{ characterName: string; description: string }> = [];
  const nature: SelectedOption[] = [];
  const drives: SelectedOption[] = [];
  const moves: SelectedOption[] = [];
  const weaponSkills: Array<{ name: string; description: string; selected: boolean }> = [];
  const roguishFeats: Array<{ name: string; description: string; selected: boolean }> = [];
  const reputationFactions: Record<string, { prestige: number; notoriety: number }> = {};

  for (const [col1, col2] of dataLines) {
    // Section headers
    if (['STATS', 'BACKGROUND', 'CONNECTIONS', 'NATURE', 'DRIVES', 'MOVES', 'WEAPON SKILLS', 'ROGUISH FEATS', 'REPUTATION', 'EQUIPMENT'].includes(col1)) {
      currentSection = col1;
      if (col1 === 'EQUIPMENT' && col2) {
        character['equipment'] = col2;
      }
      continue;
    }

    // Empty separator row
    if (!col1 && !col2) {
      continue;
    }

    // Top-level fields (before any section)
    if (!currentSection || currentSection === '') {
      const fieldMap: Record<string, string> = {
        'Name': 'name', 'Class': 'className', 'System': 'system',
        'Species': 'species', 'Demeanor': 'demeanor', 'Details': 'details',
      };
      if (fieldMap[col1]) {
        character[fieldMap[col1]] = col2;
        continue;
      }
    }

    switch (currentSection) {
      case 'STATS':
        stats.push({ name: col1, value: parseInt(col2, 10) || 0 });
        break;
      case 'BACKGROUND':
        background.push({ question: col1, answer: col2 });
        break;
      case 'CONNECTIONS':
        connections.push({ characterName: col1, description: col2 });
        break;
      case 'NATURE':
        nature.push({ name: col1, description: col2, selected: true });
        break;
      case 'DRIVES':
        drives.push({ name: col1, description: col2, selected: true });
        break;
      case 'MOVES':
        moves.push({ name: col1, description: col2, selected: true });
        break;
      case 'WEAPON SKILLS':
        weaponSkills.push({ name: col1, description: col2, selected: true });
        break;
      case 'ROGUISH FEATS':
        roguishFeats.push({ name: col1, description: col2, selected: true });
        break;
      case 'REPUTATION': {
        const match = col2.match(/Prestige:\s*([+-]?\d+),\s*Notoriety:\s*([+-]?\d+)/);
        if (match) {
          reputationFactions[col1] = { prestige: parseInt(match[1], 10), notoriety: parseInt(match[2], 10) };
        }
        break;
      }
    }
  }

  const imported: Partial<Character> = {
    name: (character['name'] as string) || 'Imported Character',
    system: (character['system'] as string) || 'Root',
    className: (character['className'] as string) || '',
    species: (character['species'] as string) || '',
    demeanor: (character['demeanor'] as string) || '',
    details: (character['details'] as string) || '',
    stats,
    background,
    connections: connections.map(c => ({ ...c, description: c.description })),
    nature,
    drives,
    moves,
    weaponSkills: { remaining: 0, skills: weaponSkills },
    roguishFeats: { remaining: 0, feats: roguishFeats },
    equipment: (character['equipment'] as string) || '',
    isPublic: false,
  };

  if (Object.keys(reputationFactions).length > 0) {
    imported.reputation = { factions: reputationFactions };
  }

  return imported;
}

/**
 * Validate and sanitize imported character data
 */
function validateImportedCharacter(data: Record<string, unknown>): Partial<Character> {
  return {
    name: (data.name as string) || 'Imported Character',
    system: (data.system as string) || 'Root',
    className: (data.className as string) || '',
    species: (data.species as string) || '',
    demeanor: (data.demeanor as string) || '',
    details: (data.details as string) || '',
    avatarImage: (data.avatarImage as string) || '',
    stats: Array.isArray(data.stats) ? data.stats : [],
    background: Array.isArray(data.background) ? data.background : [],
    connections: Array.isArray(data.connections) ? data.connections : [],
    nature: Array.isArray(data.nature) ? data.nature as SelectedOption[] : [],
    drives: Array.isArray(data.drives) ? data.drives as SelectedOption[] : [],
    moves: Array.isArray(data.moves) ? data.moves as SelectedOption[] : [],
    weaponSkills: data.weaponSkills as WeaponSkills || { remaining: 0, skills: [] },
    roguishFeats: data.roguishFeats as RoguishFeats || { remaining: 0, feats: [] },
    equipment: (data.equipment as string) || '',
    reputation: data.reputation as Reputation || { factions: {} },
    isPublic: false,
  };
}
