// npm run publish
// const path = require('path');
const uuidv1 = require('uuid/v1');
// git commit & push
const publish = () => {
    const git = require('simple-git');
    const time =
        new Date().toLocaleDateString() + '/' + new Date().toLocaleTimeString().replace(/:/g, '-');

    git()
        .addTag(`${'release-' + time + '-' + uuidv1()}`)
        .pushTags('origin', 'koot-boilerplate-web');
};

publish();
