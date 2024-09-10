import fs from 'fs/promises';

export async function parseLog(filePath: string) {
    const logData = await fs.readFile(filePath, 'utf-8');
    const logLines = logData.split('\n');

    const logRegex = new RegExp(
        `^(?<ip>\\d{1,3}(?:\\.\\d{1,3}){3})\\s+` + // IP address
            `(?<ident>[^ ]+)\\s+` + // Ident
            `(?<user>[^ ]+)\\s+` + // User
            `\$begin:math:display$(?<timestamp>[^\\$end:math:display$]+)\\]\\s+` + // Timestamp
            `\"(?<method>[A-Z]+)\\s+(?<url>[^ ]+)\\s+(?<protocol>[^"]+)\"\\s+` + // Request
            `(?<status>\\d{3})\\s+` + // Status code
            `(?<size>\\d+)`, // Response size
    );

    const uniqueIPs: Set<string> = new Set();
    const urlVisits: Map<string, number> = new Map();
    const ipActivity: Map<string, number> = new Map();
    let invalidLogCount = 0;

    logLines.forEach((logLine, index) => {
        const match = logLine.match(logRegex);

        if (match && match.groups) {
            const ip = match.groups.ip;
            const url = match.groups.url;

            uniqueIPs.add(ip);

            urlVisits.set(url, (urlVisits.get(url) || 0) + 1);

            ipActivity.set(ip, (ipActivity.get(ip) || 0) + 1);
        } else {
            // Increment invalid log counter if log format doesn't match
            invalidLogCount++;
            console.error(
                `Invalid log format on line ${index + 1}: ${logLine}`,
            );
        }
    });

    // Check if a significant number of logs are invalid
    const totalLogCount = logLines.length;
    const errorThreshold = 0.1; // 10%
    if (invalidLogCount / totalLogCount > errorThreshold) {
        throw new Error('Log file contains too many invalid entries');
    }

    const uniqueIPCount = uniqueIPs.size;
    const top3Urls = [...urlVisits.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
    const top3IPs = [...ipActivity.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    return {
        uniqueIPCount,
        top3Urls,
        top3IPs,
    };
}
