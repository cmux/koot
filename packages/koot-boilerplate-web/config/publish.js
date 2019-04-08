const id = require('shortid');
const dayjs = require('dayjs');
const git = require('simple-git');
const time = dayjs(new Date()).format('MM/DD');

git()
    .addTag(`${'release-version_' + time + '_' + id.generate()}`)
    .pushTags('origin')
    .push('origin');
