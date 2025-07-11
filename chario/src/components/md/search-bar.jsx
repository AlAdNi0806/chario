'use client'
import React from 'react'
import { Button } from '../ui/button'
import { SearchIcon } from 'lucide-react'
import { Input } from '../ui/input'

function SearchBar({ search, setSearch, submitSearch }) {
    const inputRef = React.useRef(null);
    return (
        <form
            onSubmit={submitSearch}
            onClick={() => inputRef.current.focus()}
            className='cursor-text p-0.5 rounded-full w-full max-w-[600px] flex items-center justify-between  ring-1 ring-card-foreground/10 bg-card transition-all duration-200 hover:ring-2 hover:ring-card-foreground/10'
        >
            <input
                ref={inputRef}
                type='text'
                className='bg-transparent outline-none pl-5 w-full'
                placeholder='Search for a charity'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <button
                className='bg-transparent text-primary rounded-full mr-1 ml-2 cursor-pointer cursor-pointer p-3 hover:bg-primary/30'
                onClick={submitSearch}
            >
                <SearchIcon size={22} />
            </button>
        </form>
    )
}

export default SearchBar