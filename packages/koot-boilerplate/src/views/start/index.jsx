import React from 'react';
import { extend } from 'koot';
import { Link } from 'react-router';

import { doc as urlDoc } from '@constants/urls';

import Center from '@components/center';
import Icon from '@components/icon';

import styles from './index.module.less';

// ============================================================================

// ! i18n is disabled in SPA mode
const listBasic = __SPA__ ? [] : __('pages.start.listBasic');
const listAdvanced = __SPA__ ? [] : __('pages.start.listAdvanced');

// ============================================================================

const PageStart = extend({
    pageinfo: () => ({
        title: `${__('pages.start.title')} - ${__('title')}`,
        metas: [{ description: __('pages.start.description') }]
    }),
    styles
})(({ className }) => (
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
            <Link to="/ts">{__('pages.start.bonusComponentInTS')}</Link>
        </p>
    </Center>
));

export default PageStart;

// ============================================================================

const ListItem = ({ title, checkout, learn, content, list, doc }) => (
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
);
