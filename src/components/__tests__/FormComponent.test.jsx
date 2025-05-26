import React from 'react';
import { render, screen } from '@testing-library/react';
import FormComponent from '../FormComponent';

describe('FormComponent', () => {
  const mockSetParameters = jest.fn();
  const mockGetData = jest.fn();

  const defaultProps = {
    parameters: {},
    setParameters: mockSetParameters,
    status: 'idle',
    getData: mockGetData,
    selects: {
      group: { label: 'Group', options: [{ id: '1', name: 'Group 1' }] },
    },
    inputs: [
      { id: 'input1', name: 'year', label: 'Year', type: 'number' },
    ],
  };

  it('renders without crashing with minimal props', () => {
    render(<FormComponent {...defaultProps} />);
    // Check for the submit button
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    // Check for an input label
    expect(screen.getByText(/Year/i)).toBeInTheDocument();
    // Check for a select label
    expect(screen.getByText(/Group/i)).toBeInTheDocument();
  });

  it('displays "Loading..." on submit button when status is loading', () => {
    render(<FormComponent {...defaultProps} status="loading" />);
    expect(screen.getByRole('button', { name: /loading.../i })).toBeInTheDocument();
  });
});
