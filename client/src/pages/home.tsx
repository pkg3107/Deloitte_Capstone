import { useState } from "react";
import Header from "@/components/header";
import ADRForm from "@/components/adr-form";
import ReportingCalendar from "@/components/reporting-calendar";
import ResourceLinks from "@/components/resource-links";
import ChatWidget from "@/components/chat-widget";
import ADRStatistics from "@/components/adr-statistics";
import PDFGenerator from "@/components/pdf-generator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container mx-auto p-4 flex flex-col gap-4 flex-grow">
        {/* ADR Statistics at the top */}
        <ADRStatistics />
        
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Main content area */}
          <div className="lg:w-3/4 flex flex-col">
            <Tabs defaultValue="adr-form" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="adr-form">ADR Form</TabsTrigger>
                <TabsTrigger value="pdf-generator">Generate PDF Report</TabsTrigger>
              </TabsList>
              <TabsContent value="adr-form" className="mt-4">
                <ADRForm />
              </TabsContent>
              <TabsContent value="pdf-generator" className="mt-4">
                <PDFGenerator />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right sidebar */}
          <div className="lg:w-1/4 flex flex-col gap-4">
            <ReportingCalendar />
            <ResourceLinks />
          </div>
        </div>
      </div>
      <ChatWidget />
    </div>
  );
}
