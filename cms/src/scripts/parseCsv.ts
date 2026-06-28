// Minimal RFC4180-style CSV parser — handles quoted fields, embedded commas,
// embedded newlines, and "" as an escaped quote. No external dependency
// needed for a dataset this size and this well-behaved (we wrote it).
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  const normalized = text.replace(/\r\n/g, '\n')

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i]
    const next = normalized[i + 1]

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"'
        i++
      } else if (char === '"') {
        inQuotes = false
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  const [header, ...dataRows] = rows.filter((r) => r.length > 1 || r[0] !== '')
  return dataRows.map((r) => {
    const obj: Record<string, string> = {}
    header.forEach((key, idx) => {
      obj[key] = r[idx] ?? ''
    })
    return obj
  })
}
