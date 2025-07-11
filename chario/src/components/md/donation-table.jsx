'use client';

import * as React from 'react';
import {
    CaretSortIcon,
    ChevronDownIcon,
    DotsHorizontalIcon,
} from '@radix-ui/react-icons';
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { maskId } from '@/lib/hashing';
import { toast } from 'sonner';

// Utility function to get date ranges (same as used by DonationCharts)
function getDateRangeForTable(timeRange) {
    const now = new Date();
    let startDate = new Date(now);
    let endDate = new Date(now);

    startDate.setHours(0, 0, 0, 0); // Start of current day
    endDate.setHours(23, 59, 59, 999); // End of current day

    switch (timeRange) {
        case 'yesterday':
            startDate.setDate(startDate.getDate() - 1);
            endDate.setDate(endDate.getDate() - 1);
            break;
        case 'thisWeek':
            const dayOfWeek = (startDate.getDay() + 6) % 7; // Monday = 0, Sunday = 6
            startDate.setDate(startDate.getDate() - dayOfWeek);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'thisMonth':
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setMonth(startDate.getMonth() + 1);
            endDate.setDate(0); // Last day of the previous month (which is the current month)
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'thisYear':
            startDate.setMonth(0, 1); // January 1st
            startDate.setHours(0, 0, 0, 0);
            endDate.setMonth(11, 31); // December 31st
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'allTime':
            startDate = new Date(0); // Epoch, effectively beginning of time
            endDate = new Date();
            endDate.setFullYear(endDate.getFullYear() + 100); // Far future
            break;
        // 'today' is handled by default initialization
    }
    return { startDate, endDate };
}

function useClipboard() {
    const [copied, setCopied] = React.useState(false);

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Copied to clipboard');
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 1000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return { copied, copyToClipboard };
}

// Define your table columns
// The crucial change is accessorKey: 'charity.title'
export const columns = [
    {
        accessorKey: 'charity.title', // Accesses the title property within the nested charity object
        header: ({ column }) => (
            <Button
                variant="ghost"
                className='cursor-pointer'
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
                Charity Name
                <CaretSortIcon className="ml-2 h-4 w-4" />
            </Button>
        ),
        // Render the charity title, with a fallback if it's missing
        cell: ({ row }) => <div className="capitalize">{row.original.charity?.title || 'N/A'}</div>,
        filterFn: 'includesString', // Essential for string-based searching on this column
    },
    {
        accessorKey: 'amountEth',
        header: ({ column }) => (
            <Button
                variant="ghost"
                className='cursor-pointer'
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
                Amount (ETH)
                <CaretSortIcon className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('amountEth'));
            const formatted = new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6,
            }).format(amount);
            return <div className="font-medium">{formatted}</div>;
        },
    },
    {
        accessorKey: 'createdAt',
        header: ({ column }) => (
            <Button
                variant="ghost"
                className='cursor-pointer'
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
                Date
                <CaretSortIcon className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const date = new Date(row.getValue('createdAt'));
            // Format date for display
            return <div className="text-left">{date.toLocaleDateString()} {date.toLocaleTimeString()}</div>;
        },
    },
    {
        id: 'actions',
        enableHiding: false, // Prevents this column from being hidden by the user
        cell: ({ row }) => {
            const donation = row.original;
            const { copyToClipboard, copied } = useClipboard();

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                            <span className="sr-only">Open menu</span>
                            <DotsHorizontalIcon className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {/* <DropdownMenuLabel>Actions</DropdownMenuLabel> */}
                        <DropdownMenuItem
                            className='cursor-pointer'
                            onClick={() => copyToClipboard(donation?.txHash)}
                        >
                            Copy Transaction Hash
                        </DropdownMenuItem>
                        {/* Add more actions, e.g., navigate to charity page */}
                        <Link
                            target='_blank'
                            href={`https://sepolia.etherscan.io/tx/${donation?.txHash}`}
                            className='cursor-pointer'
                        >
                            <DropdownMenuItem
                                className='cursor-pointer'
                            >
                                View Charity
                            </DropdownMenuItem>
                        </Link>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export function DonationsTable({ donations: rawDonations }) {
    const [donations, setDonations] = React.useState([]);
    const [sorting, setSorting] = React.useState([]);
    const [columnFilters, setColumnFilters] = React.useState([]);
    const [columnVisibility, setColumnVisibility] = React.useState({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [timeFilter, setTimeFilter] = React.useState('allTime'); // State for date range filtering

    React.useEffect(() => {
        if (rawDonations) {
            // Parse raw JSON string and ensure createdAt is a Date object
            const parsedDonations = rawDonations.map(d => ({
                ...d,
                createdAt: new Date(d.createdAt)
            }));
            setDonations(parsedDonations);
        }
    }, [rawDonations]);

    // Memoized filtered data based on the selected time range
    const filteredDonations = React.useMemo(() => {
        if (!donations || donations.length === 0) return [];

        const { startDate, endDate } = getDateRangeForTable(timeFilter);

        if (timeFilter === 'allTime') {
            return donations;
        }

        return donations.filter(donation => {
            const createdAt = new Date(donation.createdAt);
            return createdAt >= startDate && createdAt <= endDate;
        });
    }, [donations, timeFilter]);

    // Initialize the react-table instance
    const table = useReactTable({
        data: filteredDonations, // Use the time-filtered data as the source
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    return (
        <div className="w-full">
            <div className="flex items-center py-4 gap-2">
                {/* <Input
                    placeholder="Search by charity name..."
                    // Corrected: Ensure the value is always a string for the controlled input
                    value={(table.getColumn('charity.title')?.getFilterValue()) ?? ''}
                    onChange={(event) =>
                        table.getColumn('charity.title')?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                /> */}
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by date" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="allTime">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="yesterday">Yesterday</SelectItem>
                        <SelectItem value="thisWeek">This Week</SelectItem>
                        <SelectItem value="thisMonth">This Month</SelectItem>
                        <SelectItem value="thisYear">This Year</SelectItem>
                    </SelectContent>
                </Select>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {/* Display a more user-friendly name for the charity column */}
                                        {column.id === 'charity.title' ? 'Charity Name' : column.id}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredRowModel().rows.length} total donations.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}