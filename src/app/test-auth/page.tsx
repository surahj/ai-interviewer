"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers";
import { supabase } from "@/lib/auth";
import toast from "react-hot-toast";

export default function TestAuthPage() {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("testpassword123");
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const { signIn, signUp } = useAuth();

  const addResult = (message: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const testSupabaseConnection = async () => {
    addResult("Testing Supabase connection...");
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("count")
        .limit(1);
      if (error) {
        addResult(`❌ Supabase connection failed: ${error.message}`);
        return false;
      }
      addResult("✅ Supabase connection successful");
      return true;
    } catch (error: any) {
      addResult(`❌ Supabase connection error: ${error.message}`);
      return false;
    }
  };

  const testSignUp = async () => {
    addResult("Testing sign up...");
    setLoading(true);
    try {
      const user = await signUp(email, password);
      if (user) {
        addResult("✅ Sign up successful");
        toast.success("Sign up test successful!");
      } else {
        addResult("❌ Sign up returned null user");
      }
    } catch (error: any) {
      addResult(`❌ Sign up failed: ${error.message}`);
      toast.error(`Sign up failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSignIn = async () => {
    addResult("Testing sign in...");
    setLoading(true);
    try {
      const user = await signIn(email, password);
      if (user) {
        addResult("✅ Sign in successful");
        toast.success("Sign in test successful!");
      } else {
        addResult("❌ Sign in returned null user");
      }
    } catch (error: any) {
      addResult(`❌ Sign in failed: ${error.message}`);
      toast.error(`Sign in failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testDirectSupabaseAuth = async () => {
    addResult("Testing direct Supabase auth...");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        addResult(`❌ Direct Supabase auth failed: ${error.message}`);
      } else {
        addResult("✅ Direct Supabase auth successful");
      }
    } catch (error: any) {
      addResult(`❌ Direct Supabase auth error: ${error.message}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Authentication Test Page
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Controls */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Controls</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <button
                  onClick={testSupabaseConnection}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Test Supabase Connection
                </button>

                <button
                  onClick={testSignUp}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Testing..." : "Test Sign Up"}
                </button>

                <button
                  onClick={testSignIn}
                  disabled={loading}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Testing..." : "Test Sign In"}
                </button>

                <button
                  onClick={testDirectSupabaseAuth}
                  disabled={loading}
                  className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Testing..." : "Test Direct Supabase Auth"}
                </button>

                <button
                  onClick={clearResults}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Clear Results
                </button>
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>

            <div className="bg-gray-100 p-4 rounded-md h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500">
                  No test results yet. Run some tests to see results here.
                </p>
              ) : (
                <div className="space-y-2">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-sm font-mono">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Environment Info */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Environment Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Supabase URL:</strong>
              <div className="font-mono text-gray-600 break-all">
                {process.env.NEXT_PUBLIC_SUPABASE_URL || "Not set"}
              </div>
            </div>
            <div>
              <strong>Supabase Anon Key:</strong>
              <div className="font-mono text-gray-600 break-all">
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                  ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...`
                  : "Not set"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
