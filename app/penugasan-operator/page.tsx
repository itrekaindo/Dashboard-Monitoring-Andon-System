import { getOperatorStatistics, getAllOperators } from '@/lib/queries/operator';
import ModernSidebar from '@/components/ui/sidebar';
import { PenugasanOperatorClient } from './penugasan-operator-client';

export default async function PenugasanOperatorPage() {
  try {
    const [statistics, operators] = await Promise.all([
      getOperatorStatistics(),
      getAllOperators()
    ]);

    return (
      <ModernSidebar>
        <PenugasanOperatorClient 
          statistics={statistics}
          operators={operators}
        />
      </ModernSidebar>
    );
  } catch (error) {
    console.error('Error loading penugasan operator page:', error);

    // Fallback dengan data kosong
    return (
      <ModernSidebar>
        <PenugasanOperatorClient 
          statistics={{ total_jam: 0, total_operator_aktif: 0, total_jam_aktual: 0 }}
          operators={[]}
        />
      </ModernSidebar>
    );
  }
}
