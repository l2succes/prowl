import { useState } from 'react';

interface ToolUseBlockProps {
  name: string;
  input: any;
}

export default function ToolUseBlock({ name, input }: ToolUseBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-border rounded p-3 bg-muted/50">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="font-medium text-sm">
          🔧 Tool: <span className="text-primary">{name}</span>
        </div>
        <button className="text-muted-foreground hover:text-foreground">
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>
      {isExpanded && (
        <pre className="mt-2 text-xs overflow-x-auto bg-background/50 p-2 rounded">
          {JSON.stringify(input, null, 2)}
        </pre>
      )}
    </div>
  );
}
