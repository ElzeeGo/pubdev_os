"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "How does pubdev analyze my codebase?",
    answer:
      "pubdev uses advanced AI to scan your repository structure, commit history, and code changes. It identifies new features, bug fixes, performance improvements, and integrations automatically without requiring manual input or configuration.",
  },
  {
    question: "What types of content can pubdev generate?",
    answer:
      "pubdev creates platform-optimized content including X posts with hashtags, professional LinkedIn updates, Facebook posts, Instagram content, Reddit discussions, and comprehensive blog articles. Each piece is tailored to the specific platform's audience and format requirements.",
  },
  {
    question: "How accurate is the AI-generated content?",
    answer:
      "Our AI is trained on millions of successful developer content examples and understands technical concepts, industry trends, and platform best practices. Content is generated with 95%+ accuracy and includes fact-checking against your actual code changes.",
  },
  {
    question: "Can I customize the content before publishing?",
    answer:
      "pubdev provides a review and editing interface where you can modify, approve, or reject generated content before it goes live. You can also set custom brand voice guidelines and content preferences for more personalized output.",
  },
  {
    question: "Which platforms and repositories are supported?",
    answer:
      "pubdev integrates with GitHub repositories. For publishing, we support X (Twitter) via API. More integrations are added regularly based on user feedback.",
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="container mx-auto px-4 py-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
            </div>
            <span className="text-sm text-muted-foreground">Questions & Answers</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Everything you need to know about automated content generation for developers.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-card/50 border border-border/50 rounded-lg backdrop-blur-sm overflow-hidden transition-all duration-200 hover:bg-card/70"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-inset"
              >
                <h3 className="text-lg font-semibold text-foreground pr-4">{faq.question}</h3>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`transition-all duration-200 ease-in-out ${
                  openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 pb-5">
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Still have questions? We're here to help.</p>
          <a
            href="mailto:support@pubdev.com"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
          >
            Contact Support
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}

