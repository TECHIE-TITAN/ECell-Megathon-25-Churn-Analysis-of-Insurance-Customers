import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Wizard } from './components/Wizard';
import { MainContent } from './components/MainContent';
import { findCustomerById, explainPrediction } from './services/predictionService';
import { UserData, ChurnPrediction, ShapFeatureContribution, SectorData } from './types';
import { DEFAULT_USER_DATA } from './constants';
import { TuringFinancesLogo } from './components/icons/TuringFinancesLogo';
import { LoadingScreen } from './components/LoadingScreen';
import { HomePage } from './components/HomePage';
import { Button } from './components/ui/Button';
import { ReviewPage } from './components/ReviewPage';
import { ThemeToggle } from './components/ThemeToggle';
import { SectorPage } from './components/SectorPage';
import { AboutUsPage } from './components/AboutUsPage';
import { CareersPage } from './components/CareersPage';
import { BusinessesPage } from './components/BusinessesPage';
import { CustomerSearchPage } from './components/CustomerSearchPage';
import { CustomerResultsPage } from './components/CustomerResultsPage';
import { RegionalInsightsPage } from './components/RegionalInsightsPage';
import { ModeSelection } from './components/ModeSelection';

type Theme = 'light' | 'dark';

const ParticleCanvas: React.FC<{ theme: Theme }> = ({ theme }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouse = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let particles: any[] = [];
        const particleCount = 70;
        const connectDistance = 100;
        const mouseRepelDistance = 120;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    radius: Math.random() * 1.5 + 1,
                });
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.current.x = e.clientX;
            mouse.current.y = e.clientY;
        };
        
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', handleMouseMove);
        resizeCanvas();
        
        const animate = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const particleColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)';
            
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                const dxMouse = p.x - mouse.current.x;
                const dyMouse = p.y - mouse.current.y;
                const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

                if (distMouse < mouseRepelDistance) {
                    const forceDirectionX = dxMouse / distMouse;
                    const forceDirectionY = dyMouse / distMouse;
                    const force = (mouseRepelDistance - distMouse) / mouseRepelDistance;
                    p.x += forceDirectionX * force * 2;
                    p.y += forceDirectionY * force * 2;
                }
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = particleColor;
                ctx.fill();
            });

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectDistance) {
                        const lineColor = theme === 'dark' 
                            ? `rgba(255, 255, 255, ${1 - distance / connectDistance})`
                            : `rgba(0, 0, 0, ${0.8 - distance / connectDistance})`;

                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = lineColor;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
        }
    }, [theme]);

    return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" />;
}

type AppMode = 'home' | 'virtual' | 'review' | 'sector' | 'about' | 'careers' | 'businesses' | 'modeSelection' | 'search' | 'results' | 'regional';

