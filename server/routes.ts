import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertADRSchema, insertCalendarEventSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
// Initialize Google AI Studio (Gemini) client
async function callGeminiAPI(message: string, conversationHistory: any[] = []) {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an expert pharmacovigilance assistant with deep knowledge of adverse drug reactions, regulatory requirements, drug safety, and medical terminology. You help healthcare professionals with:

- Adverse drug reaction (ADR) identification and assessment
- Drug interaction analysis
- Regulatory reporting requirements (FDA, EMA, WHO guidelines)
- Pharmacovigilance best practices
- Risk assessment and signal detection
- PSUR (Periodic Safety Update Report) guidance
- Medical terminology and coding systems (MedDRA, WHO-ART)
- Clinical trial safety monitoring
- Post-marketing surveillance

Provide accurate, evidence-based responses that are professional and helpful for healthcare professionals. When discussing specific medications or medical conditions, always recommend consulting with qualified healthcare providers for patient-specific advice.

User query: ${message}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1000,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Google AI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Google AI API error:', error);
    return generatePharmacologyResponse(message);
  }
}

// Pharmacovigilance knowledge base for fallback responses
function generatePharmacologyResponse(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('drug interaction') || lowerQuery.includes('interaction')) {
    return `For drug interaction assessment in pharmacovigilance:

1. **Clinical Evaluation**: Review patient's complete medication history, including prescription drugs, OTC medications, and supplements.

2. **Mechanism Assessment**: Identify potential interactions based on:
   - Pharmacokinetic interactions (absorption, distribution, metabolism, excretion)
   - Pharmacodynamic interactions (additive, synergistic, or antagonistic effects)

3. **Risk Stratification**: Consider patient-specific factors:
   - Age and comorbidities
   - Hepatic and renal function
   - Genetic polymorphisms affecting drug metabolism

4. **Documentation**: Use standardized interaction databases (Lexicomp, Micromedex) and document severity levels (contraindicated, major, moderate, minor).

5. **Monitoring**: Establish appropriate monitoring parameters for identified interactions.

Recommended next steps: Consult current drug interaction databases and consider dose adjustments or alternative therapies when clinically significant interactions are identified.`;
  }
  
  if (lowerQuery.includes('signal detection') || lowerQuery.includes('safety signal')) {
    return `Pharmacovigilance signal detection best practices:

1. **Data Sources**: Monitor multiple data streams:
   - Spontaneous adverse event reports
   - Clinical trial data
   - Electronic health records
   - Literature surveillance
   - Social media monitoring

2. **Statistical Methods**:
   - Proportional Reporting Ratio (PRR)
   - Reporting Odds Ratio (ROR)
   - Information Component (IC)
   - Empirical Bayes Geometric Mean (EBGM)

3. **Signal Validation**: Evaluate biological plausibility, dose-response relationship, temporal association, and consistency across data sources.

4. **Regulatory Compliance**: Follow ICH E2E guidelines and maintain traceability of signal detection activities.

5. **Risk Communication**: Ensure timely communication of validated signals to regulatory authorities and healthcare providers.

Regular review cycles should be established to monitor emerging safety patterns and maintain signal detection effectiveness.`;
  }
  
  if (lowerQuery.includes('adr report') || lowerQuery.includes('adverse event')) {
    return `ADR reporting requirements and best practices:

1. **Mandatory Elements**:
   - Patient identifiers (initials, age, gender)
   - Suspect medication details (name, dose, indication)
   - Adverse event description and outcome
   - Reporter information and contact details

2. **Timeline Requirements**:
   - Serious ADRs: Report within 15 days of awareness
   - Non-serious ADRs: Include in periodic reports
   - Follow-up information: Submit within 90 days

3. **Seriousness Criteria** (Any event that):
   - Results in death
   - Is life-threatening
   - Requires hospitalization
   - Results in persistent disability
   - Is a congenital anomaly
   - Requires intervention to prevent permanent damage

4. **Quality Standards**: Ensure reports are complete, accurate, and include sufficient detail for medical assessment.

5. **Regulatory Submission**: Use appropriate channels (FDA MedWatch, EMA EudraVigilance, local authorities).

Maintain comprehensive documentation and follow-up procedures to support regulatory compliance and patient safety.`;
  }
  
  if (lowerQuery.includes('elderly') || lowerQuery.includes('geriatric')) {
    return `Special considerations for pharmacovigilance in elderly patients:

1. **Age-Related Changes**: Monitor for altered drug metabolism due to decreased hepatic and renal function, requiring dose adjustments.

2. **Polypharmacy Risks**: Elderly patients often take multiple medications, increasing interaction potential and ADR risk.

3. **Enhanced Monitoring**: Implement more frequent safety assessments for cognitive effects, falls risk, and cardiovascular complications.

4. **Reporting Considerations**: Age-related ADRs may be underreported as symptoms are often attributed to normal aging.

Recommendation: Establish comprehensive medication review protocols and consider lower starting doses with careful titration.`;
  }
  
  if (lowerQuery.includes('regulatory') || lowerQuery.includes('compliance')) {
    return `Key regulatory compliance requirements for pharmacovigilance:

1. **Global Standards**: Follow ICH E2A-E2F guidelines for safety reporting and risk management.

2. **Regional Requirements**:
   - FDA: MedWatch reporting, REMS programs
   - EMA: EudraVigilance, RMP requirements
   - WHO: Uppsala Monitoring Centre collaboration

3. **Documentation Standards**: Maintain complete audit trails, data integrity, and traceability for all safety activities.

4. **Quality Systems**: Implement robust QMS with regular internal audits and corrective action procedures.

Essential: Stay current with regulatory updates and maintain qualified person responsibilities for safety oversight.`;
  }

  if (lowerQuery.includes('psur') || lowerQuery.includes('periodic safety')) {
    return `PSUR (Periodic Safety Update Report) best practices:

1. **Data Integration**: Compile safety data from all sources including clinical trials, spontaneous reports, and literature.

2. **Benefit-Risk Assessment**: Provide comprehensive evaluation of product's safety profile in context of therapeutic benefit.

3. **Signal Evaluation**: Include assessment of new safety signals and status of ongoing safety investigations.

4. **Regulatory Timelines**: Submit according to established schedules (typically annually for first 2 years, then every 3 years).

Key elements: Executive summary, clinical safety profile, exposure data, and risk minimization measures effectiveness evaluation.`;
  }

  return `Thank you for your pharmacovigilance query. I can help with various aspects of drug safety monitoring including:

- Adverse drug reaction assessment and reporting
- Drug interaction evaluation methodologies  
- Signal detection and risk assessment
- Regulatory compliance requirements
- Safety monitoring best practices
- Special population considerations
- PSUR and periodic reporting guidance

Please ask specific questions about any of these areas for detailed guidance. For patient-specific situations, always consult with qualified healthcare professionals and follow your institution's protocols.`;
};

