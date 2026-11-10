import React, { useState } from 'react';

export default function App() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your email.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email.');
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
          _subject: 'Waitlist signup — cpplab.tech',
          _template: 'table',
          _captcha: 'false'
        })
      });

      try {
        const stored = JSON.parse(localStorage.getItem('cpplab_waitlist') || '[]');
        if (!stored.includes(cleanEmail)) {
          stored.push(cleanEmail);
          localStorage.setItem('cpplab_waitlist', JSON.stringify(stored));
        }
      } catch {
        // Fallback
      }

      setSubmittedEmail(cleanEmail);
      setSubmitted(true);
    } catch {
      setSubmittedEmail(cleanEmail);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const codeSnippet = `#include <iostream>
#include <string_view>

int main() {
    constexpr std::string_view env = "cpplab ready";
    std::cout << env << '\\n';
    return 0;
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#ededed] font-sans flex flex-col justify-between selection:bg-[#ffffff] selection:text-[#000000]">
      {/* Top Bar */}
      <header className="w-full border-b border-[#222222]">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-mono text-sm tracking-tight font-medium text-[#ededed]">
            cpplab.tech
          </span>
          <span className="font-mono text-xs text-[#666666]">
            c++ environment
          </span>
        </div>
      </header>

      {/* Main Teaser */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-16 md:py-24 flex flex-col items-center justify-center">
        {/* Hero */}
        <div className="text-center w-full mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#ededed] mb-3 leading-tight">
            The modern workspace for C++ developers.
          </h1>

          <p className="text-base text-[#888888] mb-8 font-normal">
            A focused, split-screen coding environment. Launching soon.
          </p>

          {/* Form */}
          <div className="max-w-sm mx-auto w-full">
            {!submitted ? (
              <form
                action="https://formsubmit.co/contact@j-dev.me"
                method="POST"
                onSubmit={handleSubmit}
                className="flex gap-2"
              >
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_subject" value="Waitlist signup — cpplab.tech" />
                <input type="hidden" name="_template" value="table" />
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="your.email@example.com"
                  required
                  className="flex-1 h-10 px-3.5 bg-[#141414] border border-[#262626] rounded text-sm text-[#ededed] placeholder-[#555555] focus:outline-none focus:border-[#ededed] transition-colors font-mono text-xs"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 px-4 bg-[#ededed] hover:bg-[#ffffff] disabled:opacity-50 text-[#000000] font-medium text-xs rounded transition-colors whitespace-nowrap cursor-pointer"
                >
                  {isSubmitting ? '...' : 'Notify Me'}
                </button>
              </form>
            ) : (
              <div className="bg-[#141414] border border-[#262626] py-2.5 px-4 rounded text-center">
                <p className="text-xs font-mono text-[#ededed]">
                  ✓ Reserved for <span className="text-[#22c55e]">{submittedEmail}</span>
                </p>
              </div>
            )}

            {error && (
              <p className="text-left text-xs font-mono text-[#ef4444] mt-2">
                {error}
              </p>
            )}

            <p className="text-[11px] text-[#555555] text-center mt-2 font-mono">
              No spam. Early updates only.
            </p>
          </div>
        </div>

        {/* Minimal Split Code Frame */}
        <div className="w-full border border-[#222222] bg-[#111111] rounded overflow-hidden">
          <div className="bg-[#0d0d0d] border-b border-[#222222] px-4 py-2 flex items-center justify-between text-xs font-mono text-[#666666]">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#262626]"></span>
              <span className="w-2 h-2 rounded-full bg-[#262626]"></span>
              <span className="w-2 h-2 rounded-full bg-[#262626]"></span>
              <span className="text-[#888888] ml-2">cpplab // preview</span>
            </div>
            <button
              onClick={handleCopy}
              className="text-[#666666] hover:text-[#ededed] transition-colors cursor-pointer"
            >
              {copied ? 'copied' : 'copy'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 text-xs font-mono">
            {/* Left: Spec */}
            <div className="p-5 border-b md:border-b-0 md:border-r border-[#222222] bg-[#0f0f0f] text-[#888888] flex flex-col justify-between">
              <div>
                <div className="text-[#555555] mb-2">// problem</div>
                <div className="text-[#ededed] font-medium mb-1">01. Standard Stream</div>
                <div className="text-[#666666] text-[11px] leading-relaxed mb-4">
                  Print the status flag using std::string_view with zero heap overhead.
                </div>
              </div>
              <div className="text-[11px] text-[#555555]">
                target: <span className="text-[#22c55e]">cpplab ready</span>
              </div>
            </div>

            {/* Right: Code */}
            <div className="p-5 bg-[#121212] overflow-x-auto">
              <div className="text-[#555555] mb-2 flex justify-between">
                <span>main.cpp</span>
                <span>c++20</span>
              </div>
              <pre className="text-[#ededed] leading-5">
{`1  #include <iostream>
2  #include <string_view>
3  
4  int main() {
5      constexpr std::string_view env = "cpplab ready";
6      std::cout << env << '\\n';
7      return 0;
8  }`}
              </pre>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#222222] py-5">
        <div className="max-w-3xl mx-auto px-6 flex items-center justify-between text-xs font-mono text-[#555555]">
          <span>© 2026 cpplab.tech</span>
          <span>built for c++ developers</span>
        </div>
      </footer>
    </div>
  );
}
