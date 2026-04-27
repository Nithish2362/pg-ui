import { Select } from '@mantine/core'
import React from 'react'

const B2BSelect = ({ searchable, label, searchValue, onSearchChange, className, radius, defaultValue, placeholder, value, data, required, onChange, style, styles, clearable, scroll, leftSection, leftSectionPointerEvents, error, disabled, name, onOptionSubmit, onClear, size }) => {

    return (
        <Select
            className={className}
            style={style}
            name={name}
            styles={{ ...styles }}
            placeholder={placeholder}
            value={value}
            data={data}
            required={required}
            label={label}
            onChange={onChange}
            variant='filled'
            clearable={clearable}
            withScrollArea={scroll}
            searchable={searchable}
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            defaultValue={defaultValue}
            disabled={disabled}
            leftSectionPointerEvents={leftSectionPointerEvents}
            leftSection={leftSection}
            comboboxProps={{ shadow: 'md' }}
            radius={radius || "sm"}
            size={size || 'sm'}
            error={error}
            onOptionSubmit={onOptionSubmit}
            onClear={onClear}
        />
    )
}

export default B2BSelect
