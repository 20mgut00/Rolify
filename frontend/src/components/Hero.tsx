import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Wand2,
  Users,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { characterAPI } from '../services/api';

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: publicCharacters, isLoading } = useQuery({
    queryKey: ['heroCharacters'],
    queryFn: () => characterAPI.getPublicCharacters(0, 10),
  });

  const characters = publicCharacters?.content || [];

  useEffect(() => {
    if (characters.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % characters.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [characters.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % characters.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + characters.length) % characters.length);
  };

  return (
    <div className="container mx-auto px-4 py-24">
      {/* Hero Section */}
      <div className="text-center mb-20">
        <h1 className="font-cinzel text-5xl md:text-6xl font-bold text-primary-dark mb-4 leading-tight">
          Create Your Legend
        </h1>
        <p className="text-lg md:text-2xl text-primary-dark/70 mb-8 max-w-3xl mx-auto">
          Bring your tabletop RPG characters to life with our intuitive character creator.
          Start with Root RPG and expand your adventures.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <RouterLink
            to="/create"
            className="bg-accent-gold text-primary-dark px-8 py-3 rounded-lg font-cinzel font-medium hover:bg-opacity-90 transition inline-flex items-center justify-center gap-2"
          >
            <Wand2 size={20} />
            Create Character
          </RouterLink>
          <RouterLink
            to="/gallery"
            className="border-2 border-accent-gold text-accent-gold px-8 py-3 rounded-lg font-cinzel font-medium hover:bg-accent-gold hover:text-primary-dark transition inline-flex items-center justify-center gap-2"
          >
            <Users size={20} />
            Browse Gallery
          </RouterLink>
        </div>
      </div>

      {/* Carousel */}
      {!isLoading && characters.length > 0 && (
        <div className="mb-20">
          <h2 className="font-cinzel text-4xl font-bold text-center text-primary-dark mb-8">
            Featured Characters
          </h2>
          <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="relative min-h-96 md:min-h-125">
              {characters.map((char, index) => (
                <div
                  key={char.id}
                  className={`absolute inset-0 transition-opacity duration-500 p-6 md:p-12 flex items-center justify-center ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="flex flex-col md:flex-row items-center gap-8 w-full">
                    {/* Avatar */}
                    <div className="shrink-0">
                      {char.avatarImage ? (
                        <img
                          src={char.avatarImage}
                          alt={char.name}
                          className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-accent-gold shadow-lg object-cover"
                        />
                      ) : (
                        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-accent-gold shadow-lg bg-accent-gold/10 flex items-center justify-center">
                          <span className="font-cinzel text-4xl md:text-6xl font-bold text-accent-gold">
                            {char.name[0]}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="text-center md:text-left flex-1">
                      <h3 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-dark mb-2">
                        {char.name}
                      </h3>
                      <p className="text-accent-gold font-semibold mb-2 text-lg">
                        {char.className} • {char.system}
                      </p>
                      <p className="text-primary-dark/70 mb-1">{char.species}</p>
                      <p className="text-primary-dark/50 text-sm mb-6">
                        Created {new Date(char.createdAt).toLocaleDateString()}
                      </p>
                      <RouterLink
                        to={`/character/${char.id}`}
                        className="bg-accent-gold text-primary-dark px-6 py-2 rounded-lg font-cinzel font-medium hover:bg-opacity-90 transition inline-block"
                      >
                        View Character
                      </RouterLink>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation */}
            {characters.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-md z-10 transition"
                  aria-label="Previous character"
                >
                  <ChevronLeft size={24} className="text-primary-dark" />
                </button>

                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-md z-10 transition"
                  aria-label="Next character"
                >
                  <ChevronRight size={24} className="text-primary-dark" />
                </button>

                {/* Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {characters.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`transition-all rounded-full ${
                        index === currentSlide
                          ? 'bg-accent-gold w-8 h-2'
                          : 'bg-white/50 w-2 h-2 hover:bg-white/75'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {/* Feature 1 */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl hover:scale-105 transition">
          <div className="w-20 h-20 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4">
            <Wand2 size={40} className="text-primary-dark" />
          </div>
          <h3 className="font-cinzel text-xl font-bold text-primary-dark mb-3">
            Easy Creation
          </h3>
          <p className="text-primary-dark/70">
            Intuitive step-by-step forms with real-time validation guide you through character creation. No rules knowledge required!
          </p>
        </div>

        {/* Feature 2 */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl hover:scale-105 transition">
          <div className="w-20 h-20 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={40} className="text-primary-dark" />
          </div>
          <h3 className="font-cinzel text-xl font-bold text-primary-dark mb-3">
            Share & Discover
          </h3>
          <p className="text-primary-dark/70">
            Make your characters public and explore amazing creations from the community. Get inspired by others!
          </p>
        </div>

        {/* Feature 3 */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl hover:scale-105 transition">
          <div className="w-20 h-20 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4">
            <Download size={40} className="text-primary-dark" />
          </div>
          <h3 className="font-cinzel text-xl font-bold text-primary-dark mb-3">
            Export Anywhere
          </h3>
          <p className="text-primary-dark/70">
            Download your characters as beautiful PDFs for printing, or JSON/CSV for importing into other tools.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-linear-to-r from-accent-gold/10 to-accent-gold/5 rounded-lg p-12 text-center mb-20 border border-accent-gold/20">
        <h2 className="font-cinzel text-4xl font-bold text-primary-dark mb-3">
          Ready to Begin Your Adventure?
        </h2>
        <p className="text-lg text-primary-dark/70 mb-8 max-w-2xl mx-auto">
          Join thousands of players creating memorable characters for their campaigns.
          Sign up now to save your characters and access all features!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <RouterLink
            to="/create"
            className="bg-accent-gold text-primary-dark px-8 py-3 rounded-lg font-cinzel font-medium hover:bg-opacity-90 transition"
          >
            Start Creating
          </RouterLink>
          <RouterLink
            to="/library"
            className="border-2 border-accent-gold text-accent-gold px-8 py-3 rounded-lg font-cinzel font-medium hover:bg-accent-gold hover:text-primary-dark transition"
          >
            View My Library
          </RouterLink>
        </div>
      </div>

      {/* How It Works */}
      <div className="mb-8">
        <h2 className="font-cinzel text-4xl font-bold text-center text-primary-dark mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="text-center">
            <div className="w-12 h-12 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4 font-cinzel text-lg font-bold text-primary-dark">
              1
            </div>
            <h3 className="font-cinzel text-xl font-bold text-primary-dark mb-2">
              Choose Your Class
            </h3>
            <p className="text-primary-dark/70 text-sm">
              Select from Adventurer, Arbiter, Ranger, and more. Each class has unique abilities and playstyles.
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-center">
            <div className="w-12 h-12 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4 font-cinzel text-lg font-bold text-primary-dark">
              2
            </div>
            <h3 className="font-cinzel text-xl font-bold text-primary-dark mb-2">
              Build Your Character
            </h3>
            <p className="text-primary-dark/70 text-sm">
              Fill in stats, background, moves, and equipment. Our system validates everything automatically.
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-center">
            <div className="w-12 h-12 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4 font-cinzel text-lg font-bold text-primary-dark">
              3
            </div>
            <h3 className="font-cinzel text-xl font-bold text-primary-dark mb-2">
              Play & Share
            </h3>
            <p className="text-primary-dark/70 text-sm">
              Export your character sheet or share it with the community. Update it as your character grows!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
