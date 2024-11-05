import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { updatePreferences, updatePersona, resetProfile } from '../../store/profileSlice';
import { 
  Award, 
  Clock, 
  Activity, 
  Settings, 
  User, 
  Brain,
  Calendar,
  TrendingUp,
  Star,
  RefreshCw
} from 'lucide-react';

const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.profile);
  const { achievements } = useSelector((state: RootState) => state.tasks);
  const [activeTab, setActiveTab] = useState<'overview' | 'preferences' | 'achievements'>('overview');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleResetProfile = () => {
    if (window.confirm('This will reset your profile and restart the onboarding process. Continue?')) {
      dispatch(resetProfile());
      localStorage.removeItem('hasCompletedOnboarding');
      window.location.reload();
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{profile.name}</h2>
            <p className="text-gray-600">Member since {formatDate(profile.dateJoined)}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-700 flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Task Stats
            </h3>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-blue-600">
                Total Completed: {profile.stats.totalTasksCompleted}
              </p>
              <p className="text-sm text-blue-600">
                Average per Day: {profile.stats.averageTasksPerDay.toFixed(1)}
              </p>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-700 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Completion Rates
            </h3>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-green-600">
                High Priority: {profile.stats.completionRateByPriority.high}%
              </p>
              <p className="text-sm text-green-600">
                Medium Priority: {profile.stats.completionRateByPriority.medium}%
              </p>
              <p className="text-sm text-green-600">
                Low Priority: {profile.stats.completionRateByPriority.low}%
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-medium text-yellow-700 flex items-center">
              <Star className="w-4 h-4 mr-2" />
              Achievements
            </h3>
            <p className="text-sm text-yellow-600 mt-2">
              {achievements.filter(a => a.unlockedAt).length} of {achievements.length} Unlocked
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="font-semibold mb-4 flex items-center">
          <Brain className="w-5 h-5 mr-2" />
          Work Style Insights
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Preferred Working Hours</p>
            <p className="text-gray-800">
              {profile.preferences.preferredWorkingHours.start} - {profile.preferences.preferredWorkingHours.end}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Work Style</p>
            <p className="text-gray-800 capitalize">{profile.persona.workStyle}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Strengths</p>
            <div className="flex flex-wrap gap-2">
              {profile.persona.strengths.map((strength) => (
                <span key={strength} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                  {strength}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Developer Tools</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <button
              onClick={handleResetProfile}
              className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors flex items-center space-x-2"
            >
              <RefreshCw size={16} />
              <span>Reset Profile & Restart Onboarding</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderAchievements = () => {
    const unlockedAchievements = achievements.filter(a => a.unlockedAt);
    const lockedAchievements = achievements.filter(a => !a.unlockedAt);

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold mb-4">Unlocked Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {unlockedAchievements.map(achievement => (
            <div key={achievement.id} className="bg-green-50 p-4 rounded-lg flex items-start space-x-3">
              <Award className="w-6 h-6 text-green-500 mt-1" />
              <div>
                <h4 className="font-medium text-green-700">{achievement.name}</h4>
                <p className="text-sm text-green-600">{achievement.description}</p>
                <p className="text-xs text-green-500 mt-1">
                  Unlocked {achievement.unlockedAt && formatDate(achievement.unlockedAt)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-lg font-semibold mb-4 mt-8">Locked Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lockedAchievements.map(achievement => (
            <div key={achievement.id} className="bg-gray-50 p-4 rounded-lg flex items-start space-x-3">
              <Award className="w-6 h-6 text-gray-400 mt-1" />
              <div>
                <h4 className="font-medium text-gray-600">{achievement.name}</h4>
                <p className="text-sm text-gray-500">{achievement.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
            activeTab === 'overview' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
<User className="w-4 h-4" />
          <span>Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
            activeTab === 'achievements' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Achievements</span>
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
            activeTab === 'preferences' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Preferences</span>
        </button>
      </div>

      <div className="bg-white rounded-lg p-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'achievements' && renderAchievements()}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Working Hours
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500">Start Time</label>
                      <input
                        type="time"
                        value={profile.preferences.preferredWorkingHours.start}
                        onChange={(e) => dispatch(updatePreferences({
                          preferredWorkingHours: {
                            ...profile.preferences.preferredWorkingHours,
                            start: e.target.value
                          }
                        }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">End Time</label>
                      <input
                        type="time"
                        value={profile.preferences.preferredWorkingHours.end}
                        onChange={(e) => dispatch(updatePreferences({
                          preferredWorkingHours: {
                            ...profile.preferences.preferredWorkingHours,
                            end: e.target.value
                          }
                        }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Focus Time Preference
                  </label>
                  <select
                    value={profile.preferences.focusTimePreference}
                    onChange={(e) => dispatch(updatePreferences({
                      focusTimePreference: e.target.value as any
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                    <option value="night">Night</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Complexity Preference
                  </label>
                  <select
                    value={profile.preferences.taskComplexityPreference}
                    onChange={(e) => dispatch(updatePreferences({
                      taskComplexityPreference: e.target.value as any
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="simple">Simple</option>
                    <option value="moderate">Moderate</option>
                    <option value="challenging">Challenging</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="breakReminders"
                    checked={profile.preferences.breakReminders}
                    onChange={(e) => dispatch(updatePreferences({
                      breakReminders: e.target.checked
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="breakReminders" className="text-sm text-gray-700">
                    Enable Break Reminders
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Work Style
                  </label>
                  <select
                    value={profile.persona.workStyle}
                    onChange={(e) => dispatch(updatePersona({
                      workStyle: e.target.value as any
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="methodical">Methodical</option>
                    <option value="flexible">Flexible</option>
                    <option value="deadline-driven">Deadline Driven</option>
                    <option value="balanced">Balanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Learning Style
                  </label>
                  <select
                    value={profile.persona.learningStyle}
                    onChange={(e) => dispatch(updatePersona({
                      learningStyle: e.target.value as any
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="visual">Visual</option>
                    <option value="practical">Practical</option>
                    <option value="theoretical">Theoretical</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;