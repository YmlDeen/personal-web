import { getDb, saveDb } from '../../db/client.js'
import axios from 'axios'
import * as cheerio from 'cheerio'

// ─── Scraper ────────────────────────────────────────────────────────────────

export async function scrapeMeta(url) {
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 5000,
      maxRedirects: 5,
    })

    const $ = cheerio.load(res.data)
    const base = new URL(url)

    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text().trim() ||
      base.hostname

    const description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      ''

    let image =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      ''

    let favicon =
      $('link[rel="shortcut icon"]').attr('href') ||
      $('link[rel="icon"]').attr('href') ||
      '/favicon.ico'

    if (favicon && !favicon.startsWith('http')) favicon = new URL(favicon, base.origin).href
    if (image && !image.startsWith('http')) image = new URL(image, base.origin).href

    const tags = generateTags(url, title, description)
    const category = detectCategory(url, title, description, tags)

    return {
      title: title.slice(0, 100),
      description: description.slice(0, 300),
      favicon: favicon || `${base.origin}/favicon.ico`,
      image: image || '',
      tags,
      category,
    }
  } catch {
    const base = new URL(url)
    const hostname = base.hostname.replace('www.', '')
    const name = hostname.split('.')[0]
    const tags = generateTags(url, name, '')
    const category = detectCategory(url, name, '', tags)
    return {
      title: name.charAt(0).toUpperCase() + name.slice(1),
      description: `Visit ${hostname}`,
      favicon: `${base.origin}/favicon.ico`,
      image: '',
      tags,
      category,
      fallback: true,
    }
  }
}

// ─── Category Detection ──────────────────────────────────────────────────────

function detectCategory(url, title, description, tags) {
  const text = `${url} ${title} ${description} ${tags.join(' ')}`.toLowerCase()
  const rules = [
    { category: 'AI Tools',    keywords: ['ai', 'gpt', 'llm', 'openai', 'anthropic', 'gemini', 'claude', 'ml', 'neural', 'chatbot', 'midjourney', 'ollama', 'deepseek'] },
    { category: 'Dev Tools',   keywords: ['github', 'gitlab', 'npm', 'docker', 'vercel', 'netlify', 'api', 'developer', 'stackoverflow', 'replit', 'codepen', 'vscode', 'cloudflare', 'figma', 'code', 'programming'] },
    { category: 'Android',     keywords: ['android', 'magisk', 'termux', 'adb', 'apk', 'xda', 'lsposed', 'xposed', 'rom', 'root', 'twrp', 'mod apk'] },
    { category: 'iOS',         keywords: ['ios', 'iphone', 'ipad', 'swift', 'xcode', 'testflight', 'jailbreak'] },
    { category: 'Social',      keywords: ['twitter', 'reddit', 'linkedin', 'instagram', 'facebook', 'discord', 'social', 'forum', 'community'] },
    { category: 'Videos',      keywords: ['youtube', 'video', 'stream', 'watch', 'twitch', 'vimeo'] },
    { category: 'News',        keywords: ['news', 'blog', 'article', 'neowin', 'techcrunch', 'medium', 'substack', 'hackernews'] },
    { category: 'Reference',   keywords: ['docs', 'documentation', 'wiki', 'cheatsheet', 'guide', 'tutorial', 'mdn'] },
    { category: 'Tools',       keywords: ['canva', 'notion', 'trello', 'drive', 'sheets', 'productivity', 'tool', 'calculator', 'converter'] },
  ]
  for (const rule of rules) {
    if (rule.keywords.some(kw => text.includes(kw))) return rule.category
  }
  return 'Other'
}

// ─── Tag Generation ──────────────────────────────────────────────────────────

