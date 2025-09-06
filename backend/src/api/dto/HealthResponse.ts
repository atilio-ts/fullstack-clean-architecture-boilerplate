/**
 * Health check response containing system status and metrics
 */
export interface HealthResponse {
  /** Current status of the API */
  status: string;
  
  /** ISO timestamp of when the health check was performed */
  timestamp: string;
  
  /** Application uptime in seconds */
  uptime: number;
  
  /** Current environment (development, production, etc.) */
  environment: string;
  
  /** Application version */
  version: string;
  
  /** Memory usage statistics in MB */
  memory: {
    /** Heap memory used in MB */
    used: number;
    /** Total heap memory in MB */
    total: number;
    /** External memory in MB */
    external: number;
  };
  
  /** System information */
  system: {
    /** Operating system platform */
    platform: string;
    /** Node.js version */
    nodeVersion: string;
    /** Process ID */
    pid: number;
  };
}