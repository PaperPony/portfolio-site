"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { faq } from "@/content/faq";
import Reveal from "@/components/ui/Reveal";
import ScrambleText from "@/components/ui/ScrambleText";

function FaqItem({ item, index, isOpen, onToggle }) {
  const panelId = `faq-panel-${index}`;
  const buttonId = `faq-question-${index}`;
  // The answer unmounts when collapsed, so it would scramble on every reopen.
  // Latch it after the first play: reopening just shows the plain text.
  const [answerPlayed, setAnswerPlayed] = useState(false);

  return (
    <div className="rounded-xl border border-white/10 bg-ink/60">
      <h3 className="m-0">
        <button
          id={buttonId}
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-bone"
        >
          <ScrambleText text={item.question} />
          <motion.span
            aria-hidden
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="shrink-0 text-neon-purple"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              <ScrambleText
                as="p"
                reserveSpace
                playOnMount={!answerPlayed}
                onComplete={() => setAnswerPlayed(true)}
                text={item.answer}
                className="block text-sm leading-relaxed text-ash"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section
      id="faq"
      className="relative border-t border-white/10 bg-coal px-6 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <ScrambleText
            as="p"
            reserveSpace
            text="FAQ"
            className="block text-sm font-medium uppercase tracking-[0.3em] text-neon-purple"
          />
          <ScrambleText
            as="h2"
            reserveSpace
            text={faq.heading}
            className="mt-3 block text-4xl font-bold tracking-tight text-bone sm:text-5xl"
          />
        </Reveal>

        <div className="mt-10 space-y-4">
          {faq.items.map((item, i) => (
            <Reveal key={item.question} delay={Math.min(i * 0.06, 0.24)}>
              <FaqItem
                item={item}
                index={i}
                isOpen={openIndex === i}
                onToggle={() =>
                  setOpenIndex((current) => (current === i ? null : i))
                }
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
