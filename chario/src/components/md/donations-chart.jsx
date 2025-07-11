"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
// Ensure this path is correct for your project
import { getChartDataForTimeRange } from "@/lib/chart-data-processing"

export const description = "Donations over time"

// --- Chart Configuration ---
const chartConfig = {
    totalDonationsEth: {
        label: "Donations (ETH)",
        color: "hsl(var(--chart-1))", // Using a CSS variable for consistent theming
    },
};

export function DonationCharts({ donations }) { // Removed targetDay prop as timeRange handles it
    const [timeRange, setTimeRange] = React.useState("today");

    // Process the donations whenever `donations` or `timeRange` changes
    const processedChartData = React.useMemo(() => {
        if (!donations || donations.length === 0) return [];

        // Important: Convert `createdAt` strings to Date objects if they are not already.
        const donationsWithDates = donations.map(d => ({
            ...d,
            createdAt: new Date(d.createdAt)
        }));

        return getChartDataForTimeRange(donationsWithDates, timeRange);
    }, [donations, timeRange]);

    // Dynamic description for the card title
    const chartDescription = React.useMemo(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.toLocaleString('default', { month: 'long' });

        switch (timeRange) {
            case 'today':
                return `Showing total ETH donated for ${today.toLocaleDateString()} in 30-minute periods.`;
            case 'yesterday':
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                return `Showing total ETH donated for ${yesterday.toLocaleDateString()} in 30-minute periods.`;
            case 'thisWeek':
                // Calculate the first day of the current week (Monday)
                const startOfWeek = new Date(today);
                const dayOfWeek = (startOfWeek.getDay() + 6) % 7; // Adjust to make Monday 0
                startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
                startOfWeek.setHours(0, 0, 0, 0);
                // Calculate the last day of the current week (Sunday)
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                endOfWeek.setHours(23, 59, 59, 999);
                return `Showing total ETH donated per day from ${startOfWeek.toLocaleDateString()} to ${endOfWeek.toLocaleDateString()}.`;
            case 'thisMonth':
                return `Showing total ETH donated per day for ${month} ${year}.`;
            case 'thisYear':
                return `Showing total ETH donated per month for the year ${year}.`;
            default:
                return `Showing total ETH donated for the selected period.`;
        }
    }, [timeRange]);

    // Dynamic X-Axis formatter based on timeRange for different granularities
    const xAxisTickFormatter = (value) => {
        if (timeRange === 'today' || timeRange === 'yesterday') {
            return value; // "HH:MM"
        } else if (timeRange === 'thisWeek' || timeRange === 'thisMonth') {
            const date = new Date(value); // value is YYYY-MM-DD
            return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        } else if (timeRange === 'thisYear') {
            const date = new Date(value + '-01'); // value is YYYY-MM, append '-01' for valid date
            return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        }
        return value;
    };

    // Dynamic X-Axis minTickGap to avoid crowded labels for daily/monthly views
    const xAxisMinTickGap = React.useMemo(() => {
        if (timeRange === 'today' || timeRange === 'yesterday') {
            return 32; // More space for 30-min intervals
        }
        return 1; // Less space needed for daily/monthly aggregation
    }, [timeRange]);

    return (
        <Card className="pt-0 bg-card/50">
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1">
                    <CardTitle>Donations Activity</CardTitle> {/* Removed fixed "30-min intervals" */}
                    <CardDescription>{chartDescription}</CardDescription>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger
                        className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
                        aria-label="Select time range"
                    >
                        <SelectValue placeholder="Select Time Range" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="today" className="rounded-lg">
                            Today
                        </SelectItem>
                        <SelectItem value="yesterday" className="rounded-lg">
                            Yesterday
                        </SelectItem>
                        <SelectItem value="thisWeek" className="rounded-lg">
                            This Week
                        </SelectItem>
                        <SelectItem value="thisMonth" className="rounded-lg">
                            This Month
                        </SelectItem>
                        <SelectItem value="thisYear" className="rounded-lg">
                            This Year
                        </SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <AreaChart data={processedChartData}>
                        <defs>
                            <linearGradient id="fillTotalDonationsEth" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--chart-1)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--chart-1)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>

                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="time"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={xAxisMinTickGap} // Dynamic gap
                            tickFormatter={xAxisTickFormatter} // Dynamic formatter
                        />
                        <YAxis
                            dataKey="totalDonationsEth"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.toFixed(2)}
                            label={{
                                value: 'ETH',
                                angle: -90,
                                position: 'insideLeft',
                                // offset: -5,
                                style: { textAnchor: 'middle' },
                            }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    className='bg-card ring-1 ring-border'
                                    labelFormatter={(value) => {
                                        if (timeRange === 'today' || timeRange === 'yesterday') {
                                            return `Time: ${value}`; // HH:MM
                                        } else if (timeRange === 'thisWeek' || timeRange === 'thisMonth') {
                                            const date = new Date(value); // YYYY-MM-DD
                                            return `Date: ${date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`;
                                        } else if (timeRange === 'thisYear') {
                                            const date = new Date(value + '-01'); // value is YYYY-MM, append -01 for valid date
                                            return `Month: ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
                                        }
                                        return value;
                                    }}
                                    indicator="dot"
                                />
                            }
                        />
                        <Area
                            dataKey="totalDonationsEth"
                            type="monotone"
                            fill="url(#fillTotalDonationsEth)" // Reference the new gradient ID
                            stroke="oklch(0.9245 0.0533 67.0855)" // Use the chart-1 color for the stroke
                            stackId="a"
                            fillOpacity={1} // Fill opacity can be 1 since gradient handles transparency
                        />
                        {/* <Area
                            dataKey="totalDonationsEth"
                            type="monotone"
                            fill="url(#fillTotalDonationsEth)" // Reference the gradient ID
                            stroke="hsl(var(--chart-1))" // Use chart-1 color for stroke consistency
                            stackId="a"
                            fillOpacity={1}
                            dot={{
                                stroke: 'hsl(var(--chart-1))', // Dot border color matches line
                                strokeWidth: 2,
                                fill: 'hsl(var(--background))', // Dot fill color (e.g., your card background)
                                r: 3, // Dot radius
                            }}
                        /> */}
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}