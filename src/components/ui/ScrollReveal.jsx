import React from "react";
import { motion } from "framer-motion";

/**
 * ScrollReveal — landing-style "fade + lift" as content scrolls into view, so
 * the signed-in app has the same motion feel as the marketing site. Reveals
 * once; framer-motion honours prefers-reduced-motion at the app level.
 */
const ScrollReveal = ({ children, delay = 0, y = 18, className }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-12% 0px -8% 0px" }}
    transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

export default ScrollReveal;
