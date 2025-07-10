import React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';

const CardWrapper = ({
    children,
    cardTitle,
    cardDescription,
    cardFooterLinkTitle = 'Learn More', // Default value
    cardFooterDescription = '',
    cardFooterLink,
    className = '',
}) => {
    return (
        <Card className={`w-[400px] relative ${className}`}>
            <CardHeader className="flex flex-col items-center justify-center">
                <CardTitle className="text-lg text-center">{cardTitle}</CardTitle>
                <CardDescription className="text-center text-xs">{cardDescription}</CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
            {cardFooterLink && (
                <CardFooter className="flex items-center justify-center gap-x-1 text-sm">
                    {cardFooterDescription && <span className="text-foreground">{cardFooterDescription}</span>}
                    <Link href={cardFooterLink} className="font-semibold hover:underline">
                        {cardFooterLinkTitle}
                    </Link>
                </CardFooter>
            )}
        </Card>
    );
};

export default CardWrapper;
