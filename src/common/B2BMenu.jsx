import { Menu } from '@mantine/core'
import React, { memo } from 'react'

const B2BMenu = memo(({ children, menuItems, trigger }) => {

    return (
            <Menu trigger={trigger} openDelay={100} closeDelay={200}>
                <Menu.Target children={children}>
                </Menu.Target>
                <Menu.Dropdown>
                    {menuItems.map((menu, index) => (
                        <Menu.Item key={index} onClick={menu.value} leftSection={menu.icon}>
                            {menu.key}
                        </Menu.Item>
                    ))}
                </Menu.Dropdown>
            </Menu>
    )
});

export default B2BMenu