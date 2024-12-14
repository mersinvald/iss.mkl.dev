import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

const Progress = React.forwardRef(({ 
  className = "", 
  value, 
  ...props 
}, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={`
      relative h-2 w-full overflow-hidden 
      rounded-full bg-slate-900/20 dark:bg-slate-50/20
      ${className}
    `}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-slate-900 dark:bg-slate-50 transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));

Progress.displayName = "Progress";

export { Progress };
