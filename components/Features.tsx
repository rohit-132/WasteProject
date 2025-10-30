"use client";

import { motion } from "framer-motion";
import { Brain, Map, Trophy } from "lucide-react";

const features = [
  {
    title: "Smart Waste Segregation",
    description:
      "AI-powered trash identification system that helps in proper waste segregation",
    icon: Brain,
  },
  {
    title: "Real-Time Waste Monitoring",
    description:
      "Live maps tracking waste levels and collection points across cities",
    icon: Map,
  },
  {
    title: "Incentivized Recycling",
    description:
      "Gamified approach to encourage citizens to participate in recycling programs",
    icon: Trophy,
  },
];

export default function Features() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-[#f8f8f8]">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center text-[#2e7d32] mb-12"
        >
          AI-Powered Features
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-[#e0e0e0]"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[#e8f5e9] rounded-full flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8 text-[#2e7d32]" />
                </div>
                <h3 className="text-2xl font-bold text-[#2e7d32] mb-4">
                  {feature.title}
                </h3>
                <p className="text-[#4a4a4a]">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
