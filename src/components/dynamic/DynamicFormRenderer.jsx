import React from 'react';

export const DynamicFormRenderer = ({ fields = [], values = {}, onChange, errors = {} }) => {
  if (!fields || fields.length === 0) {
    return (
      <div className="text-sm text-secondaryText italic bg-slate-50 p-4 rounded-lg border border-slate-200">
        No additional information required for this service.
      </div>
    );
  }

  const handleFieldChange = (fieldName, val) => {
    onChange({
      ...values,
      [fieldName]: val,
    });
  };

  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const { fieldName, label, fieldType, placeholder, required, options = [], helpText } = field;
        const value = values[fieldName] !== undefined ? values[fieldName] : '';
        const error = errors[fieldName];

        return (
          <div key={fieldName} className="space-y-1">
            <label className="block text-sm font-semibold text-darkText">
              {label} {required && <span className="text-danger">*</span>}
            </label>

            {fieldType === 'select' ? (
              <select
                value={value}
                onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm transition-smooth focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                  error ? 'border-danger' : 'border-slate-300'
                }`}
              >
                <option value="">{placeholder || `-- Select ${label} --`}</option>
                {options.map((opt, idx) => (
                  <option key={idx} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : fieldType === 'textarea' ? (
              <textarea
                rows={3}
                value={value}
                placeholder={placeholder}
                onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm transition-smooth focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                  error ? 'border-danger' : 'border-slate-300'
                }`}
              />
            ) : (
              <input
                type={fieldType || 'text'}
                value={value}
                placeholder={placeholder}
                onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm transition-smooth focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                  error ? 'border-danger' : 'border-slate-300'
                }`}
              />
            )}

            {helpText && <p className="text-xs text-secondaryText">{helpText}</p>}
            {error && <p className="text-xs text-danger font-medium">{error}</p>}
          </div>
        );
      })}
    </div>
  );
};
