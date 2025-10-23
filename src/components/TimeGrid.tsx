import React from "react";
import { generateTimeIntervals } from "../utils/timeIntervals";

type TimeGridProps = {
  date: string;
};

export const TimeGrid: React.FC<TimeGridProps> = ({ date }) => {
  const intervals = generateTimeIntervals();

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex min-w-max bg-white">
        {/* Kolumna z datą (sticky) */}
        <div className="sticky left-0 z-10 bg-white border-r p-2 min-w-[100px]">
          <div className="font-semibold">{date}</div>
        </div>
        
        {/* Pozioma siatka godzin */}
        <div className="flex">
          {intervals.map((time) => (
            <div
              key={time}
              className="w-16 border-b border-r text-center p-1 text-xs"
            >
              {time}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
