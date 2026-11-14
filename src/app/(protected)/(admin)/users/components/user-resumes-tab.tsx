"use client"

import {useQuery} from "@tanstack/react-query"
import {format} from "date-fns"
import {Loader2} from "lucide-react"
import {PiArrowSquareOut, PiFile} from "react-icons/pi"
import ListItem from "@/components/custom/item"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty"
import {getUserResumes} from "../services/get-user-resumes"

const UserResumesTab = ({userId}: {userId: string}) => {
    const {data, isLoading} = useQuery({queryKey: ["user", userId, "resumes"], queryFn: () => getUserResumes(userId)})

    if (isLoading)
        return (
            <div className="flex h-20 items-center justify-center">
                <Loader2 className="animate-spin text-primary" />
            </div>
        )

    if (!data?.success || data.data.length === 0)
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <PiFile />
                    </EmptyMedia>
                    <EmptyTitle>{data?.success ? "No resumes yet" : "Failed to load resumes"}</EmptyTitle>
                    <EmptyDescription>{data?.success ? "This user hasn't created a resume." : data?.message}</EmptyDescription>
                </EmptyHeader>
            </Empty>
        )

    return (
        <div className="flex flex-col overflow-hidden rounded-xl border border-border">
            {data.data.map((resume) => {
                const path = `/${resume.short_id}`
                return (
                    <ListItem
                        key={resume.id}
                        className="last:border-b-0"
                        media={
                            <div className="mr-3 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-lg text-muted-foreground">
                                <PiFile />
                            </div>
                        }
                        title={<span className="font-mono text-xs">{path}</span>}
                        description={
                            <div className="flex flex-col items-start gap-1.5">
                                <span className="text-xs">Updated {format(resume.updatedAt, "dd MMM yyyy, HH:mm")}</span>
                                <Badge variant={resume.isPublic ? "default" : "outline"}>{resume.isPublic ? "Public" : "Private"}</Badge>
                            </div>
                        }
                        actions={
                            <Button asChild aria-label="Open resume" className="rounded-lg" size="icon-sm" variant="ghost">
                                <a href={path} target="_blank" rel="noopener noreferrer">
                                    <PiArrowSquareOut />
                                </a>
                            </Button>
                        }
                    />
                )
            })}
        </div>
    )
}

export default UserResumesTab
