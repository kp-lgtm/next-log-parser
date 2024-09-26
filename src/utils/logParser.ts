import fs from 'fs/promises';
import logger from '../logger/logger';

export async function parseLog(filePath: string) {
    // Reading the entire log file into memory is the fastest
    // way to parse log files of the size that we're dealing with
    // due to the relatively small size of the log files.

    // A more memory efficient approach would be to read the file
    // line by line, but this would be slower for the size of log
    const logData = await fs.readFile(filePath, 'utf-8');
    const logLines = logData.split('\n');

    const totalLogCount = logLines.length;
    const uniqueIPs: Set<string> = new Set();
    const urlVisits: Map<string, number> = new Map();
    const ipActivity: Map<string, number> = new Map();
    let invalidLogCount = 0;
    const errorThreshold = 0.1; // 10%)

    logLines.forEach((line, i) => {
        const logLineChunkArr = line.split(' ');
        const ip = logLineChunkArr[0];
        const url = logLineChunkArr[6];
        const request = logLineChunkArr.slice(5, 8).join(' ');

        if (isValidIPv4(ip) && isValidHTTPRequest(request)) {
            uniqueIPs.add(ip);
            urlVisits.set(url, (urlVisits.get(url) || 0) + 1);
            ipActivity.set(ip, (ipActivity.get(ip) || 0) + 1);
        } else {
            // Increment invalid log counter if log format doesn't match and
            // ignore empty lines
            if (!!line[0]) {
                invalidLogCount++;
                logger.error(`Invalid log format on line ${i + 1}: ${line}`);
            }
        }
    });

    if (invalidLogCount / totalLogCount > errorThreshold) {
        throw new Error('Log file contains too many invalid entries');
    }

    const groupedUrls = groupByVisitCount(urlVisits);

    const groupedIPs = groupByVisitCount(ipActivity);

    return {
        uniqueIPCount: uniqueIPs.size,
        groupedUrls: limitGroupEntries(groupedUrls),
        groupedIPs: limitGroupEntries(groupedIPs),
        invalidLogCount,
    };
}

// Helper function to group URLs or IPs by visit count
export function groupByVisitCount(visits: Map<string, number>) {
    const visitGroups: Map<number, string[]> = new Map();

    visits.forEach((count, url) => {
        if (!visitGroups.has(count)) {
            visitGroups.set(count, []);
        }
        visitGroups.get(count)!.push(url);
    });

    return [...visitGroups.entries()].sort((a, b) => b[0] - a[0]).slice(0, 3);
}

// Helper function to limit the number of entries in each group
// to condense the amount of data displayed
export function limitGroupEntries(groups: [number, string[]][]) {
    return groups.map(([count, items]) => {
        const displayedItems = items.slice(0, 3);
        const othersCount = items.length - displayedItems.length;
        return { count, displayedItems, othersCount };
    });
}

export function isValidIPv4(ip: string) {
    const octets = ip.split('.');
    if (octets.length !== 4) return false;

    return octets.every(octet => {
        const num = parseInt(octet, 10);
        return num >= 0 && num <= 255;
    });
}

export function isValidHTTPRequest(request: string) {
    const requestRE = new RegExp(
        /(GET|POST|PUT|DELETE) (\/[^\s"]*|https?:\/\/[^\s"]*) HTTP\/[0-9.]+/,
    );
    return request.match(requestRE);
}
