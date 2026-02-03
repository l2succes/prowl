import { useEffect, useState } from 'react';
import FileViewer from './FileViewer';

interface FileViewerModalProps {
  path: string | null;
  onClose: () => void;
  sendRequest: (method: string, params?: any) => Promise<any>;
}

export default function FileViewerModal({
  path,
  onClose,
  sendRequest,
}: FileViewerModalProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!path) {
      setContent(null);
      setError(null);
      return;
    }

    const loadFile = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await sendRequest('gateway.exec', {
          command: 'cat',
          args: [path],
        });
        if (result && result.stdout) {
          setContent(result.stdout);
        } else if (result && result.stderr) {
          setError(result.stderr);
        } else {
          setError('Failed to read file');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to read file');
      } finally {
        setLoading(false);
      }
    };

    loadFile();
  }, [path, sendRequest]);

  if (!path) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-[80%] h-[80%] max-w-6xl bg-card rounded-lg shadow-xl overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        )}
        {error && (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-sm font-medium">{path}</h2>
              <button
                onClick={onClose}
                className="ml-4 px-3 py-1 text-sm hover:bg-muted rounded transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center text-destructive">
              {error}
            </div>
          </div>
        )}
        {content && <FileViewer path={path} content={content} onClose={onClose} />}
      </div>
    </div>
  );
}
