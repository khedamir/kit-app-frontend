import { useState } from "react";
import { Loader2, Briefcase, Sparkles, Code2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select } from "./ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useSkills, useInterests, useRoles } from "@/hooks/useReferences";
import {
  useUpdateSkills,
  useUpdateInterests,
  useUpdateRoles,
} from "@/hooks/useStudent";
import { handleError } from "@/lib/error-handler";
import type { Role, Interest, StudentSkill, Skill } from "@/types";

interface QuestionnaireModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRoles: Role[];
  currentInterests: Interest[];
  currentSkills: StudentSkill[];
}

interface SkillSelection {
  skill_id: number;
  level: number;
}

// Wrapper component that controls rendering
export function QuestionnaireModal({
  open,
  onOpenChange,
  currentRoles,
  currentInterests,
  currentSkills,
}: QuestionnaireModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <QuestionnaireModalContent
          onOpenChange={onOpenChange}
          initialRoles={currentRoles}
          initialInterests={currentInterests}
          initialSkills={currentSkills}
        />
      )}
    </Dialog>
  );
}

// Inner component with local state - mounts only when modal opens
interface QuestionnaireModalContentProps {
  onOpenChange: (open: boolean) => void;
  initialRoles: Role[];
  initialInterests: Interest[];
  initialSkills: StudentSkill[];
}

