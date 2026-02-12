import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Character } from '../types';

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
  
  // Build HTML content
  container.innerHTML = `
    <div style="color: #0F2B3A;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #D9A441; padding-bottom: 20px;">
        <h1 style="margin: 0; font-size: 32px; color: #0F2B3A;">${character.name}</h1>
        <p style="margin: 5px 0; font-size: 18px; color: #D9A441;">${character.className} • ${character.system}</p>
        <p style="margin: 5px 0; font-size: 14px; color: #666;">${character.species} • ${character.demeanor}</p>
      </div>

      <!-- Stats -->
      <div style="margin-bottom: 25px;">
        <h2 style="color: #D9A441; font-size: 20px; margin-bottom: 10px; border-bottom: 2px solid #D9A441;">Stats</h2>
        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px;">
          ${character.stats.map(stat => `
            <div style="text-align: center; padding: 10px; background: #f5f5f5; border-radius: 5px;">
              <div style="font-weight: bold; text-transform: capitalize;">${stat.name}</div>
              <div style="font-size: 24px; color: ${stat.value >= 0 ? '#D9A441' : '#666'};">
                ${stat.value >= 0 ? '+' : ''}${stat.value}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Background -->
      <div style="margin-bottom: 25px;">
        <h2 style="color: #D9A441; font-size: 20px; margin-bottom: 10px; border-bottom: 2px solid #D9A441;">Background</h2>
        ${character.background.map(bg => `
          <div style="margin-bottom: 10px;">
            <strong>${bg.question}:</strong> ${bg.answer}
          </div>
        `).join('')}
      </div>

      <!-- Nature & Drives -->
      <div style="margin-bottom: 25px;">
        <h2 style="color: #D9A441; font-size: 20px; margin-bottom: 10px; border-bottom: 2px solid #D9A441;">Nature & Drives</h2>
        <div style="margin-bottom: 15px;">
          <h3 style="font-size: 16px; margin-bottom: 5px;">Nature:</h3>
          ${character.nature.filter(n => n.selected).map(n => `
            <div style="margin-bottom: 8px; padding: 8px; background: #f5f5f5; border-left: 3px solid #D9A441;">
              <strong>${n.name}:</strong> ${n.description}
            </div>
          `).join('')}
        </div>
        <div>
          <h3 style="font-size: 16px; margin-bottom: 5px;">Drives:</h3>
          ${character.drives.filter(d => d.selected).map(d => `
            <div style="margin-bottom: 8px; padding: 8px; background: #f5f5f5; border-left: 3px solid #D9A441;">
              <strong>${d.name}:</strong> ${d.description}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Moves -->
      <div style="margin-bottom: 25px;">
        <h2 style="color: #D9A441; font-size: 20px; margin-bottom: 10px; border-bottom: 2px solid #D9A441;">Moves</h2>
        ${character.moves.filter(m => m.selected).map(m => `
          <div style="margin-bottom: 10px; padding: 10px; background: #f5f5f5; border-radius: 5px;">
            <strong style="color: #0F2B3A;">${m.name}:</strong>
            <p style="margin: 5px 0 0 0; font-size: 14px;">${m.description}</p>
          </div>
        `).join('')}
      </div>

      <!-- Weapon Skills -->
      <div style="margin-bottom: 25px;">
        <h2 style="color: #D9A441; font-size: 20px; margin-bottom: 10px; border-bottom: 2px solid #D9A441;">Weapon Skills</h2>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
          ${character.weaponSkills.skills.filter(s => s.selected).map(s => `
            <div style="padding: 8px; background: #f5f5f5; border-radius: 5px;">
              <strong style="font-size: 14px;">${s.name}</strong>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Roguish Feats -->
      <div style="margin-bottom: 25px;">
        <h2 style="color: #D9A441; font-size: 20px; margin-bottom: 10px; border-bottom: 2px solid #D9A441;">Roguish Feats</h2>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
          ${character.roguishFeats.feats.filter(f => f.selected).map(f => `
            <div style="padding: 8px; background: #f5f5f5; border-radius: 5px; text-align: center; font-size: 14px;">
              ${f.name}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Equipment -->
      ${character.equipment ? `
        <div style="margin-bottom: 25px;">
          <h2 style="color: #D9A441; font-size: 20px; margin-bottom: 10px; border-bottom: 2px solid #D9A441;">Equipment</h2>
          <div style="white-space: pre-wrap; padding: 10px; background: #f5f5f5; border-radius: 5px;">
            ${typeof character.equipment === 'string' ? character.equipment : ''}
          </div>
        </div>
      ` : ''}

      <!-- Footer -->
      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #D9A441; text-align: center; font-size: 12px; color: #666;">
        <p>Created: ${new Date(character.createdAt || '').toLocaleDateString()}</p>
        <p>RPG Character Creator</p>
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
    [''],
    ['STATS', ''],
    ...character.stats.map(s => [s.name, s.value.toString()]),
    [''],
    ['BACKGROUND', ''],
    ...character.background.map(bg => [bg.question, bg.answer]),
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

  if (character.equipment) {
    rows.push(
      [''],
      ['EQUIPMENT', typeof character.equipment === 'string' ? character.equipment : ''],
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
