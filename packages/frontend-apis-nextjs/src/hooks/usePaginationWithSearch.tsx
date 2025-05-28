import { useEffect, useState } from 'react'

const DEFAULT_DEBOUNCE_MS = 500

export type UsePaginationWithSearchProps = {
    debounceMs?: number
}

export const usePaginationWithSearch = ({ debounceMs = DEFAULT_DEBOUNCE_MS }: UsePaginationWithSearchProps) => {
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [page, setPage] = useState(0)

    // Debounce search input.
    useEffect(() => {
        const delayInputTimeoutId = setTimeout(() => {
            setDebouncedSearch(search)
        }, debounceMs)
        return () => clearTimeout(delayInputTimeoutId)
    }, [search])

    // Reset page to first page when search changes.
    useEffect(() => {
        setPage(0)
    }, [search])

    const nextPage = () => {
        setPage((prev) => prev + 1)
    }

    const previousPage = () => {
        setPage((prev) => prev - 1)
    }

    return { search, setSearch, debouncedSearch, page, nextPage, previousPage }
}
