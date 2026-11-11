type BuildAiTailorPromptArgs = {
    payload: string
    request: string
    focus: string[]
    pdfText?: string
    today: string
    // Blank resume: built from the PDF, or (no PDF) written from the request, e.g. "an example resume for Darth Vader".
    isBlank?: boolean
}

/**
 * Split into system + contents so the editing rules live in `systemInstruction`
 * and the resume JSON stays in the user turn.
 */
export const buildAiTailorPrompt = (args: BuildAiTailorPromptArgs) => {
    const {payload, request, focus, pdfText = "", today, isBlank = false} = args
    // Only a from-scratch request with no source document may make things up.
    const isDraft = isBlank && !pdfText
    const source = pdfText ? "the PDF" : "the request"

    const blockRules = isBlank
        ? `- Keep every existing block's "id" and "type", in the input order, and fill them from ${source}.
- For sections with no matching block (e.g. Work Experience, Education, Projects, Certifications), append new "general" blocks after the existing ones, with "title" set to the section name and a new unique "id". If there is no header, summary, or skill block, add one with a new unique "id".`
        : `- Return the same number of top-level blocks. Keep every block's "id" and "type", and keep the input order. Never drop, merge, or reorder blocks.`

    const truthRules = isDraft
        ? `- The resume is blank and the user wants one written from their request. Create complete, plausible content that fits it (name, contact, roles, employers, dates, achievements, skills), even for a fictional or example person.
- Fill every block. Include at least a header, summary, skills, Work Experience, and Education.
- Keep it consistent: dates in order, skills that match the roles.
- Write in the language of the request.`
        : `- Never invent employers, job titles, dates, metrics, skills, certifications, languages, or links.
- Only quantify achievements with numbers already present. Never guess or estimate a number.
- Nested entries (bullets, skills, experiences, links) may be rewritten, reordered, trimmed, or added only from information already present${pdfText ? " or in the PDF" : ""}.
- Use job-description keywords only where the resume truthfully supports the claim.
- If the request asks to translate, translate the text and keep proper nouns, dates, and structure.
- Keep the resume's original language unless explicitly asked to translate.`

    const system = `${isDraft ? "You are a resume writer. You write a complete resume from scratch based on the user's request." : "You are a resume editor. You improve an existing resume; you never invent facts."}

Output contract:
- Return ONLY a JSON object: {"resume": [...], "changes": [...], "keywords": [...]}.
- "resume" uses the same block shape as the input array.
${blockRules}
- "changes": one entry per block you changed or added: {"blockId": the block's id, "summary": one short sentence on what changed and why}, written in the resume's language. Leave unchanged blocks out.
- "keywords": only when the request is a job description, list up to 20 of the most important hard skills, tools, certifications, and the job title it asks for, using the job's exact wording, required items first. Include them whether or not the resume has them. Otherwise [].

Truth rules:
${truthRules}
- Never mention a company from the request in the summary.

ATS rules (when the request is a job description):
- First identify the target job title, required hard skills, tools, and certifications, using the job's exact terms. Required items outrank nice-to-haves.
- When the resume already shows a skill under a different name, use the job's exact term ("PostgreSQL" not "Postgres"). Write an acronym and its full form once: "Search Engine Optimization (SEO)".
- Place matched terms in the summary, the skills block, and bullets of the most recent relevant roles. Use each term at most 2-3 times, in natural sentences.
- Order skills and each role's bullets by relevance to the job, most relevant first.

Writing rules:
- Summary: 2-3 sentences. Open with the target job title if the experience supports it, and years of experience computed from the resume's dates (the only number you may derive).
- "general" block titles use standard names: "Work Experience", "Education", "Projects", "Certifications", "Volunteering".
- Bullets: one sentence, action verb + what was done + result, max ~25 words. No first-person pronouns, emojis, or decorative symbols.
- Dates use "yyyy-mm-dd". Keep an existing date when it is already valid; today is ${today}.
- Optimize existing content instead of deleting it.`

    const contents = `Current resume (JSON):
${payload}

Request (a job description to target, or an instruction to apply):
${request || "(none)"}

Focus areas (apply only where relevant):
${focus.length > 0 ? focus.map((item) => `- ${item}`).join("\n") : "(none)"}

${pdfText ? `Extracted text from the attached PDF (use it as the source of truth for facts that are missing, never as a template to copy verbatim):\n${pdfText}` : ""}

Return the JSON object.`

    return {system, contents}
}
