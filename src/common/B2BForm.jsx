import React from 'react';
import B2BButton from './B2BButton';
import B2BDateInput from './B2BDateInput';
import './B2BForm.css';
import moment from 'moment';
import B2BSelect from './B2BSelect';
import { Button, MultiSelect, NativeSelect } from '@mantine/core';
import B2BNativeSelect from './B2BNativeSelect';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleArrowDown, faCirclePlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { min } from 'lodash';
import { IconSquareRoundedPlus } from '@tabler/icons-react';

const B2BForm = ({ json, onSave, handleCancel, layoutStyle, onClick, edit, className, addBrandField, closeBrandField, brandFields, searchable }) => {
    return (
        <div className='layout' style={layoutStyle}>
            <form onSubmit={(event) => onSave(event)} className={className || 'form-layout'}>
                {json.map((e, index) => (
                    <div key={index} className={e.className ? e.className : "form-group"}>
                        {e.type == "radio" && (
                            <div className='layout-fields'>
                                <label className='layout-fields-label'>{e.label}</label>
                                <div className='layout-fields-status-input'>
                                    {e.options.map((option, idx) => (
                                        <div className='layout-fields-status-radio' key={idx}>
                                            <input
                                                id={`${e.name}-${option.value.toLowerCase()}`}
                                                value={option.value}
                                                style={e.style && e.style}
                                                onChange={(event) => e.onChange(event, e.name)}
                                                checked={e.value === option.value}
                                                type={e.type}
                                                placeholder={e.placeholder}
                                            />
                                            <label className='form-span radio' htmlFor={`${e.name}-${option.value.toLowerCase()}`}>{option.label}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                        }

                        {e.type === 'text' && <div className='layout-fields'>
                            <label className='layout-fields-label'>
                                {
                                    <span>{e?.label} {e.required === true && <span style={{ color: "red" }}> *</span>}</span>
                                }
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <input
                                    value={e.value}
                                    className='layout-fields-input'
                                    disabled={e.disabled}
                                    onChange={e.onChange}
                                    type={e.type}
                                    size={e.size}
                                    required={e.required}
                                    placeholder={e.placeholder}
                                    style={{
                                        ...e.style,
                                        cursor: e.disabled ? 'not-allowed' : 'auto'
                                    }}
                                />
                                {e.rightSection &&
                                    e.rightSection}

                                {e.note && (
                                    <div style={{ marginTop: '4px', fontSize: '12px' }}>
                                        <span>Note: </span>
                                        <span style={{ color: 'red', fontSize: '10px' }}>{e.note}</span>
                                    </div>
                                )}

                            </div>
                        </div>
                        }
                        {e.type == 'textArea' && <div className='layout-fields'>
                            <label className='layout-fields-label'>{e.label}</label>
                            <textarea
                                value={e.value}
                                className='layout-fields-input'
                                disabled={e.disabled}
                                onChange={e.onChange}
                                type={e.type}
                                required={e.required}
                                placeholder={e.placeholder}
                                style={e.style}
                            />
                        </div>}
                        {e.type == 'date' && <div className='layout-fields'>
                            {/* <label className='layout-fields-label'>{e.label}</label> */}
                            <label className='layout-fields-label'>
                                {
                                    <span>{e?.label} {e.required === true && <span style={{ color: "red" }}> *</span>}</span>
                                }
                            </label>
                            <B2BDateInput value={e.value} onChange={e.onChange} minDate={e.min} required={e.required} />
                        </div>}
                        {e.type === 'select' && <div className='layout-fields'>
                            <label className='layout-fields-label'>{e.label}</label>
                            <B2BSelect
                                data={e?.data || e?.options}
                                value={e?.value || ''}
                                onChange={e.onChange}
                                onSearchChange={e?.onSearchChange}
                                type={e.type}
                                required={e.required}
                                disabled={e.disabled}
                                placeholder={e.placeholder}
                                style={e.style}
                                maxDropdownHeight={400}
                                className='input-textField'
                                searchable={e.searchable}
                                onOptionSubmit={e.onOptionSubmit}
                                clearable={e.clearable}
                                key={e?.value}
                            />
                            {onClick && <FontAwesomeIcon
                                icon={faCirclePlus}
                                title="masterNew"
                                size="xl"
                                onClick={onClick}
                                style={{ cursor: 'pointer', marginLeft: '8px' }}
                            />}
                        </div>
                        }
                        {e.type === 'multi-select' && <div className='layout-fields'>
                            <label className='layout-fields-label'>{e.label}</label>
                            <MultiSelect
                                data={e.data}
                                value={e.value}
                                onChange={e.onChange}
                                type={e.type}
                                required={e.required}
                                placeholder={e.placeholder}
                                style={e.style}
                                maxDropdownHeight={400}
                                className='input-textField'
                                hidePickedOptions
                                searchable={searchable}
                                key={e?.value}
                            />
                        </div>
                        }
                        {e.type === 'file' && (
                            <div className='layout-fields'>
                                <label className='layout-fields-label'>{e.label}</label>
                                <input
                                    className='layout-fields-input'
                                    disabled={e.disabled}
                                    onChange={e.onChange}
                                    type={e.type}
                                    required={e.required}
                                    accept="image/*"
                                    style={e.style}
                                />
                            </div>
                        )}
                        {e.type === 'number' && (
                            <div className="layout-fields">
                                <label className="layout-fields-label">{e.label}</label>
                                <input
                                    type="number"
                                    value={e.value}
                                    className="layout-fields-input"
                                    disabled={e.disabled}
                                    onChange={e.onChange}
                                    required={e.required}
                                    placeholder={e.placeholder}
                                    min={e.min}
                                    max={e.max}
                                    step={e.step || 'any'} // allows decimal inputs if needed
                                    style={{
                                        ...e.style,
                                        cursor: e.disabled ? 'not-allowed' : 'auto',
                                        appearance: 'textfield', // hides number spinner in Firefox
                                    }}
                                    onWheel={(e) => e.target.blur()} //  prevents scroll changing number
                                    onKeyDown={(e) => {
                                        // optional: block non-numeric keys
                                        if (
                                            e.key === 'e' ||
                                            e.key === 'E' ||
                                            e.key === '+' ||
                                            e.key === '-'
                                        ) {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                                {e.rightSection && e.rightSection}
                            </div>
                        )}

                    </div>
                ))
                }
                <div className='layout-fields-btn'>
                    <B2BButton type='button' color={'red'} onClick={handleCancel} name="Cancel" />
                    <B2BButton type='submit' name={edit ? "Update" : "Save"} color={edit ? 'green' : ''} />
                </div>
            </form >
        </div >
    )
}

export default B2BForm