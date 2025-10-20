"use client";
import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans text-gray-900">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-[5%] py-5 bg-white/95 shadow-md sticky top-0 z-50">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
          🎯 PrepZone
        </h1>
        <div className="flex gap-4">
          <a
            href="login"
            className="px-6 py-2 border-2 border-blue-500 text-indigo-500 rounded-full font-semibold hover:bg-indigo-500 hover:text-white transition-all duration-300"
          >
            Login
          </a>
          <a
            href="signup"
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full font-semibold hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            Sign Up
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="text-center py-24 px-[5%] bg-gradient-to-br from-bg-cyan-600 to-blue-400 text-white">
        <h1 className="text-5xl sm:text-6xl font-bold mb-6 animate-fade-in-up">
          Learn Smarter, Crack Exams Faster
        </h1>
        <p className="text-xl sm:text-2xl opacity-90 mb-10 animate-fade-in-up delay-200">
          Practice MCQs, track progress, and achieve your dream score with PrepZone!
        </p>
        <div className="flex justify-center flex-wrap gap-4 animate-fade-in-up delay-400">
          <a
            href="lecturer"
            className="px-8 py-4 bg-white text-indigo-500 font-semibold rounded-full text-lg hover:bg-gray-100 transition-all shadow-md hover:-translate-y-1"
          >
            Get Started Free
          </a>
          <a
            href="#pricing"
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-full text-lg hover:shadow-lg hover:-translate-y-1 transition-all"
          >
            View Plans
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 px-[5%] -mt-10 rounded-t-[50px] relative z-10">
        <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">
          Why Students Love PrepZone
        </h2>
        <p className="text-center text-gray-500 mb-16">
          Built for JEE, NEET, EAMCET, and all competitive exams
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { icon: "📚", title: "Subject-Wise Practice", desc: "Access thousands of MCQs organized by subject, topic, and chapter — all exam-oriented." },
            { icon: "🏆", title: "Leaderboard", desc: "Compete with other aspirants nationwide and push your limits daily." },
            { icon: "📊", title: "Performance Tracking", desc: "Track your accuracy, speed, and consistency — improve where it matters most." },
            { icon: "💡", title: "Smart Insights", desc: "Get AI-powered insights on your weak areas with personalized recommendations." },
            { icon: "📱", title: "Learn Anywhere", desc: "Study seamlessly across mobile, tablet, or desktop. Stay productive everywhere." },
            { icon: "⚡", title: "Instant Results", desc: "Get instant feedback and detailed explanations to strengthen your concepts." },
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-white p-10 rounded-2xl shadow-xl text-center hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
            >
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-2xl text-4xl bg-gradient-to-r from-blue-600 to-cyan-400 text-white">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-800">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-gray-50 py-20 px-[5%]">
        <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">
          Choose Your Plan
        </h2>
        <p className="text-center text-gray-500 mb-16">
          Affordable plans for every student
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          {[
            {
              title: "Monthly Plan",
              price: "₹499",
              duration: "/month",
              features: [
                "Unlimited MCQ Practice",
                "Full Subject Access",
                "Leaderboard & Stats",
                "Instant Feedback",
                "Mobile Friendly",
              ],
            },
            {
              title: "Yearly Plan",
              price: "₹4499",
              duration: "/year",
              features: [
                "Everything in Monthly",
                "Save 25% per year",
                "AI-based Insights",
                "Priority Support",
                "Early Feature Access",
              ],
              popular: true,
            },
          ].map((plan, i) => (
            <div
              key={i}
              className={`relative bg-white rounded-2xl shadow-lg p-10 text-center hover:scale-105 transition-all ${
                plan.popular ? "border-4 border-indigo-500" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 right-6 bg-gradient-to-r from-blue-600 to-cyan-400 text-white text-sm font-semibold px-4 py-1 rounded-full">
                  🌟 Most Popular
                </div>
              )}
              <h3 className="text-2xl font-semibold mb-2">{plan.title}</h3>
              <div className="text-5xl font-bold text-blue-500 mb-4">
                {plan.price}
                <span className="text-lg text-gray-500">{plan.duration}</span>
              </div>
              <ul className="text-left text-gray-600 mb-6 space-y-3">
                {plan.features.map((f, idx) => (
                  <li key={idx}>✅ {f}</li>
                ))}
              </ul>
              <a
                href="#"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full font-semibold hover:shadow-lg transition-all"
              >
                Subscribe Now
              </a>
            </div>
          ))}
        </div>
      </section>

     
      <section className="bg-gradient-to-r from-blue-700 to-cyan-500 text-white text-center py-20 px-[5%]">
        <h2 className="text-4xl font-bold mb-4">Get Ready to Crack Your Dream Exam!</h2>
        <p className="text-xl mb-8 opacity-90">
          Join thousands of students already mastering their preparation with PrepZone
        </p>
        <a
          href="#"
          className="px-10 py-4 bg-white text-indigo-600 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all shadow-md"
        >
          Start Learning Now
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 text-center">
        <p className="opacity-80">
          © 2025 PrepZone. All rights reserved. | Built for students, by educators.
        </p>
      </footer>
    </div>
  );
}
