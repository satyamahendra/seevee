import {ImageResponse} from "next/og"

export const alt = "seevee, the AI-assisted resume builder"
export const size = {width: 1200, height: 630}
export const contentType = "image/png"

export default function Image() {
    return new ImageResponse(
        (
            <div style={{width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 96, background: "#fafaf9", color: "#1c1917"}}>
                <div style={{fontSize: 48, fontWeight: 600}}>seevee</div>
                <div style={{fontSize: 84, fontWeight: 700, lineHeight: 1.05, marginTop: 24}}>One resume, tailored to every job.</div>
                <div style={{fontSize: 36, color: "#57534e", marginTop: 32}}>AI rewrites, translation, a public share link and PDF export.</div>
            </div>
        ),
        size,
    )
}
