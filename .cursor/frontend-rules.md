# 🎨 Frontend Development Rules - Cyberpunk Dashboard

## 🎯 COMPONENT DEVELOPMENT

### Component Structure
```tsx
// Always use this structure for new components
import React from 'react';
import { cn } from '@/lib/utils';
import GlassCard from './GlassCard';

interface ComponentNameProps {
  // Define props with proper types
  title: string;
  isActive?: boolean;
  onClick?: () => void;
}

const ComponentName: React.FC<ComponentNameProps> = ({ 
  title, 
  isActive = false, 
  onClick 
}) => {
  return (
    <GlassCard className="p-4 border border-cyber-cyan/30">
      {/* Component content */}
    </GlassCard>
  );
};

export default ComponentName;
```

### Styling Patterns
- **Glass Morphism**: Always use `GlassCard` component for containers
- **Gradients**: Use `bg-gradient-to-br from-cyber-cyan/20 to-cyber-purple/10`
- **Glows**: Apply `shadow-glow-cyan`, `shadow-glow-purple`, `shadow-glow-orange`
- **Transitions**: Use `transition-all duration-300 ease-out`
- **Hover Effects**: Implement `hover:scale-105` and `hover:shadow-glow-*`

### Navigation Components
```tsx
// Standard navigation button pattern
<button
  onClick={onClick}
  title={label}
  aria-label={`Navigate to ${label}`}
  aria-current={active ? 'page' : undefined}
  className={cn(
    "relative w-full h-[70px] flex flex-col items-center justify-center rounded-xl transition-all duration-300 p-1 group overflow-hidden",
    "focus:outline-none focus:ring-2 focus:ring-cyber-cyan focus:ring-offset-2 focus:ring-offset-cyber-bg",
    active 
      ? 'bg-gradient-to-br from-cyber-cyan/30 to-cyber-purple/20 shadow-glow-cyan border border-cyber-cyan/30' 
      : 'hover:bg-gradient-to-br hover:from-white/10 hover:to-cyber-cyan/5 hover:shadow-glow-cyan/30 border border-transparent hover:border-cyber-cyan/20'
  )}
>
  {/* Active indicator */}
  {active && (
    <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-cyber-cyan to-cyber-purple rounded-r-full shadow-glow-cyan" />
  )}
  
  {/* Icon */}
  <Icon className={cn(
    "h-6 w-6 mb-1 transition-all duration-300",
    active ? 'text-cyber-cyan drop-shadow-glow-cyan' : 'text-white group-hover:text-cyber-cyan'
  )} />
  
  {/* Label */}
  <span className={cn(
    "text-[10px] font-semibold leading-tight text-center transition-all duration-300 font-mono",
    active ? 'text-cyber-cyan' : 'text-white/80 group-hover:text-white'
  )}>
    {label}
  </span>
</button>
```

## 📱 RESPONSIVE DESIGN

### Breakpoint Strategy
- **Mobile First**: Design for mobile, then enhance for larger screens
- **Breakpoints**: `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px)
- **Container**: Use `max-w-7xl mx-auto` for content containers

### Layout Patterns
```tsx
// Standard responsive layout
<div className="flex flex-col lg:flex-row gap-4 p-4">
  <aside className="w-full lg:w-80 flex-shrink-0">
    {/* Sidebar content */}
  </aside>
  <main className="flex-1 min-w-0">
    {/* Main content */}
  </main>
</div>
```

### Touch Targets
- **Minimum Size**: 44px for touch targets
- **Spacing**: 8px minimum between interactive elements
- **Padding**: Use `p-2` or `p-3` for buttons

## 🎨 DESIGN SYSTEM

### Color Usage
```tsx
// Primary colors
const colors = {
  cyan: 'text-cyber-cyan bg-cyber-cyan/20 border-cyber-cyan/30',
  purple: 'text-cyber-purple bg-cyber-purple/20 border-cyber-purple/30',
  orange: 'text-cyber-orange bg-cyber-orange/20 border-cyber-orange/30',
  success: 'text-green-400 bg-green-500/20 border-green-500/30',
  error: 'text-red-400 bg-red-500/20 border-red-500/30',
  warning: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
};
```

### Typography Scale
```tsx
// Text sizes and weights
const typography = {
  h1: 'text-3xl font-bold text-white',
  h2: 'text-2xl font-bold text-white',
  h3: 'text-xl font-semibold text-white',
  h4: 'text-lg font-semibold text-white',
  body: 'text-sm text-gray-300',
  caption: 'text-xs text-gray-400 font-mono',
  code: 'text-sm font-mono text-cyber-cyan'
};
```

### Spacing System
```tsx
// Consistent spacing
const spacing = {
  xs: 'gap-1 p-1',
  sm: 'gap-2 p-2',
  md: 'gap-4 p-4',
  lg: 'gap-6 p-6',
  xl: 'gap-8 p-8'
};
```

## 🔧 UTILITY FUNCTIONS

### Class Name Utility
```tsx
// Always use cn utility for conditional classes
import { cn } from '@/lib/utils';

