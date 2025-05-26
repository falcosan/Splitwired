import React from 'react';
import { render, screen } from '@testing-library/react';
import ChartsComponent from '../ChartsComponent';

// Mock react-plotly.js
jest.mock('react-plotly.js', () => ({
  __esModule: true,
  default: jest.fn((props) => <div data-testid="plotly-chart">Mocked Plotly Chart</div>),
}));

describe('ChartsComponent', () => {
  const mockChartData = [
    {
      data: [{ x: [1, 2], y: [2, 3], type: 'scatter' }],
      layout: { title: 'Test Chart 1' },
    },
  ];

  it('renders error message when status is error', () => {
    render(<ChartsComponent chart={null} status="error" />);
    expect(screen.getByText(/error loading chart data./i)).toBeInTheDocument();
  });

  it('renders no chart data message when status is success but chart is empty', () => {
    render(<ChartsComponent chart={[]} status="success" />);
    expect(screen.getByText(/no chart data to display for the selected criteria./i)).toBeInTheDocument();
  });
  
  it('renders no chart data message when status is success but chart is null', () => {
    render(<ChartsComponent chart={null} status="success" />);
    expect(screen.getByText(/no chart data to display for the selected criteria./i)).toBeInTheDocument();
  });

  it('renders no chart data message for other non-success/non-error statuses', () => {
    render(<ChartsComponent chart={null} status="idle" />);
    expect(screen.getByText(/no chart data available./i)).toBeInTheDocument();
  });
  
  it('renders fallback message when status is loading', () => {
    render(<ChartsComponent chart={null} status="Loading" />); // Assuming 'Loading' is a possible status string
    expect(screen.getByText(/chart data is currently being processed or not available./i)).toBeInTheDocument();
  });

  it('renders charts when chart data and success status are provided', () => {
    render(<ChartsComponent chart={mockChartData} status="success" />);
    expect(screen.getByTestId('plotly-chart')).toBeInTheDocument();
    // If you want to check for titles (assuming layout.title is used for a visible title by Plotly)
    // This might require a more sophisticated mock or inspection of props passed to the mock
  });

  it('renders multiple charts if provided', () => {
    const multipleCharts = [
      { data: [], layout: { title: 'Chart A' } },
      { data: [], layout: { title: 'Chart B' } },
    ];
    render(<ChartsComponent chart={multipleCharts} status="success" />);
    expect(screen.getAllByTestId('plotly-chart').length).toBe(2);
  });
});
