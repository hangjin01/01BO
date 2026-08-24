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
  Square,
  Eye,
  EyeOff,
  Plane,
  Train,
  Hotel,
  Car,
  Building2,
  Bell,
  Search,
  SlidersHorizontal,
  CloudSun,
  Sparkles,
  UserCheck,
  Compass,
  ShieldCheck,
  Layers,
  PlusCircle,
  QrCode,
  MessageSquare,
  Users,
  Settings,
  Share2,
  FileCheck,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  User
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
export const IconEye = ({ className }: { className?: string }) => <Eye className={className} />;
export const IconEyeOff = ({ className }: { className?: string }) => <EyeOff className={className} />;

/* Additional 01Bo Modern Icons */
export const IconPlane = ({ className }: { className?: string }) => <Plane className={className} />;
export const IconTrain = ({ className }: { className?: string }) => <Train className={className} />;
export const IconHotel = ({ className }: { className?: string }) => <Hotel className={className} />;
export const IconCar = ({ className }: { className?: string }) => <Car className={className} />;
export const IconBuilding = ({ className }: { className?: string }) => <Building2 className={className} />;
export const IconBell = ({ className }: { className?: string }) => <Bell className={className} />;
export const IconSearch = ({ className }: { className?: string }) => <Search className={className} />;
export const IconFilter = ({ className }: { className?: string }) => <SlidersHorizontal className={className} />;
export const IconCloudSun = ({ className }: { className?: string }) => <CloudSun className={className} />;
export const IconSparkles = ({ className }: { className?: string }) => <Sparkles className={className} />;
export const IconUserCheck = ({ className }: { className?: string }) => <UserCheck className={className} />;
export const IconCompass = ({ className }: { className?: string }) => <Compass className={className} />;
export const IconShieldCheck = ({ className }: { className?: string }) => <ShieldCheck className={className} />;
export const IconLayers = ({ className }: { className?: string }) => <Layers className={className} />;
export const IconPlusCircle = ({ className }: { className?: string }) => <PlusCircle className={className} />;
export const IconQrCode = ({ className }: { className?: string }) => <QrCode className={className} />;
export const IconMessageSquare = ({ className }: { className?: string }) => <MessageSquare className={className} />;
export const IconUsers = ({ className }: { className?: string }) => <Users className={className} />;
export const IconSettings = ({ className }: { className?: string }) => <Settings className={className} />;
export const IconShare = ({ className }: { className?: string }) => <Share2 className={className} />;
export const IconFileCheck = ({ className }: { className?: string }) => <FileCheck className={className} />;
export const IconExternalLink = ({ className }: { className?: string }) => <ExternalLink className={className} />;
export const IconArrowRight = ({ className }: { className?: string }) => <ArrowRight className={className} />;
export const IconTrendingUp = ({ className }: { className?: string }) => <TrendingUp className={className} />;
export const IconUser = ({ className }: { className?: string }) => <User className={className} />;

/* Original Suitcase Logo in brand-orange */
export const Icon1BLogo = ({ className = "w-8 h-8 text-brand-orange" }: { className?: string }) => (
  <svg viewBox="0 0 100 140" className={`shrink-0 text-brand-orange ${className}`} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <mask id="logo-cutout-orange">
        <rect width="100" height="140" fill="white" />
        <text x="50" y="105" fontSize="90" fontWeight="900" fontFamily="Arial, sans-serif" fill="black" stroke="black" strokeWidth="4" textAnchor="middle" letterSpacing="-5">1B</text>
        <circle cx="28" cy="115" r="10" fill="black" />
        <circle cx="72" cy="115" r="10" fill="black" />
      </mask>
    </defs>

    <g mask="url(#logo-cutout-orange)">
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

export const Icon01BoBrand = ({ className = "h-8" }: { className?: string }) => (
  <div className={`inline-flex items-center gap-2 font-bold tracking-tight select-none ${className}`}>
    <Icon1BLogo className="h-8 w-6 text-brand-orange" />
    <div className="flex items-baseline font-black leading-none text-2xl tracking-tighter">
      <span className="text-brand-navy dark:text-white">01</span>
      <span className="text-brand-orange">Bo</span>
    </div>
  </div>
);
