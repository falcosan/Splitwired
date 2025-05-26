import React from 'react';
import { render, screen } from '@testing-library/react';
import DownloadsComponent from '../DownloadsComponent';

describe('DownloadsComponent', () => {
  it('renders loading message when loading is true', () => {
    render(<DownloadsComponent downloads="" loading={true} />);
    expect(screen.getByText(/loading downloads.../i)).toBeInTheDocument();
  });

  it('renders no downloads message when downloads is empty and not loading', () => {
    render(<DownloadsComponent downloads="" loading={false} />);
    expect(screen.getByText(/no downloads available./i)).toBeInTheDocument();
  });
  
  it('renders no downloads message when downloads is an empty array and not loading', () => {
    render(<DownloadsComponent downloads={[]} loading={false} />);
    expect(screen.getByText(/no downloads available./i)).toBeInTheDocument();
  });

  it('renders downloads when downloads is an HTML string', () => {
    const htmlDownloads = '<ul><li><a href="/file1.txt">File 1</a></li></ul>';
    render(<DownloadsComponent downloads={htmlDownloads} loading={false} />);
    expect(screen.getByText('Downloads')).toBeInTheDocument();
    expect(screen.getByText('File 1')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /File 1/i })).toHaveAttribute('href', '/file1.txt');
  });

  it('renders downloads when downloads is an array of objects', () => {
    const arrayDownloads = [{ href: '/file2.zip', text: 'File 2 Zip' }];
    render(<DownloadsComponent downloads={arrayDownloads} loading={false} />);
    expect(screen.getByText('Downloads')).toBeInTheDocument();
    expect(screen.getByText('File 2 Zip')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /File 2 Zip/i })).toHaveAttribute('href', '/file2.zip');
  });
  
  it('renders default download text if text is missing in array objects', () => {
    const arrayDownloads = [{ href: '/file3.pdf' }];
    render(<DownloadsComponent downloads={arrayDownloads} loading={false} />);
    expect(screen.getByText('Downloads')).toBeInTheDocument();
    expect(screen.getByText(/Download 1/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Download 1/i })).toHaveAttribute('href', '/file3.pdf');
  });

  it('renders invalid format message for other data types', () => {
    render(<DownloadsComponent downloads={{ data: "unexpected" }} loading={false} />);
    expect(screen.getByText(/invalid downloads format./i)).toBeInTheDocument();
  });
});
