import React from 'react';
import Input from './Input';
import Select from './Select';

const FormComponent = ({
  parameters,
  setParameters,
  status,
  getData,
  selects,
  inputs,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setParameters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={getData} className="flex flex-col gap-4 mt-4"> {/* Added mt-4 for consistent spacing */}
      <div className="grid md:grid-cols-2 gap-x-4 gap-y-2">
        {inputs.map((input) => (
          <Input
            key={input.id}
            {...input}
            value={parameters[input.name]}
            onChange={handleChange}
          />
        ))}
        {selects &&
          Object.entries(selects).map(([key, select]) => (
            <Select
              key={key}
              id={key}
              name={key}
              value={parameters[key]}
              label={select.label}
              options={select.options}
              onChange={handleChange}
            />
          ))}
      </div>
      <button
        type="submit"
        disabled={status === 'loading'}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
      >
        {status === 'loading' ? 'Loading...' : 'Submit'}
      </button>
    </form>
  );
};

export default FormComponent;