const buttonClasses = cn(
  "base-classes",
  isActive && "active-classes",
  isDisabled && "disabled-classes",
  className // Allow custom classes
);
```

### Animation Utilities
```tsx
// Standard animation classes
const animations = {
  fadeIn: 'animate-fade-in',
  slideIn: 'animate-slide-in',
  pulse: 'animate-pulse',
  glow: 'animate-glow',
  hover: 'hover:scale-105 hover:shadow-glow-cyan transition-all duration-300'
};
```

## 📊 DATA VISUALIZATION

### Chart Components
```tsx
// Use Recharts with cyberpunk styling
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CyberpunkChart: React.FC<{ data: any[] }> = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
      <XAxis 
        dataKey="name" 
        stroke="#9CA3AF" 
        fontSize={12}
        fontFamily="mono"
      />
      <YAxis 
        stroke="#9CA3AF" 
        fontSize={12}
        fontFamily="mono"
      />
      <Tooltip 
        contentStyle={{
          backgroundColor: '#1F2937',
          border: '1px solid #374151',
          borderRadius: '8px',
          color: '#F9FAFB'
        }}
      />
      <Line 
        type="monotone" 
        dataKey="value" 
        stroke="#00ffff" 
        strokeWidth={2}
        dot={{ fill: '#00ffff', strokeWidth: 2, r: 4 }}
      />
    </LineChart>
  </ResponsiveContainer>
);
```

## 🎯 FORM COMPONENTS

### Input Components
```tsx
// Standard input styling
const CyberpunkInput: React.FC<InputProps> = ({ 
  label, 
  error, 
  ...props 
}) => (
  <div className="space-y-2">
    {label && (
      <label className="text-sm font-medium text-gray-300">
        {label}
      </label>
    )}
    <input
      {...props}
      className={cn(
        "w-full px-3 py-2 bg-gray-800/50 border border-gray-600/40 rounded-lg",
        "text-white placeholder:text-gray-400",
        "focus:outline-none focus:ring-2 focus:ring-cyber-cyan focus:border-cyber-cyan/50",
        "transition-all duration-300",
        error && "border-red-500/50 focus:ring-red-500"
      )}
    />
    {error && (
      <p className="text-sm text-red-400">{error}</p>
    )}
  </div>
);
```

### Button Components
```tsx
// Standard button variants
const buttonVariants = {
  primary: "bg-cyber-cyan text-black font-bold hover:shadow-glow-cyan",
  secondary: "bg-cyber-purple text-white font-bold hover:shadow-glow-purple",
  outline: "border border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/10",
  ghost: "text-gray-300 hover:bg-white/10 hover:text-white"
};
```

## 🔄 STATE MANAGEMENT

### React Hooks Patterns
```tsx
// Standard state management
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [data, setData] = useState<T[]>([]);

// Loading state component
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-cyan"></div>
  </div>
);

// Error state component
const ErrorMessage: React.FC<{ error: string }> = ({ error }) => (
  <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
    <p className="text-red-400 font-mono">{error}</p>
  </div>
);
```

## 🎨 ACCESSIBILITY

### ARIA Labels
```tsx
// Always include proper ARIA labels
<button
  aria-label="Toggle navigation menu"
  aria-expanded={isOpen}
  aria-controls="navigation-menu"
>
  <MenuIcon />
</button>
```

### Keyboard Navigation
```tsx
// Support keyboard navigation
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onClick?.();
  }
};
```

### Focus Management
```tsx
// Proper focus management
useEffect(() => {
  if (isOpen) {
    const firstFocusable = document.querySelector('[tabindex="0"]');
    (firstFocusable as HTMLElement)?.focus();
  }
}, [isOpen]);
```

## 🚀 PERFORMANCE

### Code Splitting
```tsx
// Use lazy loading for modules
const Dashboard = lazy(() => import('./modules/dashboard'));
const Tools = lazy(() => import('./modules/tools'));

// Wrap with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Dashboard />
</Suspense>
```

### Memoization
```tsx
// Memoize expensive components
const ExpensiveChart = React.memo<ChartProps>(({ data }) => {
  return <CyberpunkChart data={data} />;
});
```

### Bundle Optimization
- Use dynamic imports for large libraries
- Implement tree shaking
- Optimize images and assets
- Monitor bundle size with `pnpm build --analyze`

## 🧪 TESTING

### Component Testing
```tsx
// Test component rendering and interactions
import { render, screen, fireEvent } from '@testing-library/react';

test('renders navigation button correctly', () => {
  render(<NavButton label="Dashboard" isActive={true} />);
  expect(screen.getByText('Dashboard')).toBeInTheDocument();
  expect(screen.getByRole('button')).toHaveAttribute('aria-current', 'page');
});
```

### Visual Testing
- Use Playwright for visual regression testing
- Test responsive behavior across breakpoints
- Verify accessibility with axe-core

## 📋 COMPONENT CHECKLIST

Before creating a new component, ensure:
- [ ] Proper TypeScript types defined
- [ ] Responsive design implemented
- [ ] Accessibility features included
- [ ] Error states handled
- [ ] Loading states implemented
- [ ] Consistent styling with design system
- [ ] Proper ARIA labels and roles
- [ ] Keyboard navigation support
- [ ] Performance optimized
- [ ] Test coverage added

Remember: Every component should maintain the cyberpunk aesthetic while being functional, accessible, and performant.
