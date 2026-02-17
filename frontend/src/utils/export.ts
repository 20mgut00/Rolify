import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Character, SelectedOption, WeaponSkills, RoguishFeats, Reputation } from '../types';

/**
 * Export character to PDF
 */
export async function exportCharacterToPDF(character: Character): Promise<void> {
  // Create a temporary container for the character sheet
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '210mm'; // A4 width
  container.style.background = 'white';
  container.style.padding = '20mm';
  container.style.fontFamily = 'Arial, sans-serif';
  
  const selectedNature = character.nature.filter(n => n.selected);
  const selectedDrives = character.drives.filter(d => d.selected);
  const selectedMoves = character.moves.filter(m => m.selected);
  const selectedSkills = character.weaponSkills.skills.filter(s => s.selected);
  const selectedFeats = character.roguishFeats.feats.filter(f => f.selected);
  const hasConnections = character.connections && character.connections.length > 0;
  const hasReputation = character.reputation?.factions && Object.keys(character.reputation.factions).length > 0;
  const equipmentText = character.equipment
    ? (typeof character.equipment === 'string' ? character.equipment : JSON.stringify(character.equipment, null, 2))
    : '';

  // Build HTML content
  container.innerHTML = `
    <div style="color: #0F2B3A; font-size: 14px; line-height: 1.5;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #D9A441; padding-bottom: 20px;">
        <h1 style="margin: 0; font-size: 36px; color: #0F2B3A; font-family: serif;">${character.name}</h1>
        <p style="margin: 8px 0; font-size: 18px; color: #D9A441; font-weight: 600;">${character.className} &bull; ${character.system}</p>
        <p style="margin: 5px 0; font-size: 15px; color: #555;">${character.species} &bull; ${character.demeanor}</p>
      </div>

      <!-- Details -->
      ${character.details ? `
        <div style="margin-bottom: 25px;">
          <h2 style="color: #D9A441; font-size: 20px; margin-bottom: 10px; border-bottom: 2px solid #D9A441; padding-bottom: 5px;">Details</h2>
          <div style="padding: 12px; background: #f8f6f0; border-radius: 6px; white-space: pre-wrap;">
            ${character.details}
          </div>
        </div>
      ` : ''}

      <!-- Stats -->
      ${character.stats.length > 0 ? `
        <div style="margin-bottom: 25px;">
          <h2 style="color: #D9A441; font-size: 20px; margin-bottom: 10px; border-bottom: 2px solid #D9A441; padding-bottom: 5px;">Stats</h2>
          <div style="display: grid; grid-template-columns: repeat(${Math.min(character.stats.length, 5)}, 1fr); gap: 10px;">
            ${character.stats.map(stat => `
              <div style="text-align: center; padding: 12px 8px; background: #f8f6f0; border-radius: 6px; border: 1px solid #e8e4da;">
                <div style="font-weight: bold; text-transform: uppercase; font-size: 11px; color: #555; letter-spacing: 0.5px;">${stat.name}</div>
                <div style="font-size: 28px; font-weight: bold; color: ${stat.value >= 0 ? '#D9A441' : '#888'}; margin-top: 4px;">
                  ${stat.value >= 0 ? '+' : ''}${stat.value}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Background -->
      ${character.background.length > 0 ? `
        <div style="margin-bottom: 25px;">
          <h2 style="color: #D9A441; font-size: 20px; margin-bottom: 10px; border-bottom: 2px solid #D9A441; padding-bottom: 5px;">Background</h2>
          ${character.background.map(bg => `
            <div style="margin-bottom: 10px; padding: 10px 12px; background: #f8f6f0; border-radius: 6px;">
              <strong style="color: #0F2B3A;">${bg.question}</strong>
              <div style="margin-top: 4px; color: #444;">${bg.answer}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Connections -->
      ${hasConnections ? `
        <div style="margin-bottom: 25px;">
          <h2 style="color: #D9A441; font-size: 20px; margin-bottom: 10px; border-bottom: 2px solid #D9A441; padding-bottom: 5px;">Connections</h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
            ${character.connections.map(conn => `
              <div style="padding: 10px 12px; background: #f8f6f0; border-radius: 6px; border-left: 4px solid #D9A441;">
                <strong style="color: #0F2B3A;">${conn.characterName || conn.type || ''}</strong>
                <div style="font-size: 13px; color: #444; margin-top: 4px;">${conn.description}</div>
                ${conn.story ? `<div style="font-size: 12px; color: #666; margin-top: 4px; font-style: italic;">${conn.story}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Nature & Drives side by side -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
        <!-- Nature -->
        <div>
          <h2 style="color: #D9A441; font-size: 20px; margin-bottom: 10px; border-bottom: 2px solid #D9A441; padding-bottom: 5px;">Nature</h2>
          ${selectedNature.length > 0 ? selectedNature.map(n => `
            <div style="margin-bottom: 8px; padding: 10px 12px; background: #f8f6f0; border-left: 4px solid #D9A441; border-radius: 0 6px 6px 0;">
              <strong style="color: #0F2B3A;">${n.name}</strong>
              <div style="font-size: 13px; color: #444; margin-top: 4px;">${n.description}</div>
            </div>
          `).join('') : '<p style="color: #888;">None selected</p>'}
        </div>
        <!-- Drives -->
        <div>
          <h2 style="color: #D9A441; font-size: 20px; margin-bottom: 10px; border-bottom: 2px solid #D9A441; padding-bottom: 5px;">Drives</h2>
          ${selectedDrives.length > 0 ? selectedDrives.map(d => `
            <div style="margin-bottom: 8px; padding: 10px 12px; background: #f8f6f0; border-left: 4px solid #D9A441; border-radius: 0 6px 6px 0;">
              <strong style="color: #0F2B3A;">${d.name}</strong>
              <div style="font-size: 13px; color: #444; margin-top: 4px;">${d.description}</div>
            </div>
          `).join('') : '<p style="color: #888;">None selected</p>'}
        </div>
      </div>

      <!-- Moves -->
      ${selectedMoves.length > 0 ? `
        <div style="margin-bottom: 25px;">
          <h2 style="color: #D9A441; font-size: 20px; margin-bottom: 10px; border-bottom: 2px solid #D9A441; padding-bottom: 5px;">Moves</h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
            ${selectedMoves.map(m => `
              <div style="padding: 10px 12px; background: #f8f6f0; border-radius: 6px; border: 1px solid #e8e4da;">
                <strong style="color: #0F2B3A;">${m.name}</strong>
                <div style="font-size: 13px; color: #444; margin-top: 4px;">${m.description}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Weapon Skills & Roguish Feats side by side -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
        <!-- Weapon Skills -->
        <div>
          <h2 style="color: #D9A441; font-size: 20px; margin-bottom: 10px; border-bottom: 2px solid #D9A441; padding-bottom: 5px;">Weapon Skills</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${selectedSkills.length > 0 ? selectedSkills.map(s => `
              <div style="padding: 6px 14px; background: rgba(217, 164, 65, 0.2); border-radius: 6px; font-weight: 600; font-size: 13px;">
                ${s.name}
              </div>
            `).join('') : '<p style="color: #888;">None selected</p>'}
          </div>
        </div>
        <!-- Roguish Feats -->
        <div>
          <h2 style="color: #D9A441; font-size: 20px; margin-bottom: 10px; border-bottom: 2px solid #D9A441; padding-bottom: 5px;">Roguish Feats</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${selectedFeats.length > 0 ? selectedFeats.map(f => `
              <div style="padding: 6px 14px; background: #e8e4da; border-radius: 6px; font-weight: 600; font-size: 13px;">
                ${f.name}
              </div>
            `).join('') : '<p style="color: #888;">None selected</p>'}
          </div>
        </div>
      </div>

      <!-- Reputation -->
      ${hasReputation ? `
        <div style="margin-bottom: 25px;">
          <h2 style="color: #D9A441; font-size: 20px; margin-bottom: 10px; border-bottom: 2px solid #D9A441; padding-bottom: 5px;">Reputation</h2>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
            ${Object.entries(character.reputation.factions).map(([factionName, rep]) => `
              <div style="padding: 12px; background: #f8f6f0; border-radius: 6px; border: 1px solid #e8e4da; text-align: center;">
                <div style="font-weight: bold; color: #0F2B3A; margin-bottom: 8px;">${factionName}</div>
                <div style="display: flex; justify-content: space-around;">
                  <div>
                    <div style="font-size: 11px; color: #888; text-transform: uppercase;">Prestige</div>
                    <div style="font-size: 22px; font-weight: bold; color: ${rep.prestige >= 0 ? '#16a34a' : '#dc2626'};">
                      ${rep.prestige >= 0 ? '+' : ''}${rep.prestige}
                    </div>
                  </div>
                  <div style="width: 1px; background: #ddd;"></div>
                  <div>
                    <div style="font-size: 11px; color: #888; text-transform: uppercase;">Notoriety</div>
                    <div style="font-size: 22px; font-weight: bold; color: ${rep.notoriety >= 0 ? '#dc2626' : '#16a34a'};">
                      ${rep.notoriety >= 0 ? '+' : ''}${rep.notoriety}
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Equipment -->
      ${equipmentText ? `
        <div style="margin-bottom: 25px;">
          <h2 style="color: #D9A441; font-size: 20px; margin-bottom: 10px; border-bottom: 2px solid #D9A441; padding-bottom: 5px;">Equipment</h2>
          <div style="white-space: pre-wrap; padding: 12px; background: #f8f6f0; border-radius: 6px;">
            ${equipmentText}
          </div>
        </div>
      ` : ''}

      <!-- Footer -->
      <div style="margin-top: 40px; padding-top: 15px; border-top: 2px solid #D9A441; text-align: center; font-size: 12px; color: #888;">
        <p style="margin: 4px 0;">Created: ${new Date(character.createdAt || '').toLocaleDateString()}</p>
        <p style="margin: 4px 0;">ROLIFY &mdash; RPG Character Creator</p>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    // Convert to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= 297; // A4 height

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;
    }

    // Download
    pdf.save(`${character.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_character.pdf`);
  } finally {
    document.body.removeChild(container);
  }
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
