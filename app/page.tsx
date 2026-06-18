"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Droplets, Leaf, Award, Star } from "lucide-react";
import Image from "next/image";

export default function Landing() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2"
          >
            <Droplets className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              Saratoga
            </span>
          </motion.div>
          <div className="hidden items-center gap-8 sm:flex">
            <a
              href="#products"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              Products
            </a>
            <a
              href="#about"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              About
            </a>
            <a
              href="#benefits"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              Benefits
            </a>
            <button className="rounded-full bg-blue-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
              Shop Now
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-24">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-cyan-50" />
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center"
          >
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2">
                <Droplets size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  Premium Natural Spring Water
                </span>
              </div>
              <h1 className="text-5xl font-bold leading-tight text-slate-900 sm:text-6xl">
                Pure Water,{" "}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Perfectly Balanced
                </span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                Sourced from the pristine springs of Saratoga, our water is
                naturally filtered through layers of limestone and minerals,
                creating a perfectly balanced hydration experience.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button className="group inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700">
                  Explore Products
                  <ArrowRight size={18} className="transition group-hover:translate-x-0.5" />
                </button>
                <button className="rounded-full border-2 border-slate-300 px-8 py-3 font-semibold text-slate-900 transition hover:bg-slate-50">
                  Learn More
                </button>
              </div>

              <div className="mt-12 grid grid-cols-2 gap-4">
                <Stat number="100%" label="Natural Spring" />
                <Stat number="24/7" label="Quality Tested" />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative h-96 sm:h-[500px]">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-3xl blur-3xl opacity-30" />
                <div className="relative h-full bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl flex items-center justify-center overflow-hidden">
                  <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="text-center"
                  >
                    <div className="text-7xl mb-4">💧</div>
                    <p className="text-2xl font-bold text-blue-900">
                      Saratoga Spring Water
                    </p>
                    <p className="text-blue-700 mt-2">Premium Quality</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 sm:text-5xl">
              Our Collection
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Choose your perfect hydration companion
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                name: "Single Bottle",
                volume: "750ml",
                price: "$2.99",
                desc: "Perfect for daily hydration on the go",
                icon: "🧴",
              },
              {
                name: "Essentials Pack",
                volume: "6 × 750ml",
                price: "$15.99",
                desc: "Great for weekly wellness",
                icon: "📦",
              },
              {
                name: "Premium Case",
                volume: "24 × 750ml",
                price: "$49.99",
                desc: "Ideal for home and office",
                icon: "🎁",
              },
            ].map((product, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm transition hover:shadow-lg hover:border-blue-200"
              >
                <div className="mb-4 text-5xl">{product.icon}</div>
                <h3 className="text-xl font-bold text-slate-900">
                  {product.name}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{product.volume}</p>
                <p className="mt-4 text-lg text-slate-600">{product.desc}</p>
                <p className="mt-6 text-3xl font-bold text-blue-600">
                  {product.price}
                </p>
                <button className="mt-6 w-full rounded-full bg-blue-600 py-2 font-semibold text-white transition hover:bg-blue-700">
                  Add to Cart
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 sm:text-5xl">
              Why Choose Saratoga
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Pure water from nature's finest source
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <Droplets className="h-8 w-8" />,
                title: "100% Natural",
                desc: "Spring water from pristine sources, no additives",
              },
              {
                icon: <Leaf className="h-8 w-8" />,
                title: "Eco-Friendly",
                desc: "Recyclable bottles, sustainable sourcing",
              },
              {
                icon: <Award className="h-8 w-8" />,
                title: "Award Winning",
                desc: "Certified premium quality water globally",
              },
              {
                icon: <Star className="h-8 w-8" />,
                title: "Rich Minerals",
                desc: "Naturally balanced mineral content for health",
              },
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 p-6 border border-blue-100"
              >
                <div className="text-blue-600 mb-3">{benefit.icon}</div>
                <h3 className="text-lg font-bold text-slate-900">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-slate-600">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 sm:text-5xl">
              Loved by Customers
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              See what people say about Saratoga water
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                name: "Sarah Mitchell",
                role: "Health Enthusiast",
                text: "The taste is incredibly pure. I can feel the difference since switching to Saratoga.",
                rating: 5,
              },
              {
                name: "James Chen",
                role: "Fitness Coach",
                text: "My clients love it. Perfect mineral balance for post-workout recovery.",
                rating: 5,
              },
              {
                name: "Emma Rodriguez",
                role: "Restaurant Owner",
                text: "Premium quality at a fair price. Our guests consistently compliment the water.",
                rating: 5,
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex gap-1 mb-3">
                  {Array(testimonial.rating)
                    .fill(0)
                    .map((_, j) => (
                      <Star
                        key={j}
                        size={16}
                        className="fill-yellow-400 text-yellow-400"
                      />
                    ))}
                </div>
                <p className="text-slate-600 mb-4">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-slate-900">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-slate-500">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white sm:text-5xl">
              Ready to Experience Purity?
            </h2>
            <p className="mt-4 text-lg text-blue-50">
              Join thousands of customers who've made the switch to premium
              natural spring water
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <button className="rounded-full bg-white px-8 py-3 font-semibold text-blue-600 transition hover:bg-blue-50">
                Shop Now
              </button>
              <button className="rounded-full border-2 border-white px-8 py-3 font-semibold text-white transition hover:bg-white/10">
                Subscribe & Save
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-900 text-slate-300 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Droplets className="h-6 w-6 text-blue-400" />
                <span className="font-bold text-white">Saratoga</span>
              </div>
              <p className="text-sm">Premium natural spring water</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Products</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    Single Bottle
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Essentials Pack
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Premium Case
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Shipping
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-sm">
            <p>&copy; 2024 Saratoga Spring Water. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <p className="text-3xl font-bold text-blue-600">{number}</p>
      <p className="text-sm text-slate-600">{label}</p>
    </div>
  );
}
