export default function CheckoutCancel() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-token-surface">
      <div className="max-w-lg w-full py-20 px-6 sm:px-10 bg-token-elevated rounded-lg shadow text-center border border-token">
        <div className="text-token-warning text-6xl mb-4">❌</div>
        <h1 className="text-3xl font-bold mb-4 text-token-primary">Payment Canceled</h1>
        <p className="mb-6 text-token-secondary">Your payment was not completed. You can try again at any time.</p>
        <a href="/pricing" className="text-token-link underline hover:text-token-accent">Back to pricing</a>
      </div>
    </div>
  );
} 