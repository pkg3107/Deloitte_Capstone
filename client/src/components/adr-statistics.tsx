import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Define the ADR data structure
type DrugADRStatistic = {
  id: string;
  drugName: string;
  totalReports: number;
  seriousCount: number;
  nonSeriousCount: number;
  lastReported: Date;
};

export default function ADRStatistics() {
  const [loading, setLoading] = useState(true);
  // Dummy data for demonstration
  const [adrStats, setAdrStats] = useState<DrugADRStatistic[]>([
    {
      id: "1",
      drugName: "Acetaminophen",
      totalReports: 32,
      seriousCount: 7,
      nonSeriousCount: 25,
      lastReported: new Date(2024, 4, 15)
    },
    {
      id: "2",
      drugName: "Amoxicillin",
      totalReports: 48,
      seriousCount: 12,
      nonSeriousCount: 36,
      lastReported: new Date(2024, 4, 17)
    },
    {
      id: "3",
      drugName: "Atorvastatin",
      totalReports: 21,
      seriousCount: 4,
      nonSeriousCount: 17,
      lastReported: new Date(2024, 4, 10)
    },
    {
      id: "4",
      drugName: "Levofloxacin",
      totalReports: 64,
      seriousCount: 18,
      nonSeriousCount: 46,
      lastReported: new Date(2024, 4, 18)
    },
    {
      id: "5",
      drugName: "Metformin",
      totalReports: 29,
      seriousCount: 5,
      nonSeriousCount: 24,
      lastReported: new Date(2024, 4, 12)
    }
  ]);

  // Simulate API loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Calculate total report count
  const totalReports = adrStats.reduce((sum, stat) => sum + stat.totalReports, 0);
  const totalSeriousReports = adrStats.reduce((sum, stat) => sum + stat.seriousCount, 0);

  return (
    <Card className="bg-white rounded-lg shadow-md w-full mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-medium text-primary flex items-center justify-between">
          <span>Adverse Drug Reaction Reports</span>
          <Badge variant="outline" className="ml-2 text-md font-normal">
            Total: {totalReports} ({totalSeriousReports} serious)
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Drug Name</TableHead>
                  <TableHead className="text-right">Total Reports</TableHead>
                  <TableHead className="text-right">Serious</TableHead>
                  <TableHead className="text-right">Non-Serious</TableHead>
                  <TableHead className="text-right">Last Reported</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adrStats.map((stat) => (
                  <TableRow key={stat.id}>
                    <TableCell className="font-medium">{stat.drugName}</TableCell>
                    <TableCell className="text-right">{stat.totalReports}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="destructive" className="font-normal">
                        {stat.seriousCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="font-normal">
                        {stat.nonSeriousCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {stat.lastReported.toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}