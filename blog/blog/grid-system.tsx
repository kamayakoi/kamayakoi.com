export function GridSystem() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div className="h-full w-full max-h-screen">
        <div className="relative h-full w-full">
          {/* Fixed size grid using absolute positioning instead of grid layout */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                                linear-gradient(to right, rgba(26, 26, 26, 0.07) 1px, transparent 1px),
                                linear-gradient(to bottom, rgba(26, 26, 26, 0.07) 1px, transparent 1px)
                            `,
              backgroundSize: "60px 60px",
            }}
          />

          {/* Dark mode overlay for grid lines */}
          <div
            className="absolute inset-0 hidden dark:block"
            style={{
              backgroundImage: `
                                linear-gradient(to right, rgba(255, 255, 255, 0.01) 1px, transparent 1px),
                                linear-gradient(to bottom, rgba(255, 255, 255, 0.01) 1px, transparent 1px)
                            `,
              backgroundSize: "60px 60px",
            }}
          />

          {/* Fade-out gradient overlay for light mode - even more aggressive bottom fade */}
          <div
            className="absolute inset-0 dark:hidden"
            style={{
              backgroundImage: `linear-gradient(to bottom, 
                                rgba(255, 255, 255, 0) 0%,
                                rgba(255, 255, 255, 0) 77%, 
                                rgba(255, 255, 255, 0.8) 80%, 
                                rgba(255, 255, 255, 0.95) 87%,
                                rgba(255, 255, 255, 1) 95%)`,
            }}
          />

          {/* Fade-out gradient overlay for dark mode - even more aggressive bottom fade */}
          <div
            className="absolute inset-0 hidden dark:block"
            style={{
              backgroundImage: `linear-gradient(to bottom, 
                                rgba(16, 16, 16, 0) 0%,
                                rgba(16, 16, 16, 0) 67%, 
                                rgba(16, 16, 16, 0.8) 80%, 
                                rgba(16, 16, 16, 0.95) 87%,
                                rgba(16, 16, 16, 1) 92%)`,
            }}
          />

          {/* Plus symbol */}
          <div className="absolute top-0 left-0 w-8 h-8">
            <div className="absolute left-1/2 top-0 w-[1px] h-full bg-[#1a1a1a]/10 dark:bg-[#ffffff]/10 -translate-x-1/2" />
            <div className="absolute top-1/2 left-0 h-[1px] w-full bg-[#1a1a1a]/10 dark:bg-[#ffffff]/10 -translate-y-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default GridSystem;
