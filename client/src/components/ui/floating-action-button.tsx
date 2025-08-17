import { Button } from "@/components/ui/button";
import { MATERIAL_ICONS } from "@/lib/constants";

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <Button
      className="fixed bottom-20 md:bottom-6 right-6 bg-material-blue-500 text-white p-4 rounded-full shadow-material-3 hover:bg-material-blue-700 transition-colors z-40 h-auto w-auto"
      onClick={onClick}
      data-testid="floating-action-button"
    >
      <span className="material-icons text-2xl">{MATERIAL_ICONS.add}</span>
    </Button>
  );
}
