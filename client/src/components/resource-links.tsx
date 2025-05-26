import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  HelpCircle, 
  Phone, 
  MessageCircle, 
  GraduationCap 
} from "lucide-react";

export default function ResourceLinks() {
  const resources = [
    {
      title: "PvPI Guidelines 2023",
      icon: <FileText className="h-4 w-4 mr-2" />,
      href: "#",
    },
    {
      title: "FAQs on ADR Reporting",
      icon: <HelpCircle className="h-4 w-4 mr-2" />,
      href: "#",
    },
    {
      title: "Helpline: 1800 180 3024",
      icon: <Phone className="h-4 w-4 mr-2" />,
      href: "tel:18001803024",
    },
    {
      title: "Pharmacovigilance Forum",
      icon: <MessageCircle className="h-4 w-4 mr-2" />,
      href: "#",
    },
    {
      title: "Educational Materials",
      icon: <GraduationCap className="h-4 w-4 mr-2" />,
      href: "#",
    },
  ];

  return (
    <Card className="bg-white rounded-lg shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-primary">Useful Resources</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {resources.map((resource, index) => (
            <li key={index}>
              <a 
                href={resource.href} 
                className="flex items-center text-secondary hover:text-secondary-dark"
              >
                {resource.icon}
                <span>{resource.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
