import { useState, useEffect } from 'react';
import { PillsInput, Pill, Combobox, CheckIcon, Group, useCombobox } from '@mantine/core';

const B2BPillsInput = ({ value, data, onChange, hidePickedOptions, existingValues, disabled }) => {
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    const [search, setSearch] = useState('');
    const [selectedLabels, setSelectedLabels] = useState([]);
    const [selectedValues, setSelectedValues] = useState(value || []);

    useEffect(() => {
        if (value && Array.isArray(value)) {
            const labels = value
                .map((val) => {
                    const found = data.find((item) => item.value === val);
                    return found ? found.label : null;
                })
                .filter((label) => label !== null);
            setSelectedLabels(labels);
            setSelectedValues(value);
        }
    }, [value, data]);

    const handleValueSelect = (val) => {
        const selectedItem = data.find((item) => item.value === val);
        if (!selectedItem) return;

        const newSelectedValues = selectedValues.includes(val)
            ? selectedValues.filter((v) => v !== val)
            : [...selectedValues, val];

        const newSelectedLabels = newSelectedValues.map((value) => {
            const selectedItem = data.find((item) => item.value === value);
            return selectedItem ? selectedItem.label : '';
        });

        setSelectedValues(newSelectedValues);
        setSelectedLabels(newSelectedLabels);
        onChange(newSelectedValues);
    };

    const handleValueRemove = (labelToRemove) => {
        const selectedItem = data.find(item => item.label === labelToRemove);
        if (!selectedItem) return;
        const valToRemove = selectedItem.value;
        const newSelectedValues = selectedValues.filter((val) => val !== valToRemove);
        const newSelectedLabels = selectedLabels.filter((label) => label !== labelToRemove);
        setSelectedValues(newSelectedValues);
        setSelectedLabels(newSelectedLabels);
        onChange(newSelectedValues);
    };

    const values = selectedLabels.map((item) => {
        const isExisting = existingValues.includes(item);
        return (
            <Pill key={item} withRemoveButton={!isExisting} onRemove={() => handleValueRemove(item)} style={{ backgroundColor: isExisting ? '#32577D' : '#969696', color: '#FFFFFF', }}>
                {item}
            </Pill>
        );
    });

    const options = data
        .filter((item) => item.label?.toLowerCase()?.includes(search.trim()?.toLowerCase()))
        .filter((item) => !selectedValues?.includes(item.value) && !existingValues?.includes(item?.value))
        .map((item) => (
            <Combobox.Option key={item.value} value={item.value}>
                <Group gap="sm">
                    {selectedValues.includes(item.value) && <CheckIcon size={12} />}
                    <span>{item.label}</span>
                </Group>
            </Combobox.Option>
        ));

    return (
        <Combobox store={combobox} onOptionSubmit={handleValueSelect}>
            <Combobox.DropdownTarget>
                <PillsInput onClick={() => combobox.openDropdown()}>
                    <Pill.Group>
                        {values}
                        <Combobox.EventsTarget>
                            <PillsInput.Field
                                onFocus={() => combobox.openDropdown()}
                                onBlur={() => combobox.closeDropdown()}
                                value={search}
                                placeholder="Search values"
                                disabled={disabled}
                                onChange={(event) => {
                                    setSearch(event.currentTarget.value);
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === 'Backspace' && search.length === 0) {
                                        event.preventDefault();
                                        handleValueRemove(selectedValues[selectedValues.length - 1]);
                                    }
                                }}
                                hidePickedOptions={hidePickedOptions}
                            />
                        </Combobox.EventsTarget>
                    </Pill.Group>
                </PillsInput>
            </Combobox.DropdownTarget>

            <Combobox.Dropdown>
                <Combobox.Options>
                    {options.length > 0 ? options : <Combobox.Empty>Nothing found...</Combobox.Empty>}
                </Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
};

export default B2BPillsInput;
