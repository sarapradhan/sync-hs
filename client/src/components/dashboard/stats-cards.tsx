import { Card, CardContent } from "@/components/ui/card";
import { MATERIAL_ICONS } from "@/lib/constants";

interface StatsCardsProps {
  stats: {
    dueToday: number;
    thisWeek: number;
    completed: number;
    totalActive: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cardData = [
    {
      title: "Due Today",
      value: stats.dueToday,
      icon: MATERIAL_ICONS.assignment,
      bgColor: "bg-red-500 bg-opacity-10",
      iconColor: "text-red-500",
      testId: "card-due-today"
    },
    {
      title: "This Week",
      value: stats.thisWeek,
      icon: MATERIAL_ICONS.schedule,
      bgColor: "bg-orange-500 bg-opacity-10",
      iconColor: "text-orange-500",
      testId: "card-this-week"
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: MATERIAL_ICONS.check,
      bgColor: "bg-green-500 bg-opacity-10",
      iconColor: "text-green-500",
      testId: "card-completed"
    },
    {
      title: "Total Active",
      value: stats.totalActive,
      icon: MATERIAL_ICONS.assignment,
      bgColor: "bg-blue-500 bg-opacity-10",
      iconColor: "text-blue-500",
      testId: "card-total-active"
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cardData.map((card) => (
        <Card key={card.title} className="shadow-material-1" data-testid={card.testId}>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className={`p-3 ${card.bgColor} rounded-lg`}>
                <span className={`material-icons ${card.iconColor}`}>
                  {card.icon}
                </span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-semibold text-gray-900" data-testid={`${card.testId}-value`}>
                  {card.value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
