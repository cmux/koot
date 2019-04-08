const id = require('shortid');
const dayjs = require('dayjs');

const publish = () => {
    const git = require('simple-git');
    const time = dayjs(new Date()).format('YYYY/MM/DD-HH.mm');

    git()
        .addTag(`${'release_' + time + '_version-' + id.generate()}`)
        .pushTags('origin')
        .push('origin');
};

publish();
