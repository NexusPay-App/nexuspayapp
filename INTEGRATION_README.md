# NexusPay Frontend Integration

This document explains the clean and comprehensive integration of NexusPay backend APIs (running on port 8000) with the Next.js frontend.

## 🏗️ Architecture Overview

The integration follows a clean, modular architecture:

```
nexuspayapp/
├── lib/                    # Core API integration
│   ├── api.ts             # Axios client with interceptors
│   ├── auth.ts            # Authentication API functions
│   ├── crypto.ts          # Crypto operations API
│   ├── mpesa.ts           # M-Pesa operations API
│   ├── business.ts        # Business account API
│   └── index.ts           # Main exports
├── hooks/                 # React hooks for API calls
│   ├── useApi.ts          # Generic API hook
│   ├── useCrypto.ts       # Crypto operations hook
│   └── useMpesa.ts        # M-Pesa operations hook
├── context/               # React context providers
│   └── AuthContext.js     # Updated authentication context
└── components/            # Example UI components
    ├── auth/              # Authentication forms
    ├── crypto/            # Crypto operation forms
    └── mpesa/             # M-Pesa operation forms
```

## 🔧 Setup Instructions

### 1. Backend Configuration

Ensure your backend is running on `http://localhost:8000` with the following endpoints available:

- Authentication: `/api/auth/*`
- Crypto operations: `/api/token/*`
- M-Pesa operations: `/api/mpesa/*`
- Business operations: `/api/business/*`

### 2. Frontend Dependencies

All required dependencies are already installed:
- `axios` - HTTP client
- `react-hot-toast` - Toast notifications
- `@tanstack/react-query` - Data fetching (optional, for advanced usage)

### 3. Environment Setup

Create a `.env.local` file (if needed for production):

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

For production, the API will automatically use: `https://api.nexuspaydefi.xyz/api`

## 🚀 Usage Examples

### Authentication

```tsx
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const { login, verifyLogin, loading } = useAuth();
  
  const handleLogin = async (email: string, password: string) => {
    try {
      // Step 1: Initiate login
      await login({ email, password });
      
      // Step 2: Verify with OTP (user enters OTP)
      const userData = await verifyLogin({ email, otp: '123456' });
      
      // User is now logged in and redirected
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
}
```

### Crypto Operations

```tsx
import { useCrypto } from '../hooks/useCrypto';

function SendTokensPage() {
  const { sendToken, sendTokenLoading } = useCrypto();
  
  const handleSendTokens = async () => {
    try {
      const response = await sendToken({
        recipientIdentifier: '+254712345678',
        amount: '10.5',
        senderAddress: user.walletAddress,
        chain: 'arbitrum'
      });
      
      console.log('Transaction:', response.data.transactionCode);
    } catch (error) {
      console.error('Send failed:', error);
    }
  };
}
```

### M-Pesa Operations

```tsx
import { useMpesa } from '../hooks/useMpesa';

function BuyCryptoPage() {
  const { buyCrypto, buyCryptoLoading } = useMpesa();
  
  const handleBuyCrypto = async () => {
    try {
      const response = await buyCrypto({
        cryptoAmount: '0.5',
        phone: '+254712345678',
        chain: 'arbitrum',
        tokenType: 'USDC'
      });
      
      console.log('Transaction ID:', response.data.transactionId);
      console.log('Success Code:', response.data.successCode);
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };
}
```

### Revolutionary Pay with Crypto

```tsx
import { useMpesa } from '../hooks/useMpesa';

function PayBillsPage() {
  const { payWithCrypto, payWithCryptoLoading } = useMpesa();
  
  const handlePayElectricityBill = async () => {
    try {
      const response = await payWithCrypto({
        amount: 2500,           // KES amount
        cryptoAmount: 18.75,    // USDC to spend
        targetType: 'paybill',
        targetNumber: '888880', // KPLC
        accountNumber: '123456789',
        chain: 'polygon',
        tokenType: 'USDC',
        description: 'Electricity bill'
      });
      
      console.log('Payment successful!');
      console.log('Crypto TX:', response.data.cryptoTransactionHash);
      console.log('M-Pesa TX:', response.data.mpesaTransactionId);
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };
}
```

## 🔐 Authentication Flow

### Registration Flow
1. User fills registration form
2. `register()` - Creates account, sends OTP
3. `verifyEmail()` or `verifyPhone()` - Verifies OTP, returns JWT token
4. User is logged in automatically

### Login Flow
1. User enters email/password
2. `login()` - Validates credentials, sends OTP
3. `verifyLogin()` - Verifies OTP, returns JWT token
4. User is logged in

