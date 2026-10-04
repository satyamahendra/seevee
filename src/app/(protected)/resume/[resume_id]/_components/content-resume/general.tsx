import React from "react"
import {
    GeneralArrayKeys,
    GeneralContentType,
    HandleAddMultipleInputType,
    HandleChangeContentType,
    HandleChangeSubContentType,
    HandleDeleteContentType,
    HandleDeleteSubContentType,
    HandleDirectEditContentType,
} from "../../_static/type"
import {createFallbackKey} from "@/util/helpers/createFallbackKey"
import {Textarea} from "@/components/ui/textarea"
import {Button} from "@/components/ui/button"
import DateInput from "@/components/custom/input/date-input"
import ResumeDrawer from "@/components/custom/resume-drawer"
import {PiCircleFill, PiPencil, PiTrash} from "react-icons/pi"
import GeneralForm from "../content-form/general-form"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {Input} from "@/components/ui/input"

type GeneralProps = {
    data: GeneralContentType
    index: number
    handleChangeContent: HandleChangeContentType
    handleChangeSubContent: HandleChangeSubContentType
    handleAddMultipleInput: HandleAddMultipleInputType
    handleDeleteSubContent: HandleDeleteSubContentType
    handleDirectEditContent: HandleDirectEditContentType
    handleDeleteContent: HandleDeleteContentType
}

