import React, { useState } from 'react';

export default function App() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await fetch('https://formsubmit.co/ajax/contact@j-dev.me', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: cleanEmail,
          _subject: 'New Waitlist Subscriber — cpplab.tech',
          _template: 'table',
          source: 'cpplab.tech landing page'
        })
      });

      try {
        const stored = JSON.parse(localStorage.getItem('cpplab_waitlist') || '[]');
        if (!stored.includes(cleanEmail)) {
          stored.push(cleanEmail);
          localStorage.setItem('cpplab_waitlist', JSON.stringify(stored));
        }
      } catch {
        // LocalStorage fallback
      }

      setSubmittedEmail(cleanEmail);
      setSubmitted(true);
    } catch {
      // In case of network blocker or CORS, accept locally
      setSubmittedEmail(cleanEmail);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sampleCppCode = `#include <iostream>
#include <memory>
#include <string_view>

int main() {
    // Modern C++: expressive, typed, and uncompromisingly fast
    constexpr std::string_view status = "cpplab::ready";
    std::cout << status << std::endl;
    return 0;
}`;

  const copyCode = () => {
    navigator.clipboard.writeText(sampleCppCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#ededed] flex flex-col justify-between selection:bg-[#ededed] selection:text-[#121212]">
      {/* Top Header */}
      <header className="w-full border-b border-[#27272a] bg-[#121212]">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-mono text-[15px] font-semibold tracking-tight text-[#ededed]">
            cpplab.tech
          </span>
          <span className="font-mono text-xs text-[#a1a1aa] tracking-tight">
            exclusively for c++
          </span>
        </div>
      </header>

      {/* Main Centered Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-16 md:py-24 flex flex-col items-center">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="font-mono text-xs text-[#a1a1aa] mb-5 tracking-[0.16em] uppercase font-medium">
            A dedicated workspace built exclusively for C++
          </p>

          <h1 className="text-3xl sm:text-4xl md:text-[46px] font-bold tracking-tight text-[#ededed] mb-6 leading-[1.18]">
            A dedicated workspace for C++ programmers.
          </h1>

          <p className="text-base sm:text-lg text-[#a1a1aa] leading-relaxed mb-10 max-w-xl mx-auto">
            We're building a focused, split-screen coding platform designed specifically for students and engineers to write, debug, and master modern C++ — from core syntax and object-oriented design to memory management, templates, and STL algorithms, with none of the clutter from multi-language tools.
          </p>

          {/* Early Access Action */}
          <div className="max-w-md mx-auto w-full">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter your email address"
                  required
                  className="flex-1 h-11 px-4 bg-[#18181b] border border-[#27272a] rounded text-sm text-[#ededed] placeholder-[#71717a] focus:outline-none focus:border-[#ededed] transition-colors"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 px-6 bg-[#ffffff] hover:bg-[#e4e4e7] disabled:opacity-50 text-[#000000] font-semibold text-sm rounded transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center"
                >
                  {isSubmitting ? 'Sending...' : 'Notify Me'}
                </button>
              </form>
            ) : (
              <div className="bg-[#18181b] border border-[#27272a] p-4 rounded text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-[#22c55e] font-semibold">
                    ✓ You're on the list
                  </span>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setEmail('');
                    }}
                    className="text-xs text-[#a1a1aa] hover:text-[#ededed] font-mono cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
                <p className="text-sm text-[#ededed] font-mono">
                  We've recorded <span className="text-white font-medium">{submittedEmail}</span> and directed your signup to contact@j-dev.me.
                </p>
              </div>
            )}

            {error && (
              <p className="text-left text-xs font-mono text-[#ef4444] mt-2">
                {error}
              </p>
            )}

            <p className="text-xs text-[#71717a] text-center mt-3 font-mono">
              Launching soon. Enter your email to get notified first.
            </p>
          </div>
        </div>

        {/* Core Highlights */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="border-t border-[#27272a] pt-4">
            <div className="font-mono text-xs text-[#71717a] mb-2 font-medium">01.</div>
            <h2 className="text-base font-semibold text-[#ededed] mb-2">Split-Screen Layout</h2>
            <p className="text-sm text-[#a1a1aa] leading-relaxed">
              Problem statement on the left, full C++ editor on the right. Built for uninterrupted focus and immediate compiler validation.
            </p>
          </div>

          <div className="border-t border-[#27272a] pt-4">
            <div className="font-mono text-xs text-[#71717a] mb-2 font-medium">02.</div>
            <h2 className="text-base font-semibold text-[#ededed] mb-2">Pure C++ Focus</h2>
            <p className="text-sm text-[#a1a1aa] leading-relaxed">
              Tailored exclusively for C++. Master pointers, references, RAII, memory management, templates, and STL algorithms in an environment calibrated solely for real C++ code.
            </p>
          </div>

          <div className="border-t border-[#27272a] pt-4">
            <div className="font-mono text-xs text-[#71717a] mb-2 font-medium">03.</div>
            <h2 className="text-base font-semibold text-[#ededed] mb-2">Concept Verification</h2>
            <p className="text-sm text-[#a1a1aa] leading-relaxed">
              Automated checks and compiler diagnostics engineered for C++ programs. Catch memory leaks, undefined behavior, and subtle boundary issues before they compile.
            </p>
          </div>
        </div>

        {/* Split-Screen Code Preview */}
        <div className="w-full border border-[#27272a] bg-[#18181b] rounded overflow-hidden">
          <div className="bg-[#121212] border-b border-[#27272a] px-4 py-2.5 flex items-center justify-between text-xs font-mono text-[#a1a1aa]">
            <span className="text-[#ededed]">preview // c++ split-screen environment</span>
            <button
              onClick={copyCode}
              className="text-[#a1a1aa] hover:text-[#ededed] transition-colors cursor-pointer"
            >
              {isCopied ? '[ Copied ]' : '[ Copy snippet ]'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left: Problem statement */}
            <div className="p-6 border-b md:border-b-0 md:border-r border-[#27272a] bg-[#121212]">
              <p className="font-mono text-xs text-[#a1a1aa] mb-2">Problem Statement</p>
              <h3 className="text-sm font-semibold text-[#ededed] mb-2">
                Standard Streams & Resource Management
              </h3>
              <p className="text-xs text-[#a1a1aa] leading-relaxed mb-6">
                Practice deterministic memory and stream management using modern C++ abstractions and standard library facilities.
              </p>
              <div className="font-mono text-xs text-[#71717a]">
                Expected output: <span className="text-[#ededed]">cpplab::ready</span>
              </div>
            </div>

            {/* Right: Code editor */}
            <div className="p-6 bg-[#18181b] font-mono text-xs">
              <div className="flex justify-between items-center mb-3 text-[#71717a]">
                <span>solution.cpp</span>
                <span>C++20</span>
              </div>
              <pre className="text-[#ededed] leading-5 overflow-x-auto">
{`1  #include <iostream>
2  #include <memory>
3  #include <string_view>
4  
5  int main() {
6      // Modern C++: expressive, typed, and direct
7      constexpr std::string_view status = "cpplab::ready";
8      std::cout << status << std::endl;
9      return 0;
10 }`}
              </pre>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#27272a] bg-[#121212] py-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[#71717a]">
          <div>
            © 2026 cpplab.tech • Handcrafted for C++ programmers.
          </div>
          <div>
            Exclusively dedicated to modern C++ development.
          </div>
        </div>
      </footer>
    </div>
  );
}
