
import React from "react";
import { Globe, Users, Mail, User, Target, Briefcase, Phone, Award, ShoppingBag } from "lucide-react";

// Reference data for lead channels and pipeline statuses. The backend owns the
// authoritative copy (backend/app/constants.py) and all scoring — these lists
// exist so the UI can render names, icons, and colors for the same ids.

export const leadChannels = [
  { id: "website", name: "Website", icon: <Globe className="h-5 w-5" />, baseScore: 20 },
  { id: "social", name: "Social Media", icon: <Users className="h-5 w-5" />, baseScore: 15 },
  { id: "email", name: "Email Campaign", icon: <Mail className="h-5 w-5" />, baseScore: 25 },
  { id: "referral", name: "Referral", icon: <User className="h-5 w-5" />, baseScore: 30 },
  { id: "advertising", name: "Paid Advertising", icon: <Target className="h-5 w-5" />, baseScore: 10 },
  { id: "partner", name: "Partner Network", icon: <Briefcase className="h-5 w-5" />, baseScore: 25 },
  { id: "direct", name: "Direct Contact", icon: <Phone className="h-5 w-5" />, baseScore: 20 },
  { id: "event", name: "Industry Event", icon: <Award className="h-5 w-5" />, baseScore: 35 },
  { id: "marketplace", name: "Online Marketplace", icon: <ShoppingBag className="h-5 w-5" />, baseScore: 15 }
];

export const leadStatuses = [
  { id: "new", name: "New Lead", color: "bg-blue-500", scoreModifier: 0 },
  { id: "contacted", name: "Contacted", color: "bg-yellow-500", scoreModifier: 5 },
  { id: "qualified", name: "Qualified", color: "bg-green-500", scoreModifier: 15 },
  { id: "proposal", name: "Proposal Sent", color: "bg-purple-500", scoreModifier: 25 },
  { id: "negotiation", name: "Negotiation", color: "bg-orange-500", scoreModifier: 30 },
  { id: "closed-won", name: "Closed Won", color: "bg-emerald-500", scoreModifier: 50 },
  { id: "closed-lost", name: "Closed Lost", color: "bg-red-500", scoreModifier: -10 }
];

export const getChannelById = (channelId) => {
  return leadChannels.find(channel => channel.id === channelId);
};

export const getStatusById = (statusId) => {
  return leadStatuses.find(status => status.id === statusId);
};

// Reverse lookup for chart/funnel data, which carries display names
// ("New Lead") rather than ids ("new").
export const getStatusIdByName = (name) => {
  return leadStatuses.find(status => status.name === name)?.id;
};
