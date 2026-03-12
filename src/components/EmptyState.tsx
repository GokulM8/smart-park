import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ 
  icon = <Inbox className="w-12 h-12" />,
  title, 
  description,
  action 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-muted-foreground mb-4">
        {icon}
      </div>
      <h2 className="text-xl font-display font-bold mb-2">{title}</h2>
      {description && (
        <p className="text-muted-foreground text-center mb-6 max-w-sm">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
