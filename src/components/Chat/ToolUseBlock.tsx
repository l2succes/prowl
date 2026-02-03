import { useState } from 'react';

interface ToolUseBlockProps {
  name: string;
  input: any;
  onFileClick?: (path: string) => void;
}

function extractFilePath(input: any): string | null {
  if (!input) return null;
  return input.file_path || input.path || input.notebook_path || null;
}

export default function ToolUseBlock({ name, input, onFileClick }: ToolUseBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const filePath = extractFilePath(input);
  const isFileTool = ['Read', 'Write', 'Edit', 'NotebookEdit'].includes(name);

  const handleFileClick = (e: React.MouseEvent) => {
    if (filePath && onFileClick) {
      e.stopPropagation();
      onFileClick(filePath);
    }
  };

  return (
    <div className="border border-border rounded p-3 bg-muted/50">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="font-medium text-sm flex items-center gap-2">
          <span>🔧 Tool: <span className="text-primary">{name}</span></span>
          {isFileTool && filePath && (
            <button
              onClick={handleFileClick}
              className="text-xs text-blue-500 hover:underline hover:text-blue-400"
            >
              [{filePath}]
            </button>
          )}
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