const NavLink: React.FC<{onClick: () => void, isActive: boolean, children: React.ReactNode}> = ({ onClick, isActive, children }) => (
    <button 
        onClick={onClick} 
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive 
                ? 'text-gray-900 dark:text-white bg-gray-200/50 dark:bg-gray-700/50' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
        }`}
    >
        {children}
    </button>
);

const App: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [prediction, setPrediction] = useState<ChurnPrediction | null>(null);
  const [shapExplanation, setShapExplanation] = useState<ShapFeatureContribution[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [appIsLoading, setAppIsLoading] = useState<boolean>(true);
  const [appMode, setAppMode] = useState<AppMode>('home');
  const [selectedSector, setSelectedSector] = useState<SectorData | null>(null);
  const [theme, setTheme] = useState<Theme>('dark');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
        setAppIsLoading(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleSearch = async (customerId: string) => {
    setIsLoading(true);
    setSearchError(null);
    setUserData(null);
    setPrediction(null);
    setShapExplanation([]);
    
    try {
        const result = await findCustomerById(customerId);
        if (result) {
            const explanation = await explainPrediction(result.userData, result.churnPrediction.probability);
            setUserData(result.userData);
            setPrediction(result.churnPrediction);
            setShapExplanation(explanation);
            setAppMode('results');
        } else {
            setSearchError(`Customer with ID "${customerId}" not found.`);
        }
    } catch (error) {
        console.error(error);
        setSearchError('Failed to load or parse customer data. Please try again.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleGoHome = () => {
    setAppMode('home');
    setUserData(null);
    setPrediction(null);
    setShapExplanation([]);
    setSelectedSector(null);
    setIsLoggedIn(false);
  }

  const handleLogin = () => {
    setAppMode('modeSelection');
    setSearchError(null);
    setIsLoggedIn(true);
  }

  const handleGoToReview = () => {
    setAppMode('review');
  };

  const handleSelectSector = (sector: SectorData) => {
    setSelectedSector(sector);
    setAppMode('sector');
  };
  
  const handleSearchAgain = () => {
    setAppMode('search');
    setUserData(null);
    setPrediction(null);
    setShapExplanation([]);
    setSearchError(null);
  };

  if (appIsLoading) {
    return <LoadingScreen />;
  }

  const renderContent = () => {
    switch (appMode) {
      case 'home':
        return <HomePage onGetStarted={handleLogin} onGoToReview={handleGoToReview} onSelectSector={handleSelectSector} />;
      case 'about':
        return <AboutUsPage onBack={handleGoHome} />;
      case 'careers':
        return <CareersPage onBack={handleGoHome} />;
      case 'businesses':
        return <BusinessesPage onBack={handleGoHome} />;
      case 'review':
        return <ReviewPage onBack={handleGoHome} />;
      case 'sector':
        return selectedSector ? <SectorPage sector={selectedSector} onBack={handleGoHome} /> : <HomePage onGetStarted={handleLogin} onGoToReview={handleGoToReview} onSelectSector={handleSelectSector} />;
      case 'modeSelection':
        return <ModeSelection onSelectSearch={() => setAppMode('search')} onSelectRegional={() => setAppMode('regional')} />;
      case 'regional':
        return <RegionalInsightsPage />;
      case 'search':
        return <CustomerSearchPage onSearch={handleSearch} isLoading={isLoading} error={searchError} />;
      case 'results':
        if (userData && prediction) {
            return <CustomerResultsPage 
                        userData={userData}
                        prediction={prediction}
                        shapExplanation={shapExplanation}
                        onSearchAgain={handleSearchAgain}
                    />
        }
        // Fallback to search if no results are loaded
        return <CustomerSearchPage onSearch={handleSearch} isLoading={isLoading} error="Something went wrong. Please try your search again." />;
      default:
        return <HomePage onGetStarted={handleLogin} onGoToReview={handleGoToReview} onSelectSector={handleSelectSector} />;
    }
  };

  const showLoginButton = ['home', 'about', 'careers', 'businesses', 'review', 'sector'].includes(appMode);

  return (
    <div className="flex flex-col h-screen font-sans bg-transparent text-gray-800 dark:text-gray-200 relative isolate">
      <ParticleCanvas theme={theme} />
      <header className="bg-white/30 dark:bg-black/30 backdrop-blur-sm border-b border-gray-300/50 dark:border-gray-700/50 z-20 transition-colors">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={handleGoHome}>
             <TuringFinancesLogo className="h-10 w-auto" />
          </div>
          <nav className="hidden md:flex items-center space-x-2 absolute left-1/2 -translate-x-1/2">
            <NavLink onClick={handleGoHome} isActive={appMode === 'home'}>Home</NavLink>
            <NavLink onClick={() => setAppMode('about')} isActive={appMode === 'about'}>About Us</NavLink>
            <NavLink onClick={() => setAppMode('careers')} isActive={appMode === 'careers'}>Careers</NavLink>
            <NavLink onClick={() => setAppMode('businesses')} isActive={appMode === 'businesses'}>Businesses</NavLink>
          </nav>
          <div className="flex items-center space-x-4">
              {showLoginButton ? (
                <Button onClick={handleLogin}>LOGIN</Button>
              ) : (
                <Button onClick={handleGoHome} className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700">Home</Button>
              )}
              <ThemeToggle onToggle={toggleTheme} />
          </div>
        </div>
      </header>

      {renderContent()}
    </div>
  );
};

export default App;