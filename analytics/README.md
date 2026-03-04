# Analytics Module

A production-ready, type-safe analytics system with clean architecture and dependency injection.

## Architecture

```
analytics/
├── types.ts              # Core type definitions
├── service.ts            # Main analytics service
├── factory.ts            # Service factory
├── helpers.ts            # Helper functions
├── session/
│   └── manager.ts        # Session management
├── storage/
│   ├── localStorage.ts   # Local storage implementation
│   └── http.ts          # HTTP backend implementation
└── react/
    └── context.tsx       # React integration
```

## Key Design Principles

1. **Dependency Injection**: No singletons, fully testable
2. **Storage Strategy Pattern**: Pluggable backends (localStorage, HTTP)
3. **Type Safety**: Strongly typed events and contracts
4. **Error Handling**: Proper error types and recovery
5. **Performance**: Event batching and async operations
6. **React Integration**: Context-based provider pattern

## Usage Examples

### Basic Setup

```tsx
import { Analytics } from '@/analytics';
import { AnalyticsProvider } from '@/analytics/react/context';

// Create service
const analyticsService = Analytics.createLocalStorageService();

// Wrap app
function App() {
  return (
    <AnalyticsProvider service={analyticsService}>
      <MyApp />
    </AnalyticsProvider>
  );
}
```

### Event Tracking

```tsx
import { useAnalytics } from '@/analytics/react/context';
import { createProductClickEvent, createButtonClickEvent } from '@/analytics/helpers';

function ProductCard({ product }) {
  const { track } = useAnalytics();
  
  const handleClick = () => {
    track(createProductClickEvent(product.id, product.name));
  };
  
  return (
    <div onClick={handleClick}>
      {product.name}
    </div>
  );
}
```

### Backend Migration

```tsx
// Switch from localStorage to HTTP backend
const analyticsService = Analytics.createHttpService('https://api.example.com/analytics');
```

### Custom Storage

```tsx
import { AnalyticsService } from '@/analytics';
import { SessionManager } from '@/analytics/session/manager';
import { MyCustomStorage } from './my-storage';

const service = new AnalyticsService(
  new MyCustomStorage(),
  new SessionManager(),
  { batchSize: 20 }
);
```

## Benefits Over Previous Implementation

1. **No Duplicate Code**: Single, unified implementation
2. **Testable**: Dependency injection enables easy testing
3. **Maintainable**: Clear separation of concerns
4. **Scalable**: Pluggable architecture for different backends
5. **Type Safe**: Consistent type system throughout
6. **Performance**: Proper batching and error handling
7. **React Ready**: Built-in React integration
8. **Backend Ready**: Easy migration path to server-side analytics