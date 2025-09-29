import { useEffect,useState ,  useRef } from "react";
import { motion, PanInfo, useMotionValue, useTransform } from "motion/react";
import React, { JSX } from "react";

// Custom hook for responsive design
const useResponsiveWidth = () => {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    baseWidth: 660,
    itemHeight: 160
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let baseWidth = 660;
      let itemHeight = 160;

      // Small mobile devices (phones)
      if (width < 480) {
        baseWidth = width - 64; // 32px padding each side for gaps
        itemHeight = 120;
      }
      // Mobile devices (large phones)
      else if (width < 640) {
        baseWidth = width - 80; // 40px padding each side for gaps
        itemHeight = 140;
      }
      // Tablet devices
      else if (width < 1024) {
        baseWidth = width - 64; // 32px padding each side
        itemHeight = 150;
      }
      // Desktop
      else {
        baseWidth = Math.min(660, width - 128); // Max 660px or 64px padding each side
        itemHeight = 160;
      }

      setDimensions({ width, baseWidth, itemHeight });
    };

    if (typeof window !== 'undefined') {
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return dimensions;
};

// replace icons with your own if needed
import {
  FiCircle,
  FiCode,
  FiFileText,
  FiLayers,
  FiLayout,
} from "react-icons/fi";
export interface CarouselItem {
  title: string;
  description: string;
  id: number;
  icon: React.ReactNode;
}

export interface CarouselProps {
  items?: CarouselItem[];
  baseWidth?: number;
  itemHeight?: number;
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
  round?: boolean;
  responsive?: boolean;
}

interface CarouselItemProps {
  item: CarouselItem;
  index: number;
  x: any;
  trackItemOffset: number;
  itemWidth: number;
  itemHeight: number;
  round: boolean;
  effectiveTransition: any;
}

const CarouselItem: React.FC<CarouselItemProps> = ({
  item,
  index,
  x,
  trackItemOffset,
  itemWidth,
  itemHeight,
  round,
  effectiveTransition,
}) => {
  const range = [
    -(index + 1) * trackItemOffset,
    -index * trackItemOffset,
    -(index - 1) * trackItemOffset,
  ];
  const outputRange = [90, 0, -90];
  const rotateY = useTransform(x, range, outputRange, { clamp: false });

  return (
    <motion.div
      className={`relative shrink-0 flex flex-col ${
        round
          ? "items-center justify-center text-center bg-[#060010] border-0"
          : "items-start justify-between bg-[#222] border border-[#222] rounded-[12px]"
      } overflow-hidden cursor-grab active:cursor-grabbing`}
      style={{
        width: itemWidth,
        height: round ? itemWidth : `${itemHeight}px`,
        rotateY: rotateY,
        ...(round && { borderRadius: "50%" }),
      }}
      transition={effectiveTransition}
    >
      <div className="p-2 sm:p-3 md:p-4 lg:p-5">
        <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white mb-1 sm:mb-2 md:mb-3 leading-snug sm:leading-relaxed line-clamp-4 sm:line-clamp-none">{item.description}</p>
        <p className="text-xs sm:text-sm text-text-200/60 mt-auto">{item.icon}</p>
      </div>
    </motion.div>
  );
};

const DEFAULT_ITEMS: CarouselItem[] = [
  {
    title: "Message from Student27",
    description: "Sir the Lecture was amazing! I really enjoyed it and understood all the concepts. I had one doubt regarding the last topic we covered.",
    id: 1,
    icon: <div>created just now</div>,
  },
  {
    title: "Animations",
    description: "Todays event was so much exciting when will it happen again? Also foods and goodies were awesome and i loved it",
    id: 2,
    icon: <div>created 10 mins ago</div>,
  },
  {
    title: "Components",
    description: "I didnt understand the concept of GSAP animations. It was confusing and hard to follow.",
    id: 3,
    icon: <div>created 1 hour ago</div>,
  },
  {
    title: "Backgrounds",
    description: "The background noise was too loud in the background which made it difficult to follow.",
    id: 4,
    icon: <div>created 8 hours ago</div>,
  },
  {
    title: "Common UI",
    description: "Although the way of teaching was very good and I understood everything, the audience was not interested which made the event boring.",
    id: 5,
    icon: <div>created 10 hours ago</div>,
  },
];

const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const SPRING_OPTIONS = { type: "spring" as const, stiffness: 300, damping: 30 };

