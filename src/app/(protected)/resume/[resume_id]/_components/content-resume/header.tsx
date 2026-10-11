import React from "react"
import {
    HandleAddMultipleInputType,
    HandleChangeContentType,
    HandleChangeSubContentType,
    HandleDeleteContentType,
    HandleDeleteSubContentType,
    HeaderContentType,
} from "../../_static/type"
import {PiEnvelope, PiLink, PiMapPin, PiPencil, PiPhone, PiTrash} from "react-icons/pi"
import {linkIcons} from "@/utils/constants/linkIcons"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import ResumeDrawer from "@/components/custom/resume-drawer"
import HeaderForm from "../content-form/header-form"

type HeaderProps = {
    data: HeaderContentType
    index: number
    handleChangeContent: HandleChangeContentType
    handleAddMultipleInput: HandleAddMultipleInputType
    handleChangeSubContent: HandleChangeSubContentType
    handleDeleteSubContent: HandleDeleteSubContentType
    handleDeleteContent: HandleDeleteContentType
}

export default function Header({
    data,
    index,
    handleChangeContent,
    handleAddMultipleInput,
    handleChangeSubContent,
    handleDeleteSubContent,
    handleDeleteContent,
}: HeaderProps) {
    return (
        <header className="text-xs relative border-primary avoid-break flex flex-col items-center justify-center hover:bg-muted duration-200 group rounded-lg py-1">
            <input
                className="w-fit px-2 field-sizing-content bg-primary-foreground rounded-lg font-semibold group-hover:bg-muted border-none shadow-none outline-none text-lg focus:bg-muted focus:border-muted duration-200 py-0.5"
                type="text"
                value={data?.fullname || ""}
                id="fullname"
                name="fullname"
                onChange={(e) => handleChangeContent(e, index)}
                placeholder="John Doe"
            />
            <ul className="flex flex-col text-muted-foreground text-xs items-center gap-x-4 px-2">
                <li className="flex items-center gap-1">
                    <PiEnvelope className="text-base" />
                    <input
                        type="email"
                        placeholder="example@email.com"
                        className="field-sizing-content bg-primary-foreground rounded-md border-none group-hover:bg-muted shadow-none outline-none text-xs focus:bg-muted focus:border-muted duration-200 py-0.5"
                        value={data?.email || ""}
                        id="email"
                        name="email"
                        onChange={(e) => handleChangeContent(e, index)}
                    />
                </li>
                <li className="flex items-center gap-1">
                    <PiPhone className="text-base" />
                    <input
                        type="text"
                        placeholder="+1 (123) 456-7890"
                        className="field-sizing-content bg-primary-foreground rounded-md border-none group-hover:bg-muted shadow-none outline-none text-xs focus:bg-muted focus:border-muted duration-200 py-0.5"
                        value={data?.phone || ""}
                        id="phone"
                        name="phone"
                        onChange={(e) => handleChangeContent(e, index)}
                    />
                </li>
                <li className="flex items-center gap-1">
                    <PiMapPin className="text-base" />
                    <input
                        type="text"
                        placeholder="Arizona"
                        className="field-sizing-content bg-primary-foreground rounded-l-md border-none group-hover:bg-muted shadow-none outline-none text-xs focus:bg-muted focus:border-muted duration-200 py-0.5"
                        value={data?.city || ""}
                        id="city"
                        name="city"
                        onChange={(e) => handleChangeContent(e, index)}
                    />
                    {", "}
                    <input
                        type="text"
                        placeholder="United States"
                        className="field-sizing-content bg-primary-foreground rounded-r-md border-none group-hover:bg-muted shadow-none outline-none text-xs focus:bg-muted focus:border-muted duration-200 py-0.5"
                        value={data?.country || ""}
                        id="country"
                        name="country"
                        onChange={(e) => handleChangeContent(e, index)}
                    />
                </li>
            </ul>
            <ul className="flex gap-3">
                {data?.links?.length > 0 &&
                    data.links.map((link, subIndex) => (
                        <li key={subIndex} className="flex items-center">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <div className="text-base">{link?.icon ? linkIcons.find((icon) => icon.name === link.icon)?.icon : <PiLink />}</div>
                                        <div>{link?.name || "Your link"}</div>
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-2 relative">
                                    <div className="flex gap-2 flex-col">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button size="icon" variant="secondary" className="aspect-square text-lg border">
                                                    {link?.icon ? linkIcons.find((icon) => icon.name === link.icon)?.icon : <PiLink />}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent side="right" className="w-full p-2">
                                                <div className="grid grid-cols-4 gap-2">
                                                    {linkIcons.map((icon) => (
                                                        <Button
                                                            value={icon?.name || ""}
                                                            name="icon"
                                                            onClick={(e) => handleChangeSubContent(e as unknown as Parameters<HandleChangeSubContentType>[0], "links", index, subIndex)}
                                                            size="icon"
                                                            variant="secondary"
                                                            className={`text-xl  ${icon.name === link.icon ? "" : ""} aspect-square`}
                                                            key={icon.name}>
                                                            {icon.icon}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                        <Input
                                            className="h-8 bg-muted placeholder-muted outline-none"
                                            id="name"
                                            type="text"
                                            name="name"
                                            placeholder="my portfolio, etc"
                                            value={link?.name || ""}
                                            onChange={(e) => handleChangeSubContent(e, "links", index, subIndex)}
                                        />
                                        <Input
                                            className="h-8 bg-muted placeholder-muted outline-none"
                                            id="url"
                                            type="text"
                                            name="url"
                                            placeholder="https://example.com"
                                            value={link?.url || ""}
                                            onChange={(e) => handleChangeSubContent(e, "links", index, subIndex)}
                                        />
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="aspect-square absolute -top-2 -right-2 h-6 w-6"
                                            onClick={() => handleDeleteSubContent("links", index, subIndex)}>
                                            <PiTrash />
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </li>
                    ))}

                <Button
                    onClick={() => handleAddMultipleInput("links", index)}
                    variant="outline"
                    className="w-4 h-4 group-hover:flex hidden items-center justify-center aspect-square p-0 ronded-sm">
                    +
                </Button>
            </ul>

            <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 duration-200">
                <Button size="icon" variant="outline" className="w-6 h-6" onClick={() => handleDeleteContent(index)}>
                    <PiTrash />
                </Button>
            </div>

            <ResumeDrawer
                title="Header"
                description="Make changes to your data here. Simply exit and your data will stay"
                trigger={
                    <div className="absolute opacity-0 group-hover:opacity-100 duration-200 top-1 right-1">
                        <Button size="icon" variant="outline" className="w-6 h-6">
                            <PiPencil />
                        </Button>
                    </div>
                }>
                <HeaderForm
                    data={data}
                    index={index}
                    handleChangeContent={handleChangeContent}
                    handleChangeSubContent={handleChangeSubContent}
                    handleAddMultipleInput={handleAddMultipleInput}
                    handleDeleteSubContent={handleDeleteSubContent}
                />
            </ResumeDrawer>
        </header>
    )
}
