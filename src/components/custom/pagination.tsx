"use client"

import React from "react"
import {Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious} from "@/components/ui/pagination"
import {useUpdateSearchParams} from "@/utils/hooks/useUpSearchParams"
import {useSearchParams} from "next/navigation"

type MetadataType = {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
}

type PaginationProps = {
    metadata: MetadataType
}

export default function PaginationComponent({metadata}: PaginationProps) {
    const {setParam, removeParam} = useUpdateSearchParams()
    const currSearchParams = useSearchParams()

    const handlePageChange = (page: number) => {
        if (page <= 1) {
            removeParam("page")
        } else {
            setParam("page", page.toString())
        }
    }

    const currentPageParam = currSearchParams.get("page")
    const currentPage = currentPageParam ? parseInt(currentPageParam) : 1

    return (
        <Pagination className="flex justify-center items-center ">
            <PaginationContent>
                <PaginationItem
                    className="cursor-pointer"
                    onClick={() => {
                        if (!metadata.hasPrevPage) return
                        handlePageChange(Number(metadata.page) - 1)
                    }}>
                    <PaginationPrevious />
                </PaginationItem>

                {Array.from({length: metadata.totalPages}).map((_, i) => {
                    const pageNumber = i + 1
                    const isActive = currentPage === pageNumber

                    return (
                        <PaginationItem key={pageNumber} onClick={() => handlePageChange(pageNumber)}>
                            <PaginationLink href="#" isActive={isActive}>
                                {pageNumber}
                            </PaginationLink>
                        </PaginationItem>
                    )
                })}

                <PaginationItem
                    className="cursor-pointer"
                    onClick={() => {
                        if (!metadata.hasNextPage) return
                        handlePageChange(Number(metadata.page) + 1)
                    }}>
                    <PaginationNext />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}
