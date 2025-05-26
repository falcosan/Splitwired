import React from 'react';
import { render, screen } from '@testing-library/react';
import SummaryComponent from '../SummaryComponent';

describe('SummaryComponent', () => {
  it('renders null when info is not provided', () => {
    const { container } = render(<SummaryComponent info={null} />);
    // When returning null, the container should be empty.
    // Note: queryByText would also work and return null if not found.
    expect(container.firstChild).toBeNull();
  });

  it('renders "Summary" heading when info is provided', () => {
    const mockInfo = { total: '100.00', average: '25.00' };
    render(<SummaryComponent info={mockInfo} />);
    expect(screen.getByText('Summary')).toBeInTheDocument();
  });

  it('renders total and average correctly when info is provided', () => {
    const mockInfo = { total: '1,250.75', average: '125.08' };
    render(<SummaryComponent info={mockInfo} />);
    
    // Check for the labels
    expect(screen.getByText(/Total Expenses:/i)).toBeInTheDocument();
    expect(screen.getByText(/Average Expense:/i)).toBeInTheDocument();
    
    // Check for the values
    expect(screen.getByText('1,250.75')).toBeInTheDocument();
    expect(screen.getByText('125.08')).toBeInTheDocument();
  });

  it('renders with different data types for total and average (e.g. numbers)', () => {
    const mockInfo = { total: 500, average: 50 };
    render(<SummaryComponent info={mockInfo} />);
    
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });
});
