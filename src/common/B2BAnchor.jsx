import { Anchor } from '@mantine/core';
import React from 'react'

const B2BAnchor = ({ href, content, title, style, styles , onClick}) => {
    return (
        <Anchor
        onClick={onClick}
            title={title}
            href={href}
            style={style}
            styles={{ ...styles }}
            underline="never"
        >
            {content}
        </Anchor>
    )
}

export default B2BAnchor;