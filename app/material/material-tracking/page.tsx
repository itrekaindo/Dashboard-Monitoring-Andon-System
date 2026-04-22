import ModernSidebar from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";

export default function MaterialTrackingPage() {
  return (
    <ModernSidebar>
      <div className="p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Material Tracking</h1>
          <p className="text-sm text-gray-400 mt-1">
            Halaman pelacakan material untuk memantau pergerakan material secara real-time.
          </p>
        </div>

        <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
          <CardContent className="p-6">
            <p className="text-sm text-gray-300">
              Konten material tracking akan ditampilkan di sini.
            </p>
          </CardContent>
        </Card>
      </div>
    </ModernSidebar>
  );
}
