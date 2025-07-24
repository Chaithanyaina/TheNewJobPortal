import React from 'react';
import { useFormContext } from 'react-hook-form';

const Input = ({ name, label, type = 'text', placeholder, validation }) => {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name];

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-text-secondary mb-1">
        {label}
      </label>
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'}`}
        {...register(name, validation)}
      />
      {error && <p className="text-red-600 text-sm mt-1">{error.message}</p>}
    </div>
  );
};

export default Input;