import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  Brain, 
  BarChart3, 
  Users, 
  Zap, 
  Shield,
  ArrowRight,
  Play,
  CheckCircle,
  Star
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                AI Interviewer
              </span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
                Features
              </Link>
              <Link href="#pricing" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
                Pricing
              </Link>
              <Link href="#about" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
                About
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-slate-700 hover:text-slate-900">
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
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-4 py-2 text-sm font-medium mb-6">
              🚀 Trusted by 10,000+ professionals
            </Badge>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-8 leading-tight">
            Master Your Interviews with
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> AI-Powered</span> Practice
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Practice interviews with realistic AI questions, get instant feedback, and improve your skills with personalized recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300">
                Start Free Practice
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all duration-300">
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </Link>
          </div>
          
          {/* Social Proof */}
          <div className="flex items-center justify-center space-x-8 text-slate-500">
            <div className="flex items-center space-x-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm font-medium">4.9/5 rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">Free 7-day trial</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Everything You Need to Ace Your Interviews
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              From technical questions to behavioral scenarios, our AI platform provides comprehensive interview preparation.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Mic className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl text-slate-900">Real-time Speech Recognition</CardTitle>
                <CardDescription className="text-slate-600 leading-relaxed">
                  Speak naturally and get instant transcription with advanced AI speech recognition technology.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl text-slate-900">AI-Powered Analysis</CardTitle>
                <CardDescription className="text-slate-600 leading-relaxed">
                  Get detailed feedback on your technical knowledge, communication skills, and problem-solving approach.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl text-slate-900">Performance Analytics</CardTitle>
                <CardDescription className="text-slate-600 leading-relaxed">
                  Track your progress over time with comprehensive analytics and improvement suggestions.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl text-slate-900">Personalized Learning</CardTitle>
                <CardDescription className="text-slate-600 leading-relaxed">
                  Adaptive questions based on your performance and personalized improvement recommendations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl text-slate-900">Real-time Feedback</CardTitle>
                <CardDescription className="text-slate-600 leading-relaxed">
                  Receive immediate feedback and suggestions to improve your responses in real-time.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl text-slate-900">Secure & Private</CardTitle>
                <CardDescription className="text-slate-600 leading-relaxed">
                  Your interview data is encrypted and secure. Practice with confidence knowing your privacy is protected.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Interview Skills?
          </h2>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed">
            Join thousands of professionals who have improved their interview performance with AI Interviewer.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300 font-semibold">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">AI Interviewer</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Master your interviews with AI-powered practice and feedback.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-white">Product</h3>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/demo" className="hover:text-white transition-colors">Demo</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-white">Company</h3>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-white">Support</h3>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2024 AI Interviewer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
