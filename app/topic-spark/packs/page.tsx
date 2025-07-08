import React from 'react';
import Layout from '../../../components/Layout';

export default function PacksPage() {
  return (
    <Layout>
      <main className="min-h-[60vh] flex flex-col items-center justify-center py-20 px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-text mb-4 text-center">
          All Topic Packs
        </h1>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-xl">
          Explore curated packs around global events, holidays, and cultural themes. More packs and features coming soon!
        </p>
        <div className="w-full max-w-2xl h-64 bg-token-surface-subtle rounded-token-lg flex items-center justify-center text-token-text-tertiary text-xl">
          [Topic Packs content will appear here]
        </div>
      </main>
    </Layout>
  );
} 