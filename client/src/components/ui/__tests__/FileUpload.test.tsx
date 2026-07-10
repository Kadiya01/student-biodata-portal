import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileUpload } from '../FileUpload';

describe('FileUpload', () => {
  it('renders upload prompt when no value', () => {
    render(<FileUpload onChange={vi.fn()} />);
    expect(screen.getByText('Upload passport photograph')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<FileUpload onChange={vi.fn()} label="Passport Photo" />);
    expect(screen.getByText('Passport Photo')).toBeInTheDocument();
  });

  it('renders error message when provided', () => {
    render(<FileUpload onChange={vi.fn()} error="Photo is required" />);
    expect(screen.getByText('Photo is required')).toBeInTheDocument();
  });

  it('renders image preview when value is provided', () => {
    render(<FileUpload onChange={vi.fn()} value="data:image/jpeg;base64,abc123" />);
    expect(screen.getByAltText('Passport Photograph')).toBeInTheDocument();
  });

  it('renders change and remove buttons when value is provided', () => {
    render(<FileUpload onChange={vi.fn()} value="data:image/jpeg;base64,abc123" />);
    expect(screen.getByText('Change Photo')).toBeInTheDocument();
    expect(screen.getByText('Remove')).toBeInTheDocument();
  });

  it('calls onChange with empty string when remove is clicked', () => {
    const onChange = vi.fn();
    render(<FileUpload onChange={onChange} value="data:image/jpeg;base64,abc123" />);
    fireEvent.click(screen.getByText('Remove'));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('renders file input element', () => {
    render(<FileUpload onChange={vi.fn()} />);
    const input = document.querySelector('input[type="file"]');
    expect(input).toBeInTheDocument();
  });

  it('does not show upload prompt when value is provided', () => {
    render(<FileUpload onChange={vi.fn()} value="data:image/jpeg;base64,abc123" />);
    expect(screen.queryByText('Upload passport photograph')).not.toBeInTheDocument();
  });
});
