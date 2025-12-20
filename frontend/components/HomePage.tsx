import React, { useRef, useEffect, useState } from 'react';
import { AnimatedHeartIcon } from './icons/AnimatedHeartIcon';
import { AnimatedHomeIcon } from './icons/AnimatedHomeIcon';
import { FeedbackBulbIcon } from './icons/FeedbackBulbIcon';
import { AnimatedDrivingCarIcon } from './icons/AnimatedDrivingCarIcon';
import { AnimatedCreditCardIcon } from './icons/AnimatedCreditCardIcon';
import { AnimatedBackpackIcon } from './icons/AnimatedBackpackIcon';
import { AnimatedTaxBillIcon } from './icons/AnimatedTaxBillIcon';
import { SectorData } from '../types';

interface HomePageProps {
  onGetStarted: () => void;
  onGoToReview: () => void;
  onSelectSector: (sector: SectorData) => void;
}

const expertiseAreas: SectorData[] = [
  {
    id: 'auto',
    icon: AnimatedDrivingCarIcon,
    title: 'Personal Auto',
    description: 'Comprehensive coverage for your vehicle, ensuring you are protected on the road against accidents, theft, and damages.',
    pageContent: {
      heading: "Advanced Protection for Every Mile",
      paragraphs: [
        "At Turing Finances, our Personal Auto insurance goes beyond basic coverage. We utilize advanced telematics and data analytics to offer personalized premiums that reward safe driving habits. Our predictive models help anticipate risks in your area, allowing us to proactively suggest coverage adjustments.",
        "From collision and comprehensive coverage to liability and uninsured motorist protection, our policies are designed to be both robust and flexible. Our streamlined digital claims process ensures that if an incident occurs, you can get back on the road with minimal hassle. We are committed to providing intelligent, fair, and transparent auto insurance for the modern driver."
      ]
    }
  },
  {
    id: 'property',
    icon: AnimatedHomeIcon,
    title: 'Home & Property',
    description: 'Protect your biggest investment and personal belongings from unforeseen events like fire, natural disasters, and burglary.',
    pageContent: {
        heading: "Intelligent Coverage for Your Safe Haven",
        paragraphs: [
            "Your home is more than just a building; it's your sanctuary. Our Home & Property insurance leverages AI-powered risk assessment, analyzing factors like weather patterns, local crime rates, and property characteristics to offer coverage that is precisely calibrated to your needs. This data-driven approach ensures you are neither underinsured nor overpaying.",
            "We cover structural damage, personal property loss, liability for accidents on your property, and additional living expenses if your home becomes uninhabitable. With Turing Finances, you gain a partner dedicated to protecting your most valuable asset with cutting-edge technology and unparalleled service."
        ]
    }
  },
  {
    id: 'health',
    icon: AnimatedHeartIcon,
    title: 'Life & Health',
    description: 'Secure the financial future of your loved ones and ensure access to top-tier medical care with our flexible plans.',
     pageContent: {
        heading: "Data-Driven Plans for a Healthy Future",
        paragraphs: [
            "Navigating the complexities of Life & Health insurance is simpler with Turing Finances. We use sophisticated analytical models to help you find the most suitable and cost-effective plans for you and your family. Our platform provides clear, concise comparisons and predicts future healthcare costs to inform your decisions.",
            "Whether you're looking for term life, whole life, or comprehensive health coverage, our policies are designed for flexibility and long-term security. We empower you to make informed choices that protect your health and provide a lasting financial safety net for those who matter most."
        ]
    }
  },
  {
    id: 'business',
    icon: AnimatedCreditCardIcon,
    title: 'Business & Commercial',
    description: 'Customized insurance solutions to protect your business assets, employees, and operations from liability and risks.',
     pageContent: {
        heading: "Strategic Risk Management for Your Enterprise",
        paragraphs: [
            "In today's dynamic business environment, proactive risk management is key. Turing Finances offers a suite of Business & Commercial insurance products powered by predictive analytics. We assess industry-specific risks, supply chain vulnerabilities, and potential liabilities to craft policies that protect your bottom line.",
            "From general liability and commercial property to workers' compensation and cyber insurance, our solutions are tailored to the unique challenges your business faces. We act as your strategic partner, helping you mitigate risks and secure the continued growth and stability of your enterprise."
        ]
    }
  },
  {
    id: 'travel',
    icon: AnimatedBackpackIcon,
    title: 'Travel Insurance',
    description: 'Travel with peace of mind. Our plans cover trip cancellations, medical emergencies, and lost luggage worldwide.',
     pageContent: {
        heading: "Worry-Free Journeys, Globally Protected",
        paragraphs: [
            "Explore the world with confidence knowing that Turing Finances has your back. Our Travel Insurance uses real-time data to assess travel risks, from flight cancellations due to weather patterns to health advisories in your destination. This allows us to offer comprehensive and relevant coverage.",
            "Our plans are designed for modern travelers, covering medical emergencies, trip interruptions, lost or stolen baggage, and more. With 24/7 global assistance and a simple claims process, you can focus on making memories, while we handle the uncertainties."
        ]
    }
  },
  {
    id: 'liability',
    icon: AnimatedTaxBillIcon,
    title: 'Specialty Liability',
    description: 'Specialized coverage for professionals and unique situations, including errors and omissions and event liability.',
     pageContent: {
        heading: "Precision-Crafted Coverage for Unique Risks",
        paragraphs: [
            "Certain professions and situations carry unique risks that standard policies don't cover. Turing Finances' Specialty Liability insurance is designed for this complexity. We use advanced modeling to understand the specific liabilities associated with your field, be it professional malpractice, event cancellation, or product recall.",
            "Our policies for Errors & Omissions (E&O), Directors & Officers (D&O), and other specialty lines are crafted with precision. We provide the targeted protection you need to operate with confidence, knowing that your unique professional risks are intelligently managed."
        ]
    }
  },
];

