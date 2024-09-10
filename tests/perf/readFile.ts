import * as fs from 'fs';
import * as readline from 'readline';

async function testReadFileIntoMemory(filePath: string) {
    console.time('Read entire file into memory');
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    const lines = fileContent.split('\n');
    console.timeEnd('Read entire file into memory');
}

async function testReadFileLineByLine(filePath: string) {
    console.time('Read file line by line');
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });
    for await (const line of rl) {
        // Process the line
    }
    console.timeEnd('Read file line by line');
}

async function testStreamWithBuffering(filePath: string): Promise<void> {
    console.time('Stream File with Buffering');
    return new Promise((resolve, reject) => {
        const stream = fs.createReadStream(filePath);
        let buffer = '';

        stream.on('data', (chunk: string | Buffer) => {
            const chunkStr =
                typeof chunk === 'string' ? chunk : chunk.toString('utf-8');
            buffer += chunkStr;
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Save the last incomplete line to the buffer
            lines.forEach(line => {
                // Process each complete line here
            });
        });

        stream.on('end', () => {
            if (buffer.length > 0) {
                // Process the last remaining line in buffer
            }
            console.timeEnd('Stream File with Buffering');
            resolve();
        });

        stream.on('error', err => {
            console.timeEnd('Stream File with Buffering');
            reject(err);
        });
    });
}

async function runPerfTests() {
    const filePath = 'tests/perf/mocks/large_varied_log_file.log';
    await testReadFileIntoMemory(filePath);
    await testReadFileLineByLine(filePath);
    await testStreamWithBuffering(filePath);
}

runPerfTests();
