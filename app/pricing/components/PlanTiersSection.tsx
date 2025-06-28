'use client';
import React, { useState } from "react";
import { Button, Badge, ToggleGroup, ToggleGroupOption, Card, Text } from "@/app/components/ui";

const plans = [
  {
    id: "free",
    name: "Xpeak Free",
    price: 0,
    priceLabel: "Free",
    priceSuffix: "",
    description: "Try AI-powered English learning at your own pace.",
    features: [
      "60 minutes of AI conversation per month",
      "Access to Word Maze vocabulary tool",
      "Co-create 2 custom topics per month",
      "Save progress & vocabulary"
    ],
    cta: "Great for exploring",
    highlight: false
  },
  {
    id: "plus",
    name: "Xpeak Plus",
    price: 14.99,
    priceLabel: "$14.99",
    priceSuffix: "/month",
    description: "For learners building real habits.",
    features: [
      "5 hours of AI tutoring/month",
      "Unlimited Word Maze access",
      "Co-create unlimited custom topics",
      "Save + review learning history",
      "Priority access during peak hours",
      "Rollover unused minutes for 1 month"
    ],
    cta: "Choose Plus",
    highlight: true,
    badge: "Best Value"
  },
  {
    id: "pro",
    name: "Xpeak Pro",
    price: 24.99,
    priceLabel: "$24.99",
    priceSuffix: "/month",
    description: "Unlock full AI coaching power.",
    features: [
      "12 hours of AI tutoring/month",
      "Priority queue for AI responses",
      "Rollover for 2 months",
      "Beta access to new features",
      "Early invites to Human Coach upgrades",
      "Direct support"
    ],
    cta: "Choose Pro",
    highlight: false
  }
];

const billingOptions: ToggleGroupOption[] = [
  { label: "Monthly", value: "month" },
  { label: <><span>Quarterly</span><span className="text-green-600 font-semibold ml-1">Save 10%</span></>, value: "quarter" },
  { label: <><span>Yearly</span><span className="text-green-600 font-semibold ml-1">Save 20%</span></>, value: "year" }
];

export default function PlanTiersSection() {
  const [billing, setBilling] = useState<string>("month");

  // Calculate price based on billing period
  const getPrice = (plan: any) => {
    if (plan.id === "free") return plan.priceLabel;
    let price = plan.price;
    if (billing === "quarter") price = (plan.price * 3 * 0.9).toFixed(2);
    if (billing === "year") price = (plan.price * 12 * 0.8).toFixed(2);
    return `$${price}`;
  };
  const getSuffix = (plan: any) => {
    if (plan.id === "free") return plan.priceSuffix;
    if (billing === "month") return "/month";
    if (billing === "quarter") return "/quarter";
    if (billing === "year") return "/year";
    return plan.priceSuffix;
  };

  return (
    <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Xpeak AI Pricing Tiers</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan to start your language adventure. Upgrade, downgrade, or cancel anytime.
          </p>
        </div>
        <div className="flex justify-center mb-12">
          <ToggleGroup options={billingOptions} value={billing} onChange={setBilling} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, idx) => (
            <Card
              key={plan.id}
              className={`flex flex-col h-full transition-transform duration-300
                ${plan.highlight ?
                  'md:scale-110 md:shadow-2xl md:-mt-6 border-2 border-yellow-400 ring-2 ring-yellow-300 z-10' :
                  'md:scale-95 md:opacity-80'
                }
              `}
            >
              <div className="flex-1 flex flex-col p-8">
                {plan.badge && (
                  <div className="flex justify-center mb-2">
                    <span className="inline-flex items-center gap-1 px-4 py-1 rounded-full bg-yellow-400 text-yellow-900 font-bold text-sm shadow-md border border-yellow-300 animate-pulse">
                      <svg className="w-4 h-4 text-yellow-700" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z"/></svg>
                      {plan.badge}
                    </span>
                  </div>
                )}
                <Text as="h3" className="text-xl font-semibold mb-1 text-center">{plan.name}</Text>
                <div className="text-center text-gray-500 mb-4">{plan.description}</div>
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold text-gray-900">{getPrice(plan)}</span>
                  <span className="text-lg text-gray-500 ml-1">{getSuffix(plan)}</span>
                </div>
                <ul className="mb-6 space-y-2">
                  {plan.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-center text-gray-700">
                      <span className="mr-2 text-green-500">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button variant={plan.highlight ? "primary" : "outline"} className="w-full mt-auto">
                  {plan.cta}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
} 