"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/ui/footer";
import {
  Users,
  Target,
  Heart,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function AboutPage() {
  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Co-founder",
      bio: "Former Google engineer with 10+ years in AI and product development. Passionate about making technology accessible to everyone.",
      avatar: "👩‍💼",
    },
    {
      name: "Michael Chen",
      role: "CTO & Co-founder",
      bio: "AI researcher with expertise in natural language processing and speech recognition. Previously at OpenAI and Microsoft.",
      avatar: "👨‍💻",
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Product",
      bio: "Product leader with experience building user-centric applications. Focused on creating intuitive and effective learning experiences.",
      avatar: "👩‍🎨",
    },
    {
      name: "David Kim",
      role: "Head of Engineering",
      bio: "Full-stack engineer specializing in real-time applications and scalable systems. Loves solving complex technical challenges.",
      avatar: "👨‍🔧",
    },
  ];

  const values = [
    {
      icon: Heart,
      title: "Empathy First",
      description:
        "We understand the stress and anxiety that comes with job interviews. Our platform is designed to reduce that pressure and build confidence.",
    },
    {
      icon: Target,
      title: "Results-Driven",
      description:
        "Every feature we build is focused on helping users improve their interview performance and land their dream jobs.",
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description:
        "Your interview data is sacred. We use enterprise-grade security to protect your personal information and practice sessions.",
    },
    {
      icon: Zap,
      title: "Innovation",
      description:
        "We constantly push the boundaries of AI technology to provide the most realistic and effective interview practice experience.",
    },
  ];

  const stats = [
    { number: "10,000+", label: "Active Users" },
    { number: "50,000+", label: "Interviews Conducted" },
    { number: "95%", label: "Success Rate" },
    { number: "4.9/5", label: "User Rating" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </Link>
              <Link href="/">
                <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  AI Interviewer
                </span>
              </Link>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/#features"
                className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
              >
                About
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-slate-700 hover:text-slate-900"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-4 py-2 text-sm font-medium mb-6">
            🚀 Our Story
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Revolutionizing Interview Preparation with AI
          </h1>
          <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            We&apos;re on a mission to democratize access to high-quality
            interview practice. By combining cutting-edge AI technology with
            human-centered design, we&apos;re helping job seekers worldwide
            build confidence and succeed in their career goals.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Traditional interview preparation is expensive, time-consuming,
                and often ineffective. We believe everyone deserves access to
                world-class interview practice, regardless of their background
                or financial situation.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Our AI-powered platform provides realistic, personalized
                interview experiences that help users build confidence, improve
                their skills, and ultimately land their dream jobs.
              </p>
              <div className="flex items-center space-x-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                  >
                    Join Our Mission
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Why We Do This</h3>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-300 mt-0.5 flex-shrink-0" />
                    <span>Reduce interview anxiety and build confidence</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-300 mt-0.5 flex-shrink-0" />
                    <span>
                      Make quality interview practice accessible to everyone
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-300 mt-0.5 flex-shrink-0" />
                    <span>Help people achieve their career goals</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-300 mt-0.5 flex-shrink-0" />
                    <span>Bridge the gap between education and employment</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Our Impact in Numbers
            </h2>
            <p className="text-xl text-slate-600">
              See how we're making a difference in people's careers
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-lg text-slate-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Our Values
            </h2>
            <p className="text-xl text-slate-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card
                  key={index}
                  className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <CardHeader>
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl text-slate-900">
                      {value.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600 leading-relaxed">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Meet Our Team
            </h2>
            <p className="text-xl text-slate-600">
              The passionate people behind AI Interviewer
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card
                key={index}
                className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CardHeader>
                  <div className="text-6xl mb-4">{member.avatar}</div>
                  <CardTitle className="text-xl text-slate-900">
                    {member.name}
                  </CardTitle>
                  <CardDescription className="text-blue-600 font-semibold">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600 leading-relaxed">
                    {member.bio}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              How It All Started
            </h2>
            <p className="text-xl text-slate-600">
              The journey from idea to reality
            </p>
          </div>

          <div className="space-y-12">
            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  The Problem
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Our founders experienced firsthand the challenges of interview
                  preparation. Traditional methods were expensive, inconvenient,
                  and often ineffective. They knew there had to be a better way.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  The Solution
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Combining their expertise in AI, product development, and user
                  experience, they created a platform that provides realistic,
                  personalized interview practice accessible to everyone.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  The Impact
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Today, AI Interviewer has helped thousands of people improve
                  their interview skills and land their dream jobs. We&apos;re
                  just getting started on our mission to democratize interview
                  preparation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Join Us in Our Mission
          </h2>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed">
            Be part of the revolution in interview preparation. Start your
            journey to interview success today.
          </p>
          <div className="flex justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold border-0"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer icon="users" />
    </div>
  );
}
