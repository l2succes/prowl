import { useState } from 'react';

interface ToolResultBlockProps {
  content: string;
}

export default function ToolResultBlock({ content }: ToolResultBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Truncate long content
  const shouldTruncate = content.length > 200;
  const displayContent = shouldTruncate && !isExpanded
    ? content.slice(0, 200) + '...'
    : content;

  return (
    <div className="border border-border rounded p-3 bg-muted/30">
      <div className="flex items-center justify-between mb-1">
        <div className="font-medium text-sm text-muted-foreground">
          ✓ Tool Result
        </div>
        {shouldTruncate && (
          <button
            className="text-xs text-primary hover:underline"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
      <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
        {displayContent}
      </pre>
    </div>
  );
}
