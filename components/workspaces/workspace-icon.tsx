"use client";

import {
  User,
  FlaskConical,
  Boxes,
  Briefcase,
  Code2,
  Rocket,
  BookOpen,
  Globe,
  PenTool,
  Cpu,
  LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  User,
  FlaskConical,
  Boxes,
  Briefcase,
  Code2,
  Rocket,
  BookOpen,
  Globe,
  PenTool,
  Cpu,
};

export const WORKSPACE_ICONS = Object.keys(MAP);

export function WorkspaceIcon({
  name,
  size = 20,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const Icon = MAP[name] ?? Boxes;
  return <Icon size={size} className={className} />;
}
