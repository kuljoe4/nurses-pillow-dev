const fs = require('fs');
let code = fs.readFileSync('src/components/HostPortalView.tsx', 'utf8');

// Add state for stripe connect instance
const stateHookStr = `  const [stripeError, setStripeError] = useState<string | null>(null);`;
const newStateHookStr = `  const [stripeError, setStripeError] = useState<string | null>(null);
  const [stripeConnectInstance, setStripeConnectInstance] = useState<any>(null);
  const [showEmbeddedOnboarding, setShowEmbeddedOnboarding] = useState(false);`;

code = code.replace(stateHookStr, newStateHookStr);

// Rewrite handleConnectStripe
const oldHandleConnectStr = `  const handleConnectStripe = async () => {
    setIsConnectingStripe(true);
    setStripeError(null);
    try {
      const token = localStorage.getItem('np_auth_token') || sessionStorage.getItem('np_auth_token');
      const res = await fetch('/api/stripe/account-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': \`Bearer \${token}\` } : {}),
        },
        body: JSON.stringify({
          hostId,
          returnUrl: \`\${window.location.origin}\${window.location.pathname}?stripe_return=true\`,
          refreshUrl: \`\${window.location.origin}\${window.location.pathname}?stripe_refresh=true\`,
        }),
      });

      const isJson = res.headers.get('content-type')?.includes('application/json');

      if (res.ok && isJson) {
        const data = (res.headers.get('content-type')?.includes('application/json') ? await res.json() : {});
        if (data.url) {
          window.location.href = data.url;
        } else {
          setIsConnectingStripe(false);
        }
      } else {
        if (isJson) {
          const errorData = (res.headers.get('content-type')?.includes('application/json') ? await res.json() : {});
          console.error(\`Failed to create account link: \${res.status} \${res.statusText}\`, errorData);
          if (errorData.error === 'StripeInvalidRequestError') {
             setStripeError('Payouts are currently unavailable because the platform owner needs to complete Stripe Connect onboarding.');
          } else {
             setStripeError(errorData.message || 'Failed to connect payouts. Please try again.');
          }
        } else {
          console.error(\`Failed to create account link: \${res.status} \${res.statusText}\`);
          setStripeError('Failed to connect payouts due to a server error.');
        }
        setIsConnectingStripe(false);
      }
    } catch (err) {
      console.error('Failed to generate account link', err);
      setStripeError('A network error occurred while connecting payouts.');
      setIsConnectingStripe(false);
    }
  };`;

const newHandleConnectStr = `  const fetchClientSecret = async () => {
    const token = localStorage.getItem('np_auth_token') || sessionStorage.getItem('np_auth_token');
    const res = await fetch('/api/stripe/account-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': \`Bearer \${token}\` } : {}),
      },
      body: JSON.stringify({ hostId }),
    });

    const isJson = res.headers.get('content-type')?.includes('application/json');
    if (!res.ok) {
        if (isJson) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to create account session');
        } else {
            throw new Error('Failed to create account session due to a server error.');
        }
    }
    const data = await res.json();
    if (data.sandbox && !data.client_secret) {
        throw new Error(data.message || 'Sandbox simulated mode, skipping Embedded UI');
    }
    return data.client_secret;
  };

  const handleConnectStripe = async () => {
    setIsConnectingStripe(true);
    setStripeError(null);
    try {
      // First attempt to get the client secret to see if it fails due to mock key
      await fetchClientSecret();

      const VITE_STRIPE_PUBLISHABLE_KEY = (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx';
      const stripeConnect = loadConnectAndInitialize({
        publishableKey: VITE_STRIPE_PUBLISHABLE_KEY,
        fetchClientSecret,
        appearance: {
          overlays: 'dialog',
          variables: {
            colorPrimary: '#0A6FA8',
          },
        },
      });
      setStripeConnectInstance(stripeConnect);
      setShowEmbeddedOnboarding(true);
    } catch (err: any) {
      console.error('Failed to initialize Stripe Connect Embedded components', err);
      if (err.message.includes('simulated')) {
          setStripeError(err.message);
      } else {
          setStripeError('A network error occurred while connecting payouts.');
      }
    } finally {
        setIsConnectingStripe(false);
    }
  };`;

code = code.replace(oldHandleConnectStr, newHandleConnectStr);

fs.writeFileSync('src/components/HostPortalView.tsx', code);
