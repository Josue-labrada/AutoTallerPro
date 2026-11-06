import { Construction } from 'lucide-react';
import type { NavItem } from '../app/navigation';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusMessage } from '../components/ui/StatusMessage';

interface ComingSoonPageProps {
  item: NavItem;
}

/** Pantalla provisional para módulos planificados que aún no se implementan. */
export function ComingSoonPage({ item }: ComingSoonPageProps) {
  return (
    <>
      <PageHeader
        title={item.label}
        description={item.description}
        actions={<Badge tone="accent">Planificado · Etapa {item.plannedStage}</Badge>}
      />
      <Card>
        <StatusMessage icon={<Construction size={22} />} title="Próximamente">
          Este módulo todavía no está disponible. Se desarrollará en la etapa {item.plannedStage} del
          plan del proyecto.
        </StatusMessage>
      </Card>
    </>
  );
}