export async function registerRoutes(app: Express): Promise<Server> {
  // AI Chat endpoint for pharmacovigilance queries
  app.post("/api/ai-chat", async (req, res) => {
    try {
      const { message, conversationHistory } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: "Message is required" });
      }

      // Create conversation context with pharmacovigilance expertise
      const systemPrompt = `You are an expert pharmacovigilance assistant with deep knowledge of adverse drug reactions, regulatory requirements, drug safety, and medical terminology. You help healthcare professionals with:

- Adverse drug reaction (ADR) identification and assessment
- Drug interaction analysis
- Regulatory reporting requirements (FDA, EMA, WHO guidelines)
- Pharmacovigilance best practices
- Risk assessment and signal detection
- PSUR (Periodic Safety Update Report) guidance
- Medical terminology and coding systems (MedDRA, WHO-ART)
- Clinical trial safety monitoring
- Post-marketing surveillance

Provide accurate, evidence-based responses that are professional and helpful for healthcare professionals. When discussing specific medications or medical conditions, always recommend consulting with qualified healthcare providers for patient-specific advice.`;

      const messages = [
        { role: "system", content: systemPrompt },
        ...(conversationHistory || []),
        { role: "user", content: message }
      ];

      // Use Google AI Studio (Gemini) for intelligent responses
      const aiResponse = await callGeminiAPI(message, conversationHistory);

      res.json({ 
        response: aiResponse,
        conversationId: Date.now().toString()
      });

    } catch (error) {
      console.error("AI Chat error:", error);
      res.status(500).json({ 
        error: "Failed to process AI chat request. Please try again." 
      });
    }
  });

  // ADR Report submission endpoint
  app.post("/api/adr", async (req, res) => {
    try {
      const validatedData = insertADRSchema.parse(req.body);
      const report = await storage.createADRReport(validatedData);
      return res.status(201).json({ 
        success: true, 
        message: "ADR report submitted successfully", 
        reportId: report.id 
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          success: false, 
          message: validationError.message 
        });
      }
      
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while submitting the report" 
      });
    }
  });

  // Get all ADR reports
  app.get("/api/adr", async (_req, res) => {
    try {
      const reports = await storage.getAllADRReports();
      return res.status(200).json(reports);
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while fetching reports" 
      });
    }
  });

  // Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const schema = z.object({
        message: z.string().min(1),
      });
      
      const { message } = schema.parse(req.body);
      const query = message.toLowerCase();
      
      // Process the message and generate a response
      let response = "";
      let options = [];
      
      // Enhanced response logic based on query content
      if (query.includes("upcoming deadline") || query.includes("next deadline") || query.includes("calendar")) {
        // Fetch actual upcoming deadlines from storage
        const upcomingEvents = await storage.getUpcomingCalendarEvents(3);
        
        if (upcomingEvents.length > 0) {
          response = "Here are your upcoming deadlines:\n\n";
          
          upcomingEvents.forEach(event => {
            const eventDate = new Date(event.eventDate);
            response += `• ${eventDate.toLocaleDateString()}: ${event.title}\n`;
            if (event.description) {
              response += `  ${event.description}\n`;
            }
          });
          
          response += "\nWould you like to see more details about reporting requirements?";
        } else {
          response = "You don't have any upcoming deadlines. Would you like to add some to your calendar?";
        }
        
        options = [
          { id: "report_details", text: "Reporting requirements", query: "reporting requirements" },
          { id: "add_calendar", text: "Add to my calendar", query: "how to add to calendar" }
        ];
      } 
      else if (query.includes("what is adr") || query.includes("define adr") || (query.includes("adr") && query.includes("mean"))) {
        response = "ADR stands for Adverse Drug Reaction. It's an unwanted or harmful effect that occurs after a medication is administered at normal doses during clinical use. These reactions may be:";
        response += "\n\n• Type A (Augmented): Dose-dependent, predictable reactions";
        response += "\n• Type B (Bizarre): Dose-independent, unpredictable reactions";
        response += "\n• Type C (Chronic): Long-term use reactions";
        response += "\n• Type D (Delayed): Delayed onset reactions";
        
        options = [
          { id: "report_adr", text: "How to report an ADR", query: "how to report adr" },
          { id: "examples", text: "Examples of ADRs", query: "adr examples" }
        ];
      }
      else if (query.includes("adr reporting") || query.includes("how to report") || query.includes("submission process")) {
        response = "To report an Adverse Drug Reaction (ADR), follow these steps:";
        response += "\n\n1. Complete all mandatory fields in the ADR form (marked with *)";
        response += "\n2. Include detailed description of the reaction";
        response += "\n3. List all medications taken by the patient";
        response += "\n4. Provide your contact information as the reporter";
        response += "\n5. Submit the form through the system";
        response += "\n\nAll reports are reviewed by our pharmacovigilance team and may require follow-up.";
        
        options = [
          { id: "mandatory", text: "Mandatory fields", query: "mandatory fields" },
          { id: "timeline", text: "Reporting timeline", query: "reporting timeline" },
          { id: "psur", text: "PSUR requirements", query: "psur requirements" }
        ];
      }
      else if (query.includes("mandatory field") || query.includes("required field") || query.includes("must fill")) {
        response = "The mandatory fields in the ADR form (marked with *) are:";
        response += "\n\n• Patient information: Initials, age, gender";
        response += "\n• Reaction details: Description, onset date, outcome";
        response += "\n• Medication details: Name, dose, route, therapy dates";
        response += "\n• Reporter information: Name, profession, contact details";
        response += "\n\nIncomplete reports may be returned for additional information.";
        
        options = [
          { id: "patient_confidentiality", text: "Patient confidentiality", query: "patient confidentiality" },
          { id: "form_sections", text: "Form sections explained", query: "explain form sections" }
        ];
      }
      else if (query.includes("confidential") || query.includes("privacy") || query.includes("patient data")) {
        response = "Patient confidentiality is maintained throughout the ADR reporting process:";
        response += "\n\n• Use patient initials instead of full names";
        response += "\n• Include only relevant medical history";
        response += "\n• All data is protected according to data protection regulations";
        response += "\n• Access to reports is restricted to authorized personnel only";
        
        options = [
          { id: "data_usage", text: "How data is used", query: "how is adr data used" }
        ];
      }
      else if (query.includes("adr example") || query.includes("example of adverse")) {
        response = "Common examples of Adverse Drug Reactions (ADRs) include:";
        response += "\n\n• Rash, itching or hives (cutaneous reactions)";
        response += "\n• Nausea, vomiting, diarrhea (gastrointestinal)";
        response += "\n• Headache, dizziness (neurological)";
        response += "\n• Shortness of breath, cough (respiratory)";
        response += "\n• Liver or kidney function abnormalities";
        response += "\n• Unexpected therapeutic failure";
        
        options = [
          { id: "serious_adrs", text: "What are serious ADRs?", query: "serious adr definition" }
        ];
      }
      else if (query.includes("timeline") || query.includes("when to report") || query.includes("how soon")) {
        response = "ADR reporting timelines:";
        response += "\n\n• Serious ADRs: Report within 24 hours of awareness";
        response += "\n• Non-Serious ADRs: Report within 90 calendar days";
        response += "\n• Quarterly summary submissions: Due 15 days after quarter end";
        response += "\n• PSUR submissions: Due every 6 months or annually";
        
        options = [
          { id: "serious_def", text: "What is a serious ADR?", query: "serious adr definition" },
          { id: "psur_timeline", text: "PSUR submission schedule", query: "psur submission schedule" }
        ];
      }
      else if (query.includes("serious adr") || query.includes("severe reaction")) {
        response = "A serious Adverse Drug Reaction is one that:";
        response += "\n\n• Results in death";
        response += "\n• Is life-threatening";
        response += "\n• Requires hospitalization or prolongs existing hospitalization";
        response += "\n• Results in persistent or significant disability/incapacity";
        response += "\n• Is a congenital anomaly/birth defect";
        response += "\n• Requires intervention to prevent permanent impairment";
        
        options = [
          { id: "report_serious", text: "How to report serious ADRs", query: "reporting serious adrs" }
        ];
      }
      else if (query.includes("form section") || query.includes("section explain")) {
        response = "The ADR reporting form has these main sections:";
        response += "\n\n1. Patient Information: Demographics and medical history";
        response += "\n2. Adverse Reaction Details: Description, dates, severity";
        response += "\n3. Suspected Medications: All drugs, including OTC and herbals";
        response += "\n4. Concomitant Medications: Other medications taken";
        response += "\n5. Relevant Tests/Laboratory Data: Test results";
        response += "\n6. Reporter Information: Your contact details";
        
        options = [
          { id: "multiple_meds", text: "Reporting multiple medications", query: "how to report multiple medications" }
        ];
      }
      else if (query.includes("multiple medication") || query.includes("more than one drug")) {
        response = "To report multiple suspected medications:";
        response += "\n\n1. Click 'Add Another Medication' in the form";
        response += "\n2. Enter details for each medication separately";
        response += "\n3. Indicate the likelihood of causality for each";
        response += "\n4. List start and end dates for each medication";
        response += "\n5. You can remove medications using the 'Remove' button";
        
        options = [
          { id: "causality", text: "Assessing causality", query: "how to assess causality" }
        ];
      }
      else if (query.includes("psur") || query.includes("periodic safety") || query.includes("safety update")) {
        response = "Periodic Safety Update Report (PSUR) is a pharmacovigilance document intended to provide a safety update resulting in the evaluation of the risk-benefit balance of a medicinal product.";
        response += "\n\nPSUR requirements include:";
        response += "\n\n• Evaluation of relevant safety, efficacy and effectiveness information";
        response += "\n• Summary of safety data with critical analysis";
        response += "\n• Examination of whether the safety profile has changed";
        response += "\n• Risk-benefit evaluation";
        
        options = [
          { id: "psur_timeline", text: "PSUR submission schedule", query: "psur submission schedule" },
          { id: "psur_content", text: "PSUR content requirements", query: "psur content" }
        ];
      }
      else if (query.includes("psur submission schedule") || query.includes("psur timeline")) {
        response = "PSUR submission schedule according to the Pharmacovigilance Guidance Document:";
        response += "\n\n• Every 6 months for first 2 years after marketing approval";
        response += "\n• Annually for the subsequent 2 years";
        response += "\n• Thereafter once in 3 years or as per conditions of approval";
        response += "\n• PSUR should be submitted within 30 calendar days of the data lock point";
        response += "\n• Special reports may be requested by regulatory authorities";
        
        options = [
          { id: "psur_content", text: "PSUR content requirements", query: "psur content" },
          { id: "psur_submission", text: "How to submit PSURs", query: "psur submission" }
        ];
      }
      else if (query.includes("psur content") || query.includes("what should psur contain")) {
        response = "A Periodic Safety Update Report (PSUR) should contain:";
        response += "\n\n1. Executive Summary";
        response += "\n2. Worldwide Marketing Authorization Status";
        response += "\n3. Safety Actions Taken in the Reporting Interval";
        response += "\n4. Changes to Reference Safety Information";
        response += "\n5. Exposure Estimation";
        response += "\n6. Summary Tabulations of Adverse Events";
        response += "\n7. Summaries of Safety Signals";
        response += "\n8. Signal and Risk Evaluation";
        response += "\n9. Benefit Evaluation and Integrated Benefit-Risk Analysis";
        
        options = [
          { id: "psur_timeline", text: "PSUR submission schedule", query: "psur submission schedule" },
          { id: "reporting_req", text: "Other reporting requirements", query: "reporting requirements" }
        ];
      }
      else if (query.includes("psur submission") || query.includes("how to submit psur")) {
        response = "How to submit PSURs:";
        response += "\n\n• Submit to the CDSCO within 30 calendar days of the data lock point";
        response += "\n• Use the specified electronic format";
        response += "\n• Include all required sections as per guidance document";
        response += "\n• Ensure proper documentation of all adverse events";
        response += "\n• Include detailed evaluation of benefit-risk assessment";
        response += "\n• Submit to National Coordination Centre-Pharmacovigilance Programme of India (NCC-PvPI)";
        
        options = [
          { id: "psur_content", text: "PSUR content requirements", query: "psur content" },
          { id: "reporting_req", text: "General reporting requirements", query: "reporting requirements" }
        ];
      }
      else if (query.includes("pharmacovigilance system") || query.includes("pv system")) {
        response = "Marketing Authorization Holders (MAHs) must establish a pharmacovigilance system that includes:";
        response += "\n\n• A Pharmacovigilance System Master File (PSMF)";
        response += "\n• A qualified Pharmacovigilance Officer In-Charge (PVOIC)";
        response += "\n• Procedures for collecting and processing adverse event reports";
        response += "\n• A quality management system for pharmacovigilance activities";
        response += "\n• Risk management planning";
        response += "\n• Regular audits and inspections of the pharmacovigilance system";
        
        options = [
          { id: "psmf", text: "What is a PSMF?", query: "what is psmf" },
          { id: "reporting_req", text: "Reporting requirements", query: "reporting requirements" }
        ];
      }
      else if (query.includes("psmf") || query.includes("system master file")) {
        response = "A Pharmacovigilance System Master File (PSMF) is a detailed description of the pharmacovigilance system used by an MAH for their marketed products.";
        response += "\n\nIt should include:";
        response += "\n\n• Information about the PVOIC (Pharmacovigilance Officer In-Charge)";
        response += "\n• Description of computerized systems and databases";
        response += "\n• Process descriptions (collection, evaluation & reporting of safety data)";
        response += "\n• Quality system for pharmacovigilance activities";
        response += "\n• Documentation of qualification and training of personnel";
        
        options = [
          { id: "pv_system", text: "Pharmacovigilance system", query: "pharmacovigilance system" },
          { id: "reporting_req", text: "Reporting requirements", query: "reporting requirements" }
        ];
      }
      else {
        response = "Thank you for your query about pharmacovigilance. How else can I assist you with ADR reporting?";
        
        // Default options when response doesn't match any specific category
        options = [
          { id: "start_over", text: "Main menu", query: "show main menu" },
          { id: "adr_def", text: "What is an ADR?", query: "what is adr" },
          { id: "deadlines", text: "Upcoming deadlines", query: "upcoming deadlines" },
          { id: "pv_system", text: "Pharmacovigilance system", query: "pharmacovigilance system" },
          { id: "help", text: "Contact support", query: "contact support" }
        ];
      }
      
      // Store the chat message and response
      await storage.createChatMessage({
        message,
        response,
      });
      
      return res.status(200).json({ 
        message: response,
        options: options
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid message format" 
        });
      }
      
      return res.status(500).json({ 
        success: false, 
        message: "Failed to process your query" 
      });
    }
  });

  // Calendar Events API Endpoints
  
  // Get all calendar events
  app.get("/api/calendar", async (_req, res) => {
    try {
      const events = await storage.getAllCalendarEvents();
      return res.status(200).json(events);
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while fetching calendar events" 
      });
    }
  });
  
  // Get upcoming calendar events
  app.get("/api/calendar/upcoming", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const events = await storage.getUpcomingCalendarEvents(limit);
      return res.status(200).json(events);
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while fetching upcoming events" 
      });
    }
  });
  
  // Get a specific calendar event
  app.get("/api/calendar/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid event ID" 
        });
      }
      
      const event = await storage.getCalendarEvent(id);
      if (!event) {
        return res.status(404).json({ 
          success: false, 
          message: "Event not found" 
        });
      }
      
      return res.status(200).json(event);
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while fetching the event" 
      });
    }
  });
  
  // Create a new calendar event
  app.post("/api/calendar", async (req, res) => {
    try {
      const validatedData = insertCalendarEventSchema.parse(req.body);
      const event = await storage.createCalendarEvent(validatedData);
      return res.status(201).json({ 
        success: true, 
        message: "Calendar event created successfully", 
        eventId: event.id 
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          success: false, 
          message: validationError.message 
        });
      }
      
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while creating the event" 
      });
    }
  });
  
  // Delete a calendar event
  app.delete("/api/calendar/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid event ID" 
        });
      }
      
      const deleted = await storage.deleteCalendarEvent(id);
      if (!deleted) {
        return res.status(404).json({ 
          success: false, 
          message: "Event not found" 
        });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: "Event deleted successfully" 
      });
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while deleting the event" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
