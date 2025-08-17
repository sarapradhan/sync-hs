import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MATERIAL_ICONS } from "@/lib/constants";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from "date-fns";

interface MiniCalendarProps {
  onViewFull: () => void;
}

export function MiniCalendar({ onViewFull }: MiniCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "d";
  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = "";

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;
      
      days.push(
        <div
          key={day.toString()}
          className={`text-center py-2 cursor-pointer hover:bg-gray-100 rounded ${
            !isSameMonth(day, monthStart)
              ? "text-gray-400"
              : isSameDay(day, new Date())
              ? "bg-material-blue-500 text-white rounded-full"
              : isToday(day)
              ? "bg-material-blue-500 text-white rounded-full"
              : ""
          }`}
          onClick={() => console.log("Selected date:", cloneDay)}
          data-testid={`calendar-day-${format(day, 'yyyy-MM-dd')}`}
        >
          {formattedDate}
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7 gap-1" key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }

  const onPrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const onNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  return (
    <Card className="shadow-material-1" data-testid="mini-calendar">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-gray-900">
            {format(currentDate, 'MMMM yyyy')}
          </CardTitle>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="p-1 hover:bg-gray-100 rounded"
              onClick={onPrevMonth}
              data-testid="button-prev-month"
            >
              <span className="material-icons text-sm">chevron_left</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="p-1 hover:bg-gray-100 rounded"
              onClick={onNextMonth}
              data-testid="button-next-month"
            >
              <span className="material-icons text-sm">chevron_right</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Calendar Header */}
        <div className="grid grid-cols-7 gap-1 text-xs font-medium text-gray-500 mb-2">
          <div className="text-center py-2">S</div>
          <div className="text-center py-2">M</div>
          <div className="text-center py-2">T</div>
          <div className="text-center py-2">W</div>
          <div className="text-center py-2">T</div>
          <div className="text-center py-2">F</div>
          <div className="text-center py-2">S</div>
        </div>
        
        {/* Calendar Body */}
        <div className="space-y-1">
          {rows}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button
            variant="ghost"
            className="w-full text-material-blue-700 hover:text-material-blue-500 font-medium text-sm"
            onClick={onViewFull}
            data-testid="button-view-full-calendar"
          >
            View Full Calendar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
