"use client";

import { SignUp } from "@clerk/nextjs";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

export default function SignUpPage() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="flex min-h-screen items-center justify-center"
      variants={fadeUp}
      initial={shouldReduceMotion ? false : "initial"}
      animate={shouldReduceMotion ? false : "animate"}
    >
      <SignUp fallbackRedirectUrl="/dashboard" />
    </motion.div>
  );
}
