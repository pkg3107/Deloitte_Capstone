import { useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { insertADRSchema } from "@shared/schema";
import { Plus, Trash2 } from "lucide-react";

// Define a medication schema for the array entries
const medicationSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  manufacturer: z.string().optional(),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  doseUsed: z.string().optional(),
  routeUsed: z.string().optional(),
  frequency: z.string().optional(),
  therapyStartDate: z.string().optional(),
  therapyEndDate: z.string().optional(), 
  indication: z.string().optional(),
  actionTaken: z.string().optional(),
  reintroductionResult: z.string().optional(),
});

// Extends the base schema with additional validation requirements
const formSchema = insertADRSchema.extend({
  patientInitials: z.string().min(1, "Patient initials are required"),
  ageAtEvent: z.string().min(1, "Age at event is required"),
  reactionStartDate: z.string().min(1, "Event/Reaction start date is required"),
  reactionDescription: z.string().min(1, "Event/Reaction description is required"),
  suspectedMedicationName: z.string().min(1, "At least one suspected medication name is required"),
  reporterName: z.string().min(1, "Reporter name is required"),
  reporterEmail: z.string().email("Please enter a valid email address"),
  reporterOccupation: z.string().min(1, "Reporter occupation is required"),
  reportDate: z.string().min(1, "Report date is required"),
  suspectedMedications: z.array(medicationSchema).optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function ADRForm() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("patientInfo");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientInitials: "",
      ageAtEvent: "",
      gender: "",
      weight: "",
      registrationNumber: "",
      reactionStartDate: "",
      reactionStopDate: "",
      reactionDescription: "",
      relevantTests: "",
      medicalHistory: "",
      seriousness: [],
      outcome: "",
      suspectedMedicationName: "",
      manufacturer: "",
      batchNumber: "",
      expiryDate: "",
      doseUsed: "",
      routeUsed: "",
      frequency: "",
      therapyStartDate: "",
      therapyEndDate: "",
      indication: "",
      actionTaken: "",
      reintroductionResult: "",
      reintroductionDose: "",
      concomitantMedications: "",
      additionalInformation: "",
      reporterName: "",
      reporterAddress: "",
      reporterAddressLine2: "",
      pinCode: "",
      reporterEmail: "",
      reporterPhone: "",
      reporterOccupation: "",
      reportDate: "",
      suspectedMedications: [{
        name: "",
        manufacturer: "",
        batchNumber: "",
        expiryDate: "",
        doseUsed: "",
        routeUsed: "",
        frequency: "",
        therapyStartDate: "",
        therapyEndDate: "",
        indication: "",
        actionTaken: "",
        reintroductionResult: "",
      }],
    },
  });
  
  // Use field array for multiple medications
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "suspectedMedications",
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Copy the first medication name to suspectedMedicationName for backward compatibility
      if (data.suspectedMedications && data.suspectedMedications.length > 0) {
        data.suspectedMedicationName = data.suspectedMedications[0].name;
      }
      
      await apiRequest("POST", "/api/adr", data);
      toast({
        title: "Report Submitted",
        description: `Thank you for submitting your ADR report. Your reference number is: ADR-${Math.floor(Math.random() * 1000000)}`,
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem submitting your report. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-md p-4 mb-4">
      <CardHeader className="border-b border-neutral-200 pb-2 p-4">
        <CardTitle className="text-xl font-medium text-primary">Suspected Adverse Drug Reaction Reporting Form</CardTitle>
        <CardDescription className="text-neutral-800">
          For VOLUNTARY reporting of Adverse Drug Reaction by Healthcare Professionals
          <div className="text-xs text-neutral-600 mt-1">Version-1.3</div>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full flex justify-start border-b border-neutral-200 mb-6 bg-transparent">
                <TabsTrigger 
                  value="patientInfo"
                  className="py-2 px-4 font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary text-neutral-600 hover:text-primary rounded-none data-[state=active]:shadow-none"
                >
                  Patient Information
                </TabsTrigger>
                <TabsTrigger 
                  value="adverseReaction"
                  className="py-2 px-4 font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary text-neutral-600 hover:text-primary rounded-none data-[state=active]:shadow-none"
                >
                  Adverse Reaction
                </TabsTrigger>
                <TabsTrigger 
                  value="suspectedMedication"
                  className="py-2 px-4 font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary text-neutral-600 hover:text-primary rounded-none data-[state=active]:shadow-none"
                >
                  Suspected Medication(s)
                </TabsTrigger>
                <TabsTrigger 
                  value="reporterDetails"
                  className="py-2 px-4 font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary text-neutral-600 hover:text-primary rounded-none data-[state=active]:shadow-none"
                >
                  Reporter Details
                </TabsTrigger>
              </TabsList>

              {/* Patient Information Tab */}
              <TabsContent value="patientInfo" className="mt-4">
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-primary mb-4">A. Patient Information</h3>
                  <div className="flex justify-end mb-2">
                    <div className="w-64">
                      <FormField
                        control={form.control}
                        name="registrationNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-neutral-800">Reg. No./IPD No./OPD No./CR No.</FormLabel>
                            <FormControl>
                              <Input {...field} className="w-full p-2 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="patientInitials"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-800">1. Patient Initials <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input {...field} required className="w-full p-2 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="ageAtEvent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-800">2. Age at time of Event or Date of Birth <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input {...field} required className="w-full p-2 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm font-medium text-neutral-800">3. Gender</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4 mt-2"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="M" />
                              </FormControl>
                              <FormLabel className="font-normal">Male</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="F" />
                              </FormControl>
                              <FormLabel className="font-normal">Female</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Other" />
                              </FormControl>
                              <FormLabel className="font-normal">Other</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-800">4. Weight (Kgs)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" className="w-full p-2 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end mt-6">
                  <Button 
                    type="button" 
                    className="bg-primary hover:bg-primary-dark text-white" 
                    onClick={() => setActiveTab("adverseReaction")}
                  >
                    Next
                  </Button>
                </div>
              </TabsContent>

              {/* Adverse Reaction Tab */}
              <TabsContent value="adverseReaction" className="mt-4">
                <h3 className="text-lg font-medium text-primary mb-4">B. Suspected Adverse Reaction</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="reactionStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-800">5. Event/Reaction start date <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input {...field} type="date" required className="w-full p-2 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="reactionStopDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-800">6. Event/Reaction stop date</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" className="w-full p-2 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="reactionDescription"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-sm font-medium text-neutral-800">7. Describe Event/Reaction with treatment details <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            rows={4} 
                            required 
                            className="w-full p-2 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="relevantTests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-800">12. Relevant tests/laboratory data with dates</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            rows={3} 
                            className="w-full p-2 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="medicalHistory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-800">13. Relevant medical/medication history</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            rows={3} 
                            placeholder="Allergies, race, pregnancy, smoking, alcohol use, hepatic/renal dysfunction, etc."
                            className="w-full p-2 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="seriousness"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-800">14. Seriousness of the reaction</FormLabel>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {[
                            { id: "death", label: "Death" },
                            { id: "congenital-anomaly", label: "Congenital anomaly" },
                            { id: "life-threatening", label: "Life threatening" },
                            { id: "disability", label: "Disability" },
                            { id: "hospitalization", label: "Hospitalization/Prolonged" },
                            { id: "other-important", label: "Other Medically important" },
                          ].map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="seriousness"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, item.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== item.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {item.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="outcome"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm font-medium text-neutral-800">15. Outcomes</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2 gap-2 mt-2"
                          >
                            {[
                              { value: "recovered", label: "Recovered" },
                              { value: "recovering", label: "Recovering" },
                              { value: "not-recovered", label: "Not recovered" },
                              { value: "fatal", label: "Fatal" },
                              { value: "sequelae", label: "Recovered with sequelae" },
                              { value: "unknown", label: "Unknown" },
                            ].map((item) => (
                              <FormItem key={item.value} className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value={item.value} />
                                </FormControl>
                                <FormLabel className="font-normal">{item.label}</FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end mt-6 space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setActiveTab("patientInfo")}
                  >
                    Previous
                  </Button>
                  <Button 
                    type="button" 
                    className="bg-primary hover:bg-primary-dark text-white" 
                    onClick={() => setActiveTab("suspectedMedication")}
                  >
                    Next
                  </Button>
                </div>
              </TabsContent>

              {/* Suspected Medications Tab */}
              <TabsContent value="suspectedMedication" className="mt-4">
                <h3 className="text-lg font-medium text-primary mb-4">C. Suspected Medication(s)</h3>
                
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-neutral-100">
                        <th className="border border-neutral-300 px-3 py-2 text-left text-sm font-medium">S.No</th>
                        <th className="border border-neutral-300 px-3 py-2 text-left text-sm font-medium">8. Name<br/>(Brand/Generic) <span className="text-red-500">*</span></th>
                        <th className="border border-neutral-300 px-3 py-2 text-left text-sm font-medium">Manufacturer<br/>(if known)</th>
                        <th className="border border-neutral-300 px-3 py-2 text-left text-sm font-medium">Batch/Lot No.</th>
                        <th className="border border-neutral-300 px-3 py-2 text-left text-sm font-medium">Exp. Date</th>
                        <th className="border border-neutral-300 px-3 py-2 text-left text-sm font-medium">Dose used</th>
                        <th className="border border-neutral-300 px-3 py-2 text-left text-sm font-medium">Route used</th>
                        <th className="border border-neutral-300 px-3 py-2 text-left text-sm font-medium">Frequency</th>
                        <th className="border border-neutral-300 px-3 py-2 text-left text-sm font-medium">Therapy dates</th>
                        <th className="border border-neutral-300 px-3 py-2 text-left text-sm font-medium">Indication</th>
                        <th className="border border-neutral-300 px-3 py-2 text-left text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fields.map((field, index) => (
                        <tr key={field.id}>
                          <td className="border border-neutral-300 px-3 py-2 text-sm">{index + 1}</td>
                          <td className="border border-neutral-300 px-3 py-2">
                            <Input 
                              {...form.register(`suspectedMedications.${index}.name` as const, { required: true })}
                              className="w-full p-1 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary" 
                              required
                            />
                          </td>
                          <td className="border border-neutral-300 px-3 py-2">
                            <Input 
                              {...form.register(`suspectedMedications.${index}.manufacturer` as const)}
                              className="w-full p-1 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary" 
                            />
                          </td>
                          <td className="border border-neutral-300 px-3 py-2">
                            <Input 
                              {...form.register(`suspectedMedications.${index}.batchNumber` as const)}
                              className="w-full p-1 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary" 
                            />
                          </td>
                          <td className="border border-neutral-300 px-3 py-2">
                            <Input 
                              {...form.register(`suspectedMedications.${index}.expiryDate` as const)}
                              type="date"
                              className="w-full p-1 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary" 
                            />
                          </td>
                          <td className="border border-neutral-300 px-3 py-2">
                            <Input 
                              {...form.register(`suspectedMedications.${index}.doseUsed` as const)}
                              className="w-full p-1 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary" 
                            />
                          </td>
                          <td className="border border-neutral-300 px-3 py-2">
                            <Controller
                              control={form.control}
                              name={`suspectedMedications.${index}.routeUsed` as const}
                              render={({ field }) => (
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger className="w-full p-1 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="oral">Oral</SelectItem>
                                    <SelectItem value="intravenous">Intravenous</SelectItem>
                                    <SelectItem value="intramuscular">Intramuscular</SelectItem>
                                    <SelectItem value="subcutaneous">Subcutaneous</SelectItem>
                                    <SelectItem value="topical">Topical</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </td>
                          <td className="border border-neutral-300 px-3 py-2">
                            <Input 
                              {...form.register(`suspectedMedications.${index}.frequency` as const)}
                              placeholder="OD, BD, etc."
                              className="w-full p-1 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary" 
                            />
                          </td>
                          <td className="border border-neutral-300 px-3 py-2">
                            <div className="flex flex-col gap-1">
                              <Input 
                                {...form.register(`suspectedMedications.${index}.therapyStartDate` as const)}
                                type="date"
                                placeholder="Start"
                                className="w-full p-1 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary" 
                              />
                              <Input 
                                {...form.register(`suspectedMedications.${index}.therapyEndDate` as const)}
                                type="date"
                                placeholder="End"
                                className="w-full p-1 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary" 
                              />
                            </div>
                          </td>
                          <td className="border border-neutral-300 px-3 py-2">
                            <Input 
                              {...form.register(`suspectedMedications.${index}.indication` as const)}
                              className="w-full p-1 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary" 
                            />
                          </td>
                          <td className="border border-neutral-300 px-3 py-2 text-center">
                            {index > 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => remove(index)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-center mb-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({
                      name: "",
                      manufacturer: "",
                      batchNumber: "",
                      expiryDate: "",
                      doseUsed: "",
                      routeUsed: "",
                      frequency: "",
                      therapyStartDate: "",
                      therapyEndDate: "",
                      indication: "",
                      actionTaken: "",
                      reintroductionResult: "",
                    })}
                    className="flex items-center gap-1 border-dashed"
                  >
                    <Plus className="h-4 w-4" />
                    Add Another Medication
                  </Button>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-md font-medium text-neutral-800 mb-2">9. Action Taken & 10. Reaction After Reintroduction</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead>
                        <tr className="bg-neutral-100">
                          <th className="border border-neutral-300 px-3 py-2 text-left text-sm font-medium">S.No</th>
                          <th className="border border-neutral-300 px-3 py-2 text-left text-sm font-medium" colSpan={6}>9. Action Taken</th>
                          <th className="border border-neutral-300 px-3 py-2 text-left text-sm font-medium" colSpan={4}>10. Reaction After Reintroduction</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-neutral-300 px-3 py-2 text-sm">i</td>
                          <td className="border border-neutral-300 px-3 py-2" colSpan={6}>
                            <Controller
                              control={form.control}
                              name="actionTaken"
                              render={({ field }) => (
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-wrap gap-2"
                                >
                                  {[
                                    { value: "withdrawn", label: "Drug withdrawn" },
                                    { value: "increased", label: "Dose increased" },
                                    { value: "reduced", label: "Dose reduced" },
                                    { value: "unchanged", label: "Dose not changed" },
                                    { value: "na", label: "Not applicable" },
                                    { value: "unknown", label: "Unknown" },
                                  ].map((item) => (
                                    <FormItem key={item.value} className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value={item.value} />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal">{item.label}</FormLabel>
                                    </FormItem>
                                  ))}
                                </RadioGroup>
                              )}
                            />
                          </td>
                          <td className="border border-neutral-300 px-3 py-2" colSpan={4}>
                            <div className="flex flex-wrap gap-3">
                              <Controller
                                control={form.control}
                                name="reintroductionResult"
                                render={({ field }) => (
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-wrap gap-3"
                                  >
                                    {[
                                      { value: "yes", label: "Yes" },
                                      { value: "no", label: "No" },
                                      { value: "unknown", label: "Effect unknown" },
                                    ].map((item) => (
                                      <FormItem key={item.value} className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                          <RadioGroupItem value={item.value} />
                                        </FormControl>
                                        <FormLabel className="text-sm font-normal">{item.label}</FormLabel>
                                      </FormItem>
                                    ))}
                                  </RadioGroup>
                                )}
                              />
                              <div className="flex items-center">
                                <span className="text-sm mr-1">Dose:</span>
                                <Input 
                                  {...form.register("reintroductionDose")}
                                  className="p-1 w-20 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary" 
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-md font-medium text-neutral-800 mb-2">11. Concomitant Medical Products</h4>
                  <FormField
                    control={form.control}
                    name="concomitantMedications"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            rows={3} 
                            placeholder="Enter concomitant medical products (including self-medication and herbal remedies)"
                            className="w-full p-2 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="mb-4">
                  <FormField
                    control={form.control}
                    name="additionalInformation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-800">Additional Information</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            rows={3} 
                            className="w-full p-2 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end mt-6 space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setActiveTab("adverseReaction")}
                  >
                    Previous
                  </Button>
                  <Button 
                    type="button" 
                    className="bg-primary hover:bg-primary-dark text-white" 
                    onClick={() => setActiveTab("reporterDetails")}
                  >
                    Next
                  </Button>
                </div>
              </TabsContent>

              {/* Reporter Details Tab */}
              <TabsContent value="reporterDetails" className="mt-4">
                <h3 className="text-lg font-medium text-primary mb-4">D. Reporter Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="reporterName"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-sm font-medium text-neutral-800">16. Name and Professional Address <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            required 
                            className="w-full p-2 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary mb-2" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reporterAddressLine2"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2 -mt-2">
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Address Line 2" 
                            className="w-full p-2 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="pinCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-800">Pin</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="w-full p-2 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="reporterEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-800">E-mail <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="email" 
                            required 
                            className="w-full p-2 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="reporterPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-800">Tel. No. (with STD code)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="tel" 
                            className="w-full p-2 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="reporterOccupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-800">Occupation <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger className="w-full p-2 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="physician">Physician</SelectItem>
                              <SelectItem value="pharmacist">Pharmacist</SelectItem>
                              <SelectItem value="nurse">Nurse</SelectItem>
                              <SelectItem value="dentist">Dentist</SelectItem>
                              <SelectItem value="other">Other Healthcare Professional</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="reportDate"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-sm font-medium text-neutral-800">17. Date of this report <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="date" 
                            required 
                            className="w-full p-2 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="md:col-span-2 bg-neutral-100 p-3 rounded text-sm text-neutral-700">
                    <p><strong>Confidentiality:</strong> The patient's identity is held in strict confidence and protected to the fullest extent. Submission of a report does not constitute an admission that medical personnel or manufacturer or the product caused or contributed to the reaction. Submission of an ADR report does not have any legal implication on the reporter.</p>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6 space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setActiveTab("suspectedMedication")}
                  >
                    Previous
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors"
                  >
                    Submit Report
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