function QuestionnaireModalContent({
  onOpenChange,
  initialRoles,
  initialInterests,
  initialSkills,
}: QuestionnaireModalContentProps) {
  // Fetch reference data
  const { data: allSkills, isLoading: loadingSkills } = useSkills();
  const { data: allInterests, isLoading: loadingInterests } = useInterests();
  const { data: allRoles, isLoading: loadingRoles } = useRoles();

  // Mutations
  const updateSkills = useUpdateSkills();
  const updateInterests = useUpdateInterests();
  const updateRoles = useUpdateRoles();

  // Local state - initialized from props at mount time
  const [selectedRoles, setSelectedRoles] = useState<number[]>(() =>
    initialRoles.map((r) => r.id)
  );
  const [selectedInterests, setSelectedInterests] = useState<number[]>(() =>
    initialInterests.map((i) => i.id)
  );
  const [selectedSkills, setSelectedSkills] = useState<SkillSelection[]>(() =>
    initialSkills.map((s) => ({ skill_id: s.id, level: s.level }))
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const isLoading = loadingSkills || loadingInterests || loadingRoles;
  const isSaving =
    updateSkills.isPending ||
    updateInterests.isPending ||
    updateRoles.isPending;

  const handleRoleToggle = (roleId: number) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleInterestToggle = (interestId: number) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleSkillToggle = (skill: Skill) => {
    setSelectedSkills((prev) => {
      const exists = prev.find((s) => s.skill_id === skill.id);
      if (exists) {
        return prev.filter((s) => s.skill_id !== skill.id);
      }
      return [...prev, { skill_id: skill.id, level: 3 }];
    });
  };

  const handleSkillLevelChange = (skillId: number, level: number) => {
    setSelectedSkills((prev) =>
      prev.map((s) => (s.skill_id === skillId ? { ...s, level } : s))
    );
  };

  const getSkillLevel = (skillId: number): number | null => {
    const skill = selectedSkills.find((s) => s.skill_id === skillId);
    return skill ? skill.level : null;
  };

  const handleSave = async () => {
    try {
      await Promise.all([
        updateRoles.mutateAsync(selectedRoles),
        updateInterests.mutateAsync(selectedInterests),
        updateSkills.mutateAsync(selectedSkills),
      ]);
      onOpenChange(false);
    } catch (error) {
      handleError(error, "QuestionnaireModal");
    }
  };

  // Group skills by category
  const skillsByCategory =
    allSkills?.reduce((acc, skill) => {
      const catName = skill.category.name;
      if (!acc[catName]) acc[catName] = [];
      acc[catName].push(skill);
      return acc;
    }, {} as Record<string, Skill[]>) || {};

  const categories = Object.keys(skillsByCategory);
  const currentCategorySkills = selectedCategory
    ? skillsByCategory[selectedCategory] || []
    : [];

  // Get selected skills info for display
  const selectedSkillsInfo = selectedSkills
    .map((ss) => {
      const skill = allSkills?.find((s) => s.id === ss.skill_id);
      return skill ? { ...skill, level: ss.level } : null;
    })
    .filter(Boolean) as (Skill & { level: number })[];

  return (
    <DialogContent
      className="max-w-none sm:max-w-3xl h-full sm:h-auto max-h-none sm:max-h-[85vh] rounded-none sm:rounded-xl overflow-hidden flex flex-col"
      onClose={() => onOpenChange(false)}
    >
      <DialogHeader>
        <DialogTitle>Редактирование анкеты</DialogTitle>
        <DialogDescription>
          Укажите ваши роли, интересы и навыки
        </DialogDescription>
      </DialogHeader>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-6 pr-2 -mr-2">
          {/* Roles Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Роли в команде</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {allRoles?.map((role) => {
                const isSelected = selectedRoles.includes(role.id);
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleToggle(role.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-transparent border-border hover:bg-muted"
                    }`}
                  >
                    {role.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interests Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Интересы</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {allInterests?.map((interest) => {
                const isSelected = selectedInterests.includes(interest.id);
                return (
                  <button
                    key={interest.id}
                    onClick={() => handleInterestToggle(interest.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-transparent border-border hover:bg-muted"
                    }`}
                  >
                    {interest.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Skills Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Навыки</h3>
            </div>

            {/* Selected Skills Display */}
            {selectedSkillsInfo.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Выбранные навыки:
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedSkillsInfo.map((skill) => (
                    <Badge
                      key={skill.id}
                      variant="secondary"
                      className="gap-1 pr-1"
                    >
                      {skill.name}
                      <span className="ml-1 px-1.5 py-0.5 bg-primary/20 rounded text-xs">
                        {skill.level}
                      </span>
                      <button
                        onClick={() => handleSkillToggle(skill)}
                        className="ml-1 hover:bg-muted rounded p-0.5"
                      >
                        <span className="sr-only">Удалить</span>
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Category Select */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Выберите категорию для добавления навыков:
              </p>
              <Select
                value={selectedCategory}
                onChange={(value: string) => setSelectedCategory(value)}
                placeholder="Выберите категорию"
                options={categories.map((category) => ({
                  value: category,
                  label: category,
                }))}
              />
            </div>

            {/* Skills for Selected Category */}
            {selectedCategory && currentCategorySkills.length > 0 && (
              <div className="space-y-2 rounded-lg border border-border/50 bg-muted/30 p-3">
                <h4 className="text-sm font-medium">{selectedCategory}</h4>
                <div className="space-y-1">
                  {currentCategorySkills.map((skill) => {
                    const level = getSkillLevel(skill.id);
                    const isSelected = level !== null;

                    return (
                      <div
                        key={skill.id}
                        className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                          isSelected ? "bg-card" : "hover:bg-card/50"
                        }`}
                      >
                        <label className="flex items-center gap-3 cursor-pointer flex-1">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleSkillToggle(skill)}
                          />
                          <span className="text-sm">{skill.name}</span>
                        </label>

                        {isSelected && (
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((lvl) => (
                              <button
                                key={lvl}
                                onClick={() =>
                                  handleSkillLevelChange(skill.id, lvl)
                                }
                                className={`w-6 h-6 rounded text-xs font-medium transition-colors ${
                                  lvl <= level!
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted hover:bg-muted/80"
                                }`}
                              >
                                {lvl}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!selectedCategory && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Выберите категорию, чтобы увидеть доступные навыки
              </p>
            )}
          </div>
        </div>
      )}

      <DialogFooter className="border-t border-border pt-4">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Отмена
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="animate-spin" />
              Сохранение...
            </>
          ) : (
            "Сохранить"
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
