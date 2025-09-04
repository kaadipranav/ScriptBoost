import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { GeneratedScript } from '@/types'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { Document, Packer, Paragraph, HeadingLevel, TextRun, AlignmentType } from 'docx'
import PptxGenJS from 'pptxgenjs'

function buildPlainText(script: GeneratedScript): string {
  const parts: string[] = []
  parts.push(`# ${script.input.niche}`)
  parts.push('')
  parts.push(`Platform: ${script.platform}`)
  parts.push(`Tone: ${script.input.tone}`)
  parts.push(`Length: ${script.input.scriptLength}s`)
  parts.push('')
  parts.push('Hook:')
  parts.push(script.hook.text)
  parts.push('')
  parts.push('Body:')
  parts.push(script.body.text)
  parts.push('')
  parts.push('CTA:')
  parts.push(script.cta.text)
  if (script.hashtags?.length) {
    parts.push('')
    parts.push('Hashtags:')
    parts.push(script.hashtags.map(h => `#${h}`).join(' '))
  }
  return parts.join('\n')
}

async function buildPDF(script: GeneratedScript): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  let page = doc.addPage()
  let { width, height } = page.getSize()
  const margin = 50
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)

  const title = `${script.input.niche} (${script.platform})`
  const content = buildPlainText(script)

  // Title
  let y = height - margin
  page.drawText(title, { x: margin, y, size: 18, font: fontBold, color: rgb(0, 0, 0) })
  y -= 24

  const lines = wrapText(content, 12, font, width - margin * 2)
  for (const line of lines) {
    if (y < margin) {
      page = doc.addPage()
      ;({ width, height } = page.getSize())
      y = height - margin
    }
    page.drawText(line, { x: margin, y, size: 12, font })
    y -= 16
  }

  return await doc.save()
}

function wrapText(text: string, fontSize: number, font: any, maxWidth: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const test = line ? line + ' ' + w : w
    const width = font.widthOfTextAtSize(test, fontSize)
    if (width > maxWidth) {
      if (line) lines.push(line)
      line = w
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

async function buildDOCX(script: GeneratedScript): Promise<Uint8Array> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({ text: script.input.niche, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.LEFT }),
          new Paragraph({ text: `Platform: ${script.platform} • Tone: ${script.input.tone} • ${script.input.scriptLength}s`, spacing: { after: 200 } }),
          new Paragraph({ text: 'Hook', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: script.hook.text }),
          new Paragraph({ text: 'Body', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: script.body.text }),
          new Paragraph({ text: 'CTA', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: script.cta.text }),
          ...(script.hashtags?.length ? [
            new Paragraph({ text: 'Hashtags', heading: HeadingLevel.HEADING_2 }),
            new Paragraph({ text: script.hashtags.map(h => `#${h}`).join(' ') })
          ] : []),
        ],
      },
    ],
  })
  return await Packer.toBuffer(doc)
}

async function buildPPTX(script: GeneratedScript): Promise<Buffer> {
  const pptx = new PptxGenJS()
  pptx.author = 'ScriptBoost'
  pptx.company = 'ScriptBoost'
  pptx.title = script.input.niche

  // Slide: Title
  let slide = pptx.addSlide()
  slide.addText(script.input.niche, { x: 0.5, y: 1.5, w: 9, fontSize: 32, bold: true })
  slide.addText(`${script.platform} • ${script.input.tone} • ${script.input.scriptLength}s`, { x: 0.5, y: 2.5, w: 9, fontSize: 18 })

  // Slide: Hook
  slide = pptx.addSlide()
  slide.addText('Hook', { x: 0.5, y: 0.5, fontSize: 24, bold: true })
  slide.addText(script.hook.text, { x: 0.5, y: 1.2, w: 9, h: 4.5, fontSize: 18 })

  // Slide: Body (bullet points if available)
  slide = pptx.addSlide()
  slide.addText('Body', { x: 0.5, y: 0.5, fontSize: 24, bold: true })
  if (script.body.keyPoints?.length) {
    slide.addText(script.body.keyPoints.map(k => `• ${k}`).join('\n'), { x: 0.8, y: 1.2, w: 8.5, fontSize: 18 })
  } else {
    slide.addText(script.body.text, { x: 0.5, y: 1.2, w: 9, h: 4.5, fontSize: 18 })
  }

  // Slide: CTA
  slide = pptx.addSlide()
  slide.addText('CTA', { x: 0.5, y: 0.5, fontSize: 24, bold: true })
  slide.addText(script.cta.text, { x: 0.5, y: 1.2, w: 9, h: 4.5, fontSize: 20 })

  const arrBuf = await pptx.write({ outputType: 'nodebuffer' })
  return arrBuf as Buffer
}

