// Export all Signet-related functionality from this module

// Client and types
export * from '../signet-client';

// React Context
export {
  SignetProvider,
  useSignet
} from '../signet-context';

// Re-export hook (for completeness)
export { useSignet as useSignetHook } from '../hooks/use-signet';

// Demo component
export { SignetDemo } from '../../components/signet-demo';