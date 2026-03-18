import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Suppress console.error from React's error boundary logging during tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});
afterEach(() => {
  console.error = originalConsoleError;
});

// A component that throws on demand
function ProblemChild({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>Child rendered successfully</div>;
}

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Hello World</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders the default fallback UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText(/We encountered an unexpected error/)
    ).toBeInTheDocument();
    // Error message appears in the prominent error box
    const errorBox = document.querySelector('.bg-destructive\\/10.border');
    expect(errorBox).toBeInTheDocument();
    expect(errorBox!.textContent).toContain('Test error message');
  });

  it('shows the error name and message in the error details', () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    // The error name:message line is inside the styled <p> element
    const errorP = document.querySelector('p.font-mono.font-semibold');
    expect(errorP).toBeInTheDocument();
    expect(errorP!.textContent).toContain('Error');
    expect(errorP!.textContent).toContain('Test error message');
  });

  it('renders a custom fallback when the fallback prop is provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('shows Try Again and Go Home buttons in default fallback', () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Go Home')).toBeInTheDocument();
  });

  it('resets error state and re-renders children when Try Again is clicked', () => {
    // We need a component that can switch between throwing and not throwing.
    // Use a key-based approach: ErrorBoundary resets its state via handleRetry,
    // and then re-renders children. If children no longer throw, they render.
    let shouldThrow = true;

    function ConditionalThrower() {
      if (shouldThrow) {
        throw new Error('Temporary error');
      }
      return <div>Recovered successfully</div>;
    }

    render(
      <ErrorBoundary>
        <ConditionalThrower />
      </ErrorBoundary>
    );

    // Verify error state is shown
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Fix the underlying issue
    shouldThrow = false;

    // Click "Try Again" to reset the error boundary
    fireEvent.click(screen.getByText('Try Again'));

    // Now the child should render successfully
    expect(screen.getByText('Recovered successfully')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('contains a Stack trace details section', () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Stack trace')).toBeInTheDocument();
  });

  it('shows contact support message', () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(
      screen.getByText(/If this problem persists, please contact support/)
    ).toBeInTheDocument();
  });
});
