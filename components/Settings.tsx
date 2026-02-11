
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Save, User, Globe } from 'lucide-react';

interface SettingsProps {
  user: UserProfile;
  onSave: (user: UserProfile) => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, onSave }) => {
  const [weight, setWeight] = useState(user.weightKg || 70);
  const [gender, setGender] = useState<'male' | 'female'>(user.gender);
  const [language, setLanguage] = useState<'en' | 'fr'>(user.language || 'en');

  const handleSave = () => {
    onSave({
      weightKg: weight,
      gender,
      language,
      isSetup: true
    });
  };

  const t = {
    en: {
        title: "Profile",
        desc: "To accurately estimate your alcohol level (BAC), Drinkosaur needs a few details. This data stays on your device.",
        weight: "Weight (kg)",
        sex: "Biological Sex",
        male: "Male",
        female: "Female",
        widmark: "Required for Widmark formula calculation",
        lang: "Language",
        save: "Save Profile"
    },
    fr: {
        title: "Profil",
        desc: "Pour estimer votre alcoolémie (BAC), Drinkosaur a besoin de quelques détails. Vos données restent sur votre appareil.",
        weight: "Poids (kg)",
        sex: "Sexe Biologique",
        male: "Homme",
        female: "Femme",
        widmark: "Requis pour la formule de Widmark",
        lang: "Langue",
        save: "Enregistrer"
    }
  }[language];

  return (
    <div className="w-full h-full flex flex-col justify-center px-6 animate-fade-in-up pb-32 overflow-y-auto no-scrollbar">
      <div className="glass-panel p-8 rounded-[40px] text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-white/10 rounded-full">
            <User className="w-6 h-6 text-pink-300" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">{t.title}</h2>
        </div>
        
        <p className="text-white/60 mb-8 text-sm leading-relaxed">
          {t.desc}
        </p>

        <div className="space-y-6">
          
          {/* Language Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 ml-2 flex items-center gap-2">
                <Globe size={14} /> {t.lang}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setLanguage('en')}
                className={`py-3 rounded-2xl text-md font-medium transition-all duration-300 border ${
                  language === 'en' 
                    ? 'bg-white/20 border-white text-white shadow-lg' 
                    : 'bg-black/20 border-white/10 text-white/40 hover:bg-white/5'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('fr')}
                className={`py-3 rounded-2xl text-md font-medium transition-all duration-300 border ${
                  language === 'fr' 
                    ? 'bg-white/20 border-white text-white shadow-lg' 
                    : 'bg-black/20 border-white/10 text-white/40 hover:bg-white/5'
                }`}
              >
                Français
              </button>
            </div>
          </div>

          <div className="w-full h-[1px] bg-white/10 my-4" />

          {/* Weight */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 ml-2">{t.weight}</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-xl font-semibold text-white focus:outline-none focus:border-pink-500/50 transition-all"
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 ml-2">{t.sex}</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setGender('male')}
                className={`py-4 rounded-2xl text-lg font-medium transition-all duration-300 border ${
                  gender === 'male' 
                    ? 'bg-blue-500/20 border-blue-500 text-blue-200 shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
                    : 'bg-black/20 border-white/10 text-white/40 hover:bg-white/5'
                }`}
              >
                {t.male}
              </button>
              <button
                onClick={() => setGender('female')}
                className={`py-4 rounded-2xl text-lg font-medium transition-all duration-300 border ${
                  gender === 'female' 
                    ? 'bg-pink-500/20 border-pink-500 text-pink-200 shadow-[0_0_20px_rgba(236,72,153,0.3)]' 
                    : 'bg-black/20 border-white/10 text-white/40 hover:bg-white/5'
                }`}
              >
                {t.female}
              </button>
            </div>
            <p className="text-xs text-white/30 text-center mt-2">{t.widmark}</p>
          </div>

          <button
            onClick={handleSave}
            className="w-full mt-8 bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-400 hover:to-violet-500 text-white py-4 rounded-2xl text-lg font-bold shadow-lg shadow-purple-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
};