### Token Management
- JWT tokens are automatically stored in localStorage
- Axios interceptors add tokens to all requests
- Expired tokens trigger automatic logout
- Token validation on app initialization

## 🎯 Key Features

### 1. Automatic Error Handling
- All API calls include error handling
- Toast notifications for user feedback
- Automatic token refresh/logout on 401 errors

### 2. Loading States
- Every API call has loading states
- UI components can show spinners/disabled states
- Prevents multiple simultaneous requests

### 3. Type Safety
- Full TypeScript support
- Typed API responses and request data
- IntelliSense support for all functions

### 4. Modular Design
- Separate files for different API domains
- Reusable hooks for common operations
- Clean separation of concerns

## 🌟 Revolutionary Features

### Pay with Crypto
The most innovative feature allows users to pay bills and shop using their crypto balance:

- **Electricity Bills**: Pay KPLC using USDC
- **Water Bills**: Pay Nairobi Water using ETH
- **Shopping**: Pay at tills using any supported crypto
- **Automatic Conversion**: Real-time crypto-to-KES conversion
- **Rollback Protection**: Crypto returned if payment fails

### Enhanced Transaction History
- Multi-currency values (USD, KES)
- Blockchain explorer links
- Portfolio impact analysis
- Dashboard-ready formatting

## 🔧 Customization

### Adding New Endpoints

1. **Add to API file** (e.g., `lib/crypto.ts`):
```tsx
export const cryptoAPI = {
  newEndpoint: async (data: NewData): Promise<Response> => {
    const response = await apiClient.post('/new-endpoint', data);
    return response.data;
  },
};
```

2. **Add to hook** (e.g., `hooks/useCrypto.ts`):
```tsx
const newEndpointApi = useApi();

const callNewEndpoint = useCallback(async (data: NewData) => {
  return newEndpointApi.execute(
    () => cryptoAPI.newEndpoint(data),
    { showSuccessToast: true }
  );
}, [newEndpointApi]);
```

3. **Use in component**:
```tsx
const { callNewEndpoint, newEndpointLoading } = useCrypto();
```

### Custom Error Handling

```tsx
const { execute } = useApi();

const customApiCall = async () => {
  try {
    await execute(
      () => apiClient.post('/endpoint', data),
      {
        showErrorToast: false, // Disable automatic error toast
        onError: (error) => {
          // Custom error handling
          if (error.response?.status === 400) {
            alert('Custom error message');
          }
        }
      }
    );
  } catch (error) {
    // Additional error handling
  }
};
```

## 🧪 Testing

### API Testing
```tsx
// Test authentication
const testAuth = async () => {
  try {
    const response = await authAPI.login({
      email: 'test@example.com',
      password: 'TestPassword123'
    });
    console.log('Login response:', response);
  } catch (error) {
    console.error('Login test failed:', error);
  }
};
```

### Component Testing
```tsx
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';
import { LoginForm } from '../components/auth/LoginForm';

test('renders login form', () => {
  render(
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
  
  expect(screen.getByText('Login to NexusPay')).toBeInTheDocument();
});
```

## 📱 Mobile Considerations

The integration is mobile-ready:
- Responsive forms
- Touch-friendly inputs
- Mobile-optimized loading states
- PWA support (already configured)

## 🔒 Security Best Practices

1. **Token Storage**: JWT tokens in localStorage (consider httpOnly cookies for production)
2. **Request Validation**: All requests validated on backend
3. **Error Handling**: No sensitive data in error messages
4. **HTTPS**: Use HTTPS in production
5. **Rate Limiting**: Backend implements rate limiting

## 🚀 Production Deployment

1. **Environment Variables**:
```env
NEXT_PUBLIC_API_BASE_URL=https://api.nexuspaydefi.xyz/api
```

2. **Build Optimization**:
```bash
npm run build
npm start
```

3. **Error Monitoring**: Consider adding Sentry or similar

## 📞 Support

For integration support:
- Check the API documentation: `backendMirror/API_DOCUMENTATION.md`
- Review example components in `components/`
- Test with sandbox environment first

## 🎉 Getting Started

1. **Start the backend**: Ensure it's running on port 8000
2. **Import components**: Use the example components as starting points
3. **Customize**: Modify forms and styling to match your design
4. **Test**: Start with authentication, then add other features
5. **Deploy**: Follow production deployment guidelines

The integration is designed to be developer-friendly, type-safe, and production-ready. Happy coding! 🚀