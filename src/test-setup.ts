import { cleanup } from '@testing-library/preact'
import { afterEach } from 'vitest'

// Testing Library only cleans up on its own when Vitest globals are on.
afterEach(cleanup)
