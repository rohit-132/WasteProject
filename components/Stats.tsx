"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const stats = [
  {
    value: 150000,
    label: "Tons of Waste Generated Daily",
    suffix: "tons",
  },
  {
    value: 30,
    label: "Waste Recycled",
    suffix: "%",
  },
  {
    value: 100,
    label: "Cities Covered",
    suffix: "+",
  },
];

export default function Stats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section className="py-20 bg-[#f8f8f8] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[url('/mandala-pattern.png')] opacity-5" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-lg text-center"
            >
              <motion.div
                initial={{ scale: 0.5 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-5xl font-bold text-[#2e7d32] mb-4"
              >
                {isInView && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                  >
                    {stat.value.toLocaleString()}
                    {stat.suffix}
                  </motion.span>
                )}
              </motion.div>
              <p className="text-[#4a4a4a] text-lg">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
