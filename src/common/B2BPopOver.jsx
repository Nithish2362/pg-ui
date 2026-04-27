import React from 'react'
import { Popover } from '@mantine/core'

const B2BPopOver = ({target, children}) => {
    return (
        <Popover position="bottom" withArrow shadow="md" >
            <Popover.Target>
                {target}
            </Popover.Target>
            <Popover.Dropdown>
                {children}
            </Popover.Dropdown>
        </Popover>
    )
}

export default B2BPopOver