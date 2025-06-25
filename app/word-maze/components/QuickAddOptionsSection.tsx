import React from 'react'

export default function QuickAddOptionsSection() {
  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { icon: '📸', title: 'Add from Photo', subtitle: 'Snap menus, books—Xpeak AI pulls out suggested vocab.', badge: 'Coming Soon' },
          { icon: '📄', title: 'Upload Lesson Notes', subtitle: 'Copy-paste or upload—AI extracts top new words for you.', badge: 'Coming Soon' },
        ].map((opt) => (
          <div key={opt.title} className="bg-white rounded-2xl shadow transition-shadow p-6 space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center text-2xl">{opt.icon}</div>
              <span className="text-xs bg-muted rounded-full px-2 py-1">{opt.badge}</span>
            </div>
            <h3 className="font-semibold text-text">{opt.title}</h3>
            <p className="text-text-muted text-sm">{opt.subtitle}</p>
          </div>
        ))}
      </div>
    </section>
  )
} 