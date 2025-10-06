import { MainLayout } from '../layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from '../ui';
import { Construction } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description: string;
  icon?: string;
}

export function ComingSoon({ title, description, icon = '🚧' }: ComingSoonProps) {
  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-4xl">{icon}</span>
              </div>
            </div>
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              {title}
              <Badge variant="info">Em breve</Badge>
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex items-center justify-center gap-2 text-neutral-600">
              <Construction className="h-5 w-5" />
              <p className="text-sm">
                Esta funcionalidade está em desenvolvimento
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
