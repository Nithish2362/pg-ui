import { Combobox, InputBase, useCombobox } from '@mantine/core';
import { useState, useEffect } from 'react';

const B2BSelectable = ({ data, value, setData, setValue }) => {
    const [search, setSearch] = useState(value || '');

    // Reset the search value if the value prop changes
    useEffect(() => {
        setSearch(value);
    }, [value]);

    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    const exactOptionMatch = data?.some((item) => item === search);
    const filteredOptions = exactOptionMatch
        ? data
        : data?.filter((item) => item?.toLowerCase().includes(search.toLowerCase().trim()));

    const options = filteredOptions.map((item, index) => (
        <Combobox.Option value={item} key={index}>
            {item}
        </Combobox.Option>
    ));

    return (
        <Combobox
            store={combobox}
            withinPortal={false}
            onOptionSubmit={(val) => {
                if (val === '$create') {
                    setData((current) => [...current, search]);
                    setValue(search);
                } else {
                    setValue(val);
                    setSearch(val);
                }

                combobox.closeDropdown();
            }}
        >
            <Combobox.Target>
                <InputBase
                    rightSection={<Combobox.Chevron />}
                    value={search}
                    onChange={(event) => {
                        combobox.openDropdown();
                        combobox.updateSelectedOptionIndex();
                        setSearch(event.currentTarget.value);
                    }}
                    onClick={() => combobox.openDropdown()}
                    onFocus={() => combobox.openDropdown()}
                    placeholder="Search Name"
                    style={{ width: '250px' }}
                    rightSectionPointerEvents="none"
                />
            </Combobox.Target>

            <Combobox.Dropdown>
                <Combobox.Options>
                    {options}
                    {!exactOptionMatch && search.trim().length > 0 && (
                        <Combobox.Option value="$create">+ Create {search}</Combobox.Option>
                    )}
                </Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
}

export default B2BSelectable;
