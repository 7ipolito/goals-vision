interface ProfileCardProps {
  title: string;
  description: string;
  icon: string;
  features: string[];
  isSelected?: boolean;
  onClick?: () => void;
  gradient: string;
  className?: string;
  selectedText?: string;
}

export function ProfileCard({
  title,
  description,
  icon,
  features,
  isSelected = false,
  onClick,
  gradient,
  className = "",
  selectedText = "Selected",
}: ProfileCardProps) {
  return (
    <div
      className={`relative p-4 md:p-8 rounded-xl md:rounded-2xl backdrop-blur-lg border border-white/20 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl ${gradient} ${className}`}
      onClick={onClick}
    >
      <div className="absolute top-4 md:top-6 right-4 md:right-6">
        <div
          className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-white/60 flex items-center justify-center ${
            isSelected ? "bg-white" : ""
          }`}
        >
          {isSelected && (
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#1B5E43]"></div>
          )}
        </div>
      </div>

      <div className="text-3xl md:text-4xl mb-3 md:mb-4">{icon}</div>

      <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-4">
        {title}
      </h3>

      <p className="text-sm md:text-base text-gray-200 mb-4 md:mb-6 leading-relaxed">
        {description}
      </p>

      <ul className="space-y-2 md:space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-gray-200">
            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white/60 rounded-full mr-2 md:mr-3"></span>
            <span className="text-xs md:text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      {isSelected && (
        <div className="mt-4 md:mt-6 bg-white/20 backdrop-blur-sm rounded-lg py-2 md:py-3 px-3 md:px-4 text-center">
          <span className="text-white font-medium text-sm md:text-base">
            ✓ {selectedText}
          </span>
        </div>
      )}
    </div>
  );
}
