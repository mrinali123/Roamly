interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  style?: React.CSSProperties;
}

export default function GlassCard({ children, className = "", hover = true, style }: GlassCardProps) {
  return (
    <div className={`${hover ? "glass-card" : "glass"} ${className}`} style={style}>
      {children}
    </div>
  );
}
