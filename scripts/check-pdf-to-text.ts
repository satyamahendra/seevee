/**
 * Self-check for pdfToText. Run: npx tsx scripts/check-pdf-to-text.ts
 */
import assert from "node:assert"
import {pdfToText} from "../src/utils/helpers/pdfToText"

function buildPdf(text: string): string {
    const stream = `BT /F1 14 Tf 20 200 Td (${text}) Tj ET\n`
    const objects = [
        "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
        "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
        "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 300] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
        `4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}endstream\nendobj\n`,
        "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    ]

    let out = "%PDF-1.4\n"
    const offsets: number[] = []
    for (const obj of objects) {
        offsets.push(out.length)
        out += obj
    }
    const xref = out.length
    out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
    for (const offset of offsets) out += `${String(offset).padStart(10, "0")} 00000 n \n`
    out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`

    return Buffer.from(out, "latin1").toString("base64")
}

async function main() {
    const text = await pdfToText(buildPdf("Jane Roe - Data Scientist"))

    assert.ok(text.includes("Jane Roe"), `expected extracted name, got: ${JSON.stringify(text)}`)
    assert.ok(text.includes("Data Scientist"), `expected extracted role, got: ${JSON.stringify(text)}`)
    assert.strictEqual(await pdfToText("not-a-real-pdf"), "", "garbage input should return empty string")

    console.log("ok:", JSON.stringify(text))
}

void main()
