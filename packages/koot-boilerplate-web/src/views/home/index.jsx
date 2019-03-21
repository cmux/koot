import React from 'react';
import { extend } from 'koot';

import navItems from '@constants/nav-items';

import { Link } from 'react-router';
import Center from '@components/center';

@extend({
    connect: true,
    pageinfo: () => ({
        title: `${__('pages.home.title')} - ${__('title')}`,
        metas: [{ description: __('pages.home.description') }],
    }),
    styles: require('./styles.component.less'),
})
class PageHome extends React.Component {
    render() {
        return (
            <div className={this.props.className}>
                <div className="cover" ref={el => (this._cover = el)}>
                    <h2>Koot.js</h2>
                    <div className="nav">
                        {navItems.map((item, index) => (
                            <Link
                                className="item"
                                activeClassName="on"
                                to={item}
                                children={__('navs', item)}
                                key={index}
                            />
                        ))}
                    </div>
                </div>
                <Center className="wrapper">
                    <p>
                        Sit proident sit laboris ex cillum et excepteur in culpa qui sint veniam
                        laborum voluptate. Aute enim in ad anim voluptate cupidatat adipisicing
                        exercitation duis consequat ex qui anim est. Ullamco officia tempor
                        excepteur nostrud minim proident aliqua pariatur mollit commodo sit eu enim.
                        Aliqua amet irure eu duis nostrud magna officia enim. Elit cupidatat
                        pariatur est anim nostrud labore esse adipisicing ipsum ad deserunt laboris
                        sint sint.
                    </p>
                    <p>
                        Fugiat proident in eu id proident et cupidatat do elit voluptate enim.
                        Officia ullamco ea elit aliqua incididunt proident anim eu deserunt anim
                        fugiat laborum. Veniam qui sunt aliqua reprehenderit laboris anim cillum
                        adipisicing eu minim. Excepteur aliqua mollit minim non do aute labore Lorem
                        enim amet.
                    </p>
                    <p>
                        Tempor amet eiusmod qui tempor mollit eiusmod do aliqua sint elit eu in
                        duis. In non duis sint pariatur dolor pariatur anim consectetur dolor elit
                        commodo amet sunt fugiat. Ex laborum occaecat est velit magna nostrud. Nisi
                        adipisicing consectetur duis irure ad ut esse enim ex ex. Nisi qui fugiat
                        amet proident. Incididunt ut tempor deserunt esse irure.
                    </p>
                    <p>
                        Deserunt reprehenderit consequat nisi quis non anim ad consequat aute aute.
                        Duis irure occaecat dolore et aliquip aliqua laboris laborum. Proident
                        eiusmod nulla nulla aliqua eiusmod fugiat consectetur ea cillum amet est ut.
                        Id laborum veniam Lorem anim quis incididunt voluptate fugiat irure aute et
                        adipisicing nulla qui. Pariatur sint magna ex dolore aute. In est in
                        consectetur cillum sit consectetur ut velit nisi occaecat.
                    </p>
                    <p>
                        Deserunt labore cillum dolor nulla qui Lorem cillum. Laborum elit eiusmod
                        fugiat id nisi esse reprehenderit tempor id velit. Sint commodo eiusmod nisi
                        ea non cillum commodo commodo eiusmod reprehenderit. Duis reprehenderit
                        culpa eiusmod aute labore exercitation cillum pariatur reprehenderit. Elit
                        Lorem sint culpa Lorem reprehenderit. Aliqua eu dolore eu officia nisi
                        cupidatat mollit amet id.
                    </p>
                    <p>
                        Adipisicing qui sit eiusmod nostrud sunt nostrud ullamco qui est sunt nisi.
                        Cillum pariatur voluptate eu pariatur elit pariatur aute ex non minim aliqua
                        nulla exercitation. Irure deserunt reprehenderit velit aliqua. Consequat
                        consequat elit cupidatat sint ipsum sit tempor aute Lorem quis. Nulla veniam
                        laboris mollit fugiat consectetur non enim id sunt ut velit elit nisi. Elit
                        anim culpa in nisi pariatur et ipsum eu eiusmod magna amet irure consequat.
                    </p>
                </Center>
            </div>
        );
    }
}

export default PageHome;
