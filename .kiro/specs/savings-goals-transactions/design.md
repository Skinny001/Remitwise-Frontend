# Design Document: Savings Goals Transactions

## Overview

This feature implements the transaction building layer for savings goals in RemitWise. It provides a clean separation between transaction construction (backend) and transaction signing/submission (frontend). The backend builds unsigned Stellar transactions and returns them as XDR strings, while the frontend handles wallet interaction and submission to the network.

The implementation consists of two main components:
1. Transaction builder functions in `lib/contracts/savings-goals.ts` that construct Stellar transactions
2. Next.js API routes that validate inputs, authenticate users, and return transaction XDRs

## Architecture

### High-Level Flow

```
Frontend → API Route → Validate Input → Authenticate User → Build Transaction → Return XDR → Frontend Signs & Submits
```

### Component Layers

1. **Transaction Builders** (`lib/contracts/savings-goals.ts`)
   - Pure functions that construct Stellar transactions
   - No side effects or external dependencies
   - Return unsigned transaction XDR strings

2. **API Routes** (`app/api/goals/*`)
   - Handle HTTP requests from frontend
   - Validate request parameters
   - Authenticate users via session
   - Call transaction builders
   - Return JSON responses with XDR or errors

3. **Frontend Integration** (existing pages)
   - Call API endpoints with user input
   - Receive transaction XDR
   - Sign with user's wallet (Freighter)
   - Submit to Stellar network

## Components and Interfaces

### Transaction Builder Functions

Located in `lib/contracts/savings-goals.ts`:

```typescript
interface BuildTxResult {
  xdr: string;
}

// Create a new savings goal
function buildCreateGoalTx(
  owner: string,
  name: string,
  targetAmount: number,
  targetDate: string
): BuildTxResult

// Add funds to an existing goal
function buildAddToGoalTx(
  caller: string,
  goalId: string,
  amount: number
): BuildTxResult

// Withdraw funds from a goal
function buildWithdrawFromGoalTx(
  caller: string,
  goalId: string,
  amount: number
): BuildTxResult

// Lock a goal to prevent withdrawals
function buildLockGoalTx(
  caller: string,
  goalId: string
): BuildTxResult

// Unlock a goal to allow withdrawals
function buildUnlockGoalTx(
  caller: string,
  goalId: string
): BuildTxResult
```

### API Endpoints

All endpoints return JSON in this format:

```typescript
// Success response
{
  xdr: string;
  simulation?: {
    success: boolean;
    result?: any;
  };
}

// Error response
{
  error: string;
  details?: string;
}
```

#### POST /api/goals

Create a new savings goal.

**Request Body:**
```typescript
{
  name: string;
  targetAmount: number;
  targetDate: string; // ISO 8601 format
}
```

**Response:** 200 with XDR, or 400/401 with error

#### POST /api/goals/[id]/add

Add funds to a goal.

**Request Body:**
```typescript
{
  amount: number;
}
```

**Response:** 200 with XDR, or 400/401 with error

#### POST /api/goals/[id]/withdraw

Withdraw funds from a goal.

**Request Body:**
```typescript
{
  amount: number;
}
```

**Response:** 200 with XDR, or 400/401 with error

#### POST /api/goals/[id]/lock

Lock a goal to prevent withdrawals.

**Request Body:** Empty

**Response:** 200 with XDR, or 400/401 with error

#### POST /api/goals/[id]/unlock

Unlock a goal to allow withdrawals.

**Request Body:** Empty

**Response:** 200 with XDR, or 400/401 with error

## Data Models

### Goal Creation Parameters

```typescript
interface CreateGoalParams {
  owner: string;        // Stellar public key
  name: string;         // Goal name (1-100 characters)
  targetAmount: number; // Target amount (positive number)
  targetDate: string;   // ISO 8601 date string (future date)
}
```

### Goal Operation Parameters

```typescript
interface GoalOperationParams {
  caller: string;  // Stellar public key from session
  goalId: string;  // Unique goal identifier
  amount?: number; // Amount for add/withdraw operations (positive)
}
```

### Session Data

```typescript
interface Session {
  publicKey: string; // User's Stellar public key
  // Additional session fields as needed
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Positive Amount Validation

*For any* amount parameter in add or withdraw operations, the validation should reject non-positive values and accept positive values.

**Validates: Requirements 2.2, 3.2**

### Property 2: Future Date Validation

*For any* target date in goal creation, the validation should reject dates in the past or present and accept future dates.

**Validates: Requirements 1.3**

### Property 3: Authentication Consistency

*For any* API endpoint requiring authentication, an unauthenticated request should return 401 status code.

**Validates: Requirements 2.4, 3.4, 4.3, 5.3**

### Property 4: XDR Format Validity

*For any* successful transaction build operation, the returned XDR should be a valid base64-encoded string that can be parsed by Stellar SDK.

**Validates: Requirements 1.4, 2.5, 3.5, 4.4, 5.4**

### Property 5: Error Response Structure

*For any* validation failure, the error response should include both an error message and a 400 status code.

**Validates: Requirements 6.1, 6.3**

### Property 6: Goal ID Validation

*For any* operation requiring a goal ID, the system should validate that the goal ID is provided and non-empty.

**Validates: Requirements 2.3, 3.3, 4.2, 5.2**

## Error Handling

### Validation Errors (400)

- Missing required fields
- Invalid amount (non-positive, NaN, Infinity)
- Invalid target date (past date, invalid format)
- Invalid goal ID (empty, malformed)
- Name too long or empty

### Authentication Errors (401)

- Missing session
- Invalid session
- Expired session

### Server Errors (500)

- Transaction building failures
- Unexpected exceptions

### Error Response Format

```typescript
{
  error: "Brief error message",
  details: "Detailed explanation (optional)"
}
```

## Testing Strategy

### Unit Testing

We will use standard unit testing for specific examples and edge cases:

- Test each validation function with valid and invalid inputs
- Test error response formatting
- Test session extraction logic
- Test specific date edge cases (today, yesterday, tomorrow)
- Test specific amount edge cases (0, negative, very large numbers)

### Property-Based Testing

We will use **fast-check** (a property-based testing library for TypeScript/JavaScript) to verify universal properties across many randomly generated inputs.

**Configuration:**
- Each property test will run a minimum of 100 iterations
- Tests will use fast-check's built-in generators and custom generators for domain-specific types

**Property Test Tagging:**
- Each property-based test will include a comment in this format: `// Feature: savings-goals-transactions, Property {number}: {property_text}`
- Each correctness property will be implemented by a single property-based test

