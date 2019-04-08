// npm run publish
// const path = require('path');
const uuidv1 = require('uuid/v1');
// git commit & push
const publish = () => {
    const git = require('simple-git');

    git()
        .addTag(`${'release-' + new Date().toLocaleDateString() + '-' + uuidv1()}`)
        .pushTags('origin', 'koot-boilerplate-web')
        .push('origin', 'koot-boilerplate-web');
};

publish();