export default function General({
    data,
    index,
    handleChangeContent,
    handleChangeSubContent,
    handleAddMultipleInput,
    handleDeleteSubContent,
    handleDirectEditContent,
    handleDeleteContent,
}: GeneralProps) {
    const handleAddListItem = (genIndex: number, type: GeneralArrayKeys) => {
        const thisGeneral = data.general[genIndex]
        const modifiedGeneral = {...thisGeneral, [type]: [...thisGeneral?.[type], ""]}
        const modifiedContent = {...data, general: data.general.map((con, index2) => (genIndex === index2 ? modifiedGeneral : con))}
        handleDirectEditContent(modifiedContent, index)
    }

    const handleChangeListItem = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, genIndex: number, itemIndex: number, type: GeneralArrayKeys) => {
        const {value} = e.target
        const thisGeneral = data.general[genIndex]
        const modifiedGeneral = {
            ...thisGeneral,
            [type]: thisGeneral?.[type].map((item, index2) => (itemIndex === index2 ? value : item)),
        }
        const modifiedContent = {...data, general: data.general.map((con, index2) => (genIndex === index2 ? modifiedGeneral : con))}
        handleDirectEditContent(modifiedContent, index)
    }

    const handleDeleteListItem = (genIndex: number, itemIndex: number, type: GeneralArrayKeys) => {
        const thisGeneral = data.general[genIndex]
        const modifiedGeneral = {...thisGeneral, [type]: thisGeneral?.[type].filter((_, index2) => itemIndex !== index2)}
        const modifiedContent = {...data, general: data.general.map((con, index2) => (genIndex === index2 ? modifiedGeneral : con))}
        handleDirectEditContent(modifiedContent, index)
    }

    const handleChangeLink = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, genIndex: number, linkIndex: number) => {
        const {value, name} = e.target
        const thisGeneral = data.general[genIndex]
        const modifiedGeneral = {
            ...thisGeneral,
            links: thisGeneral.links.map((link, index2) => (linkIndex === index2 ? {...link, [name]: value} : link)),
        }
        const modifiedContent = {...data, general: data.general.map((con, index2) => (genIndex === index2 ? modifiedGeneral : con))}
        handleDirectEditContent(modifiedContent, index)
    }

    const handleDeleteLink = (conIndex: number, genIndex: number, linkIndex: number) => {
        const thisGeneral = data.general[genIndex]
        const modifiedProject = {...thisGeneral, links: thisGeneral?.links.filter((_, index2) => linkIndex !== index2)}
        const modifiedContent = {...data, general: data.general.map((con, index2) => (genIndex === index2 ? modifiedProject : con))}
        handleDirectEditContent(modifiedContent, conIndex)
    }

    return (
        <section className="text-sm group/head avoid-break rounded-xl">
            <h2 className="mb-1">
                <div className="flex items-center">
                    <input
                        className="w-fit px-2 field-sizing-content text-base bg-primary-foreground rounded-lg font-[600] group-hover:bg-muted border-none shadow-none outline-none focus:bg-muted focus:border-muted duration-200 py-0.5 placeholder:text-muted-foreground"
                        type="text"
                        value={data?.title || ""}
                        id="title"
                        name="title"
                        onChange={(e) => handleChangeContent(e, index)}
                        placeholder="Title"
                    />
                    <div className="flex items-center duration-200 opacity-0 group-hover/head:opacity-100">
                        <Button onClick={() => handleDeleteContent(index)} size="icon" variant="outline" className="aspect-square h-6 w-6">
                            <PiTrash />
                        </Button>
                    </div>
                </div>
                <div className="border-b border-primary mx-2"></div>
            </h2>
            <ul className="text-xs text-justify space-y-2">
                {data?.general?.length > 0 &&
                    data?.general?.map((gen, genIndex) => {
                        const fallBackKey = createFallbackKey()
                        return (
                            <li key={genIndex ?? fallBackKey} className="relative group duration-200 hover:bg-muted rounded-lg pt-2 pr-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <input
                                            className="w-fit px-2 field-sizing-content bg-primary-foreground rounded-lg font-[500] group-hover:bg-muted border-none shadow-none outline-none text-sm focus:bg-muted focus:border-muted duration-200 placeholder:text-muted-foreground"
                                            type="text"
                                            value={gen?.title || ""}
                                            id="title"
                                            name="title"
                                            onChange={(e) => handleChangeSubContent(e, "general", index, genIndex)}
                                            placeholder="Title A"
                                        />
                                        {gen?.links?.length > 0 &&
                                            gen.links.map((link, linkIndex) => {
                                                const fallBackKey = createFallbackKey()
                                                return (
                                                    <Popover key={link.id ?? fallBackKey}>
                                                        <PopoverTrigger asChild>
                                                            <div className="flex text-blue-400 text-xs font-semibold ml-4 items-center gap-2">
                                                                <div>{link?.name || "Your link"}</div>
                                                            </div>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-[200px] p-2 relative">
                                                            <div className="flex gap-2 flex-col">
                                                                <Input
                                                                    className="h-8 bg-muted placeholder-muted outline-none"
                                                                    id="name"
                                                                    type="text"
                                                                    name="name"
                                                                    placeholder="my portfolio, etc"
                                                                    value={link?.name || ""}
                                                                    onChange={(e) => handleChangeLink(e, genIndex, linkIndex)}
                                                                />
                                                                <Input
                                                                    className="h-8 bg-muted placeholder-muted outline-none"
                                                                    id="url"
                                                                    type="text"
                                                                    name="url"
                                                                    placeholder="https://example.com"
                                                                    value={link?.url || ""}
                                                                    onChange={(e) => handleChangeLink(e, genIndex, linkIndex)}
                                                                />
                                                                <Button
                                                                    onClick={() => handleDeleteLink(index, genIndex, linkIndex)}
                                                                    size="icon"
                                                                    variant="outline"
                                                                    className="aspect-square absolute -top-2 -right-2 h-6 w-6">
                                                                    <PiTrash />
                                                                </Button>
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                )
                                            })}
                                    </div>
                                    <div className="text-muted-foreground text-xs flex">
                                        <DateInput
                                            value={gen?.startDate || ""}
                                            onChange={(e) => handleChangeSubContent(e, "general", index, genIndex)}
                                            name="startDate"
                                        />
                                        <div className="mx-1">-</div>
                                        <DateInput value={gen?.endDate || ""} onChange={(e) => handleChangeSubContent(e, "general", index, genIndex)} name="endDate" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                    <input
                                        className="w-fit px-2 text-muted-foreground italic field-sizing-content bg-primary-foreground group-hover:bg-muted border-none shadow-none outline-none text-xs focus:bg-muted focus:border-muted duration-200 placeholder:text-muted-foreground pr-1"
                                        type="text"
                                        value={gen?.subtitle || ""}
                                        id="subtitle"
                                        name="subtitle"
                                        onChange={(e) => handleChangeSubContent(e, "general", index, genIndex)}
                                        placeholder="Subtitle"
                                    />

                                    <div className="flex items-center text-muted-foreground">
                                        <input
                                            type="text"
                                            placeholder="City"
                                            className="field-sizing-content bg-primary-foreground rounded-l-md border-none group-hover:bg-muted shadow-none outline-none text-xs focus:bg-muted focus:border-muted duration-200 pl-2 py-0.5 placeholder:text-muted-foreground"
                                            value={gen?.city || ""}
                                            id="city"
                                            name="city"
                                            onChange={(e) => handleChangeSubContent(e, "general", index, genIndex)}
                                        />
                                        {", "}
                                        <input
                                            type="text"
                                            placeholder="Country"
                                            className="field-sizing-content bg-primary-foreground rounded-r-md ml-1 border-none group-hover:bg-muted shadow-none outline-none text-xs focus:bg-muted focus:border-muted duration-200 py-0.5 placeholder:text-muted-foreground"
                                            value={gen?.country || ""}
                                            id="country"
                                            name="country"
                                            onChange={(e) => handleChangeSubContent(e, "general", index, genIndex)}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col px-2">
                                    {gen?.bulletpoints?.length > 0 &&
                                        gen.bulletpoints.map((tech, ttIndex) => (
                                            <div key={ttIndex} className="flex relative ml-1">
                                                <div className="mt-2">
                                                    <PiCircleFill size={4} />
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleDeleteListItem(genIndex, ttIndex, "bulletpoints")}
                                                    className="absolute -left-1 top-1 w-3 h-3 flex items-center justify-center p-1 opacity-0 group-hover:opacity-100 duration-200 rounded-sm">
                                                    &times;
                                                </Button>
                                                <Textarea
                                                    style={{fontSize: "0.75rem"}}
                                                    className="min-h-fit border-none resize-none shadow-none py-0 field-sizing-content placeholder:text-muted-foreground"
                                                    placeholder="I did something here..."
                                                    value={tech || ""}
                                                    onChange={(e) => handleChangeListItem(e, genIndex, ttIndex, "bulletpoints")}
                                                />
                                            </div>
                                        ))}
                                    <Button
                                        onClick={() => handleAddListItem(genIndex, "bulletpoints")}
                                        variant="outline"
                                        className="w-fit text-xs h-5 mt-2 mb-2 aspect-square py-0 hidden group-hover:block duration-200 ronded-sm ">
                                        + Bullet point
                                    </Button>
                                </div>

                                {gen?.tags?.length > 0 && (
                                    <div className="px-2 pb-2">
                                        {
                                            <div className="flex flex-wrap items-center gap-1 mt-1">
                                                {gen.tags.map((tag, tagIndex) => (
                                                    <div key={tagIndex} className="flex relative items-center">
                                                        <input
                                                            type="text"
                                                            className="px-2 border bg-muted rounded-md w-fit field-sizing-content"
                                                            onChange={(e) => handleChangeListItem(e, genIndex, tagIndex, "tags")}
                                                            placeholder="Tags"
                                                            value={tag}
                                                        />
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => handleDeleteListItem(genIndex, tagIndex, "tags")}
                                                            className="w-3 h-3 -top-1.5 -right-0.5 flex items-center justify-center  p-1 absolute opacity-0 group-hover:opacity-100 duration-200 rounded-sm">
                                                            &times;
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button
                                                    onClick={() => handleAddListItem(genIndex, "tags")}
                                                    variant="outline"
                                                    className="w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 duration-200 aspect-square p-0 ronded-sm ">
                                                    +
                                                </Button>
                                            </div>
                                        }
                                    </div>
                                )}

                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="absolute group-hover:flex hidden p-2 w-4 h-4 left-1/2 -translate-x-1/2 -top-2"
                                    onClick={() => handleAddMultipleInput("general", index, genIndex)}>
                                    +
                                </Button>

                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="absolute group-hover:flex hidden p-2 w-4 h-4 left-1/2 -translate-x-1/2 -bottom-2"
                                    onClick={() => handleAddMultipleInput("general", index, genIndex + 1)}>
                                    +
                                </Button>

                                <div className="absolute -top-7 rounded-sm gap-1 right-0 group-hover:bg-muted p-1 flex opacity-0 group-hover:opacity-100 duration-200">
                                        <ResumeDrawer
                                            title={
                                                <input
                                                    className="w-fit field-sizing-content text-base bg-primary-foreground rounded-lg font-[600] group-hover:bg-muted border-none shadow-none outline-none focus:bg-muted focus:border-muted duration-200 py-0.5 placeholder:text-muted-foreground"
                                                    type="text"
                                                    value={data?.title || ""}
                                                    id="title"
                                                    name="title"
                                                    onChange={(e) => handleChangeContent(e, index)}
                                                    placeholder="Title"
                                                />
                                            }
                                            description="Make changes to your data here. Simply exit and your data will stay"
                                            trigger={
                                                <Button size="icon" variant="outline" className="w-6 h-6">
                                                    <PiPencil />
                                                </Button>
                                            }>
                                            <GeneralForm
                                                data={data}
                                                gen={gen}
                                                index={index}
                                                subIndex={genIndex}
                                                handleChangeSubContent={handleChangeSubContent}
                                                handleDirectEditContent={handleDirectEditContent}
                                            />
                                        </ResumeDrawer>
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDeleteSubContent("general", index, genIndex)
                                            }}
                                            size="icon"
                                            variant="outline"
                                            className="w-6 h-6">
                                            <PiTrash />
                                        </Button>
                                    </div>
                            </li>
                        )
                    })}
            </ul>
            {data?.general?.length < 1 && <div className="my-2 text-muted-foreground text-center text-xs">No {data?.title || "item"} added yet</div>}
            <div className="w-full justify-center flex border-t mt-3">
                <Button
                    onClick={() => handleAddMultipleInput("general", index)}
                    variant="outline"
                    className="text-xs h-5 rounded-t-none border-t-0 aspect-square py-0 duration-200 ronded-sm ">
                    + {data?.title || "Item"}
                </Button>
            </div>
        </section>
    )
}
