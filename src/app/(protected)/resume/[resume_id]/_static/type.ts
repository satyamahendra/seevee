import {ChangeEvent, Dispatch, SetStateAction} from "react"

// states type
export type ContentStatesType = {
    content: ContentStateType[]
    setContent: Dispatch<SetStateAction<ContentStateType[]>>
}

export type FontStylesType = "default" | "sans" | "mono" | "serif"
export type SettingsStatesType = {
    selectedFontStyle: FontStylesType
    setSelectedFontStyle: Dispatch<SetStateAction<FontStylesType>>
}

// HEADER
export type LinkType = {
    id: string
    icon?: string
    name: string
    url: string
}
export type HeaderContentType = {
    id: string
    type: "header"
    fullname: string
    city: string
    country: string
    email: string
    phone: string
    links: LinkType[]
}

// SKILL

export type SkillType = {
    id: string
    name: string
    items: string[]
}

export type SkillContentType = {
    id: string
    type: "skill"
    skill: SkillType[]
}

// SUMMARY

export type SummaryContentType = {
    id: string
    type: "summary"
    text: string
}

// GENERAL

export type GeneralType = {
    id: string
    title: string
    subtitle: string
    description: string
    bulletpoints: string[]
    tags: string[]
    city: string
    country: string
    startDate: string
    endDate: string
    links: LinkType[]
}

export type GeneralContentType = {
    id: string
    type: "general"
    title: string
    general: GeneralType[]
}

export type GeneralArrayKeys = Extract<keyof GeneralType, "bulletpoints" | "tags">

export type ContentStateType = HeaderContentType | SkillContentType | SummaryContentType | GeneralContentType

export type ContentType = "header" | "summary" | "skill" | "general" | "project" | "professional"
export type MultipleInputType = "skill" | "links" | "general"
export type MultipleInputInitialType = SkillType | LinkType | GeneralType

// FUNCTIONS

export type HandleDeleteContentType = (index: number) => void
export type HandleChangeContentType = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => void
export type HandleAddContentType = (type: ContentType, title?: string) => void
export type HandleAddMultipleInputType = (type: MultipleInputType, index: number, nestedIndex?: number) => void
export type HandleChangeSubContentType = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, type: MultipleInputType, index: number, subIndex: number) => void
export type HandleDeleteSubContentType = (type: MultipleInputType, index: number, subIndex: number) => void
export type HandleDirectEditContentType = (newData: ContentStateType, index: number) => void
