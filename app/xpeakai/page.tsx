"use client";

import React from "react";
import { Card, Button, Text } from '@/app/components/ui';
import Link from "next/link";
import { Globe, Users, MessageCircle, KeyRound, User as UserIcon, Gavel, Wrench } from 'lucide-react';
import Layout from '../../components/Layout';

export default function AboutPage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="w-full py-16 flex flex-col items-center text-center bg-white border-b">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-gray-100">
            <UserIcon className="w-8 h-8 text-gray-500" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">About Xpeak AI</h1>
        <div className="flex items-center justify-center gap-2 mb-2 text-lg font-medium text-gray-700">
          <Globe className="w-5 h-5 text-blue-600" />
          <span>Mission: Help the World Speak as One.</span>
        </div>
        <p className="text-gray-600 max-w-xl mx-auto mb-2">
          We believe language is power — and everyone deserves access to it.
        </p>
      </section>

      {/* Intro & Features */}
      <section className="w-full py-12 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <p className="text-gray-700 text-lg mb-6">
            Xpeak AI is your personal language wingman — powered by AI, fueled by curiosity, and designed to help you actually speak with confidence.<br /><br />
            Whether you're prepping for study abroad, eyeing that global dream job, or just want to say more than "hello" on your next trip, we've got your back.
          </p>
        </div>
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="flex flex-col items-center text-center">
            <MessageCircle className="w-8 h-8 mb-2 text-blue-600" />
            <div className="font-semibold mb-1">Co-create lesson topics</div>
            <div className="text-gray-600 text-sm">that you care about</div>
          </div>
          <div className="flex flex-col items-center text-center">
            <Users className="w-8 h-8 mb-2 text-blue-600" />
            <div className="font-semibold mb-1">Practice with AI tutors</div>
            <div className="text-gray-600 text-sm">that feel surprisingly human</div>
          </div>
          <div className="flex flex-col items-center text-center">
            <KeyRound className="w-8 h-8 mb-2 text-blue-600" />
            <div className="font-semibold mb-1">Unlock words, track progress</div>
            <div className="text-gray-600 text-sm">and maybe even flex your badge collection</div>
          </div>
        </div>
        <div className="max-w-2xl mx-auto text-center text-gray-700 text-base">
          We're not just another language app.<br />
          We're building something more personal, more flexible, and honestly… way more fun.<br />
          And we're just getting started.
        </div>
      </section>

      {/* Founder Section */}
      <section className="w-full py-16 bg-white border-t">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-2">
              <UserIcon className="w-8 h-8 text-gray-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Hey, I'm the founder — and yep, it's just me (for now).</h2>
          </div>
          <p className="text-gray-700 mb-6">
            No team. No VC backing. No mental support (well… depends on the coffee).<br /><br />
            Just one guy, one laptop, and a not-so-chill obsession with building the best AI-powered language experience possible.
          </p>
          {/* Background Card */}
          <Card className="mb-4 text-left">
            <div className="flex items-center gap-2 font-semibold mb-1">
              <UserIcon className="w-5 h-5 text-blue-600" />
              My Background
            </div>
            <div className="text-gray-700 text-sm">
              Before Xpeak AI, I spent 9+ years at Cambly, a YC-backed startup where I was the first and only hire for the Greater China team. I interviewed, hired, and managed every single person on my team — growing it to 40+ full-time legends (and over 70 including part-time support).<br /><br />
              I didn't just lead the org — I built it.<br /><br />
              That included product, design, engineering, marketing, ops, support, finance, and even…yes, legal!
            </div>
          </Card>
          {/* Legal Card */}
          <Card className="mb-4 text-left">
            <div className="flex items-center gap-2 font-semibold mb-1">
              <Gavel className="w-5 h-5 text-blue-600" />
              Legal (aka my unlicensed superpower)
            </div>
            <div className="text-gray-700 text-sm">
              Especially in China, one of the most highly regulated markets in the world, I learned how to navigate foreign business operations for 9+ years — without a single compliance mishep.<br /><br />
              That's not luck. That's late nights with legal docs, endless policy changes, and a 6th sense for regulation landmines.<br /><br />
              If you think UX Pilot is impressive… try staying compliant in China for nearly a decade.
            </div>
          </Card>
          <div className="text-gray-700 mb-6">
            We scaled APAC from 0 to $40M+ ARR — and I loved every minute of it.<br /><br />
            Now? I'm back to zero.<br />
            Solo founder. No product at the start.<br /><br />
            Just me, learning to code in 2025, and shipping every day with my very chill (and non-unionized) co-founder: Cursor.
          </div>
          <Card className="mb-6 text-left bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-2 font-semibold mb-1">
              <Wrench className="w-5 h-5 text-blue-600" />
              <span>If something breaks, don't panic. It just means I'm debugging at 2am with snacks and tears.<br />#SoloDevLife 🛠️</span>
            </div>
          </Card>
        </div>
      </section>

      {/* Roadmap/Changelog Section */}
      <section className="w-full py-16 bg-gray-50 border-t">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h3 className="text-xl font-semibold mb-4">Want to be part of this wild ride?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6 flex flex-col items-center">
              <div className="font-semibold mb-2">Shape the Roadmap</div>
              <div className="text-gray-600 text-sm mb-4">Suggest features, upvote others, or just poke around and see what's next. Yes, I actually read it.</div>
              <Button asChild variant="primary">
                <a href="https://xpeakai.featurebase.app/roadmap" target="_blank" rel="nofollow noreferrer">Join the Discussion</a>
              </Button>
            </Card>
            <Card className="p-6 flex flex-col items-center">
              <div className="font-semibold mb-2">See What I Broke Today</div>
              <div className="text-gray-600 text-sm mb-4">Read the Daily Changelog for raw, unfiltered build-in-public energy. No fluff. Just commits, crashes, and caffeine.</div>
              <Button asChild variant="outline">
                <a href="https://xpeakai.featurebase.app/changelog" target="_blank" rel="nofollow noreferrer">View Changelog</a>
              </Button>
            </Card>
          </div>
        </div>
        <div className="max-w-xl mx-auto text-center text-gray-700 text-base mt-10">
          If you're reading this — you're early.<br />
          You're part of the story.<br />
          And one day, you'll get to say: "Yeah… I was there before it got cool."
        </div>
      </section>
    </Layout>
  );
} 