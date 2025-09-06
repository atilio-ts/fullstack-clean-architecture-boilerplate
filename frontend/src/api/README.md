# Generated TypeScript API Client

This directory contains the auto-generated TypeScript API client created from the backend Swagger documentation using `swagger-typescript-api`.

## Files

- `api.ts` - Auto-generated API client and types (DO NOT EDIT MANUALLY)
- `index.ts` - Configuration and utility functions for the API client
- `README.md` - This documentation file

## Usage

### Basic Usage

```typescript
import { healthApi, checkHealth } from '@/api';

// Using the utility function
const healthData = await checkHealth();

// Using the API client directly
const response = await healthApi.getHealth();
console.log(response.data);
```

### Using Types

```typescript
import type { HealthResponse } from '@/api';

const handleHealthData = (health: HealthResponse) => {
  console.log(`API Status: ${health.status}`);
  console.log(`Uptime: ${health.uptime} seconds`);
  console.log(`Memory Used: ${health.memory.used} MB`);
};
```

### Advanced Usage

```typescript
import { apiClient, Api } from '@/api';

// Using the configured client with interceptors
const customRequest = async () => {
  try {
    const response = await apiClient.health.getHealth();
    return response.data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Creating a new client instance with custom configuration
const customApi = new Api({
  baseURL: 'https://my-custom-api.com/api/v1',
  timeout: 5000,
});
```

## Regenerating the API Client

When the backend Swagger documentation is updated, regenerate the client:

```bash
npm run api:generate
```

To regenerate and check types:

```bash
npm run api:generate-watch
```

## Configuration

The API client is configured in `index.ts` with:

- Base URL from environment variable or localhost:3001
- 10-second timeout
- Authentication token interceptor
- Error handling interceptor for 401 responses

## Authentication

The client automatically includes JWT tokens from localStorage:

```typescript
// Token is automatically added to requests if available
localStorage.setItem('authToken', 'your-jwt-token');

// Requests will include: Authorization: Bearer your-jwt-token
const response = await healthApi.getHealth();
```

## Error Handling

The client includes built-in error handling:

- 401 responses automatically clear the auth token
- Network errors are propagated with proper TypeScript types
- All responses are properly typed based on the Swagger specification