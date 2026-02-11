import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, Globe, Calendar, TrendingUp } from 'lucide-react';
import { characterAPI } from '../../services/api';
import { useAuthStore } from '../../store';

export default function Statistics() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: characters, isLoading } = useQuery({
    queryKey: ['myCharacters'],
    queryFn: characterAPI.getMyCharacters,
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="font-cinzel text-4xl font-bold text-primary-dark mb-4">
            Statistics
          </h1>
          <p className="text-primary-dark/70 mb-6">
            You need to be logged in to view statistics.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-accent-gold text-primary-dark px-6 py-3 rounded-lg font-cinzel font-medium hover:bg-opacity-90 transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const stats = characters ? {
    total: characters.length,
    public: characters.filter(c => c.isPublic).length,
    private: characters.filter(c => !c.isPublic).length,
    byClass: characters.reduce((acc, char) => {
      acc[char.className] = (acc[char.className] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    bySystem: characters.reduce((acc, char) => {
      acc[char.system] = (acc[char.system] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    mostRecent: characters.length > 0 
      ? new Date(Math.max(...characters.map(c => new Date(c.createdAt).getTime())))
      : null,
  } : null;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-cinzel text-4xl font-bold text-primary-dark mb-2">
          Statistics
        </h1>
        <p className="text-primary-dark/70 mb-8">
          Your character creation journey at a glance
        </p>

        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                <div className="h-10 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && stats && (
          <>
            {/* Overview Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-cinzel text-lg font-bold text-primary-dark">
                    Total Characters
                  </h3>
                  <div className="w-12 h-12 bg-accent-gold/20 rounded-full flex items-center justify-center">
                    <BarChart3 size={24} className="text-accent-gold" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-accent-gold">
                  {stats.total}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-cinzel text-lg font-bold text-primary-dark">
                    Public Characters
                  </h3>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Globe size={24} className="text-green-600" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-green-600">
                  {stats.public}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-cinzel text-lg font-bold text-primary-dark">
                    Private Characters
                  </h3>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users size={24} className="text-blue-600" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-blue-600">
                  {stats.private}
                </p>
              </div>
            </div>

            {/* Characters by Class */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-primary-dark mb-6 flex items-center gap-2">
                <TrendingUp size={24} className="text-accent-gold" />
                Characters by Class
              </h2>
              
              {Object.keys(stats.byClass).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(stats.byClass)
                    .sort(([, a], [, b]) => b - a)
                    .map(([className, count]) => (
                      <div key={className}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-primary-dark">{className}</span>
                          <span className="text-accent-gold font-bold">{count}</span>
                        </div>
                        <div className="w-full bg-primary-dark/10 rounded-full h-3">
                          <div
                            className="bg-accent-gold rounded-full h-3 transition-all duration-500"
                            style={{ width: `${(count / stats.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-primary-dark/50 text-center py-8">
                  No characters created yet
                </p>
              )}
            </div>

            {/* Account Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="font-cinzel text-xl font-bold text-primary-dark mb-4 flex items-center gap-2">
                  <Calendar size={20} />
                  Account Created
                </h3>
                <p className="text-lg text-primary-dark/70">
                  {new Date(user.createdAt || '').toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              {stats.mostRecent && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="font-cinzel text-xl font-bold text-primary-dark mb-4 flex items-center gap-2">
                    <TrendingUp size={20} />
                    Last Character
                  </h3>
                  <p className="text-lg text-primary-dark/70">
                    {stats.mostRecent.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Call to Action */}
            {stats.total === 0 && (
              <div className="mt-8 text-center bg-linear-to-r from-accent-gold/20 to-primary-dark/10 rounded-lg p-12">
                <h3 className="font-cinzel text-2xl font-bold text-primary-dark mb-4">
                  Start Your Adventure
                </h3>
                <p className="text-primary-dark/70 mb-6">
                  You haven't created any characters yet. Create your first character to start building your collection!
                </p>
                <button
                  onClick={() => navigate('/create')}
                  className="bg-accent-gold text-primary-dark px-8 py-3 rounded-lg font-cinzel font-medium hover:bg-opacity-90 transition shadow-lg"
                >
                  Create Your First Character
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
