"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

interface FeatureSectionProps {
  title: string;
  subtitle: string;
  description: string;
  imageSrc?: string;
  videoSrc?: string;
  isReversed?: boolean;
}

export default function FeatureSection({
  title,
  subtitle,
  description,
  imageSrc,
  videoSrc,
  isReversed = false,
}: FeatureSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-100px" });
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [hasPlayed, setHasPlayed] = useState(false);

  // Control video playback based on visibility
  useEffect(() => {
    if (videoRef && isInView && !hasPlayed) {
      videoRef.currentTime = 0;
      videoRef.play();
      setHasPlayed(true);
    } else if (videoRef && !isInView) {
      videoRef.pause();
      setHasPlayed(false);
    }
  }, [videoRef, isInView, hasPlayed]);

  // Handle video click to replay
  const handleVideoClick = () => {
    if (videoRef) {
      videoRef.currentTime = 0;
      videoRef.play();
    }
  };

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="py-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center overflow-hidden w-full"
    >
      <div className="max-w-7xl mx-auto w-full overflow-hidden">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full ${
            isReversed ? "lg:grid-flow-col-dense" : ""
          }`}
        >
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: isReversed ? 30 : -30 }}
            animate={
              isInView
                ? { opacity: 1, x: 0 }
                : { opacity: 0, x: isReversed ? 30 : -30 }
            }
            transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
            className={`space-y-8 ${isReversed ? "lg:col-start-2" : ""}`}
          >
            <div>
              {/* Title */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-relaxed">
                {title} <span className="gradient-text">{subtitle}</span>
              </h2>

              {/* Description */}
              <p className="text-xl text-text-secondary leading-relaxed max-w-lg">
                {description}
              </p>
            </div>
          </motion.div>

          {/* App Screenshot/Mockup */}
          <motion.div
            initial={{ opacity: 0, x: isReversed ? -30 : 30 }}
            animate={
              isInView
                ? { opacity: 1, x: 0 }
                : { opacity: 0, x: isReversed ? -30 : 30 }
            }
            transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
            className={`relative ${isReversed ? "lg:col-start-1" : ""}`}
          >
            <div className="relative">
              {videoSrc ? (
                <video
                  ref={setVideoRef}
                  muted
                  playsInline
                  className="relative mx-auto w-96 h-[700px] object-contain rounded-[3rem] shadow-2xl cursor-pointer max-w-full"
                  onClick={handleVideoClick}
                  onError={(e) => console.error("Video error:", e)}
                  onLoadStart={() => console.log("Video loading started")}
                  onCanPlay={() => console.log("Video can play")}
                >
                  <source src={videoSrc} type="video/quicktime" />
                  <source src={videoSrc} type="video/mp4" />
                  <source src={videoSrc} type="video/x-msvideo" />
                </video>
              ) : imageSrc ? (
                <img
                  src={imageSrc}
                  alt={title}
                  className="relative mx-auto w-96 h-[700px] object-cover rounded-[3rem] shadow-2xl"
                />
              ) : (
                <div className="relative mx-auto w-96 h-[700px] bg-secondary rounded-[3rem] shadow-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📱</div>
                    <p className="text-text-secondary">App Screenshot</p>
                    <p className="text-sm text-text-secondary mt-2">
                      Coming Soon
                    </p>
                  </div>
                </div>
              )}

              {/* Floating elements for visual interest */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={
                  isInView
                    ? { opacity: 0.6, scale: 1 }
                    : { opacity: 0, scale: 0 }
                }
                transition={{ duration: 0.5, delay: 0.6 }}
                className="absolute top-2 right-2 w-8 h-8 bg-primary rounded-full animate-pulse"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={
                  isInView
                    ? { opacity: 0.4, scale: 1 }
                    : { opacity: 0, scale: 0 }
                }
                transition={{ duration: 0.5, delay: 0.8 }}
                className="absolute bottom-2 left-2 w-6 h-6 bg-cta-hover rounded-full animate-pulse delay-1000"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
