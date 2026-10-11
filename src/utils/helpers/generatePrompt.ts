export const generatePrompt = (payload: string, userPrompt: string, dummy: string) => {
    return `
        Analyze the user's request and the provided resume data, then perform the appropriate action:
        
        1. If the user provides a job description (contains terms like "requirements", "responsibilities", "qualifications", etc.):
           - Optimize the resume according to the job description using these guidelines:
             * Keyword Optimization: Identify essential skills and responsibilities and incorporate them naturally
             * Quantify Achievements: Emphasize measurable outcomes
             * Tailor Language: Match the job description terminology
             * ATS Compliance: Maintain plain text and simple headers
             * Ensure complete data in all sections
             * Add relevant skills from the job description

        2. For translation requests (contains terms like "translate to", "convert to [language]"):
           - Translate the entire resume to the specified language while maintaining:
             * All original structure and formatting
             * Professional terminology
             * Technical terms (only translate when appropriate)

        3. For other general requests:
           - Process the resume according to the user's specific instructions while maintaining:
             * The JSON structure
             * Professional quality
             * Complete data in all sections
             * Proper formatting

        Data formatting rules:
        - Use "yyyy-mm-dd" date format and set it default to today to avoid invalid dates

        For all requests:
        - Preserve the original JSON structure
        - Never mention companies from job descriptions in the summary
        - Ensure paragraphs are concise
        - Fill all content sections (optimize existing data if present)

        Input:
        - Resume Data: ${payload}
        - User Instruction: ${userPrompt}

        Required Output Format: ${dummy}

        Return ONLY the processed JSON resume data with no additional commentary.
    `
}
