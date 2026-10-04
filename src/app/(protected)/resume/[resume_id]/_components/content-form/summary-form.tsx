import React from "react"
import {HandleChangeContentType, SummaryContentType} from "../../_static/type"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"

type SummaryFormProps = {
    data: SummaryContentType
    index: number
    handleChangeContent: HandleChangeContentType
}

export default function SummaryForm({data, handleChangeContent, index}: SummaryFormProps) {
    return (
        <div className="space-y-2">
            <div>
                <Label htmlFor="text" className="text-muted-foreground text-xs">
                    Text
                </Label>
                <Textarea
                    className="h-[400px] bg-muted placeholder-muted"
                    id="text"
                    name="text"
                    placeholder="John Doe"
                    value={data?.text || ""}
                    onChange={(e) => handleChangeContent(e, index)}
                />
            </div>
        </div>
    )
}
