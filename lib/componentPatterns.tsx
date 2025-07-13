import React, { ComponentType, forwardRef } from 'react';
import { cn } from './utils';

// Higher-Order Component for withLoading
export function withLoading<P extends object>(
  Component: ComponentType<P>,
  LoadingComponent?: ComponentType
) {
  return function WithLoadingComponent(props: P & { loading?: boolean }) {
    const { loading, ...componentProps } = props;
    
    if (loading) {
      return LoadingComponent ? <LoadingComponent /> : <div>Loading...</div>;
    }
    
    return <Component {...(componentProps as P)} />;
  };
}

// Higher-Order Component for withError
export function withError<P extends object>(
  Component: ComponentType<P>,
  ErrorComponent?: ComponentType<{ error: Error }>
) {
  return function WithErrorComponent(props: P & { error?: Error }) {
    const { error, ...componentProps } = props;
    
    if (error) {
      return ErrorComponent ? <ErrorComponent error={error} /> : <div>Error: {error.message}</div>;
    }
    
    return <Component {...(componentProps as P)} />;
  };
}

// Higher-Order Component for withEmpty
export function withEmpty<P extends object>(
  Component: ComponentType<P>,
  EmptyComponent?: ComponentType
) {
  return function WithEmptyComponent(props: P & { isEmpty?: boolean; emptyMessage?: string }) {
    const { isEmpty, emptyMessage, ...componentProps } = props;
    
    if (isEmpty) {
      return EmptyComponent ? <EmptyComponent /> : <div>{emptyMessage || 'No data available'}</div>;
    }
    
    return <Component {...(componentProps as P)} />;
  };
}

// Controlled Component Pattern
export interface ControlledProps<T> {
  value?: T;
  onChange?: (value: T) => void;
  defaultValue?: T;
}

export function createControlledComponent<T, P extends object>(
  Component: ComponentType<P & ControlledProps<T>>
) {
  return function ControlledComponent(props: P & ControlledProps<T>) {
    const { value, onChange, defaultValue, ...rest } = props;
    
    if (value !== undefined && onChange) {
      // Controlled component
      return <Component {...(rest as P)} value={value} onChange={onChange} />;
    } else {
      // Uncontrolled component
      return <Component {...(rest as P)} defaultValue={defaultValue} />;
    }
  };
}

// Compound Component Pattern
export interface CompoundComponentProps {
  children: React.ReactNode;
  className?: string;
}

export function createCompoundComponent<T extends Record<string, ComponentType<any>>>(
  components: T
) {
  const CompoundComponent = Object.assign(
    (props: CompoundComponentProps) => <div {...props} />,
    components
  );
  
  return CompoundComponent;
}

// Render Prop Pattern
export interface RenderProps<T> {
  children: (props: T) => React.ReactNode;
}

export function createRenderPropComponent<T>(
  renderFn: (props: T) => React.ReactNode
) {
  return function RenderPropComponent(props: RenderProps<T>) {
    return <>{renderFn(props as T)}</>;
  };
}

// Provider Pattern
export function createProvider<T>(
  defaultValue: T,
  displayName?: string
) {
  const Context = React.createContext<T>(defaultValue);
  
  const Provider: React.FC<{ value: T; children: React.ReactNode }> = ({ value, children }) => {
    return <Context.Provider value={value}>{children}</Context.Provider>;
  };
  
  Provider.displayName = displayName || 'Provider';
  
  return { Context, Provider };
}

// Async Component Pattern
export interface AsyncComponentProps<T> {
  asyncFn: () => Promise<T>;
  loading?: React.ReactNode;
  error?: React.ComponentType<{ error: Error }>;
  children: (data: T) => React.ReactNode;
}

export function AsyncComponent<T>({ 
  asyncFn, 
  loading = <div>Loading...</div>, 
  error: ErrorComponent,
  children 
}: AsyncComponentProps<T>) {
  const [state, setState] = React.useState<{
    loading: boolean;
    error: Error | null;
    data: T | null;
  }>({
    loading: true,
    error: null,
    data: null,
  });

  React.useEffect(() => {
    asyncFn()
      .then(data => setState({ loading: false, error: null, data }))
      .catch(error => setState({ loading: false, error, data: null }));
  }, [asyncFn]);

  if (state.loading) return <>{loading}</>;
  if (state.error) return ErrorComponent ? <ErrorComponent error={state.error} /> : <div>Error: {state.error.message}</div>;
  if (!state.data) return null;
  
  return <>{children(state.data)}</>;
}

// Conditional Render Pattern
export interface ConditionalRenderProps {
  condition: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ConditionalRender({ condition, children, fallback }: ConditionalRenderProps) {
  if (condition) {
    return <>{children}</>;
  }
  return fallback ? <>{fallback}</> : null;
}

// Lazy Load Pattern
export interface LazyLoadProps {
  children: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
}

export function LazyLoad({ children, threshold = 0.1, rootMargin = '50px' }: LazyLoadProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div ref={ref}>
      {isVisible ? children : <div>Loading...</div>}
    </div>
  );
}

// Error Boundary Pattern
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback && this.state.error) {
        return <this.props.fallback error={this.state.error} />;
      }
      return <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}

// Memo Pattern
export function createMemoComponent<T extends object>(
  Component: ComponentType<T>,
  propsAreEqual?: (prevProps: T, nextProps: T) => boolean
) {
  return React.memo(Component, propsAreEqual);
} 