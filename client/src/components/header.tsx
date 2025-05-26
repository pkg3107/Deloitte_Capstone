import { CircleDot } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-primary text-white p-4 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <CircleDot className="mr-2 h-6 w-6" />
          <h1 className="text-xl font-medium">Pharmacovigilance Programme of India (PvPI)</h1>
        </div>
        <div className="flex items-center">
          <span className="text-sm">Healthcare Professional Portal</span>
        </div>
      </div>
    </header>
  );
}
