'use client'

import React from 'react';
import Layout from '../../../components/Layout';
import TutorProfile from '../../components/TutorProfile';

export default function TutorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const [tutorId, setTutorId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadParams = async () => {
      const { id } = await params;
      setTutorId(id);
    };
    loadParams();
  }, [params]);

  if (!tutorId) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <TutorProfile tutorId={tutorId} showSidebar={true} />
    </Layout>
  );
} 