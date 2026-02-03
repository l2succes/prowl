interface FileViewerProps {
  path: string;
  content: string;
  onClose: () => void;
}

export default function FileViewer({ path, content, onClose }: FileViewerProps) {
  return (
    <div className="flex flex-col h-full bg-card">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-medium truncate">{path}</h2>
        </div>
        <button
          onClick={onClose}
          className="ml-4 px-3 py-1 text-sm hover:bg-muted rounded transition-colors"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <pre className="text-xs bg-background/50 p-4 rounded border border-border overflow-x-auto">
          <code>{content}</code>
        </pre>
      </div>
    </div>
  );
}
