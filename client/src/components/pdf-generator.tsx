import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FileDown, Eye, Loader2 } from "lucide-react";
import jsPDF from "jspdf";

export default function PDFGenerator() {
  const [prompt, setPrompt] = useState("");
  const [patientInfo, setPatientInfo] = useState({
    initials: "",
    age: "",
    gender: "",
    weight: ""
  });
  const [reporterInfo, setReporterInfo] = useState({
    name: "",
    title: "",
    institution: "",
    phone: "",
    email: ""
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generatePDF = () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter details about medications and reactions",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const doc = new jsPDF();
      let yPos = 25;
      
      // Header
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text("ADVERSE DRUG REACTION REPORTING FORM", 20, yPos);
      yPos += 15;
      
      // Form details
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("For use by Healthcare Professionals and Consumers", 20, yPos);
      yPos += 7;
      doc.text("Submit to: National Coordination Centre-Pharmacovigilance Programme of India", 20, yPos);
      yPos += 10;
      
      // Current date and reference
      const currentDate = new Date().toLocaleDateString();
      doc.setTextColor(40, 40, 40);
      doc.text(`Date Generated: ${currentDate}`, 20, yPos);
      doc.text(`Report ID: ADR-${Date.now()}`, 140, yPos);
      yPos += 15;
      
      // Section 1: Patient Information
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("SECTION 1: PATIENT INFORMATION", 20, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Patient Initials: ${patientInfo.initials || "_________________"}`, 20, yPos);
      yPos += 7;
      doc.text(`Age at Event: ${patientInfo.age || "_________________"}`, 20, yPos);
      yPos += 7;
      doc.text(`Gender: ${patientInfo.gender || "_________________"}`, 20, yPos);
      yPos += 7;
      doc.text(`Weight (kg): ${patientInfo.weight || "_________________"}`, 20, yPos);
      yPos += 7;
      doc.text("Height (cm): _________________", 20, yPos);
      yPos += 7;
      doc.text("Medical Record No.: _________________", 20, yPos);
      yPos += 15;
      
      // Section 2: Adverse Event Information
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("SECTION 2: ADVERSE EVENT INFORMATION", 20, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Reaction Description: _________________", 20, yPos);
      yPos += 7;
      doc.text("Onset Date: _________________", 20, yPos);
      yPos += 7;
      doc.text("Recovery Date: _________________", 20, yPos);
      yPos += 7;
      doc.text("Outcome: _________________", 20, yPos);
      yPos += 7;
      doc.text("Seriousness: _________________", 20, yPos);
      yPos += 7;
      doc.text("Action Taken: _________________", 20, yPos);
      yPos += 15;
      
      // Section 3: Suspected Medication Information
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("SECTION 3: SUSPECTED MEDICATION INFORMATION", 20, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Medication Name: _________________", 20, yPos);
      yPos += 7;
      doc.text("Active Ingredient: _________________", 20, yPos);
      yPos += 7;
      doc.text("Strength/Dosage: _________________", 20, yPos);
      yPos += 7;
      doc.text("Route of Administration: _________________", 20, yPos);
      yPos += 7;
      doc.text("Frequency: _________________", 20, yPos);
      yPos += 7;
      doc.text("Therapy Start Date: _________________", 20, yPos);
      yPos += 7;
      doc.text("Therapy End Date: _________________", 20, yPos);
      yPos += 7;
      doc.text("Indication for Use: _________________", 20, yPos);
      yPos += 15;
      
      // Section 4: Reporter Information
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("SECTION 4: REPORTER INFORMATION", 20, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Name: ${reporterInfo.name || "_________________"}`, 20, yPos);
      yPos += 7;
      doc.text(`Professional Title: ${reporterInfo.title || "_________________"}`, 20, yPos);
      yPos += 7;
      doc.text(`Institution: ${reporterInfo.institution || "_________________"}`, 20, yPos);
      yPos += 7;
      doc.text(`Phone: ${reporterInfo.phone || "_________________"}`, 20, yPos);
      yPos += 7;
      doc.text(`Email: ${reporterInfo.email || "_________________"}`, 20, yPos);
      yPos += 7;
      doc.text(`Report Date: ${currentDate}`, 20, yPos);
      yPos += 15;
      
      // Section 5: Additional Information
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("SECTION 5: ADDITIONAL INFORMATION", 20, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const description = prompt || "Please provide detailed description of the adverse event, including timeline, symptoms, and any relevant medical history.";
      const lines = doc.splitTextToSize(description, 170);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 6 + 15;
      
      // Footer and Instructions
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("INSTRUCTIONS FOR COMPLETION:", 20, yPos);
      yPos += 7;
      doc.text("• Fields marked with * are mandatory", 20, yPos);
      yPos += 7;
      doc.text("• Submit completed form to regulatory authorities within required timeframe", 20, yPos);
      yPos += 7;
      doc.text("• Keep a copy for your records", 20, yPos);
      
      // Generate and download
      doc.save(`ADR-Report-${Date.now()}.pdf`);
      toast({
        title: "Success",
        description: "PDF report generated successfully!",
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const previewPDF = () => {
    generatePDF();
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileDown className="h-5 w-5" />
          Generate PDF Report
        </CardTitle>
        <CardDescription>
          Create a standardized ADR report for regulatory submission
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Patient Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="initials">Patient Initials</Label>
                <Input
                  id="initials"
                  value={patientInfo.initials}
                  onChange={(e) => setPatientInfo({...patientInfo, initials: e.target.value})}
                  placeholder="e.g., J.D."
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  value={patientInfo.age}
                  onChange={(e) => setPatientInfo({...patientInfo, age: e.target.value})}
                  placeholder="e.g., 45"
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Input
                  id="gender"
                  value={patientInfo.gender}
                  onChange={(e) => setPatientInfo({...patientInfo, gender: e.target.value})}
                  placeholder="e.g., Male/Female"
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  value={patientInfo.weight}
                  onChange={(e) => setPatientInfo({...patientInfo, weight: e.target.value})}
                  placeholder="e.g., 70"
                />
              </div>
            </div>
          </div>

          {/* Reporter Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Reporter Information</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={reporterInfo.name}
                  onChange={(e) => setReporterInfo({...reporterInfo, name: e.target.value})}
                  placeholder="Full name"
                />
              </div>
              <div>
                <Label htmlFor="title">Professional Title</Label>
                <Input
                  id="title"
                  value={reporterInfo.title}
                  onChange={(e) => setReporterInfo({...reporterInfo, title: e.target.value})}
                  placeholder="e.g., Physician, Pharmacist"
                />
              </div>
              <div>
                <Label htmlFor="institution">Institution</Label>
                <Input
                  id="institution"
                  value={reporterInfo.institution}
                  onChange={(e) => setReporterInfo({...reporterInfo, institution: e.target.value})}
                  placeholder="Hospital/Clinic name"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={reporterInfo.phone}
                  onChange={(e) => setReporterInfo({...reporterInfo, phone: e.target.value})}
                  placeholder="Contact number"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={reporterInfo.email}
                  onChange={(e) => setReporterInfo({...reporterInfo, email: e.target.value})}
                  placeholder="Email address"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Adverse Event Description */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Adverse Event Description</h3>
          <div>
            <Label htmlFor="prompt">Detailed Description</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the adverse event including medications involved, reaction details, timeline, and any relevant medical history..."
              className="min-h-[120px]"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={previewPDF}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            Preview PDF
          </Button>
          <Button
            onClick={generatePDF}
            disabled={isGenerating}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
            Download PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}