export const HomePage: React.FC<HomePageProps> = ({ onGetStarted, onGoToReview, onSelectSector }) => {
  const bulbRef = useRef<HTMLButtonElement>(null);
  const [isNear, setIsNear] = useState(false);
  const [clickedIcon, setClickedIcon] = useState<string | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (bulbRef.current) {
        const rect = bulbRef.current.getBoundingClientRect();
        const bulbX = rect.left + rect.width / 2;
        const bulbY = rect.top + rect.height / 2;
        const distance = Math.sqrt(Math.pow(bulbX - e.clientX, 2) + Math.pow(bulbY - e.clientY, 2));
        setIsNear(distance < 150); // Proximity threshold of 150px
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSectorClick = (area: SectorData) => {
    if (clickedIcon) return; // Prevent multiple clicks while animating
    setClickedIcon(area.id);
    
    // Allow animation to complete before navigating
    setTimeout(() => {
        onSelectSector(area);
        setClickedIcon(null);
    }, 600);
  };

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="container mx-auto px-6 py-16 lg:py-24">
        {/* Hero Section */}
        <div className="bg-gray-50/50 dark:bg-black/30 backdrop-blur-sm border border-gray-300/50 dark:border-gray-700/50 rounded-xl shadow-2xl p-8 lg:p-12 text-center">
            <div className="animate-[fadeInUp_1s_ease-out]">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-wide font-display">
                    Securing Your Future with <span className="text-blue-500 dark:text-blue-400">Intelligent Insurance</span>
                </h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                    At Turing Finances, we leverage cutting-edge technology and data-driven insights to provide you with the best insurance coverage tailored to your unique needs.
                </p>
            </div>
        </div>
      </div>

      {/* Expertise Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-display tracking-wide">Our Fields of Expertise</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">We offer a wide range of insurance products across various sectors.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {expertiseAreas.map((area, index) => (
            <button
              key={area.id}
              onClick={() => handleSectorClick(area)}
              disabled={clickedIcon !== null}
              className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-gray-300/50 dark:border-gray-700/50 rounded-xl p-8 flex flex-col items-center text-center shadow-lg transition-all duration-300 hover:border-blue-500/70 hover:scale-105 active-press"
              style={{ animation: `fadeInUp 1s ease-out ${0.5 + index * 0.1}s`, animationFillMode: 'backwards' }}
            >
              <div className="bg-blue-500/10 dark:bg-blue-400/10 p-4 rounded-full">
                <area.icon className="h-12 w-12 text-blue-500 dark:text-blue-400" clicked={clickedIcon === area.id} />
              </div>
              <h3 className="mt-6 text-xl font-bold text-gray-900 dark:text-white font-display tracking-wide">{area.title}</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400 flex-grow">{area.description}</p>
            </button>
          ))}
        </div>
      </div>
      
      {/* Ideate Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-display tracking-wide">Ideate with Us</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Have an idea for a new feature, or want to share some feedback? Click the bulb below to let us know!
            </p>
            <div className="mt-8 flex justify-center">
                <button
                    ref={bulbRef}
                    onClick={onGoToReview}
                    className={`p-2 rounded-full hover:bg-gray-500/10 transition-all duration-300 feedback-bulb-button ${isNear ? 'prox-pulse' : ''}`}
                    aria-label="Go to review page"
                >
                    <FeedbackBulbIcon className="h-16 w-16 text-yellow-400" />
                </button>
            </div>
        </div>
      </div>

       <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
};