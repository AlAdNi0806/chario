// src/lib/chart-data-processing.js

/**
 * Calculates the start and end dates for a given time range.
 * @param {string} timeRange - The time range (e.g., "today", "yesterday", "thisWeek", "thisMonth", "thisYear").
 * @returns {{startDate: Date, endDate: Date}} - Object with start and end Date objects.
 */
function getDateRange(timeRange) {
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
            // Get Monday of the current week (assuming Monday is the first day of the week)
            const dayOfWeek = (startDate.getDay() + 6) % 7; // Adjust to make Monday 0, Sunday 6
            startDate.setDate(startDate.getDate() - dayOfWeek);
            startDate.setHours(0, 0, 0, 0); // Ensure start of the day
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6); // End of Sunday
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'thisMonth':
            startDate.setDate(1); // First day of current month
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setMonth(startDate.getMonth() + 1);
            endDate.setDate(0); // Last day of current month
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'thisYear':
            startDate.setMonth(0, 1); // January 1st of current year
            startDate.setHours(0, 0, 0, 0);
            endDate.setMonth(11, 31); // December 31st of current year
            endDate.setHours(23, 59, 59, 999);
            break;
        // 'today' is handled by default initialization
    }
    return { startDate, endDate };
}

/**
 * Processes an array of donations into chart data based on the specified time range.
 * @param {Array<Object>} donations An array of donation objects, each with `createdAt` (Date) and `amountEth` (Decimal/String).
 * @param {string} timeRange - The desired time range for aggregation (e.g., "today", "yesterday", "thisWeek", "thisMonth", "thisYear").
 * @returns {Array<Object>} An array of objects suitable for Recharts, with aggregated totals.
 */
export function getChartDataForTimeRange(donations, timeRange) {
    const { startDate, endDate } = getDateRange(timeRange);

    // Filter donations to only include those within the calculated date range
    const filteredDonations = donations.filter(donation => {
        const createdAt = new Date(donation.createdAt); // Ensure it's a Date object
        return createdAt >= startDate && createdAt <= endDate;
    });

    const dataMap = new Map(); // Map<key, totalEth>
    let initialDataPoints = []; // To ensure all periods are represented, even with no data
    let formatKey = (date) => date.toISOString(); // Default key formatter

    // Determine aggregation granularity based on timeRange
    if (timeRange === 'today' || timeRange === 'yesterday') {
        // 30-minute intervals
        const dayStart = new Date(startDate);
        dayStart.setHours(0, 0, 0, 0);

        for (let i = 0; i < 24 * 2; i++) { // 48 intervals in a day (24 hours * 2 per half hour)
            const currentTime = new Date(dayStart.getTime() + i * 30 * 60 * 1000);
            const hours = currentTime.getHours().toString().padStart(2, '0');
            const minutes = currentTime.getMinutes().toString().padStart(2, '0');
            const timeKey = `${hours}:${minutes}`;
            initialDataPoints.push({ time: timeKey, totalDonationsEth: 0 });
            dataMap.set(timeKey, 0);
        }
        formatKey = (date) => {
            let minutes = date.getMinutes();
            if (minutes >= 30) minutes = 30;
            else minutes = 0;
            return `${date.getHours().toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        };
    } else if (timeRange === 'thisWeek' || timeRange === 'thisMonth') {
        // Daily aggregation
        let currentDay = new Date(startDate);
        while (currentDay <= endDate) {
            const dateKey = currentDay.toISOString().split('T')[0]; // YYYY-MM-DD
            initialDataPoints.push({ time: dateKey, totalDonationsEth: 0 });
            dataMap.set(dateKey, 0);
            currentDay.setDate(currentDay.getDate() + 1);
            currentDay.setHours(0, 0, 0, 0); // Reset hours to avoid daylight saving issues
        }
        formatKey = (date) => date.toISOString().split('T')[0]; // YYYY-MM-DD
    } else if (timeRange === 'thisYear') {
        // Monthly aggregation
        let currentMonth = new Date(startDate);
        currentMonth.setDate(1); // Ensure it starts at the first of the month
        currentMonth.setHours(0, 0, 0, 0);

        while (currentMonth <= endDate) {
            const monthKey = currentMonth.toISOString().substring(0, 7); // YYYY-MM
            initialDataPoints.push({ time: monthKey, totalDonationsEth: 0 });
            dataMap.set(monthKey, 0);
            currentMonth.setMonth(currentMonth.getMonth() + 1);
            // If we cross into the next year, ensure it stays within the current year's months
            if (currentMonth.getFullYear() > endDate.getFullYear() && currentMonth.getMonth() > endDate.getMonth()) break;
        }
        formatKey = (date) => date.toISOString().substring(0, 7); // YYYY-MM
    }

    // Aggregate donations into the data map
    for (const donation of filteredDonations) {
        const createdAt = new Date(donation.createdAt);
        const key = formatKey(createdAt);

        const currentTotal = dataMap.get(key) || 0;

        let donationAmount;
        // Handle Decimal type from Prisma or string conversion
        if (typeof donation.amountEth === 'object' && donation.amountEth !== null && donation.amountEth.constructor && donation.amountEth.constructor.name === 'Decimal') {
            donationAmount = donation.amountEth.toNumber();
        } else if (typeof donation.amountEth === 'string') {
            donationAmount = parseFloat(donation.amountEth);
        } else {
            donationAmount = donation.amountEth; // Assume it's already a number
        }

        dataMap.set(key, currentTotal + donationAmount);
    }

    // Convert the map to an array of objects and ensure all initial points are included
    const chartData = initialDataPoints.map(item => ({
        ...item,
        totalDonationsEth: dataMap.get(item.time) || 0 // Use aggregated value or default to 0
    }));

    // Sort the data by time key
    chartData.sort((a, b) => {
        if (timeRange === 'today' || timeRange === 'yesterday') {
            const [hA, mA] = a.time.split(':').map(Number);
            const [hB, mB] = b.time.split(':').map(Number);
            return (hA * 60 + mA) - (hB * 60 + mB);
        } else {
            // Lexicographical sort works for YYYY-MM-DD and YYYY-MM
            return a.time.localeCompare(b.time);
        }
    });

    return chartData;
}