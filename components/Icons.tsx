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

// User-provided 01BO logo, shared by the header and login screen.
export const Icon1BLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <img src="/brand/logo.png" alt="01BO" className={`shrink-0 object-contain ${className}`} draggable={false} />
);

export const Icon01BoBrand = ({ className = "h-8" }: { className?: string }) => (
  <div className={`inline-flex items-center gap-2 font-bold tracking-tight select-none ${className}`}>
    <Icon1BLogo className="h-9 w-9" />
    <div className="flex items-baseline font-black leading-none text-2xl tracking-tighter">
      <span className="text-brand-navy dark:text-white">01</span>
      <span className="text-brand-orange">Bo</span>
    </div>
  </div>
);

