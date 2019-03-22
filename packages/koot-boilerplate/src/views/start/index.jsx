import React from 'react'
import { extend } from 'koot'

import { doc as urlDoc } from '@constants/urls'

import Center from '@components/center'
import Icon from '@components/icon'

const PageStart = extend({
    pageinfo: () => ({
        title: `${__('pages.start.title')} - ${__('title')}`,
        metas: [
            { 'description': __('pages.start.description') },
        ]
    }),
    styles: require('./styles.component.less')
})(
    ({ className }) => (
        <Center className={className}>
            <h2 className="title">{__('pages.start.title')}</h2>
            <ol className="list">
                {__('pages.start.listBasic').map((item, index) =>
                    <ListItem key={index} {...item} />
                )}
            </ol>
            <h4 className="title title-more">{__('pages.start.titles.learnMore')}</h4>
            <ul className="list list-advanced">
                {__('pages.start.listAdvanced').map((item, index) =>
                    <ListItem key={index} {...item} />
                )}
            </ul>
        </Center>
    )
)

export default PageStart



const ListItem = ({
    title, checkout, learn,
    content, list, doc,
}) => (
    <li className="item">
        <strong className="sub-title">{(() => {
            if (checkout)
                return <small>{__('pages.start.titles.checkout')}</small>
            if (learn)
                return <small>{__('pages.start.titles.learn')}</small>
        })()}{title || checkout || learn}</strong>
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
            <a className="doc" href={urlDoc + '#' + doc} target="_blank">
                {__('pages.start.linkToDoc')}
                <Icon className="icon" icon="new-tab" />
            </a>
        )}
    </li>
)
