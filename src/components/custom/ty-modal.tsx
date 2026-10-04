"use client"

import {Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import {useUpdateSearchParams} from "@/util/hooks/useUpSearchParams"
import {cn} from "@/lib/utils"
import {CheckCircle2, Heart, Sparkles} from "lucide-react"
import {motion} from "framer-motion"

type TyModalProps = {isDialogOpen: boolean}

export default function TyModal({isDialogOpen}: TyModalProps) {
    const {removeParam} = useUpdateSearchParams()

    const handleClose = () => {
        removeParam("is_ty")
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className={cn("sm:max-w-md text-center p-8", "animate-in fade-in-90 zoom-in-95 duration-300")}>
                <motion.div
                    initial={{scale: 0.8, opacity: 0}}
                    animate={{scale: 1, opacity: 1}}
                    transition={{type: "spring", stiffness: 300, damping: 20}}
                    className="flex flex-col items-center">
                    {/* Animated checkmark */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-accent/20 rounded-full scale-110 animate-pulse" />
                        <CheckCircle2 className="relative w-16 h-16 text-green-600" strokeWidth={1.5} />
                        <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-500 animate-spin" />
                    </div>

                    <DialogHeader className="flex flex-col items-center space-y-4">
                        <DialogTitle className="text-3xl font-bold">
                            Thank You! <Heart className="inline w-6 h-6 ml-1 text-foreground animate-heartbeat" />
                        </DialogTitle>
                        <DialogDescription className="text-lg">Your credits have been successfully added!</DialogDescription>
                    </DialogHeader>

                    <div className="my-6 px-4 py-3 bg-accent/5 rounded-lg border w-full">
                        <p className="text-sm">You&apos;re all set to create amazing resumes. We&apos;re thrilled to have you on board!</p>
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground mb-6">
                        <Sparkles className="w-4 h-4 mr-2" />
                        <span>Happy resume crafting! Can&apos;t wait to see what you&apos;ll create.</span>
                        <Sparkles className="w-4 h-4 ml-2" />
                    </div>

                    <DialogFooter className="w-full">
                        <DialogClose asChild>
                            <motion.div whileHover={{scale: 1.03}} whileTap={{scale: 0.98}} className="w-full">
                                <Button onClick={handleClose} className="w-full">
                                    Start Creating
                                </Button>
                            </motion.div>
                        </DialogClose>
                    </DialogFooter>
                </motion.div>
            </DialogContent>
        </Dialog>
    )
}