function generateTags(url, title, description) {
  const text = `${url} ${title} ${description}`.toLowerCase()
  const tagMap = {
    ai:           ['ai', 'artificial intelligence', 'gpt', 'llm'],
    code:         ['code', 'programming', 'developer', 'github'],
    design:       ['design', 'figma', 'canva', 'ui', 'ux'],
    android:      ['android', 'apk', 'magisk', 'root', 'termux', 'xda'],
    ios:          ['ios', 'iphone', 'swift', 'xcode'],
    social:       ['twitter', 'reddit', 'linkedin', 'social'],
    productivity: ['notion', 'trello', 'productivity', 'notes', 'task'],
    cloud:        ['cloud', 'vercel', 'netlify', 'hosting', 'deploy'],
    video:        ['youtube', 'video', 'stream'],
    news:         ['news', 'blog', 'article'],
    reference:    ['docs', 'documentation', 'wiki', 'guide'],
  }
  const found = []
  for (const [tag, keywords] of Object.entries(tagMap)) {
    if (keywords.some(kw => text.includes(kw))) found.push(tag)
  }
  try {
    const hostname = new URL(url).hostname.replace('www.', '').split('.')[0]
    if (hostname && !found.includes(hostname)) found.push(hostname)
  } catch {}
  return found.slice(0, 6)
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

function mapRow(cols, row) {
  const obj = Object.fromEntries(cols.map((c, i) => [c, row[i]]))
  obj.tags = obj.tags ? JSON.parse(obj.tags) : []
  obj.favorite = obj.favorite === 1 || obj.favorite === true
  return obj
}

export async function getLinks(userId) {
  const db = await getDb()
  const result = db.exec(
    `SELECT * FROM links WHERE user_id = ${userId} ORDER BY created_at DESC`
  )
  if (!result.length) return []
  const cols = result[0].columns
  return result[0].values.map(r => mapRow(cols, r))
}

export async function createLink(userId, data) {
  const db = await getDb()
  const { title, url, tags = [], description = '', category = 'Other', favicon = '', image = '', favorite = false } = data
  db.run(
    `INSERT INTO links (user_id, title, url, tags, description, category, favicon, image, favorite)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, title, url, JSON.stringify(tags), description, category, favicon, image, favorite ? 1 : 0]
  )
  saveDb()
  const result = db.exec(
    `SELECT * FROM links WHERE user_id = ${userId} ORDER BY id DESC LIMIT 1`
  )
  const cols = result[0].columns
  return mapRow(cols, result[0].values[0])
}

export async function updateLink(userId, id, data) {
  const db = await getDb()
  const check = db.exec(`SELECT id FROM links WHERE id = ${id} AND user_id = ${userId}`)
  if (!check.length) return null

  const fields = []
  const values = []

  if (data.title       !== undefined) { fields.push('title = ?');       values.push(data.title) }
  if (data.url         !== undefined) { fields.push('url = ?');         values.push(data.url) }
  if (data.tags        !== undefined) { fields.push('tags = ?');        values.push(JSON.stringify(data.tags)) }
  if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description) }
  if (data.category    !== undefined) { fields.push('category = ?');    values.push(data.category) }
  if (data.favicon     !== undefined) { fields.push('favicon = ?');     values.push(data.favicon) }
  if (data.image       !== undefined) { fields.push('image = ?');       values.push(data.image) }
  if (data.favorite    !== undefined) { fields.push('favorite = ?');    values.push(data.favorite ? 1 : 0) }

  if (!fields.length) return null

  db.run(`UPDATE links SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`, [...values, id, userId])
  saveDb()

  const result = db.exec(`SELECT * FROM links WHERE id = ${id}`)
  const cols = result[0].columns
  return mapRow(cols, result[0].values[0])
}

export async function deleteLink(userId, id) {
  const db = await getDb()
  const result = db.exec(`SELECT id FROM links WHERE id = ${id} AND user_id = ${userId}`)
  if (!result.length) return false
  db.run(`DELETE FROM links WHERE id = ? AND user_id = ?`, [id, userId])
  saveDb()
  return true
}
