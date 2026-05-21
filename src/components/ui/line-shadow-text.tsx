"use client"
import { type CSSProperties, type HTMLAttributes } from "react"
import { motion, type DOMMotionComponents, type MotionProps } from "motion/react"
import { cn } from "@/lib/utils"

const motionElements = {
  article: motion.article,
  div: motion.div,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  h5: motion.h5,
  h6: motion.h6,
  li: motion.li,
  p: motion.p,
  section: motion.section,
  span: motion.span,
} as const

type MotionElementType = Extract<keyof DOMMotionComponents, keyof typeof motionElements>

interface LineShadowTextProps
  extends Omit<HTMLAttributes<HTMLElement>, keyof MotionProps>, MotionProps {
  children: string
  shadowColor?: string
  as?: MotionElementType
}

export function LineShadowText({
  children,
  shadowColor = "black",
  className,
  as: Component = "span",
  ...props
}: LineShadowTextProps) {
  const MotionComponent = motionElements[Component]

  return (
    <MotionComponent
      className={cn("relative inline-flex", className)}
      data-text={children}
      style={{ "--shadow-color": shadowColor } as CSSProperties}
      {...props}
    >
      {children}

      {/* Shadow overlay — pakai mask bukan background-clip */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: "0.04em",
          left: "0.04em",
          right: 0,
          bottom: 0,
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 45%,
            ${shadowColor} 45%,
            ${shadowColor} 55%,
            transparent 55%,
            transparent 100%
          )`,
          backgroundSize: "0.06em 0.06em",
          animation: "line-shadow 15s linear infinite",
          pointerEvents: "none",
          userSelect: "none",
          opacity: 0.25,
          zIndex: 2,
        }}
      />
    </MotionComponent>
  )
}
