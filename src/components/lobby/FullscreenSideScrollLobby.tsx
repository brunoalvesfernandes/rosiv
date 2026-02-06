import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { SideScrollingLobby } from "./SideScrollingLobby";

interface FullscreenSideScrollLobbyProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FullscreenSideScrollLobby({
  isOpen,
  onClose,
}: FullscreenSideScrollLobbyProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    // Lock scroll when open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("resize", updateDimensions);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-black"
        >
          <SideScrollingLobby
            width={dimensions.width}
            height={dimensions.height}
            onClose={onClose}
            isFullscreen={true}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
