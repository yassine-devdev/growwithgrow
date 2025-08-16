/**
 * Unit tests for ErrorBoundary component
 * Tests error handling, fallback UI, and error reporting
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../../../components/ErrorBoundary';

// Mock child component that can throw errors
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Child component</div>;
};

const WorkingChild = () => <div>Working child component</div>;

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console.error to capture error logs
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('should render children when there are no errors', () => {
    render(
      <ErrorBoundary>
        <WorkingChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Working child component')).toBeInTheDocument();
  });

  it('should render error fallback when child throws error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should show error boundary fallback UI
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.queryByText('Child component')).not.toBeInTheDocument();
  });

  it('should display error message in fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should display the error message
    expect(screen.getByText(/test error/i)).toBeInTheDocument();
  });

  it('should provide retry functionality', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should show retry button
    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();

    // Click retry button
    retryButton.click();

    // Re-render with working component
    rerender(
      <ErrorBoundary>
        <WorkingChild />
      </ErrorBoundary>
    );

    // Should show working component after retry
    expect(screen.getByText('Working child component')).toBeInTheDocument();
  });

  it('should log errors to console', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should log error to console
    expect(console.error).toHaveBeenCalled();
  });

  it('should handle custom fallback component', () => {
    const CustomFallback = ({ error }: { error: Error }) => (
      <div>Custom error: {error.message}</div>
    );

    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error: Test error')).toBeInTheDocument();
  });

  it('should handle errors in nested components', () => {
    const NestedComponent = () => (
      <div>
        <span>Nested content</span>
        <ThrowError shouldThrow={true} />
      </div>
    );

    render(
      <ErrorBoundary>
        <NestedComponent />
      </ErrorBoundary>
    );

    // Should catch error from nested component
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.queryByText('Nested content')).not.toBeInTheDocument();
  });

  it('should reset error state when children change', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should show error
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

    // Re-render with different children
    rerender(
      <ErrorBoundary>
        <WorkingChild />
      </ErrorBoundary>
    );

    // Should show working component
    expect(screen.getByText('Working child component')).toBeInTheDocument();
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
  });

  it('should handle multiple error boundaries', () => {
    const InnerError = () => {
      throw new Error('Inner error');
    };

    const OuterError = () => {
      throw new Error('Outer error');
    };

    render(
      <ErrorBoundary>
        <div>Outer content</div>
        <ErrorBoundary>
          <InnerError />
        </ErrorBoundary>
        <OuterError />
      </ErrorBoundary>
    );

    // Inner error boundary should catch inner error
    // Outer error boundary should catch outer error
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('should provide error details in development mode', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should show more detailed error information in development
    expect(screen.getByText(/test error/i)).toBeInTheDocument();

    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should hide error details in production mode', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should show generic error message in production
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    // Should not expose detailed error information
    expect(screen.queryByText('Test error')).not.toBeInTheDocument();

    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should handle async errors gracefully', async () => {
    const AsyncError = () => {
      // Simulate async error
      setTimeout(() => {
        throw new Error('Async error');
      }, 0);
      return <div>Async component</div>;
    };

    render(
      <ErrorBoundary>
        <AsyncError />
      </ErrorBoundary>
    );

    // Should initially render the component
    expect(screen.getByText('Async component')).toBeInTheDocument();

    // Note: Error boundaries don't catch async errors by default
    // This test documents the current behavior
  });

  it('should handle errors during rendering', () => {
    const RenderError = () => {
      // Error during render
      const data = null;
      return <div>{data.nonExistentProperty}</div>;
    };

    render(
      <ErrorBoundary>
        <RenderError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('should handle errors in event handlers', () => {
    const EventHandlerError = () => {
      const handleClick = () => {
        throw new Error('Event handler error');
      };

      return <button onClick={handleClick}>Click me</button>;
    };

    render(
      <ErrorBoundary>
        <EventHandlerError />
      </ErrorBoundary>
    );

    const button = screen.getByRole('button', { name: 'Click me' });
    
    // Error boundaries don't catch errors in event handlers
    // This test documents the current behavior
    expect(() => button.click()).toThrow('Event handler error');
  });

  it('should provide accessibility features', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should have proper ARIA attributes
    const errorContainer = screen.getByRole('alert');
    expect(errorContainer).toBeInTheDocument();
    expect(errorContainer).toHaveAttribute('aria-live', 'assertive');
  });

  it('should handle component unmounting during error', () => {
    const { unmount } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should not throw when unmounting error boundary
    expect(() => unmount()).not.toThrow();
  });

  it('should report errors to external service', () => {
    const mockErrorReporter = vi.fn();
    
    render(
      <ErrorBoundary onError={mockErrorReporter}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should call error reporter
    expect(mockErrorReporter).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Object)
    );
  });

  it('should handle multiple consecutive errors', () => {
    const MultipleErrors = ({ errorCount }: { errorCount: number }) => {
      if (errorCount > 0) {
        throw new Error(`Error ${errorCount}`);
      }
      return <div>No errors</div>;
    };

    const { rerender } = render(
      <ErrorBoundary>
        <MultipleErrors errorCount={1} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

    // Trigger another error
    rerender(
      <ErrorBoundary>
        <MultipleErrors errorCount={2} />
      </ErrorBoundary>
    );

    // Should still show error boundary
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
});