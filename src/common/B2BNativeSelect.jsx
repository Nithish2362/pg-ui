import { NativeSelect } from '@mantine/core'
import React from 'react'

const B2BNativeSelect = ({ data, value, required, onChange, style }) => {
    return (
        <NativeSelect
            data={data}
            value={value}
            required={required}
            onChange={onChange}
            style={style}
        />
    )
}

export default B2BNativeSelect