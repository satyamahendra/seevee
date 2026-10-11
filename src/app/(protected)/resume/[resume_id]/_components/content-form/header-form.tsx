import React from "react"
import {HandleAddMultipleInputType, HandleChangeContentType, HandleChangeSubContentType, HandleDeleteSubContentType, HeaderContentType} from "../../_static/type"
import {Label} from "@/components/ui/label"
import {Input} from "@/components/ui/input"
import {PiLink, PiPlus, PiTrash} from "react-icons/pi"
import {Button} from "@/components/ui/button"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {linkIcons} from "@/utils/constants/linkIcons"
import {createFallbackKey} from "@/utils/helpers/createFallbackKey"

type HeaderFormProps = {
    data: HeaderContentType
    index: number
    handleChangeContent: HandleChangeContentType
    handleChangeSubContent: HandleChangeSubContentType
    handleAddMultipleInput: HandleAddMultipleInputType
    handleDeleteSubContent: HandleDeleteSubContentType
}

export default function HeaderForm({data, index, handleChangeContent, handleChangeSubContent, handleAddMultipleInput, handleDeleteSubContent}: HeaderFormProps) {
    return (
        <div className="space-y-2">
            <div>
                <Label htmlFor="fullname" className="text-muted-foreground text-xs">
                    Full Name
                </Label>
                <Input
                    className="h-8 bg-muted placeholder-muted outline-none"
                    id="fullname"
                    type="text"
                    name="fullname"
                    placeholder="John Doe"
                    value={data?.fullname || ""}
                    onChange={(e) => handleChangeContent(e, index)}
                />
            </div>
            <div>
                <Label htmlFor="city" className="text-muted-foreground text-xs">
                    City
                </Label>
                <Input
                    className="h-8 bg-muted placeholder-muted outline-none"
                    id="city"
                    type="text"
                    name="city"
                    placeholder="Arizona"
                    value={data?.city || ""}
                    onChange={(e) => handleChangeContent(e, index)}
                />
            </div>
            <div>
                <Label htmlFor="country" className="text-muted-foreground text-xs">
                    Country
                </Label>
                <Input
                    className="h-8 bg-muted placeholder-muted outline-none"
                    id="country"
                    type="text"
                    name="country"
                    placeholder="America"
                    value={data?.country || ""}
                    onChange={(e) => handleChangeContent(e, index)}
                />
            </div>
            <div>
                <Label htmlFor="email" className="text-muted-foreground text-xs">
                    Email
                </Label>
                <Input
                    className="h-8 bg-muted placeholder-muted outline-none"
                    id="email"
                    type="email"
                    name="email"
                    placeholder="john@doe.com"
                    value={data?.email || ""}
                    onChange={(e) => handleChangeContent(e, index)}
                />
            </div>
            <div>
                <Label htmlFor="phone" className="text-muted-foreground text-xs">
                    Phone
                </Label>
                <Input
                    className="h-8 bg-muted placeholder-muted outline-none"
                    id="phone"
                    type="text"
                    name="phone"
                    placeholder="08123456789"
                    value={data?.phone || ""}
                    onChange={(e) => handleChangeContent(e, index)}
                />
            </div>
            {data?.links?.length > 0 &&
                data.links.map((link, subIndex) => {
                    const fallBackKey = createFallbackKey()
                    return (
                        <div key={link?.id ?? fallBackKey}>
                            <Label htmlFor="link" className="text-muted-foreground text-xs">
                                Link #{subIndex + 1}
                            </Label>
                            <div className="flex items-center gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button size="sm" variant="secondary" className="aspect-square text-lg">
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
                                    id="url"
                                    type="text"
                                    name="url"
                                    placeholder="https://example.com"
                                    value={link?.url || ""}
                                    onChange={(e) => handleChangeSubContent(e, "links", index, subIndex)}
                                />
                                <Input
                                    className="h-8 bg-muted placeholder-muted outline-none"
                                    id="name"
                                    type="text"
                                    name="name"
                                    placeholder="my portfolio, etc"
                                    value={link?.name || ""}
                                    onChange={(e) => handleChangeSubContent(e, "links", index, subIndex)}
                                />
                                <Button size="sm" variant="outline" className="aspect-square" onClick={() => handleDeleteSubContent("links", index, subIndex)}>
                                    <PiTrash />
                                </Button>
                            </div>
                        </div>
                    )
                })}
            <div className="flex justify-center">
                <Button onClick={() => handleAddMultipleInput("links", index)} size="sm" variant="ghost">
                    <PiPlus />
                    Add Link
                </Button>
            </div>
        </div>
    )
}
