"use client";

import { useState } from "react";

interface TechniqueSelectorProps {
  onTechniqueSelect: (techniques: string[]) => void;
  isVisible: boolean;
}

const techniques = [
  { id: "1", name: "What If Scenarios", description: "Provocative questions to expand thinking" },
  { id: "2", name: "Analogical Thinking", description: "Find connections through analogies" },
  { id: "3", name: "Reversal/Inversion", description: "Flip the problem to find new angles" },
  { id: "4", name: "First Principles Thinking", description: "Break down to fundamentals" },
  
  { id: "5", name: "SCAMPER Method", description: "7 perspectives for modification" },
  { id: "6", name: "Six Thinking Hats", description: "6 different viewpoints" },
  { id: "7", name: "Mind Mapping", description: "Visual organization and expansion" },
  
  { id: "8", name: "Yes, And... Building", description: "Build ideas collaboratively" },
  { id: "9", name: "Brainwriting/Round Robin", description: "Pass ideas back and forth" },
  { id: "10", name: "Random Stimulation", description: "Use random prompts for connections" },
  
  { id: "11", name: "Five Whys", description: "Drill down to root causes" },
  { id: "12", name: "Morphological Analysis", description: "Explore parameter combinations" },
  { id: "13", name: "Provocation Technique (PO)", description: "Challenge with provocative statements" },
  
  { id: "14", name: "Forced Relationships", description: "Connect unrelated concepts" },
  { id: "15", name: "Assumption Reversal", description: "Challenge core assumptions" },
  { id: "16", name: "Role Playing", description: "Different stakeholder perspectives" },
  { id: "17", name: "Time Shifting", description: "Solve in different time periods" },
  { id: "18", name: "Resource Constraints", description: "Limited resources, unlimited creativity" },
  { id: "19", name: "Metaphor Mapping", description: "Extended metaphors for solutions" },
  { id: "20", name: "Question Storming", description: "Generate questions before answers" }
];

export default function TechniqueSelector({ onTechniqueSelect, isVisible }: TechniqueSelectorProps) {
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>([]);

  if (!isVisible) return null;

  const handleTechniqueToggle = (techniqueId: string) => {
    setSelectedTechniques(prev => 
      prev.includes(techniqueId) 
        ? prev.filter(id => id !== techniqueId)
        : [...prev, techniqueId]
    );
  };

  const handleSubmit = () => {
    if (selectedTechniques.length > 0) {
      onTechniqueSelect(selectedTechniques);
      setSelectedTechniques([]);
    }
  };

  return (
    <div className="surface p-6 mb-4">
      <h3 className="text-lg font-semibold mb-4">Choose Brainstorming Techniques</h3>
      <p className="text-sm text-[color:var(--muted)] mb-6">
        Select one or more techniques to guide your brainstorming session. You can choose multiple techniques to explore different angles.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {techniques.map((technique) => (
          <div
            key={technique.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
              selectedTechniques.includes(technique.id)
                ? "border-[var(--accent)] bg-[var(--accent)]/10"
                : "border-[color:var(--border)] hover:border-[var(--accent)]/50 hover:bg-[#1f2637]"
            }`}
            onClick={() => handleTechniqueToggle(technique.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-[var(--accent)] mr-2">
                    {technique.id}.
                  </span>
                  <h4 className="font-medium text-sm">{technique.name}</h4>
                </div>
                <p className="text-xs text-[color:var(--muted)]">
                  {technique.description}
                </p>
              </div>
              <div className={`w-5 h-5 rounded border-2 ml-3 flex items-center justify-center ${
                selectedTechniques.includes(technique.id)
                  ? "border-[var(--accent)] bg-[var(--accent)]"
                  : "border-[color:var(--border)]"
              }`}>
                {selectedTechniques.includes(technique.id) && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-[color:var(--muted)]">
          {selectedTechniques.length} technique{selectedTechniques.length !== 1 ? 's' : ''} selected
        </p>
        <button
          onClick={handleSubmit}
          disabled={selectedTechniques.length === 0}
          className="px-4 py-2 text-sm font-medium rounded-md btn-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Start Brainstorming
        </button>
      </div>
    </div>
  );
}
