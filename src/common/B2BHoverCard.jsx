import { Group, HoverCard } from '@mantine/core'
import React from 'react'

const B2BHoverCard = ({ target, children }) => {
    return (
        <Group justify="center">
            <HoverCard width={280} shadow="md">
                <HoverCard.Target>
                    {target}
                </HoverCard.Target>
                <HoverCard.Dropdown>
                    {children}
                </HoverCard.Dropdown>
            </HoverCard>
        </Group>
    )
}

export default B2BHoverCard