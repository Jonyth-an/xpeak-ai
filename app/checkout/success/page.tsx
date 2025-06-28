export default function CheckoutSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="max-w-lg w-full py-20 px-6 sm:px-10 bg-white rounded-lg shadow text-center">
        <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
        <p className="mb-6">Thank you for subscribing to Xpeak AI. Your payment was processed successfully.</p>
        <a href="/dashboard" className="text-blue-600 underline">Go to your dashboard</a>
      </div>
    </div>
  );
} 