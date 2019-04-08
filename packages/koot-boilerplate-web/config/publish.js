// npm run publish
// const path = require('path');
const id = require('shortid');
const dayjs = require('dayjs');

// git commit & push
const publish = () => {
    const git = require('simple-git');
    const time = dayjs(new Date()).format('YYYY/MM/DD_HH-mm');

    git()
        .addTag(`${'release-' + time + '_' + id.generate()}`)
        .pushTags('origin', 'koot-boilerplate-web');
};

publish();
