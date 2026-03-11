import { getAllPrompts, addPrompt, type Prompt, type MidjourneyParams, DEFAULT_PARAMS } from './db';

// ─── CSV Export ───

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

const CSV_HEADERS = [
  'title', 'body', 'version', 'aspectRatio', 'stylize', 'chaos',
  'quality', 'weird', 'seed', 'tile', 'stop', 'styleRef',
  'characterRef', 'personalize', 'no', 'tags', 'createdAt', 'updatedAt',
];

function promptToRow(prompt: Prompt): string {
  const values = [
    escapeCSV(prompt.title),
    escapeCSV(prompt.body),
    prompt.params.version,
    prompt.params.aspectRatio,
    String(prompt.params.stylize),
    String(prompt.params.chaos),
    String(prompt.params.quality),
    String(prompt.params.weird),
    prompt.params.seed != null ? String(prompt.params.seed) : '',
    prompt.params.tile ? 'true' : 'false',
    String(prompt.params.stop),
    escapeCSV(prompt.params.styleRef),
    escapeCSV(prompt.params.characterRef),
    escapeCSV(prompt.params.personalize),
    escapeCSV(prompt.params.no),
    escapeCSV(prompt.tags.join('|')),
    prompt.createdAt.toISOString(),
    prompt.updatedAt.toISOString(),
  ];
  return values.join(',');
}

export async function exportToCSV(): Promise<void> {
  const prompts = await getAllPrompts();
  if (prompts.length === 0) {
    alert('エクスポートするプロンプトがありません。');
    return;
  }

  const rows = [CSV_HEADERS.join(','), ...prompts.map(promptToRow)];
  const csvContent = rows.join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  const date = new Date().toISOString().slice(0, 10);
  a.download = `prompt-vault-backup-${date}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── CSV Import ───

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}

function rowToPrompt(headers: string[], values: string[]): Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'> {
  const get = (key: string): string => {
    const idx = headers.indexOf(key);
    return idx >= 0 && idx < values.length ? values[idx] : '';
  };

  const params: MidjourneyParams = {
    version: get('version') || DEFAULT_PARAMS.version,
    aspectRatio: get('aspectRatio') || DEFAULT_PARAMS.aspectRatio,
    stylize: Number(get('stylize')) || DEFAULT_PARAMS.stylize,
    chaos: Number(get('chaos')) || DEFAULT_PARAMS.chaos,
    quality: Number(get('quality')) || DEFAULT_PARAMS.quality,
    weird: Number(get('weird')) || DEFAULT_PARAMS.weird,
    seed: get('seed') ? Number(get('seed')) : undefined,
    tile: get('tile') === 'true',
    stop: Number(get('stop')) || DEFAULT_PARAMS.stop,
    styleRef: get('styleRef'),
    characterRef: get('characterRef'),
    personalize: get('personalize'),
    no: get('no'),
  };

  const tagsStr = get('tags');
  const tags = tagsStr ? tagsStr.split('|').filter(Boolean) : [];

  return {
    title: get('title') || '無題',
    body: get('body'),
    params,
    tags,
  };
}

export async function importFromCSV(file: File): Promise<number> {
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    throw new Error('CSVファイルにデータが含まれていません。');
  }

  const headers = parseCSVLine(lines[0]);
  let importedCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < 2) continue; // skip empty-ish rows

    const promptData = rowToPrompt(headers, values);
    await addPrompt(promptData);
    importedCount++;
  }

  return importedCount;
}
