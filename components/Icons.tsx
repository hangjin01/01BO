import React from 'react';
import { 
  MapPin, 
  Briefcase, 
  Camera, 
  FileText, 
  ChevronRight, 
  CheckCircle, 
  XCircle,
  Clock,
  Home,
  Receipt,
  Globe,
  Edit,
  Calendar,
  Zap,
  LogOut,
  Plus,
  Trash2,
  Map as MapIcon,
  Navigation,
  Save,
  X,
  Image as ImageIcon,
  Send,
  Bot,
  Mic,
  Moon,
  Sun,
  Square
} from 'lucide-react';

export const IconMapPin = ({ className }: { className?: string }) => <MapPin className={className} />;
export const IconBriefcase = ({ className }: { className?: string }) => <Briefcase className={className} />;
export const IconCamera = ({ className }: { className?: string }) => <Camera className={className} />;
export const IconFileText = ({ className }: { className?: string }) => <FileText className={className} />;
export const IconChevronRight = ({ className }: { className?: string }) => <ChevronRight className={className} />;
export const IconCheckCircle = ({ className }: { className?: string }) => <CheckCircle className={className} />;
export const IconXCircle = ({ className }: { className?: string }) => <XCircle className={className} />;
export const IconClock = ({ className }: { className?: string }) => <Clock className={className} />;
export const IconHome = ({ className }: { className?: string }) => <Home className={className} />;
export const IconReceipt = ({ className }: { className?: string }) => <Receipt className={className} />;
export const IconGlobe = ({ className }: { className?: string }) => <Globe className={className} />;
export const IconEdit = ({ className }: { className?: string }) => <Edit className={className} />;
export const IconCalendar = ({ className }: { className?: string }) => <Calendar className={className} />;
export const IconZap = ({ className }: { className?: string }) => <Zap className={className} />;
export const IconLogOut = ({ className }: { className?: string }) => <LogOut className={className} />;
export const IconPlus = ({ className }: { className?: string }) => <Plus className={className} />;
export const IconTrash = ({ className }: { className?: string }) => <Trash2 className={className} />;
export const IconMap = ({ className }: { className?: string }) => <MapIcon className={className} />;
export const IconNavigation = ({ className }: { className?: string }) => <Navigation className={className} />;
export const IconSave = ({ className }: { className?: string }) => <Save className={className} />;
export const IconX = ({ className }: { className?: string }) => <X className={className} />;
export const IconImage = ({ className }: { className?: string }) => <ImageIcon className={className} />;
export const IconSend = ({ className }: { className?: string }) => <Send className={className} />;
export const IconBot = ({ className }: { className?: string }) => <Bot className={className} />;
export const IconMic = ({ className }: { className?: string }) => <Mic className={className} />;
export const IconMoon = ({ className }: { className?: string }) => <Moon className={className} />;
export const IconSun = ({ className }: { className?: string }) => <Sun className={className} />;
export const IconStop = ({ className }: { className?: string }) => <Square className={className} />;

export const Icon1BLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 140" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <mask id="logo-cutout">
        <rect width="100" height="140" fill="white" />
        <text x="50" y="105" fontSize="90" fontWeight="900" fontFamily="Arial, sans-serif" fill="black" stroke="black" strokeWidth="4" textAnchor="middle" letterSpacing="-5">1B</text>
        <circle cx="28" cy="115" r="10" fill="black" />
        <circle cx="72" cy="115" r="10" fill="black" />
      </mask>
    </defs>

    <g mask="url(#logo-cutout)">
      {/* Handle */}
      <path d="M 35 30 L 35 15 C 35 10 40 10 45 10 L 55 10 C 60 10 65 10 65 15 L 65 30" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Suitcase Body */}
      <rect x="10" y="30" width="80" height="85" rx="15" fill="currentColor" />
      
      {/* Wheels */}
      <circle cx="28" cy="115" r="16" fill="currentColor" />
      <circle cx="72" cy="115" r="16" fill="currentColor" />
    </g>

    {/* 1B Text inner fill */}
    <text x="50" y="105" fontSize="90" fontWeight="900" fontFamily="Arial, sans-serif" fill="currentColor" textAnchor="middle" letterSpacing="-5">1B</text>
    
    {/* Wheels inner dots */}
    <circle cx="28" cy="115" r="5" fill="currentColor" />
    <circle cx="72" cy="115" r="5" fill="currentColor" />
  </svg>
);