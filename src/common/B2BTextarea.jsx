import { Textarea } from '@mantine/core'
import React from 'react'

const B2BTextarea = ({ placeholder, value, onChange, required, minRows = 4, maxRows = 4, readOnly = false }) => {
    return (
        <Textarea
            className="input-textField"
            placeholder={placeholder}
            value={value}
            radius="sm"
            required={required}
            autosize
            minRows={minRows}
            onChange={onChange}
            maxRows={maxRows}
            readOnly={readOnly}
        />
    )
}

export default B2BTextarea
