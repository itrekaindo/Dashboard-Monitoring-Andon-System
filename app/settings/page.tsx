import ModernSidebar from "@/components/ui/sidebar"

export default function Settings() {
  return (
    <ModernSidebar>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Configure system settings</p>
        </div>
        
        {/* Konten Settings Anda */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <p className="text-gray-300">Settings content goes here...</p>
        </div>
      </div>
    </ModernSidebar>
  )
}