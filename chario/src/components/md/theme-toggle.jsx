'use client'

import { useTheme } from 'next-themes'
import React from 'react'
import { useId } from "react"
import Image from 'next/image' // Import the Image component

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import lightThemeImage from "../../../public/ui-light.png"
import darkThemeImage from "../../../public/ui-dark.png"
import systemThemeImage from "../../../public/ui-system.png"
import { CheckIcon, MinusIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
    { value: "light", image: lightThemeImage },
    { value: "dark", image: darkThemeImage },
    { value: "system", image: systemThemeImage },
]

function ThemeToggle() {

    const { theme, setTheme } = useTheme()

    const id = useId()

    return (
        <fieldset className="space-y-4">
            <RadioGroup className="flex gap-3" defaultValue="1" value={theme} onValueChange={setTheme}>
                {items.map((item) => (
                    <label key={`${id}-${item.value}`}>
                        <RadioGroupItem
                            id={`${id}-${item.value}`}
                            value={item.value}
                            className="peer sr-only after:absolute after:inset-0"
                        />
                        <Image // Use the Image component
                            src={item.image}
                            alt={item.value}
                            width={88}
                            height={70}
                            className={cn(
                                "border-input peer-focus-visible:ring-ring/50 border-2  peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-accent relative cursor-pointer overflow-hidden rounded-md shadow-xs transition-[color,box-shadow] outline-none peer-focus-visible:ring-[3px] peer-data-disabled:cursor-not-allowed peer-data-disabled:opacity-50"

                            )}
                        />
                        <span className="group peer-data-[state=unchecked]:text-muted-foreground/70 mt-2 flex items-center gap-1">
                            <CheckIcon
                                size={16}
                                className="group-peer-data-[state=unchecked]:hidden"
                                aria-hidden="true"
                            />
                            <MinusIcon
                                size={16}
                                className="group-peer-data-[state=checked]:hidden"
                                aria-hidden="true"
                            />
                            <span className="text-xs font-medium">{item.value}</span>
                        </span>
                    </label>
                ))}
            </RadioGroup>
        </fieldset>
    )
}

export default ThemeToggle