**Property Tests to Implement:**

1. **Property 1 Test**: Generate random numbers (positive, negative, zero, NaN, Infinity) and verify validation correctly accepts/rejects them
2. **Property 2 Test**: Generate random dates (past, present, future) and verify validation correctly accepts/rejects them
3. **Property 3 Test**: Generate random session states (valid, missing, invalid) and verify authentication returns correct status codes
4. **Property 4 Test**: Generate random valid inputs and verify all returned XDRs can be parsed by Stellar SDK
5. **Property 5 Test**: Generate random invalid inputs and verify all error responses have correct structure and status codes
6. **Property 6 Test**: Generate random goal ID values (empty, whitespace, valid) and verify validation correctly accepts/rejects them

### Integration Testing

- Test complete flow from API request to XDR response
- Test with mock Stellar network
- Verify transaction can be signed and submitted

## Implementation Notes

### Stellar SDK Usage

The implementation will use `@stellar/stellar-sdk` (already installed) for:
- Building transactions with `TransactionBuilder`
- Creating operations for contract calls
- Encoding transactions to XDR format
- Simulating transactions (optional)

### Contract Address Configuration

The Soroban contract address for savings goals will be stored in environment variables:
- `NEXT_PUBLIC_SAVINGS_GOALS_CONTRACT_ID`

### Network Configuration

Network settings will be configurable via environment variables:
- `NEXT_PUBLIC_STELLAR_NETWORK` (testnet/mainnet)
- `NEXT_PUBLIC_STELLAR_RPC_URL`

### Session Management

For this implementation, we'll use a simplified session approach:
- Session data will be extracted from request headers or cookies
- The `publicKey` field will be used as the caller address
- Full authentication implementation is outside the scope of this feature

### Transaction Simulation

Optionally, the API can simulate transactions before returning XDR:
- Helps catch errors early
- Provides gas estimates
- Can be enabled/disabled per endpoint

## Security Considerations

1. **Input Validation**: All inputs are validated before transaction building
2. **Authentication**: All operations require authenticated sessions
3. **Authorization**: Caller must own the goal for operations (enforced by smart contract)
4. **Rate Limiting**: Should be implemented at API gateway level (future enhancement)
5. **XSS Prevention**: All error messages are sanitized
6. **SQL Injection**: Not applicable (no database queries in this feature)

## Performance Considerations

1. **Transaction Building**: Fast operation (<10ms typically)
2. **Validation**: Minimal overhead (<1ms)
3. **No Database Calls**: All state is on-chain
4. **Caching**: Not applicable for transaction building
5. **Concurrent Requests**: Stateless design supports high concurrency

## Documentation for Frontend Integration

### Example Usage

#### Creating a Goal

```typescript
const response = await fetch('/api/goals', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: "Emergency Fund",
    targetAmount: 5000,
    targetDate: "2025-12-31"
  })
});

const { xdr } = await response.json();

// Sign with Freighter
const signedXdr = await window.freighter.signTransaction(xdr);

// Submit to network
const result = await server.submitTransaction(signedXdr);
```

#### Adding Funds

```typescript
const response = await fetch(`/api/goals/${goalId}/add`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: 100 })
});

const { xdr } = await response.json();
// Sign and submit...
```

#### Withdrawing Funds

```typescript
const response = await fetch(`/api/goals/${goalId}/withdraw`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: 50 })
});

const { xdr } = await response.json();
// Sign and submit...
```

#### Locking a Goal

```typescript
const response = await fetch(`/api/goals/${goalId}/lock`, {
  method: 'POST'
});

const { xdr } = await response.json();
// Sign and submit...
```

#### Unlocking a Goal

```typescript
const response = await fetch(`/api/goals/${goalId}/unlock`, {
  method: 'POST'
});

const { xdr } = await response.json();
// Sign and submit...
```

### Error Handling

```typescript
const response = await fetch('/api/goals', {
  method: 'POST',
  body: JSON.stringify({ /* ... */ })
});

if (!response.ok) {
  const { error, details } = await response.json();
  console.error(`Error: ${error}`, details);
  // Show error to user
  return;
}

const { xdr } = await response.json();
// Proceed with signing...
```
