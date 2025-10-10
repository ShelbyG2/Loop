import loopIcon from "@src/assets/loop-icon.png";

export function LoadingSpinner({
  size = "lg",
  className = "",
}: {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <span
        className={`inline-block ${sizes[size]} animate-spin rounded-full border-4 border-loop-primary border-t-transparent`}
        style={{ position: "relative" }}
      >
        <img
          src={loopIcon}
          alt="Loop loading"
          className="absolute inset-0 m-auto w-2/3 h-2/3 object-contain pointer-events-none"
          style={{ top: 0, left: 0, right: 0, bottom: 0 }}
        />
      </span>
    </div>
  );
}
