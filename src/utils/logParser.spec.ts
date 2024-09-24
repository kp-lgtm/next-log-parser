import { describe } from 'node:test';
import { parseLog } from './logParser';
import { join } from 'path';

const logFile = join(
    process.cwd(),
    'uploads',
    'programming-task-example-data_(1) (1).log',
);
