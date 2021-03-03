import { memo } from 'react';
import { extend } from 'koot';
import { Link } from 'react-router';

import { doc as urlDoc } from '@constants/urls';
// import { updateAppType } from '@actions/app.ts';

import Center from '@components/center';
import Icon from '@components/icon';

import { updateAppType } from '../../actions/app';

import styles from './index.module.less';

// ============================================================================

const listBasic = __('pages.start.listBasic');
const listAdvanced = __('pages.start.listAdvanced');

// ============================================================================

const PageStart = extend({
    pageinfo: () => ({
        title: `${__('pages.start.title')} - ${__('title')}`,
        metas: [{ description: __('pages.start.description') }],
    }),
    styles,
})(
    memo(({ className }) => (
        <Center className={className}>
            <h2 className="title">{__('pages.start.title')}</h2>
            <ol className="list">
                {listBasic.map((item, index) => (
                    <ListItem key={index} {...item} />
                ))}
            </ol>
            <h4 className="title title-more">
                {__('pages.start.titles.learnMore')}
            </h4>
            <ul className="list list-advanced">
                {listAdvanced.map((item, index) => (
                    <ListItem key={index} {...item} />
                ))}
            </ul>
            <p className="bonus">
                <strong>{__('pages.start.bonus')}</strong>
                <Link to="/ts">
                    {__('pages.start.bonusComponentInTS')}
                </Link> | <BtnUpdateAppType />
            </p>
        </Center>
    ))
);

export default PageStart;

// ============================================================================

const ListItem = memo(({ title, checkout, learn, content, list, doc }) => (
    <li className="item">
        <strong className="sub-title">
            {!!checkout && <small>{__('pages.start.titles.checkout')}</small>}
            {!!learn && <small>{__('pages.start.titles.learn')}</small>}
            {title || checkout || learn}
        </strong>
        <span className="content">
            {content}
            {Array.isArray(list) && (
                <ul className="content-list">
                    {list.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            )}
        </span>
        {doc && (
            <a
                className="doc"
                href={urlDoc + '#' + doc}
                target="_blank"
                rel="noopener noreferrer"
            >
                {__('pages.start.linkToDoc')}
                <Icon className="icon" icon="new-tab" />
            </a>
        )}
    </li>
));

const BtnUpdateAppType = extend({
    connect: (state) => ({
        type: state.app.type,
    }),
})(
    memo(({ type, dispatch }) => {
        function onClick() {
            dispatch(updateAppType(makeid(4)));
        }
        return (
            <button
                className="btn-update-app-type link-style"
                onClick={onClick}
            >
                {__('pages.start.bonusUpdateAppType', {
                    current: type || 'undefined',
                })}
            </button>
        );
    })
);
function makeid(length) {
    var result = '';
    var characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
    }
    return result;
}