export default function Carousel({
  items = DEFAULT_ITEMS,
  baseWidth = 300,
  itemHeight = 160,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  loop = false,
  round = false,
  responsive = false,
}: CarouselProps): JSX.Element {
  const responsiveDimensions = useResponsiveWidth();
  
  // Use responsive dimensions if responsive prop is true, otherwise use provided values
  const effectiveBaseWidth = responsive ? responsiveDimensions.baseWidth : baseWidth;
  const effectiveItemHeight = responsive ? responsiveDimensions.itemHeight : itemHeight;
  
  // Calculate padding based on screen size for better mobile experience
  const containerPadding = responsive ? (
    responsiveDimensions.width < 480 ? 32 : // Small mobile: 32px padding
    responsiveDimensions.width < 640 ? 40 : // Mobile: 40px padding for side gaps
    responsiveDimensions.width < 1024 ? 48 : // Tablet: 48px padding
    64 // Desktop: 64px padding (matches hook calculation)
  ) : 32;
  
  // Item width is the effective base width (already calculated correctly in hook)
  const itemWidth = effectiveBaseWidth;
  const trackItemOffset = itemWidth + GAP;
  const controlsHeight = 48; // sufficient space for dots/navigation
  const containerHeight = round ? effectiveBaseWidth : effectiveItemHeight + controlsHeight + 24; // adequate padding for dots
  const actualContainerWidth = itemWidth + 32; // fixed padding for borders

  const carouselItems = loop ? [...items, items[0]] : items;
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (pauseOnHover && containerRef.current) {
      const container = containerRef.current;
      const handleMouseEnter = () => setIsHovered(true);
      const handleMouseLeave = () => setIsHovered(false);
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [pauseOnHover]);

  useEffect(() => {
    if (autoplay && (!pauseOnHover || !isHovered)) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev === items.length - 1 && loop) {
            return prev + 1;
          }
          if (prev === carouselItems.length - 1) {
            return loop ? 0 : prev;
          }
          return prev + 1;
        });
      }, autoplayDelay);
      return () => clearInterval(timer);
    }
  }, [
    autoplay,
    autoplayDelay,
    isHovered,
    loop,
    items.length,
    carouselItems.length,
    pauseOnHover,
  ]);

  const effectiveTransition = isResetting ? { duration: 0 } : SPRING_OPTIONS;

  const handleAnimationComplete = () => {
    if (loop && currentIndex === carouselItems.length - 1) {
      setIsResetting(true);
      x.set(0);
      setCurrentIndex(0);
      setTimeout(() => setIsResetting(false), 50);
    }
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ): void => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    if (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
      if (loop && currentIndex === items.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex((prev) => Math.min(prev + 1, carouselItems.length - 1));
      }
    } else if (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
      if (loop && currentIndex === 0) {
        setCurrentIndex(items.length - 1);
      } else {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }
    }
  };

  const dragProps = loop
    ? {}
    : {
        dragConstraints: {
          left: -trackItemOffset * (carouselItems.length - 1),
          right: 0,
        },
      };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${
        round
          ? "rounded-full border border-white p-2 sm:p-3 md:p-4"
          : "rounded-xl sm:rounded-2xl border border-[#222] py-1 px-4 sm:px-6 md:px-4"
      } ${responsive ? 'w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl mx-auto' : ''}`}
      style={{
        width: responsive ? 'auto' : `${actualContainerWidth}px`,
        maxWidth: responsive ? `${actualContainerWidth}px` : 'none',
        height: `${containerHeight}px`,
      }}
    >
      <div className="flex justify-center items-start pt-1 pb-1">
        <motion.div
          className="flex"
          drag="x"
          {...dragProps}
          style={{
            width: itemWidth,
            gap: `${GAP}px`,
            perspective: 1000,
            perspectiveOrigin: `${
              currentIndex * trackItemOffset + itemWidth / 2
            }px 50%`,
            x,
          }}
        onDragEnd={handleDragEnd}
        animate={{ x: -(currentIndex * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationComplete={handleAnimationComplete}
      >
        {carouselItems.map((item, index) => (
          <CarouselItem
            key={index}
            item={item}
            index={index}
            x={x}
            trackItemOffset={trackItemOffset}
            itemWidth={itemWidth}
            itemHeight={effectiveItemHeight}
            round={round}
            effectiveTransition={effectiveTransition}
          />
        ))}
        </motion.div>
      </div>
      <div
        className={`flex w-full justify-center ${
          round ? "absolute z-20 bottom-12 left-1/2 -translate-x-1/2" : "mt-6"
        }`}
      >
        <div className={`flex justify-between px-4 sm:px-6 md:px-8 ${
          responsive && responsiveDimensions.width < 640 
            ? 'w-[100px] sm:w-[120px]' 
            : 'w-[150px]'
        }`}>
          {items.map((_, index) => (
            <motion.div
              key={index}
              className={`h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full cursor-pointer transition-colors duration-150 ${
                currentIndex % items.length === index
                  ? round
                    ? "bg-white"
                    : "bg-[#5227FF]"
                  : round
                  ? "bg-[#555]"
                  : "bg-[rgba(255,255,255,0.3)]"
              }`}
              animate={{
                scale: currentIndex % items.length === index ? 1.3 : 1,
              }}
              onClick={() => setCurrentIndex(index)}
              transition={{ duration: 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
