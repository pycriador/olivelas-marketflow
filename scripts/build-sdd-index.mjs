import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sddDir = join(root, 'sdd')
const outDir = join(root, 'sdd-viewer')
const outFile = join(outDir, 'index.json')

const slugify = (text, used = new Set()) => {
  const base = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  let slug = base || 'secao'
  let i = 2
  while (used.has(slug)) slug = `${base}-${i++}`
  used.add(slug)
  return slug
}

const extract = (path, file) => {
  const lines = readFileSync(path, 'utf8').split(/\r?\n/)
  const content = lines.join('\n').trim() + '\n'

  let title = null
  const descParts = []
  const sections = []
  const secSlugs = new Set()
  let inFence = false

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue

    if (/^```/.test(line)) {
      inFence = !inFence
      continue
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line)
    const wrapper = /^"[^"]+\.md"\s*:\s*"""\s*#\s+(.+)$/.exec(line)
    if (heading) {
      if (title === null) {
        title = heading[2].trim()
        continue
      }
      sections.push({
        level: heading[1].length,
        title: heading[2].trim(),
        id: slugify(heading[2].trim(), secSlugs),
      })
      continue
    }
    if (title === null && wrapper) {
      title = wrapper[1].trim()
      continue
    }

    if (inFence) continue
    if (sections.length === 0) descParts.push(line)
  }

  const words = content.match(/[A-Za-zÀ-ú0-9_]+/g)?.length ?? 0
  return {
    id: file.replace(/\.md$/i, ''),
    file,
    title,
    description: descParts.join(' ').slice(0, 260),
    sections,
    lines: lines.length,
    words,
    content,
  }
}

const files = readdirSync(sddDir)
  .filter((f) => /\.md$/i.test(f))
  .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))

const docs = files.map((f) => extract(join(sddDir, f), f))
const totalWords = docs.reduce((acc, d) => acc + d.words, 0)

const manifest = {
  title: 'MarketFlow — Especificações SDD',
  generatedAt: new Date().toISOString(),
  count: docs.length,
  totalWords,
  docs,
}

mkdirSync(outDir, { recursive: true })
writeFileSync(outFile, JSON.stringify(manifest, null, 2), 'utf8')
console.log(`OK  ${outFile}  (${docs.length} docs, ${totalWords} words)`)
for (const d of docs) {
  console.log(`    ${String(d.id).padEnd(24)} | ${d.title}`)
}