function toSrt(script: GeneratedScript): string {
  // Split body text by sentences, allocate times across durations
  const lines: { text: string; start: number; end: number }[] = []
  const secsHook = script.hook.duration || 3
  const secsBody = script.body.duration || Math.max(1, script.input.scriptLength - 6)
  const secsCTA = 3

  const pushChunks = (text: string, start: number, total: number) => {
    const chunks = text.split(/(?<=[.!?])\s+/).filter(Boolean)
    const per = total / Math.max(1, chunks.length)
    chunks.forEach((t, i) => {
      const s = start + i * per
      const e = Math.min(start + (i + 1) * per, start + total)
      lines.push({ text: t, start: s, end: e })
    })
  }

  let t = 0
  pushChunks(script.hook.text, t, secsHook)
  t += secsHook
  pushChunks(script.body.text, t, secsBody)
  t += secsBody
  pushChunks(script.cta.text, t, secsCTA)

  const toTS = (s: number) => {
    const hh = Math.floor(s / 3600)
    const mm = Math.floor((s % 3600) / 60)
    const ss = Math.floor(s % 60)
    const ms = Math.floor((s - Math.floor(s)) * 1000)
    const pad = (n: number, l = 2) => n.toString().padStart(l, '0')
    return `${pad(hh)}:${pad(mm)}:${pad(ss)},${pad(ms, 3)}`
  }

  return lines
    .map((l, i) => `${i + 1}\n${toTS(l.start)} --> ${toTS(l.end)}\n${l.text}\n`)
    .join('\n')
}

export async function POST(req: NextRequest) {
  try {
    const { script, format } = await req.json()
    if (!script || !format) {
      return NextResponse.json({ success: false, error: 'Missing script or format', timestamp: new Date().toISOString() }, { status: 400 })
    }

    const data: GeneratedScript = script
    const filenameBase = `${data.input.niche.replace(/[^a-z0-9]+/gi, '_')}_${data.id}`

    if (format === 'pdf') {
      const file = await buildPDF(data)
      return new NextResponse(Buffer.from(file), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filenameBase}.pdf"`
        }
      })
    }

    if (format === 'docx') {
      const file = await buildDOCX(data)
      return new NextResponse(Buffer.from(file), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${filenameBase}.docx"`
        }
      })
    }

    if (format === 'pptx') {
      const file = await buildPPTX(data)
      // Ensure BodyInit compatibility in Node/Edge runtimes by using a Blob
      const blob = new Blob([file], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' })
      return new NextResponse(blob, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'Content-Disposition': `attachment; filename="${filenameBase}.pptx"`
        }
      })
    }

    if (format === 'srt') {
      const srt = toSrt(data)
      return new NextResponse(srt, {
        headers: {
          'Content-Type': 'application/x-subrip',
          'Content-Disposition': `attachment; filename="${filenameBase}.srt"`
        }
      })
    }

    return NextResponse.json({ success: false, error: 'Unsupported format', timestamp: new Date().toISOString() }, { status: 400 })
  } catch (e) {
    console.error('Export error', e)
    return NextResponse.json({ success: false, error: 'Failed to export', timestamp: new Date().toISOString() }, { status: 500 })
  }
}
