// app/operator/page.tsx

import ModernSidebar from "@/components/ui/sidebar";
import { getAllOperators, getOperatorStatistics } from '@/lib/queries/operator';
import OperatorClient from './operator-client';

export default async function OperatorPage() {
  try {
    const [operators, statistics] = await Promise.all([
      getAllOperators(),
      getOperatorStatistics()
    ]);

    return (
      <ModernSidebar>
        <OperatorClient operators={operators} statistics={statistics} />
      </ModernSidebar>
    );
  } catch (error) {
    console.error('Error loading operator page:', error);
    // Fallback dengan data kosong jika terjadi error
    return (
      <ModernSidebar>
        <OperatorClient 
          operators={[]} 
          statistics={{ total_jam: 0, total_operator_aktif: 0, total_jam_aktual: 0 }} 
        />
      </ModernSidebar>
    );
  }
}
