# Data Management Approaches for PDF Voice Assistant

## Current Issues with Your Approach

Your current context implementation has several problems:

1. **API calls in context providers**: Contexts are making API calls directly, violating separation of concerns
2. **No error handling or loading states**: Missing proper loading and error state management
3. **No caching**: Data is fetched on every mount without optimization
4. **Tight coupling**: Context is tightly coupled to specific API endpoints
5. **No data synchronization**: Server changes aren't reflected in the client

## Better Approaches

### 1. **Custom Hooks Pattern** (Current Implementation)

**What it is**: Custom hooks that encapsulate API logic and state management.

**Benefits**:
- ✅ Separation of concerns (API logic separate from UI)
- ✅ Reusable across components
- ✅ Proper error and loading state handling
- ✅ Easy to test
- ✅ No external dependencies

**Drawbacks**:
- ❌ No automatic caching
- ❌ No background refetching
- ❌ Manual cache invalidation
- ❌ More boilerplate code

**Usage**:
```tsx
const { pdfFile, loading, error, refetch } = usePdfFile();
const { uploadPdf } = useUploadPdf();
```

### 2. **React Query/TanStack Query** (Recommended for Production)

**What it is**: A powerful data synchronization library for React.

**Benefits**:
- ✅ Automatic caching and background updates
- ✅ Built-in loading and error states
- ✅ Optimistic updates
- ✅ Automatic retry on failure
- ✅ DevTools for debugging
- ✅ Request deduplication
- ✅ Infinite queries and pagination

**Setup**:
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

**Usage**:
```tsx
// In main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Wrap your app
<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools />
</QueryClientProvider>
```

**Hooks with React Query**:
```tsx
export const usePdfFile = () => {
  return useQuery({
    queryKey: ['pdf'],
    queryFn: async () => {
      const response = await apiFetch('/pdf');
      const blob = await response.blob();
      return new File([blob], "document.pdf", { type: "application/pdf" });
    },
    enabled: !!localStorage.getItem("sessionToken"),
  });
};

export const useUploadPdf = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('pdf', file);
      return apiFetch('/upload-pdf', { method: 'POST', body: formData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pdf'] });
    },
  });
};
```

### 3. **Zustand** (Alternative State Management)

**What it is**: A small, fast, and scalable state management solution.

**Benefits**:
- ✅ Lightweight (no providers needed)
- ✅ TypeScript support
- ✅ DevTools support
- ✅ Easy to test
- ✅ Can persist state to localStorage

**Usage**:
```tsx
import { create } from 'zustand';

interface AppStore {
  pdfFile: File | null;
  audioBlob: Blob | null;
  transcription: any;
  setPdfFile: (file: File) => void;
  setAudioBlob: (blob: Blob) => void;
  setTranscription: (data: any) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  pdfFile: null,
  audioBlob: null,
  transcription: null,
  setPdfFile: (file) => set({ pdfFile: file }),
  setAudioBlob: (blob) => set({ audioBlob: blob }),
  setTranscription: (data) => set({ transcription: data }),
}));
```

### 4. **Redux Toolkit + RTK Query** (Enterprise Solution)

**What it is**: Official Redux toolkit with built-in data fetching.

**Benefits**:
- ✅ Powerful caching and synchronization
- ✅ Optimistic updates
- ✅ TypeScript support
- ✅ DevTools integration
- ✅ Middleware ecosystem

**Drawbacks**:
- ❌ More complex setup
- ❌ Larger bundle size
- ❌ Overkill for smaller apps

## Recommendations

### For Your Current Project:

1. **Start with the Custom Hooks pattern** (already implemented) - it's a good foundation
2. **Migrate to React Query** when you need:
   - Better caching
   - Background updates
   - Optimistic updates
   - Better error handling

### Migration Path:

1. **Phase 1**: Use the current custom hooks implementation
2. **Phase 2**: Add React Query for better caching and synchronization
3. **Phase 3**: Consider Zustand if you need more complex state management

### Code Organization:

```
src/
├── hooks/
│   └── useApi.ts          # API hooks
├── context/
│   └── AppContext.tsx     # Unified context
├── services/
│   └── api.ts            # API service functions
└── stores/
    └── appStore.ts       # Zustand store (if needed)
```

## Best Practices

1. **Keep API logic in hooks/services, not in components**
2. **Use TypeScript for better type safety**
3. **Handle loading and error states consistently**
4. **Implement proper error boundaries**
5. **Use React Query DevTools for debugging**
6. **Cache data appropriately (staleTime, cacheTime)**
7. **Invalidate cache when data changes**

## Example Migration

**Before (Your Current Approach)**:
```tsx
// Context making API calls directly
useEffect(() => {
  fetch("http://localhost:2008/api/pdf", {
    headers: { "Authorization": `Bearer ${sessionToken}` }
  })
  .then(response => response.blob())
  .then(blob => setPdfFile(new File([blob], "document.pdf")))
  .catch(error => console.error("Error:", error));
}, []);
```

**After (Custom Hooks)**:
```tsx
// Clean separation of concerns
const { pdfFile, loading, error, refetch } = usePdfFile();
```

**After (React Query)**:
```tsx
// Even better with caching and background updates
const { data: pdfFile, isLoading, error, refetch } = usePdfFile();
```

This approach gives you much better maintainability, performance, and user experience!