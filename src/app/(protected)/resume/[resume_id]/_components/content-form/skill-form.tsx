import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import React, {ChangeEvent, useState} from "react"
import {PiPlus} from "react-icons/pi"
import {HandleChangeSubContentType, HandleDirectEditContentType, SkillContentType, SkillType} from "../../_static/type"

type SkillFormProps = {
    data: SkillContentType
    skill: SkillType
    index: number
    subIndex: number
    handleChangeSubContent: HandleChangeSubContentType
    handleDirectEditContent: HandleDirectEditContentType
}

export default function SkillForm({data, skill, index, subIndex, handleChangeSubContent, handleDirectEditContent}: SkillFormProps) {
    const [skillInput, setSkillInput] = useState<string>("")

    const handleChangeSkill = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {value} = e.target
        setSkillInput(value)
    }

    const handleAddSkill = (subIndex: number) => {
        const thisSkill = data.skill[subIndex]
        const modifiedProject = {...thisSkill, items: [...thisSkill?.items, skillInput]}
        const modifiedContent = {...data, skill: data.skill.map((con, index2) => (subIndex === index2 ? modifiedProject : con))}
        setSkillInput("")
        handleDirectEditContent(modifiedContent, index)
    }

    const handleDeleteSkill = (subIndex: number, skillIndex: number) => {
        const thisSkill = data.skill[subIndex]
        const modifiedSkill = {...thisSkill, items: thisSkill.items.filter((_, index2) => skillIndex !== index2)}
        const modifiedContent = {...data, skill: data.skill.map((sk, index2) => (subIndex === index2 ? modifiedSkill : sk))}
        setSkillInput("")
        handleDirectEditContent(modifiedContent, index)
    }

    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="name" className="text-muted-foreground text-xs">
                    Skill group
                </Label>
                <Input
                    type="text"
                    className="h-8 bg-muted placeholder-muted outline-none"
                    id="name"
                    name="name"
                    placeholder="Your title here..."
                    value={skill?.name || ""}
                    onChange={(e) => handleChangeSubContent(e, "skill", index, subIndex)}
                />
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
                <Label htmlFor="tag" className="text-muted-foreground text-xs">
                    Skill
                </Label>
                <div className="flex items-center gap-2">
                    <Input
                        type="text"
                        className="h-8 bg-muted placeholder-muted outline-none"
                        id="tag"
                        name="city"
                        placeholder="React JS, Tailwind CSS, ..."
                        value={skillInput || ""}
                        onChange={handleChangeSkill}
                    />
                    <Button type="submit" disabled={!skillInput} variant="outline" onClick={() => handleAddSkill(subIndex)} size="sm">
                        <PiPlus />
                    </Button>
                </div>
            </form>
            <div className="flex flex-wrap gap-1">
                {skill?.items?.length > 0 &&
                    skill.items.map((item, itemIndex) => (
                        <div
                            key={itemIndex}
                            className="px-2 cursor-pointer hover:bg-destructive duration-200 py-1 bg-primary text-primary-foreground text-xs w-fit rounded-lg"
                            onClick={() => handleDeleteSkill(subIndex, itemIndex)}>
                            {item}
                        </div>
                    ))}
            </div>
        </div>
    )
}
