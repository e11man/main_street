import { useState, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import Button from '../components/ui/Button';
import Modal from '../components/Modal/Modal';
import VolunteerRequestForm from '../components/Modal/VolunteerRequestForm';
import Icon from '../components/ui/Icon';
import MetricsDisplay from '../components/Metrics/MetricsDisplay';
import { useScrollTriggeredAnimationCallback } from '../lib/hooks';
import useContent from '../lib/useContent';

export default function About({ content }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState({});
  
  const getContent = (key, defaultValue = '') => {
    return content?.[key] || defaultValue;
  };
  
  // Refs for scroll animations
  const heroRef = useRef(null);
  const missionRef = useRef(null);
  const impactRef = useRef(null);
  const whatWeDoRef = useRef(null);
  const contactRef = useRef(null);
  const ctaRef = useRef(null);
  
  // Metrics visibility state
  const [metricsVisible, setMetricsVisible] = useState(false);

  // Apply scroll animations
  useScrollTriggeredAnimationCallback(heroRef, (entry) => {
    setIsVisible(prev => ({ ...prev, hero: entry.isIntersecting }));
  });
  
  useScrollTriggeredAnimationCallback(missionRef, (entry) => {
    setIsVisible(prev => ({ ...prev, mission: entry.isIntersecting }));
  });
  
  useScrollTriggeredAnimationCallback(impactRef, (entry) => {
    setIsVisible(prev => ({ ...prev, impact: entry.isIntersecting }));
    setMetricsVisible(entry.isIntersecting);
  });
  
  useScrollTriggeredAnimationCallback(whatWeDoRef, (entry) => {
    setIsVisible(prev => ({ ...prev, whatWeDo: entry.isIntersecting }));
  });
  
  useScrollTriggeredAnimationCallback(contactRef, (entry) => {
    setIsVisible(prev => ({ ...prev, contact: entry.isIntersecting }));
  });
  
  useScrollTriggeredAnimationCallback(ctaRef, (entry) => {
    setIsVisible(prev => ({ ...prev, cta: entry.isIntersecting }));
  });

  // Handle modal open/close
  const openModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = '';
  };
  
  const scrollToOpportunities = () => {
    window.location.href = '/#opportunities';
  };
  
  const scrollToAbout = () => {
    const missionSection = document.getElementById('mission');
    if (missionSection) {
      missionSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Head>
        <title>About - Community Connect</title>
        <meta name="description" content="Learn about Community Connect's mission to foster meaningful relationships between volunteers and impactful opportunities." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header openModal={openModal} content={content} />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section 
          ref={heroRef}
          className="pt-16 relative overflow-hidden bg-gradient-to-b from-background to-surface min-h-screen flex items-center"
          style={{
            backgroundImage: 'url(/IMG_2645.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: 'overlay'
          }}
        >
          {/* Blue overlay for better text readability */}
          <div className="absolute inset-0 bg-blue-900/50 z-0"></div>
          
          {/* Background pattern */}
          <div className="absolute inset-0 z-10 opacity-10">
            <div className="absolute top-0 left-0 right-0 h-full w-full bg-[radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:20px_20px]"></div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-20 left-10 w-24 h-24 bg-accent1/20 rounded-full blur-2xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent2/20 rounded-full blur-3xl animate-float animation-delay-1000"></div>
          <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-white/20 rounded-full blur-xl animate-float animation-delay-2000"></div>
          
          <div className="max-w-screen-xl mx-auto px-6 md:px-8 py-20 md:py-32 text-center relative z-20">
            <div className={`transition-all duration-1000 ease-out transform ${
              isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <h1 className="hero-title relative font-montserrat text-clamp-36-64 font-extrabold mb-8 md:mb-10 tracking-[-0.025em] text-white leading-tight inline-block">
{getContent('about.hero.title')}
                <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary to-accent1 rounded-full"></span>
              </h1>
              
              <p className="font-source-serif text-clamp-18-24 font-normal text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
{getContent('about.hero.subtitle')}
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/#opportunities">
                  <Button 
                    variant="secondary" 
                    className="group text-base px-8 py-4 shadow-lg hover:shadow-xl"
                  >
                    Find Opportunities →
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="text-base px-8 py-4 bg-white/10 border-white/30 text-white hover:bg-white hover:text-primary"
                  onClick={scrollToAbout}
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission Section */}
        <section 
          id="mission"
          ref={missionRef}
          className="py-20 md:py-32 bg-white"
        >
          <div className="max-w-screen-xl mx-auto px-6 md:px-8">
            <div className={`text-center transition-all duration-1000 ease-out transform ${
              isVisible.mission ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <h2 className="font-montserrat text-clamp-32-48 font-bold mb-8 text-primary relative inline-block">
{getContent('about.mission.title')}
                <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary to-accent1 rounded-full"></span>
              </h2>
              <p className="font-source-serif text-lg text-text-secondary max-w-4xl mx-auto leading-relaxed">
{getContent('about.mission.text')}
              </p>
            </div>
          </div>
        </section>

        {/* Our Impact Section */}
        <section 
          ref={impactRef}
          className="py-20 md:py-32 bg-surface"
        >
          <div className="max-w-screen-xl mx-auto px-6 md:px-8">
            <div className={`text-center mb-16 transition-all duration-1000 ease-out transform ${
              isVisible.impact ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <h2 className="font-montserrat text-clamp-32-48 font-bold mb-8 text-primary relative inline-block">
{getContent('about.impact.title')}
                <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary to-accent1 rounded-full"></span>
              </h2>
            </div>
            
            <MetricsDisplay 
              isVisible={metricsVisible}
              layout="grid"
            />
          </div>
        </section>

        {/* What We Do Section */}
        <section 
          id="what-we-do"
          ref={whatWeDoRef}
          className="py-20 md:py-32 bg-white"
        >
          <div className="max-w-screen-xl mx-auto px-6 md:px-8">
            <div className={`text-center mb-16 transition-all duration-1000 ease-out transform ${
              isVisible.whatWeDo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <h2 className="font-montserrat text-clamp-32-48 font-bold mb-8 text-primary relative inline-block">
{getContent('about.what_we_do.title')}
                <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary to-accent1 rounded-full"></span>
              </h2>
              <p className="font-source-serif text-lg text-text-secondary max-w-4xl mx-auto leading-relaxed">
{getContent('about.what_we_do.text')}
              </p>
            </div>

            {/* Main Program Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
              {/* Local Ministries Card */}
              <div className={`group bg-white rounded-xl md:rounded-2xl border border-border/80 overflow-hidden shadow-md
                             transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]
                             hover:translate-y-[-8px] hover:scale-[1.02] hover:shadow-xl hover:border-accent1/50 transform ${
                isVisible.whatWeDo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: '0ms' }}>
                <div className="p-8">
                  <div className="bg-accent1/10 w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-accent1/20 group-hover:scale-110">
                    <Icon 
                      path="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
                      className="w-8 h-8 text-accent1 transition-all duration-300" 
                    />
                  </div>
                  <h3 className="font-montserrat text-xl font-bold mb-4 text-primary group-hover:text-primary-light transition-all duration-300">
                    Local Ministries
                  </h3>
                  <p className="font-source-serif text-text-secondary leading-relaxed text-sm">
                    Taylor World Outreach (TWO) ministries provide hands-on opportunities to serve in our local upland and beyond. These programs focus on meeting immediate needs while building lasting relationships.
                  </p>
                </div>
              </div>

              {/* Community Plunge Card */}
              <div className={`group bg-gradient-to-br from-accent1 to-accent1/90 rounded-xl md:rounded-2xl overflow-hidden shadow-md text-white
                             transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]
                             hover:translate-y-[-8px] hover:scale-[1.02] hover:shadow-xl transform ${
                isVisible.whatWeDo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: '200ms' }}>
                <div className="p-8 relative overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 opacity-30"></div>
                  
                  <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-white/30 group-hover:scale-110 relative z-10">
                    <Icon 
                      path="M13 10V3L4 14h7v7l9-11h-7z" 
                      className="w-8 h-8 text-white transition-all duration-300" 
                    />
                  </div>
                  <h3 className="font-montserrat text-xl font-bold mb-4 text-white relative z-10">
                    Community Plunge
                  </h3>
                  <p className="font-source-serif text-white/90 leading-relaxed text-sm relative z-10">
                    Our signature immersive experience where volunteers dive deep into service in Upland, building connections and creating lasting impact through intensive, focused engagement.
                  </p>
                </div>
              </div>

              {/* World Opportunities Card */}
              <div className={`group bg-white rounded-xl md:rounded-2xl border border-border/80 overflow-hidden shadow-md
                             transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]
                             hover:translate-y-[-8px] hover:scale-[1.02] hover:shadow-xl hover:border-accent1/50 transform ${
                isVisible.whatWeDo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: '400ms' }}>
                <div className="p-8">
                  <div className="bg-accent1/10 w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-accent1/20 group-hover:scale-110">
                    <Icon 
                      path="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                      className="w-8 h-8 text-accent1 transition-all duration-300" 
                    />
                  </div>
                  <h3 className="font-montserrat text-xl font-bold mb-4 text-primary group-hover:text-primary-light transition-all duration-300">
                    World Opportunities
                  </h3>
                  <p className="font-source-serif text-text-secondary leading-relaxed text-sm">
                    Learn about opportunities to serve globally, from short-term mission trips to long-term international partnerships that expand your impact beyond local borders.
                  </p>
                </div>
              </div>
            </div>

            {/* Community Outreach Programs */}
            <div className={`transition-all duration-1000 ease-out transform ${
              isVisible.whatWeDo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: '600ms' }}>
              <div className="text-center mb-8">
                <h3 className="font-montserrat text-2xl md:text-3xl font-bold mb-4 text-primary">
                  Community Outreach Programs
                </h3>
                <p className="font-source-serif text-text-secondary leading-relaxed max-w-3xl mx-auto">
                  Share the love of Christ through diverse service opportunities that address real needs in Upland and foster meaningful relationships.
                </p>
              </div>
              
              <div className="bg-white rounded-xl border border-border/80 shadow-md overflow-hidden">
                {[
                  { 
                    name: "Basics", 
                    description: "Essential needs support for families and individuals",
                    iconPath: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  },
                  { 
                    name: "Basics Jr.", 
                    description: "Youth-focused programs for children and teens",
                    iconPath: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  },
                  { 
                    name: "Carpenter&apos;s Hands", 
                    description: "Home repair and construction projects",
                    iconPath: "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  },
                  { 
                    name: "ESL", 
                    description: "English as Second Language tutoring and support",
                    iconPath: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  },
                  { 
                    name: "Lift", 
                    description: "Mentorship and encouragement programs",
                    iconPath: "M7 11l5-6m0 0l5 6m-5-6v12"
                  },
                  { 
                    name: "ReaLife", 
                    description: "Real-life skills and life coaching",
                    iconPath: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  }
                ].map((program, index) => (
                  <div 
                    key={index}
                    className={`group flex items-center p-4 transition-all duration-300 hover:bg-surface/50 ${
                      index !== 5 ? 'border-b border-border/50' : ''
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div className="bg-accent1/10 w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0 transition-all duration-300 group-hover:bg-accent1/20 group-hover:scale-105">
                      <Icon 
                        path={program.iconPath} 
                        className="w-5 h-5 text-accent1 transition-all duration-300" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-montserrat font-bold text-primary mb-1 group-hover:text-primary-light transition-all duration-300">
                        {program.name}
                      </h4>
                      <p className="font-source-serif text-sm text-text-secondary leading-relaxed group-hover:text-text-primary transition-all duration-300 pr-4">
                        {program.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Get In Touch Section */}
        <section 
          id="contact"
          ref={contactRef}
          className="py-20 md:py-32 bg-surface"
        >
          <div className="max-w-screen-xl mx-auto px-6 md:px-8">
            <div className={`text-center transition-all duration-1000 ease-out transform ${
              isVisible.contact ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <h2 className="font-montserrat text-clamp-32-48 font-bold mb-8 text-primary relative inline-block">
{getContent('about.contact.title')}
                <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary to-accent1 rounded-full"></span>
              </h2>
              <p className="font-source-serif text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed mb-8">
{getContent('about.contact.text')}
              </p>
              
              <div className="mb-8">
                <a 
                  href="mailto:co@taylor.edu" 
                  className="font-montserrat text-xl font-semibold text-accent1 hover:text-accent1-dark transition-colors duration-200"
                >
                  co@taylor.edu
                </a>
              </div>
              
  
            </div>
          </div>
        </section>

        
      </main>

      <Footer content={content} />

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <VolunteerRequestForm onCancel={closeModal} />
      </Modal>
    </>
  );
}

export async function getServerSideProps() {
  try {
    const { getAllContent, initializeDefaultContent } = require('../lib/contentManager');
    
    // Initialize default content if needed
    await initializeDefaultContent();
    
    // Get all content
    const content = await getAllContent();
    
    return {
      props: {
        content,
      },
    };
  } catch (error) {
    console.error('Error fetching content:', error);
    return {
      props: {
        content: {},
      },
    };
  }
}