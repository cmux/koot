import { DistinctQuestion } from 'inquirer';

interface PromptOptions<T> extends DistinctQuestion<T> {
    default?: T;
}

async function promptTimeout<T>(
    prompt: PromptOptions<T>,
    timeout: number = 1000
): Promise<T>;

export default promptTimeout;
