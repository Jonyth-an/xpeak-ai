import React from "react";
import { Card, Text, Badge } from "@/app/components/ui";

const supporterTiers = [
  {
    name: "Starter",
    price: "$25",
    credit: "$50",
    bonus: "2x credits",
    perks: "Supporter badge"
  },
  {
    name: "Builder",
    price: "$50",
    credit: "$100",
    bonus: "2x credits",
    perks: "1-on-1 session (15m)"
  },
  {
    name: "Champion",
    price: "$100+",
    credit: "$200+",
    bonus: "2x credits",
    perks: (
      <span>
        1-on-1 session (30m), Founding Wall badge, VIP channel
      </span>
    )
  }
];

export default function SupporterPacksSection() {
  return (
    <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <span role="img" aria-label="diamond">💎</span>
          <Text as="h2" className="text-xl font-bold">Founding Supporter Packs (Pre-MVP)</Text>
        </div>
        <p className="text-gray-600 mb-6">Back Xpeak early and receive extra perks when we launch.</p>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl overflow-hidden border">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-left">
                <th className="px-4 py-3 font-semibold">Pack Name</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Launch Credit</th>
                <th className="px-4 py-3 font-semibold">Bonus</th>
                <th className="px-4 py-3 font-semibold">Perks</th>
              </tr>
            </thead>
            <tbody>
              {supporterTiers.map((tier, idx) => (
                <tr key={tier.name} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-3 font-medium">{tier.name}</td>
                  <td className="px-4 py-3">{tier.price}</td>
                  <td className="px-4 py-3">{tier.credit}</td>
                  <td className="px-4 py-3">{tier.bonus}</td>
                  <td className="px-4 py-3">{tier.perks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-xs text-gray-500 mt-4">
          <div>Refundable before launch. Credits redeemable for any paid Xpeak plan.</div>
        </div>
      </div>
    </section>
  );
} 