import fs from 'fs/promises';

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

    // Regular expressions to match IP addresses and HTTP requests
    // Also allows for leading zeroes in IP address octets
    const ipRE = new RegExp(
        /^((25[0-5]|2[0-4]\d|1\d{2}|0?\d{1,2})\.){3}(25[0-5]|2[0-4]\d|1\d{2}|0?\d{1,2})$/,
    );
    const requestRE = new RegExp(
        /(GET|POST|PUT|DELETE) (\/[^\s"]*|https?:\/\/[^\s"]*) HTTP\/[0-9.]+/,
    );

    logLines.forEach((line, i) => {
        const logLineChunkArr = line.split(' ');
        const ip = logLineChunkArr[0];
        const url = logLineChunkArr[6];
        const request = logLineChunkArr.slice(5, 8).join(' ');

        if (ip.match(ipRE) && request.match(requestRE)) {
            uniqueIPs.add(ip);
            urlVisits.set(url, (urlVisits.get(url) || 0) + 1);
            ipActivity.set(ip, (ipActivity.get(ip) || 0) + 1);
        } else {
            // Increment invalid log counter if log format doesn't match and
            // ignore empty lines
            if (!!line[0]) {
                invalidLogCount++;
                console.error(`Invalid log format on line ${i + 1}: ${line}`);
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
    };
}

// Helper function to group URLs or IPs by visit count
function groupByVisitCount(visits: Map<string, number>) {
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
function limitGroupEntries(groups: [number, string[]][]) {
    return groups.map(([count, items]) => {
        const displayedItems = items.slice(0, 3);
        const othersCount = items.length - displayedItems.length;
        return { count, displayedItems, othersCount };
    });
}
