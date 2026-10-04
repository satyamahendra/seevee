"use client"

import React from "react"
import {motion} from "motion/react"

type AnimatedContainerProps = Omit<React.ComponentProps<typeof motion.div>, "initial" | "animate" | "transition"> & {
    children: React.ReactNode
}

export default function AnimatedContainer({children, ...props}: AnimatedContainerProps) {
    return (
        <motion.div {...props} initial={{opacity: 0, y: 12}} animate={{opacity: 1, y: 0}} transition={{bounce: 0}}>
            {children}
        </motion.div>
    )
}
