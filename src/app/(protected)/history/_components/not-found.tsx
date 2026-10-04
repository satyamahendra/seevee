import React from "react"
import AnimatedContainer from "@/components/custom/animated-container"

type NotFoundProps = {
    icon: React.ReactNode
    text: string
}

export default function NotFound({icon, text}: NotFoundProps) {
    return (
        <AnimatedContainer className="flex flex-col flex-1 justify-center items-center text-sm text-muted-foreground gap-4">
            <div className="flex items-center justify-center p-4 border bg-primary-foreground rounded-xl text-2xl">{icon}</div>
            {text}
        </AnimatedContainer>
    )
}
