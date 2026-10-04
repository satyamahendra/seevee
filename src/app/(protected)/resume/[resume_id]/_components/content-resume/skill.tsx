import React from "react"
import {
    HandleAddMultipleInputType,
    HandleChangeContentType,
    HandleChangeSubContentType,
    HandleDeleteContentType,
    HandleDeleteSubContentType,
    HandleDirectEditContentType,
    SkillContentType,
} from "../../_static/type"
import {Button} from "@/components/ui/button"
import {PiPencil, PiTrash} from "react-icons/pi"
import ResumeDrawer from "@/components/custom/resume-drawer"
import SkillForm from "../content-form/skill-form"

type SkillProps = {
    data: SkillContentType
    conIndex: number
    handleChangeContent: HandleChangeContentType
    handleChangeSubContent: HandleChangeSubContentType
    handleAddMultipleInput: HandleAddMultipleInputType
    handleDeleteSubContent: HandleDeleteSubContentType
    handleDirectEditContent: HandleDirectEditContentType
    handleDeleteContent: HandleDeleteContentType
}

export default function Skill({
    data,
    conIndex,
    handleChangeSubContent,
    handleAddMultipleInput,
    handleDeleteSubContent,
    handleDirectEditContent,
    handleDeleteContent,
}: SkillProps) {
    const handleAddListItem = (skillIndex: number) => {
        const thisSkill = data.skill[skillIndex]
        const modifiedSkill = {...thisSkill, items: [...thisSkill?.items, ""]}
        const modifiedContent = {
            ...data,
            skill: data.skill.map((con, index2) => (skillIndex === index2 ? modifiedSkill : con)),
        }
        handleDirectEditContent(modifiedContent, conIndex)
    }

    const handleChangeListItem = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, skillIndex: number, itemIndex: number) => {
        const {value} = e.target
        const thisSkill = data.skill[skillIndex]
        const modifiedSkill = {
            ...thisSkill,
            items: thisSkill?.items.map((item, index2) => (itemIndex === index2 ? value : item)),
        }
        const modifiedContent = {
            ...data,
            skill: data.skill.map((con, index2) => (skillIndex === index2 ? modifiedSkill : con)),
        }
        handleDirectEditContent(modifiedContent, conIndex)
    }

    const handleDeleteListItem = (skillIndex: number, itemIndex: number) => {
        const thisSkill = data.skill[skillIndex]
        const modifiedSkill = {
            ...thisSkill,
            items: thisSkill?.items.filter((_, index2) => itemIndex !== index2),
        }
        const modifiedContent = {
            ...data,
            skill: data.skill.map((con, index2) => (skillIndex === index2 ? modifiedSkill : con)),
        }
        handleDirectEditContent(modifiedContent, conIndex)
    }

    return (
        <section className="text-sm avoid-break group/section duration-200 rounded-xl">
            <div className="px-2">
                <div className="flex items-center border-b border-primary gap-2">
                    <h2 className="text-base font-[600]">Skills</h2>

                    {/* Delete whole section button */}
                    <div className="group-hover/section:opacity-100 opacity-0 duration-200">
                        <Button size="icon" variant="outline" className="w-6 h-6" onClick={() => handleDeleteContent(conIndex)}>
                            <PiTrash />
                        </Button>
                    </div>
                </div>
            </div>

            <ul className="text-xs text-justify">
                {data?.skill?.length > 0 &&
                    data.skill.map((sk, skillIndex) => (
                        <li key={skillIndex} className="relative flex gap-2 h-full break-inside-avoid p-2 group/item hover:bg-muted hover:rounded-lg duration-200">
                            {/* Skill Group Name */}
                            <div className="font-[500] flex gap-2">
                                <input
                                    className="h-fit w-20 field-sizing-content text-xs bg-primary-foreground rounded-lg font-[500] group-hover/item:bg-muted border-none shadow-none outline-none focus:bg-muted focus:border-muted duration-200 placeholder:text-muted-foreground"
                                    type="text"
                                    value={sk?.name || ""}
                                    name="name"
                                    onChange={(e) => handleChangeSubContent(e, "skill", conIndex, skillIndex)}
                                    placeholder="Skill group"
                                />
                            </div>

                            {/* Skill Items */}
                            <ul className="flex gap-1 flex-wrap pl-2">
                                {sk?.items?.length > 0 &&
                                    sk.items.map((item, itemIndex) => (
                                        <li key={itemIndex} className="flex relative items-center group/tag">
                                            <input
                                                type="text"
                                                className="px-2 border bg-muted rounded-md w-fit field-sizing-content"
                                                onChange={(e) => handleChangeListItem(e, skillIndex, itemIndex)}
                                                placeholder="Tags"
                                                value={item || ""}
                                                onKeyDown={(e) => e.key === "Enter" && handleAddListItem(skillIndex)}
                                            />

                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleDeleteListItem(skillIndex, itemIndex)}
                                                className="w-3 h-3 -top-1.5 -right-0.5 flex items-center justify-center p-1 absolute opacity-0 group-hover/tag:opacity-100 duration-200 rounded-sm">
                                                &times;
                                            </Button>
                                        </li>
                                    ))}

                                {/* Add Tag Button */}
                                <Button
                                    onClick={() => handleAddListItem(skillIndex)}
                                    variant="outline"
                                    className="w-4 h-4 items-center group-hover/item:flex hidden duration-200 aspect-square p-0 rounded-sm">
                                    +
                                </Button>
                            </ul>

                            {/* Edit + Delete Skill Group */}
<div className="absolute -top-7 rounded-sm gap-1 right-0 group-hover:bg-muted p-1 flex opacity-0 group-hover:opacity-100 duration-200">
                                    <ResumeDrawer
                                        title={`${sk.name} Skill group`}
                                        description="Make changes to your data here. Simply exit and your data will stay"
                                        trigger={
                                            <Button size="icon" variant="outline" className="w-6 h-6">
                                                <PiPencil />
                                            </Button>
                                        }>
                                        <SkillForm
                                            data={data}
                                            skill={sk}
                                            index={conIndex}
                                            subIndex={skillIndex}
                                            handleChangeSubContent={handleChangeSubContent}
                                            handleDirectEditContent={handleDirectEditContent}
                                        />
                                    </ResumeDrawer>

                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteSubContent("skill", conIndex, skillIndex)
                                        }}
                                        size="icon"
                                        variant="outline"
                                        className="w-6 h-6">
                                        <PiTrash />
                                    </Button>
                                </div>
                        </li>
                    ))}
            </ul>

            {data?.skill?.length < 1 && <div className="my-2 text-muted-foreground text-center text-xs">No skill group added yet</div>}

            {/* Add Skill Group Button */}
            <div className="w-full justify-center flex border-t mt-3">
                <Button
                    onClick={() => handleAddMultipleInput("skill", conIndex)}
                    variant="outline"
                    className="text-xs h-5 rounded-t-none border-t-0 aspect-square py-0 duration-200 rounded-sm">
                    + Skill group
                </Button>
            </div>
        </section>
    )
}
