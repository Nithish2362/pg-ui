import React from 'react';
import { Flex, Text, Tooltip } from '@mantine/core';

const B2BToolTip = ({ label, value }) => {
    return (
        <Tooltip label={label}>
            <span>{value}</span>
        </Tooltip>
    )
}

export default B2BToolTip