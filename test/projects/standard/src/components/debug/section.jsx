import React from 'react';

const DebugSection = ({ name, children }) => (
    <section className="section" data-section={name}>
        <div className="section-name">{name}</div>
        <div className="section-content">{children}</div>
    </section>
);

export default DebugSection;
