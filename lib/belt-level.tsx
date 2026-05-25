import { Award } from "lucide-react";

// belt 级别中文映射
export const beltLevelMap: Record<string, string> = {
  white: "白带",
  white_yellow: "白黄带",
  yellow: "黄带",
  yellow_green: "黄绿带",
  green: "绿带",
  green_blue: "绿蓝带",
  blue: "蓝带",
  blue_red: "蓝红带",
  red: "红带",
  red_black: "红黑带",
  black: "黑带",
};

// belt 级别颜色映射
export const beltLevelStyleMap: Record<string, { bg: string; text: string }> = {
  white: { bg: "bg-gray-200", text: "text-gray-700" },
  white_yellow: { bg: "bg-yellow-100", text: "text-yellow-700" },
  yellow: { bg: "bg-yellow-400/15", text: "text-yellow-700" },
  yellow_green: { bg: "bg-lime-400/15", text: "text-lime-700" },
  green: { bg: "bg-green-400/15", text: "text-green-700" },
  green_blue: { bg: "bg-teal-400/15", text: "text-teal-700" },
  blue: { bg: "bg-blue-400/15", text: "text-blue-700" },
  blue_red: { bg: "bg-purple-400/15", text: "text-purple-700" },
  red: { bg: "bg-red-400/15", text: "text-red-700" },
  red_black: { bg: "bg-rose-400/15", text: "text-rose-700" },
  black: { bg: "bg-gray-800/10", text: "text-gray-800" },
};

export function BeltBadge({ beltLevel }: { beltLevel: string }) {
  const style = beltLevelStyleMap[beltLevel];
  if (!style) {
    return <span className="text-[#A1A1A6] text-[13px]">—</span>;
  }
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${style.bg} ${style.text} text-[12px] font-medium`}
    >
      <Award className="w-3 h-3" />
      {beltLevelMap[beltLevel] || beltLevel}
    </span>
  );
}
