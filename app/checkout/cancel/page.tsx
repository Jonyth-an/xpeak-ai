export default function CheckoutCancel() {
  return (
    <div className="max-w-lg mx-auto py-20 text-center">
      <h1 className="text-3xl font-bold mb-4">Payment Canceled</h1>
      <p className="mb-6">Your payment was not completed. You can try again at any time.</p>
      <a href="/pricing" className="text-blue-600 underline">Back to pricing</a>
    </div>
  );
} 