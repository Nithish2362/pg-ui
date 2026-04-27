import { MultiSelect } from "@mantine/core";

const B2BMultiselectSearch = ({ label, value, placeholder, size, style, styles = {}, className, onChange, searchable, clearable, searchValue, setSearchValue, data, onRemove, hidePickedOptions = "false", maxValues, disabled }) => {
    return (
        <MultiSelect
            label={label}
            size={size ||= 'md'}
            style={style}
            value={value}
            styles={{ pill: { ...styles.pill }, label: { ...styles.label }, option: { ...styles.option }, root: { ...styles.root }, input: { ...styles.input, fontSize: '13px', maxHeight: '9rem', overflowY: 'auto' }, wrapper: { ...styles.wrapper } }}
            className={className}
            placeholder={placeholder}
            searchable={searchable}
            clearable={clearable}
            limit={10}
            onChange={onChange}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            data={data}
            hidePickedOptions={hidePickedOptions}
            maxValues={maxValues}
            comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 } }}
            onRemove={onRemove}
            disabled={disabled}
        />
    );
}

export default B2BMultiselectSearch;