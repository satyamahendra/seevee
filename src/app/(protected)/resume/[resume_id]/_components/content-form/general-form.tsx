"use client"

import React, {ChangeEvent, useState} from "react"
import {GeneralArrayKeys, GeneralContentType, GeneralType, HandleChangeSubContentType, HandleDirectEditContentType} from "../../_static/type"
import {Label} from "@/components/ui/label"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {PiCircleFill, PiPlus, PiPlusBold, PiTrash} from "react-icons/pi"
import {createFallbackKey} from "@/util/helpers/createFallbackKey"
import {linkInitial} from "../../_static/var"
import {generateRandomNumber} from "@/util/helpers/generateRandomNumber"

type GeneralFormType = {
    data: GeneralContentType
    gen: GeneralType
    index: number
    subIndex: number
    handleChangeSubContent: HandleChangeSubContentType
    handleDirectEditContent: HandleDirectEditContentType
}

export default function GeneralForm({data, gen, index, subIndex, handleChangeSubContent, handleDirectEditContent}: GeneralFormType) {
    const [bulletpointInput, setBulletpointInput] = useState<string>("")
    const [tagInput, setTagInput] = useState<string>("")

    const handleChangeBulletpoints = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {value} = e.target
        setBulletpointInput(value)
    }

    const handleChangeTags = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {value} = e.target
        setTagInput(value)
    }

    const handleAddListItem = (subIndex: number, type: GeneralArrayKeys) => {
        let value
        if (type === "tags") value = tagInput
        if (type === "bulletpoints") value = bulletpointInput

        const thisGeneral = data.general[subIndex]
        const modifiedProject = {...thisGeneral, [type]: [...thisGeneral?.[type], value]}
        const modifiedContent = {...data, general: data.general.map((con, index2) => (subIndex === index2 ? modifiedProject : con))}

        if (type === "tags") setTagInput("")
        if (type === "bulletpoints") setBulletpointInput("")
        handleDirectEditContent(modifiedContent, index)
    }

    const handleChangeBulletPoint = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, generalIndex: number, bulletpointIndex: number) => {
        const {value} = e.target
        const thisGeneral = data.general[generalIndex]
        const modifiedGeneral = {
            ...thisGeneral,
            bulletpoints: thisGeneral.bulletpoints.map((bulletpoints, index2) => (bulletpointIndex === index2 ? value : bulletpoints)),
        }
        const modifiedContent = {...data, general: data.general.map((con, index2) => (generalIndex === index2 ? modifiedGeneral : con))}
        handleDirectEditContent(modifiedContent, index)
    }

    const handleDeleteListItem = (generalIndex: number, itemIndex: number, type: GeneralArrayKeys) => {
        const thisGeneral = data.general[generalIndex]
        const modifiedProject = {...thisGeneral, [type]: thisGeneral?.[type].filter((_, index2) => itemIndex !== index2)}
        const modifiedContent = {...data, general: data.general.map((con, index2) => (generalIndex === index2 ? modifiedProject : con))}
        setBulletpointInput("")
        handleDirectEditContent(modifiedContent, index)
    }

    const handleChangeLink = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, generalIndex: number, linkIndex: number) => {
        const {value, name} = e.target
        const thisGeneral = data.general[generalIndex]
        const modifiedGeneral = {
            ...thisGeneral,
            links: thisGeneral.links.map((link, index2) => (linkIndex === index2 ? {...link, [name]: value} : link)),
        }
        const modifiedContent = {...data, general: data.general.map((con, index2) => (generalIndex === index2 ? modifiedGeneral : con))}
        handleDirectEditContent(modifiedContent, index)
    }

    const handleAddLink = (index: number, generalIndex: number) => {
        const thisGeneral = data.general[generalIndex]
        const modifiedProject = {...thisGeneral, links: [...thisGeneral?.links, {...linkInitial, id: generateRandomNumber()}]}
        const modifiedContent = {...data, general: data.general.map((con, index2) => (generalIndex === index2 ? modifiedProject : con))}
        handleDirectEditContent(modifiedContent, index)
    }

    const handleDeleteLink = (index: number, subIndex: number, linkIndex: number) => {
        const thisGeneral = data.general[subIndex]
        const modifiedProject = {...thisGeneral, links: thisGeneral?.links.filter((_, index2) => linkIndex !== index2)}
        const modifiedContent = {...data, general: data.general.map((con, index2) => (subIndex === index2 ? modifiedProject : con))}
        handleDirectEditContent(modifiedContent, index)
    }

    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="title" className="text-muted-foreground text-xs">
                    Title
                </Label>
                <Input
                    type="text"
                    className="h-8 bg-muted placeholder-muted outline-none"
                    id="title"
                    name="title"
                    placeholder="Yout title here..."
                    value={gen?.title || ""}
                    onChange={(e) => handleChangeSubContent(e, "general", index, subIndex)}
                />
            </div>
            <div>
                <Label htmlFor="subtitle" className="text-muted-foreground text-xs">
                    Subtitle
                </Label>
                <Input
                    type="text"
                    className="h-8 bg-muted placeholder-muted outline-none"
                    id="subtitle"
                    name="subtitle"
                    placeholder="Yout subtitle here..."
                    value={gen?.subtitle || ""}
                    onChange={(e) => handleChangeSubContent(e, "general", index, subIndex)}
                />
            </div>
            <form onSubmit={(e) => e.preventDefault()}>
                <Label htmlFor="techstack" className="text-muted-foreground text-xs">
                    Bulletpoints
                </Label>
                <div className="flex items-center gap-2">
                    <Input
                        type="text"
                        className="h-8 bg-muted placeholder-muted outline-none"
                        id="techstack"
                        name="city"
                        placeholder="I did this.. and that..."
                        value={bulletpointInput || ""}
                        onChange={handleChangeBulletpoints}
                    />
                    <Button type="submit" disabled={!bulletpointInput} variant="outline" onClick={() => handleAddListItem(subIndex, "bulletpoints")} size="sm">
                        <PiPlusBold />
                    </Button>
                </div>
            </form>
            <div className="flex flex-col gap-1 pl-2">
                {gen?.bulletpoints?.map((bp, bpIndex) => (
                    <div key={bpIndex} className="relative group flex items-center gap-2 text-sm text-muted-foreground">
                        <PiCircleFill size={6} />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteListItem(subIndex, bpIndex, "bulletpoints")}
                            className="absolute -left-1 top-1 w-3 h-3 flex items-center justify-center p-1 opacity-0 group-hover:opacity-100 duration-200 rounded-sm">
                            &times;
                        </Button>
                        <input
                            type="text"
                            placeholder="I did this.. and that..."
                            className="placeholder-muted-foreground outline-none"
                            value={bp || ""}
                            onChange={(e) => handleChangeBulletPoint(e, subIndex, bpIndex)}
                        />
                    </div>
                ))}
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
                <Label htmlFor="tag" className="text-muted-foreground text-xs">
                    Tags
                </Label>
                <div className="flex items-center gap-2">
                    <Input
                        type="text"
                        className="h-8 bg-muted placeholder-muted outline-none"
                        id="tag"
                        name="city"
                        placeholder="React JS, Tailwind CSS, ..."
                        value={tagInput || ""}
                        onChange={handleChangeTags}
                    />
                    <Button type="submit" disabled={!tagInput} variant="outline" onClick={() => handleAddListItem(subIndex, "tags")} size="sm">
                        <PiPlusBold />
                    </Button>
                </div>
            </form>
            <div className="flex flex-wrap gap-1">
                {gen?.tags?.map((tag, tagIndex) => (
                    <div
                        key={tagIndex}
                        className="px-2 cursor-pointer hover:bg-destructive duration-200 py-1 bg-primary text-primary-foreground text-xs w-fit rounded-lg"
                        onClick={() => handleDeleteListItem(subIndex, tagIndex, "tags")}>
                        {tag}
                    </div>
                ))}
            </div>

            <div className="flex gap-4">
                <div className="w-1/2">
                    <Label htmlFor="startDate" className="text-muted-foreground text-xs">
                        City
                    </Label>
                    <Input
                        type="text"
                        className="h-8 bg-muted placeholder-muted outline-none"
                        id="city"
                        name="city"
                        value={gen?.city || ""}
                        placeholder="New York"
                        onChange={(e) => handleChangeSubContent(e, "general", index, subIndex)}
                    />
                </div>
                <div className="w-1/2">
                    <Label htmlFor="startDate" className="text-muted-foreground text-xs">
                        Country
                    </Label>
                    <Input
                        type="text"
                        className="h-8 bg-muted placeholder-muted outline-none"
                        id="country"
                        name="country"
                        value={gen?.country || ""}
                        placeholder="United States"
                        onChange={(e) => handleChangeSubContent(e, "general", index, subIndex)}
                    />
                </div>
            </div>

            <div className="flex gap-4">
                <div className="w-1/2">
                    <Label htmlFor="startDate" className="text-muted-foreground text-xs">
                        Start date
                    </Label>
                    <Input
                        type="date"
                        className="h-8 bg-muted placeholder-muted outline-none"
                        id="startDate"
                        name="startDate"
                        value={gen?.startDate || ""}
                        onChange={(e) => handleChangeSubContent(e, "general", index, subIndex)}
                    />
                </div>
                <div className="w-1/2">
                    <Label htmlFor="startDate" className="text-muted-foreground text-xs">
                        End date
                    </Label>
                    <Input
                        type="date"
                        className="h-8 bg-muted placeholder-muted outline-none"
                        id="endDate"
                        name="endDate"
                        value={gen?.endDate || ""}
                        onChange={(e) => handleChangeSubContent(e, "general", index, subIndex)}
                    />
                </div>
            </div>

            {gen?.links?.map((link, linkIndex) => {
                const fallBackKey = createFallbackKey()
                return (
                    <div key={link?.id ?? fallBackKey}>
                        <Label htmlFor="link" className="text-muted-foreground text-xs">
                            Link #{linkIndex + 1}
                        </Label>
                        <div className="flex items-center gap-2">
                            <Input
                                className="h-8 bg-muted placeholder-muted outline-none"
                                id="url"
                                type="text"
                                name="url"
                                placeholder="https://example.com"
                                value={link?.url || ""}
                                onChange={(e) => handleChangeLink(e, subIndex, linkIndex)}
                            />
                            <Input
                                className="h-8 bg-muted placeholder-muted outline-none"
                                id="name"
                                type="text"
                                name="name"
                                placeholder="my portfolio, etc"
                                value={link?.name || ""}
                                onChange={(e) => handleChangeLink(e, subIndex, linkIndex)}
                            />
                            <Button onClick={() => handleDeleteLink(index, subIndex, linkIndex)} size="sm" variant="outline" className="aspect-square">
                                <PiTrash />
                            </Button>
                        </div>
                    </div>
                )
            })}
            <div className="flex justify-center">
                <Button onClick={() => handleAddLink(index, subIndex)} size="sm" variant="ghost">
                    <PiPlus />
                    Add Link
                </Button>
            </div>
        </div>
    )
}
