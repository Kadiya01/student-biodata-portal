import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stepper } from '../Stepper';

const steps = [
  { title: 'Personal', description: 'Your info' },
  { title: 'Education', description: 'School details' },
  { title: 'Guardian', description: 'Guardian info' },
  { title: 'Review', description: 'Final check' },
];

describe('Stepper', () => {
  it('renders all step titles', () => {
    render(<Stepper steps={steps} currentStep={0} />);
    expect(screen.getByText('Personal')).toBeInTheDocument();
    expect(screen.getByText('Education')).toBeInTheDocument();
    expect(screen.getByText('Guardian')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
  });

  it('shows step descriptions', () => {
    render(<Stepper steps={steps} currentStep={0} />);
    expect(screen.getByText('Your info')).toBeInTheDocument();
  });

  it('shows mobile step indicator', () => {
    render(<Stepper steps={steps} currentStep={1} />);
    expect(screen.getByText('Step 2 of 4: Education')).toBeInTheDocument();
  });

  it('shows completion percentage on mobile', () => {
    render(<Stepper steps={steps} currentStep={1} />);
    expect(screen.getByText('50% Complete')).toBeInTheDocument();
  });

  it('renders step numbers for non-completed steps', () => {
    render(<Stepper steps={steps} currentStep={0} />);
    expect(screen.getByText('4')).toBeInTheDocument();
  });
});
