import React from 'react';

function Select({ params }) {

  const { key, label, value, onChange, options, optionLabel, disabled } = params;

  return (
    <div className="select-input">
      <label htmlFor={`${key}-select`}>Select {label}: </label>
      <select id={`${key}-select`} value={value} onChange={(e) => { onChange(e.target.value) }} disabled={disabled}>
        {options.map((optionKey) => <option key={optionKey} value={optionKey}>{optionLabel(optionKey)}</option>)}
      </select>
    </div>
  );
}

export default Select;