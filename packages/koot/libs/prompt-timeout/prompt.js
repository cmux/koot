import inquirer from 'inquirer';

let prompt;

process.on('message', async (message = {}) => {
    const { question, done } = message;

    if (typeof question !== 'undefined') {
        const { timeout, ...promptOptions } = question;
        prompt = inquirer.prompt(
            Array.isArray(question)
                ? question
                : {
                      name: 'value',
                      type: 'confirm',
                      default: true,
                      ...promptOptions,
                  }
        );

        prompt.then((result) => {
            if (process.send) {
                process.send({ result: result.value });
            }
        });

        // console.log(prompt.ui);
    } else if (typeof done !== 'undefined') {
        prompt.ui.rl.emit('line', done === true ? 'y' : 'n');
        // prompt.ui.onDone(done);
        // prompt.ui.rl.emit('line', done);
        // prompt.ui.rl.line = '';
        prompt.ui.close();
        process.exit(1);
    }
});
