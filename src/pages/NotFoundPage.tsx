import { Link } from 'react-router-dom';
import { EmptyState, Page } from '../components/ui';

export default function NotFoundPage() {
  return (
    <Page>
      <EmptyState title="Page introuvable" icon="alert">
        <Link to="/" className="link">
          Revenir à l'accueil
        </Link>
      </EmptyState>
    </Page>
  );
}
