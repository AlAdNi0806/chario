'use client'

import React from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// interface ActionTooltipProps {
//     label: String;
//     children: React.ReactNode;  
//     side?: "top" | "right" | "bottom" | "left";
//     align?: "start" | "center" | "end";
// }

const ActionTooltip = ({
    children,
    label,
    side = "right",
    align = "center",
    triggerClassName,
    contentClassname
}) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger
                    className={triggerClassName}
                >
                    {children}
                </TooltipTrigger>
                <TooltipContent
                    side={side}
                    align={align}
                    className={contentClassname}
                >
                    <p className='font-semibold text-sm capitalize'>
                        {label?.toLowerCase()}
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

export default ActionTooltip