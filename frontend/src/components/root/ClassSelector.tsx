import { ArrowBigLeft, ArrowBigRight } from "lucide-react";
import { useState } from "react";
import { useTranslation } from 'react-i18next';

interface role {
  name: string;
  image: string;
}

interface ClassSelectorProps {
  roles: role[];
  onRoleSelect: (roleIndex: number) => void;
}

export default function ClassSelector({
  roles,
  onRoleSelect,
}: ClassSelectorProps) {
  const { t } = useTranslation();
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const currentRole = roles[currentRoleIndex].name;

  const handleNextRole = () => {
    const newIndex = (currentRoleIndex + 1) % roles.length;
    setCurrentRoleIndex(newIndex);
    onRoleSelect(newIndex);
  };

  const handlePrevRole = () => {
    const newIndex = (currentRoleIndex - 1 + roles.length) % roles.length;
    setCurrentRoleIndex(newIndex);
    onRoleSelect(newIndex);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
      <h1 className="text-xl font-semibold mb-1 text-primary-dark">
        {t('characterForm.chooseYourRole')}
      </h1>
      <div className="w-full flex items-center">
        <ArrowBigLeft
          size={96}
          className="text-primary-dark ml-8 cursor-pointer hover:text-accent-gold"
          onClick={() => {
            handlePrevRole();
          }}
        />
        {roles[currentRoleIndex].image ? (
          <img
            src={roles[currentRoleIndex].image}
            alt="Role Icon"
            className="w-96 h-96 mx-auto object-contain"
          />
        ) : (
          <div className="w-96 h-96 mx-auto flex items-center justify-center bg-primary-dark/5 rounded-lg">
            <span className="font-cinzel text-9xl text-primary-dark/20">
              {currentRole[0]}
            </span>
          </div>
        )}
        <ArrowBigRight
          size={96}
          className="text-primary-dark mr-8 cursor-pointer hover:text-accent-gold"
          onClick={() => {
            handleNextRole();
          }}
        />
      </div>

      <h1 className="text-3xl font-semibold mt-1 text-primary-dark">
        {t(`gameData.classes.${currentRole}.name`, { defaultValue: currentRole })}
      </h1>
    </div>
  );
}
