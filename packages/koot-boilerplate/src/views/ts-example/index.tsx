import React from 'react';
import { extend, ExtendedProps } from 'koot';
import { Link } from 'react-router';

import Icon from '@components/icon';

import svgTS from '@assets/typescript.svg';
import styles from './index.module.less';

// ============================================================================

interface ComponentProps {
    customProps?: string;
}

// Functional Component =======================================================

const TSFunctionalComponent = extend<ComponentProps>({
    pageinfo: () => ({
        title: `${__('pages.ts.title')} - ${__('title')}`,
        metas: [{ description: __('pages.ts.description') }]
    }),
    styles
})(
    ({
        className,
        children,
        customProps,
        'data-class-name': dataClassName
    }): JSX.Element => {
        return (
            <div className={className} data-koot-test-page="page-ts">
                <img
                    src={require('@assets/typescript.svg')}
                    className="logo"
                    alt="TypeScript LOGO"
                    data-custom-props={customProps}
                    data-class-name={dataClassName}
                />
                <p className="msg-big">{__('pages.ts.msg')}</p>
                <p className="msg-small">{__('pages.ts.msgCheckFile')}</p>
                <Link to="/start" className="back">
                    <Icon className="icon" icon="circle-left3" />
                    {__('pages.ts.back')}
                </Link>
                {children}
            </div>
        );
    }
);

export default TSFunctionalComponent;

export const UseTSFunctionalComponent: React.FC = (): JSX.Element => (
    <TSFunctionalComponent customProps="B" />
);

// Component Class ============================================================

@extend({
    pageinfo: () => ({
        title: `${__('pages.ts.title')} - ${__('title')}`,
        metas: [{ description: __('pages.ts.description') }]
    }),
    styles
})
class TSComponentClass extends React.Component<ExtendedProps & ComponentProps> {
    testProperty(): number {
        let a = 1;
        a++;
        return a;
    }
    render(): React.ReactNode {
        return (
            <div
                className={this.props.className}
                data-custom-props={this.props.customProps}
                data-class-name={this.props['data-class-name']}
                data-koot-test-page="page-ts"
            >
                <img src={svgTS} className="logo" alt="TypeScript LOGO" />
                <p className="msg-big">{__('pages.ts.msg')}</p>
                <p className="msg-small">{__('pages.ts.msgCheckFile')}</p>
                <Link to="/start" className="back">
                    <Icon className="icon" icon="circle-left3" />
                    {__('pages.ts.back')}
                </Link>
                {this.props.children}
            </div>
        );
    }
}

export { TSComponentClass };

export const UseTSComponentClass: React.FC = (): JSX.Element => (
    <TSComponentClass customProps="B" />
);
