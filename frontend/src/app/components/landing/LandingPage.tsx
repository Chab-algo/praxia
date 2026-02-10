'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Menu, X, ArrowRight, Sparkles, Zap, Eye, Mic, FileText, Brain, Workflow, BarChart3, Shield, Clock } from 'lucide-react';
import { fadeUp, staggerContainer } from '@/lib/motion';

const NAV_LINKS = [
  { href: '#platform', label: 'Platform' },
  { href: '#capabilities', label: 'Capabilities' },
  { href: '#workflow', label: 'Workflow' },
];

function useScrollState() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);

      const sections = ['platform', 'capabilities', 'workflow', 'cta'];
      let current = '';
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200) current = id;
        }
      }
      setActiveSection(current);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return { scrolled, activeSection };
}

export function LandingPage() {
  const { scrolled, activeSection } = useScrollState();
  const [mobileOpen, setMobileOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Mesh Gradient Background */}
      <div className="fixed inset-0 mesh-gradient-bg pointer-events-none" />
      
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-background/80 backdrop-blur-xl border-b border-border'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold tracking-tight">
            <span className="gradient-text">Praxia</span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  activeSection === link.href.slice(1)
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/sign-in"
              className="hidden sm:inline text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </a>
            <a
              href="#cta"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </a>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-card/95 backdrop-blur-xl border-b border-border overflow-hidden"
            >
              <div className="px-6 py-4 space-y-3">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <a
                    href="/sign-in"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Sign In
                  </a>
                  <a
                    href="#cta"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Get Started
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="relative z-10 max-w-7xl mx-auto text-center"
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-secondary/50 backdrop-blur-sm border border-border text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Multimodal AI Agents Platform</span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-8"
          >
            Transform Business<br />
            <span className="gradient-text">Into Intelligence</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Empower product designers to model business needs and deploy intelligent agents that process text, images, audio, and video — no code required.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <a
              href="#cta"
              className="group relative inline-flex items-center gap-2.5 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
            >
              Get a Demo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#platform"
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-secondary/80 backdrop-blur-sm text-foreground rounded-xl font-semibold text-lg border border-border hover:bg-secondary transition-all duration-300"
            >
              Explore Platform
            </a>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={fadeUp}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            {[
              { value: '48h', label: 'Agent Deployment' },
              { value: '98%', label: 'Faster Iteration' },
              { value: '300%', label: 'ROI Increase' },
              { value: '24/7', label: 'AI Operations' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Platform Section */}
      <section id="platform" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold mb-6">
              The Complete Platform<br />
              <span className="gradient-text">To Build Intelligence</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              From ideation to production, Praxia provides everything product designers need to create multimodal AI agents.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Brain,
                title: 'Visual Workflow Builder',
                description: 'Model business needs into AI workflows with intuitive drag-and-drop. No coding required.',
              },
              {
                icon: Workflow,
                title: 'Agent Orchestration',
                description: 'Chain multiple AI capabilities together. Process text, images, audio, and video seamlessly.',
              },
              {
                icon: BarChart3,
                title: 'Full CRM & Sales Cycle',
                description: 'Manage leads, track conversions, and grow your AI-powered business from one platform.',
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                description: 'Bank-level encryption, SOC 2 compliance, and granular access controls for peace of mind.',
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative p-8 bg-card/50 backdrop-blur-sm border border-border rounded-2xl hover:bg-card transition-all duration-300"
              >
                <feature.icon className="w-12 h-12 text-primary mb-6" />
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="capabilities" className="relative py-32 px-6 bg-secondary/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold mb-6">
              Multimodal<br />
              <span className="gradient-text">AI Capabilities</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Process any type of data with state-of-the-art AI models. Text, images, audio, video — all in one platform.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: FileText, title: 'Text Processing', items: ['Classification', 'Generation', 'Summarization', 'Translation'] },
              { icon: Eye, title: 'Vision AI', items: ['Image Analysis', 'Object Detection', 'OCR', 'Visual QA'] },
              { icon: Mic, title: 'Audio & Speech', items: ['Transcription', 'Voice Synthesis', 'Audio Analysis', 'Sentiment'] },
            ].map((capability, i) => (
              <motion.div
                key={capability.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="p-8 bg-card/50 backdrop-blur-sm border border-border rounded-2xl"
              >
                <capability.icon className="w-10 h-10 text-primary mb-6" />
                <h3 className="text-xl font-bold mb-6">{capability.title}</h3>
                <ul className="space-y-3">
                  {capability.items.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold mb-6">
              From Idea<br />
              <span className="gradient-text">To Production</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Ship intelligent agents in 48 hours with our streamlined workflow designed for product designers.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Model Your Need', description: 'Use our visual builder to map out your business process. AI assists you every step of the way.', icon: Brain },
              { step: '02', title: 'Configure & Test', description: 'Select AI models, customize prompts, and preview results in real-time before going live.', icon: Zap },
              { step: '03', title: 'Deploy & Scale', description: 'Launch your agent with one click. Monitor performance, iterate, and scale as you grow.', icon: Clock },
            ].map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="relative"
              >
                <div className="text-7xl font-bold gradient-text opacity-20 mb-4">{step.step}</div>
                <step.icon className="w-10 h-10 text-primary mb-6" />
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl font-bold mb-6">
              Ready to Build<br />
              <span className="gradient-text">Something Extraordinary?</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              Join forward-thinking companies transforming their business with AI agents.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#"
                className="group relative inline-flex items-center gap-2.5 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
              >
                Book a Demo
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="/sign-up"
                className="inline-flex items-center gap-2.5 px-8 py-4 bg-secondary/80 backdrop-blur-sm text-foreground rounded-xl font-semibold text-lg border border-border hover:bg-secondary transition-all duration-300"
              >
                Start Free Trial
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold gradient-text">Praxia</span>
              <span className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()}. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-8">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Docs
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
